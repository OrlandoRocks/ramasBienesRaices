import { coercePaymentStatus, isPaidStatus } from "@/util/paymentApi";

/**
 * Stable schedule order (matches backend redistribution).
 */
export function sortContractPayments(payments) {
  return [...(payments || [])].sort((a, b) => {
    const dateA = String(a.payment_date || "");
    const dateB = String(b.payment_date || "");
    if (dateA !== dateB) {
      return dateA.localeCompare(dateB);
    }
    return String(a.id ?? "").localeCompare(String(b.id ?? ""));
  });
}

function paymentStatus(payment) {
  return coercePaymentStatus(
    payment.payment_status_name || payment.status_name || payment.status
  );
}

/**
 * Aggregates derived from the current payment rows (not cached API fields).
 */
export function computeContractFinancials({
  payments = [],
  total_price = 0,
  down_payment = 0,
}) {
  const sorted = sortContractPayments(payments);
  const price = Number(total_price) || 0;
  const down = Number(down_payment) || 0;
  const principal = price - down;

  let totalPaid = 0;
  let totalScheduled = 0;
  let countPaid = 0;
  let countPending = 0;

  sorted.forEach((payment) => {
    const amount = Number(payment.amount) || 0;
    totalScheduled += amount;
    const status = paymentStatus(payment);
    if (isPaidStatus(status)) {
      totalPaid += amount;
      countPaid += 1;
    } else {
      countPending += 1;
    }
  });

  const remainingOnPrice = Math.max(0, price - totalPaid);
  const scheduleRemainder = principal - totalScheduled;
  /** Sum of installments minus paid (schedule saldo). */
  const pendingBalance = Math.max(0, totalScheduled - totalPaid);

  return {
    totalPaid,
    totalScheduled,
    principal,
    remainingOnPrice,
    pendingBalance,
    scheduleRemainder,
    countPaid,
    countPending,
  };
}

/**
 * Running "Total a Pagar" column before each installment.
 */
export function enrichPaymentsWithRunningTotal(
  payments,
  total_price,
  down_payment
) {
  const sorted = sortContractPayments(payments);
  let running = (Number(total_price) || 0) - (Number(down_payment) || 0);

  return sorted.map((payment, index) => {
    const row = { ...payment };
    row.payment_status_name = row.payment_status_name || paymentStatus(payment);
    row.total = running;
    running -= Number(row.amount) || 0;
    row.row_number = index + 1;
    return row;
  });
}
