let pdfMakeLoader = null;

async function loadPdfMake() {
  if (pdfMakeLoader) {
    return pdfMakeLoader;
  }
  pdfMakeLoader = (async () => {
    const pdfMakeModule = await import(
      /* webpackChunkName: "pdfmake" */ "pdfmake/build/pdfmake"
    );
    const pdfFontsModule = await import(
      /* webpackChunkName: "pdfmake-fonts" */ "pdfmake/build/vfs_fonts"
    );
    const pdfMake = pdfMakeModule.default || pdfMakeModule;
    const pdfFonts = pdfFontsModule.default || pdfFontsModule;
    const vfs =
      pdfFonts.pdfMake?.vfs || pdfFonts.vfs || pdfMakeModule.pdfMake?.vfs;
    if (!vfs) {
      throw new Error("No se pudieron cargar las fuentes para PDF.");
    }
    pdfMake.vfs = vfs;
    return pdfMake;
  })();
  return pdfMakeLoader;
}

const COLORS = {
  primary: "#1d3557",
  accent: "#e14eca",
  muted: "#6c757d",
  border: "#e8e8e8",
  surface: "#f4f5f7",
  white: "#ffffff",
  status: {
    Pagado: { bg: "#d4edda", text: "#155724" },
    Pendiente: { bg: "#fff3cd", text: "#856404" },
    Liquidado: { bg: "#cce5ff", text: "#004085" },
    Activo: { bg: "#e2e3e5", text: "#383d41" },
    "Sin pagos": { bg: "#e2e3e5", text: "#383d41" },
    Fallo: { bg: "#f8d7da", text: "#721c24" },
    Cancelado: { bg: "#e2e3e5", text: "#383d41" },
    Regrezado: { bg: "#d1ecf1", text: "#0c5460" },
  },
};

function statusCell(text) {
  const key = text || "Pendiente";
  const palette = COLORS.status[key] || COLORS.status.Pendiente;
  return {
    text: key,
    fillColor: palette.bg,
    color: palette.text,
    bold: true,
    alignment: "center",
    margin: [0, 2, 0, 2],
  };
}

function summaryField(label, value, options = {}) {
  return {
    width: options.width || "*",
    stack: [
      { text: label, style: "summaryLabel" },
      {
        text: value || "—",
        style: options.emphasis ? "summaryValueEmphasis" : "summaryValue",
      },
    ],
    margin: [0, 0, 12, 10],
  };
}

