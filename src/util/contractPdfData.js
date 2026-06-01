import { addMonthsToDateString } from "@/util/paymentScheduleDates";
import { coercePaymentStatus, isPaidStatus } from "@/util/paymentApi";

function formatCurrencyMx(amount) {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDisplayDate(dateStr) {
  if (!dateStr || dateStr === "0000-00-00") {
    return "—";
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(dateStr));
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }
  return String(dateStr);
}

function computeEndDate(contractDate, months) {
  if (!contractDate || !months) {
    return null;
  }
  try {
    const count = Number(months);
    if (!count || count < 1) {
      return null;
    }
    return addMonthsToDateString(contractDate, count);
  } catch {
    return null;
  }
}

function deriveContractStatus(payments, totalPrice, totalPaid) {
  const items = payments || [];
  if (!items.length) {
    return "Sin pagos";
  }
  const allPaid = items.every((p) => isPaidStatus(p.status));
  const price = Number(totalPrice) || 0;
  const paid = Number(totalPaid) || 0;

  if (allPaid && price > 0 && paid >= price) {
    return "Liquidado";
  }
  if (paid > 0) {
    return "Activo";
  }
  return "Pendiente";
}

function summarizePayments(payments, totalPrice) {
  const items = (payments || []).map((payment, index) => {
    const status = coercePaymentStatus(
      payment.status || payment.payment_status_name
    );
    const amount = Number(payment.amount) || 0;
    return {
      row_number: payment.row_number ?? index + 1,
      payment_date: payment.payment_date,
      payment_date_label: formatDisplayDate(payment.payment_date),
      amount,
      amount_label: formatCurrencyMx(amount),
      status,
      payment_type: payment.payment_type || "",
      comments: payment.comments || "",
    };
  });

  let totalPaid = 0;
  items.forEach((row) => {
    if (isPaidStatus(row.status)) {
      totalPaid += row.amount;
    }
  });

  const totalScheduled =
    Number(totalPrice) || items.reduce((sum, row) => sum + row.amount, 0);

  return {
    items,
    summary: {
      totalScheduled,
      totalScheduledLabel: formatCurrencyMx(totalScheduled),
      totalPaid,
      totalPaidLabel: formatCurrencyMx(totalPaid),
      totalPending: Math.max(0, totalScheduled - totalPaid),
      totalPendingLabel: formatCurrencyMx(
        Math.max(0, totalScheduled - totalPaid)
      ),
      countPaid: items.filter((r) => isPaidStatus(r.status)).length,
      countPending: items.filter((r) => !isPaidStatus(r.status)).length,
    },
  };
}

/**
 * Build normalized payload for contract PDF from Vuex / API shapes.
 */
export function buildContractPdfPayload({
  contract = {},
  client = {},
  land = {},
  payments = [],
}) {
  const contractDate = contract.contract_date || "";
  const months = contract.months;
  const endDate = computeEndDate(contractDate, months);
  const paymentBlock = summarizePayments(payments, contract.total_price);

  return {
    meta: {
      generatedAt: new Date().toLocaleString("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      generatedBy: "Ramas Bienes Raíces",
    },
    contract: {
      id: contract.id,
      contract_date: contractDate,
      contract_date_label: formatDisplayDate(contractDate),
      end_date: endDate,
      end_date_label: formatDisplayDate(endDate),
      months: months ?? "—",
      monthly_payment: contract.monthly_payment,
      monthly_payment_label: formatCurrencyMx(contract.monthly_payment),
      down_payment: contract.down_payment,
      down_payment_label: formatCurrencyMx(contract.down_payment),
      total_price: contract.total_price,
      total_price_label: formatCurrencyMx(contract.total_price),
      total_paid: contract.total_paid ?? paymentBlock.summary.totalPaid,
      total_paid_label: formatCurrencyMx(
        contract.total_paid ?? paymentBlock.summary.totalPaid
      ),
      status: deriveContractStatus(
        paymentBlock.items,
        contract.total_price,
        contract.total_paid ?? paymentBlock.summary.totalPaid
      ),
    },
    client: {
      full_name: client.full_name || "—",
      email: client.email || "—",
      phone_number: client.phone_number || "—",
      rfc: client.rfc || "—",
    },
    land: {
      land_code: land.land_code || "—",
      address: land.address || "—",
      residential_name: land.residential_name || "—",
    },
    payments: paymentBlock,
  };
}