function buildDocumentDefinition(payload) {
  const { meta, contract, client, land, payments } = payload;
  const paymentRows = payments.items.map((row) => [
    { text: String(row.row_number), alignment: "center" },
    row.payment_date_label,
    { text: row.amount_label, alignment: "right" },
    statusCell(row.status),
    row.payment_type || "—",
    row.comments || "—",
  ]);

  const tableBody = [
    [
      { text: "#", style: "tableHeader", alignment: "center" },
      { text: "Fecha de pago", style: "tableHeader" },
      { text: "Monto", style: "tableHeader", alignment: "right" },
      { text: "Estado", style: "tableHeader", alignment: "center" },
      { text: "Método", style: "tableHeader" },
      { text: "Notas", style: "tableHeader" },
    ],
    ...(paymentRows.length
      ? paymentRows
      : [
          [
            {
              text: "No hay pagos registrados para este contrato.",
              colSpan: 6,
              alignment: "center",
              color: COLORS.muted,
              italics: true,
              margin: [0, 8, 0, 8],
            },
            {},
            {},
            {},
            {},
            {},
          ],
        ]),
    [
      { text: "Totales", style: "tableFooter", colSpan: 2 },
      {},
      {
        text: payments.summary.totalScheduledLabel,
        style: "tableFooter",
        alignment: "right",
      },
      {
        text: `Pagado: ${payments.summary.totalPaidLabel}`,
        style: "tableFooter",
        colSpan: 2,
        alignment: "center",
      },
      {},
      {
        text: `Pendiente: ${payments.summary.totalPendingLabel}`,
        style: "tableFooter",
        alignment: "right",
      },
    ],
  ];

  return {
    pageSize: "A4",
    pageMargins: [40, 48, 40, 48],
    defaultStyle: {
      font: "Roboto",
      fontSize: 10,
      color: "#2b2b2b",
    },
    styles: {
      brandName: {
        fontSize: 14,
        bold: true,
        color: COLORS.primary,
      },
      docSubtitle: {
        fontSize: 11,
        color: COLORS.muted,
        margin: [0, 2, 0, 0],
      },
      meta: { fontSize: 8, color: COLORS.muted },
      sectionTitle: {
        fontSize: 11,
        bold: true,
        color: COLORS.primary,
        margin: [0, 16, 0, 8],
      },
      sectionSubtitle: {
        fontSize: 9,
        color: COLORS.muted,
        margin: [0, 0, 0, 8],
      },
      summaryLabel: {
        fontSize: 8,
        color: COLORS.muted,
        margin: [0, 0, 0, 2],
      },
      summaryValue: {
        fontSize: 10,
        color: "#2b2b2b",
      },
      summaryValueEmphasis: {
        fontSize: 11,
        bold: true,
        color: COLORS.primary,
      },
      tableHeader: {
        bold: true,
        fontSize: 9,
        color: COLORS.white,
        fillColor: COLORS.primary,
        margin: [4, 6, 4, 6],
      },
      tableFooter: {
        bold: true,
        fontSize: 9,
        fillColor: "#e9ecef",
        margin: [4, 8, 4, 8],
      },
      footer: {
        fontSize: 8,
        color: COLORS.muted,
        italics: true,
      },
    },
    footer(currentPage, pageCount) {
      return {
        margin: [40, 0, 40, 24],
        columns: [
          {
            text: "Documento informativo — no sustituye el contrato legal firmado.",
            style: "footer",
          },
          {
            text: `Página ${currentPage} de ${pageCount}`,
            style: "footer",
            alignment: "right",
          },
        ],
      };
    },
    content: [
      {
        columns: [
          {
            width: "*",
            stack: [
              { text: "RAMAS BIENES RAÍCES", style: "brandName" },
              { text: "Resumen de contrato", style: "docSubtitle" },
            ],
          },
          {
            width: "auto",
            stack: [
              {
                ...statusCell(contract.status),
                alignment: "right",
              },
              {
                text: `Generado: ${meta.generatedAt}`,
                style: "meta",
                alignment: "right",
                margin: [0, 6, 0, 0],
              },
            ],
          },
        ],
      },
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: 1,
            lineColor: COLORS.border,
          },
        ],
        margin: [0, 12, 0, 12],
      },
      {
        text: "RESUMEN DEL CONTRATO",
        style: "sectionTitle",
        margin: [0, 0, 0, 8],
      },
      {
        table: {
          widths: ["*", "*", "*"],
          body: [
            [
              {
                colSpan: 3,
                fillColor: COLORS.surface,
                border: [false, false, false, false],
                margin: [12, 12, 12, 4],
                columns: [
                  summaryField("ID contrato", `#${contract.id}`, {
                    emphasis: true,
                  }),
                  summaryField("Cliente", client.full_name, { width: 140 }),
                  summaryField("Estado", contract.status, { emphasis: true }),
                ],
              },
              {},
              {},
            ],
            [
              {
                colSpan: 3,
                fillColor: COLORS.surface,
                border: [false, false, false, false],
                margin: [12, 0, 12, 4],
                columns: [
                  summaryField("Fecha de inicio", contract.contract_date_label),
                  summaryField("Fecha de fin", contract.end_date_label),
                  summaryField("Meses", String(contract.months)),
                ],
              },
              {},
              {},
            ],
            [
              {
                colSpan: 3,
                fillColor: COLORS.surface,
                border: [false, false, false, false],
                margin: [12, 0, 12, 12],
                columns: [
                  summaryField("Monto total", contract.total_price_label, {
                    emphasis: true,
                  }),
                  summaryField("Total pagado", contract.total_paid_label, {
                    emphasis: true,
                  }),
                  summaryField(
                    "Saldo pendiente",
                    payments.summary.totalPendingLabel,
                    { emphasis: true }
                  ),
                ],
              },
              {},
              {},
            ],
          ],
        },
        layout: {
          hLineWidth: () => 0,
          vLineWidth: () => 0,
          paddingLeft: () => 0,
          paddingRight: () => 0,
          paddingTop: () => 0,
          paddingBottom: () => 0,
        },
        margin: [0, 0, 0, 4],
      },
      {
        columns: [
          summaryField("Mensualidad", contract.monthly_payment_label),
          summaryField("Abono inicial", contract.down_payment_label),
          summaryField("Terreno", `${land.land_code} — ${land.address}`, {
            width: 200,
          }),
        ],
        margin: [0, 0, 0, 8],
      },
      {
        text: "DETALLE DE PAGOS",
        style: "sectionTitle",
        pageBreak: paymentRows.length > 18 ? "before" : undefined,
      },
      {
        text: `${payments.items.length} pago(s) registrado(s)`,
        style: "sectionSubtitle",
      },
      {
        table: {
          headerRows: 1,
          widths: [24, 72, 72, 64, 72, "*"],
          body: tableBody,
        },
        layout: {
          fillColor(rowIndex) {
            if (rowIndex === 0) {
              return COLORS.primary;
            }
            if (rowIndex === tableBody.length - 1) {
              return "#e9ecef";
            }
            return rowIndex % 2 === 0 ? COLORS.surface : COLORS.white;
          },
          hLineWidth(i, node) {
            return i === 0 || i === node.table.body.length ? 1 : 0.5;
          },
          vLineWidth: () => 0,
          hLineColor: () => COLORS.border,
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: () => 6,
          paddingBottom: () => 6,
        },
      },
    ],
  };
}

/**
 * Generate and download contract summary PDF.
 * @param {object} payload - from buildContractPdfPayload
 * @param {string} [filename]
 */
export async function downloadContractPdf(payload, filename) {
  const pdfMake = await loadPdfMake();
  const docDefinition = buildDocumentDefinition(payload);
  const name =
    filename ||
    `contrato-${payload.contract?.id || "export"}-${Date.now()}.pdf`;
  pdfMake.createPdf(docDefinition).download(name);
}

export { buildDocumentDefinition };
