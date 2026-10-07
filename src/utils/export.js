const REPORT_COLORS = {
  ink: [15, 23, 42],
  muted: [71, 85, 105],
  line: [203, 213, 225],
  teal: [13, 148, 136],
  tealSoft: [240, 253, 250],
  slateSoft: [248, 250, 252],
};

const roundAmount = (value) => Math.round(Number(value) || 0);

const formatAmount = (value) => roundAmount(value).toLocaleString("en-IN");

const normaliseHeader = (header) => String(header).trim().toLowerCase();

/**
 * Investment schedules in the calculators store running totals. A running total
 * is useful, but calling it simply "Invested" or "Interest" makes a report
 * look like each row is the activity for that year. Expand that shape into an
 * actual annual ledger before exporting it.
 */
export function buildInvestmentBreakdown(data, headers) {
  const headerIndex = headers.reduce((index, header, position) => {
    index[normaliseHeader(header)] = position;
    return index;
  }, {});
  const investedIndex = headerIndex.invested;
  const interestIndex = headerIndex.interest;
  const balanceIndex = headerIndex.balance ?? headerIndex.value ?? headerIndex["total value"];

  const hasInvestmentShape = [investedIndex, interestIndex, balanceIndex]
    .every((index) => Number.isInteger(index));
  const hasNumericTotals = hasInvestmentShape && data.every((row) =>
    [investedIndex, interestIndex, balanceIndex].every((index) =>
      Number.isFinite(Number(row[index]))
    )
  );

  if (!hasNumericTotals) return null;

  let priorInvested = 0;
  let priorInterest = 0;

  const body = data.map((row) => {
    const invested = roundAmount(row[investedIndex]);
    const interest = roundAmount(row[interestIndex]);
    const balance = roundAmount(row[balanceIndex]);
    const contribution = invested - priorInvested;
    const earnings = interest - priorInterest;

    priorInvested = invested;
    priorInterest = interest;

    return [
      row[headerIndex.year] ?? row[0],
      formatAmount(contribution),
      formatAmount(invested),
      formatAmount(earnings),
      formatAmount(interest),
      formatAmount(balance),
    ];
  });

  const lastRow = data[data.length - 1];
  return {
    headers: [
      "Year",
      "Added this year",
      "Total contributed",
      "Earned this year",
      "Total earnings",
      "Closing balance",
    ],
    body,
    totals: {
      invested: roundAmount(lastRow[investedIndex]),
      interest: roundAmount(lastRow[interestIndex]),
      balance: roundAmount(lastRow[balanceIndex]),
    },
  };
}

function buildStandardTable(data) {
  return data.map((row) =>
    row.map((cell) => (typeof cell === "number" ? formatAmount(cell) : cell ?? ""))
  );
}

function addReportHeader(doc, title, dateStr, pageWidth) {
  const margin = 16;
  doc.setDrawColor(...REPORT_COLORS.teal);
  doc.setLineWidth(0.8);
  doc.line(margin, 13, pageWidth - margin, 13);
  doc.setTextColor(...REPORT_COLORS.ink);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text(title, margin, 23);
  doc.setTextColor(...REPORT_COLORS.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Generated ${dateStr}`, margin, 29);
}

function addReportFooter(doc, pageWidth, pageHeight) {
  const margin = 16;
  doc.setDrawColor(...REPORT_COLORS.line);
  doc.setLineWidth(0.2);
  doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
  doc.setTextColor(...REPORT_COLORS.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("Illustrative calculation based on the assumptions entered.", margin, pageHeight - 7);
  doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber}`, pageWidth - margin, pageHeight - 7, { align: "right" });
}

function addInvestmentSummary(doc, totals, startY, pageWidth) {
  const margin = 16;
  const gap = 5;
  const cardWidth = (pageWidth - (margin * 2) - (gap * 2)) / 3;
  const cardHeight = 17;
  const items = [
    ["Total contributed", totals.invested],
    ["Investment earnings", totals.interest],
    ["Closing balance", totals.balance],
  ];

  doc.setTextColor(...REPORT_COLORS.ink);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Your projection at a glance", margin, startY);

  items.forEach(([label, amount], index) => {
    const x = margin + (index * (cardWidth + gap));
    doc.setFillColor(...(index === 2 ? REPORT_COLORS.tealSoft : REPORT_COLORS.slateSoft));
    doc.roundedRect(x, startY + 4, cardWidth, cardHeight, 2, 2, "F");
    doc.setTextColor(...REPORT_COLORS.muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(label, x + 4, startY + 9);
    doc.setTextColor(...REPORT_COLORS.ink);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(formatAmount(amount), x + 4, startY + 15);
  });

  return startY + cardHeight + 7;
}

export async function downloadPDF(data, headers, filename = "investment_report.pdf", options = {}) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const investmentBreakdown = buildInvestmentBreakdown(data, headers);
  const tableHeaders = investmentBreakdown?.headers ?? headers;
  const tableBody = investmentBreakdown?.body ?? buildStandardTable(data);
  const isLandscape = tableHeaders.length >= 6;
  const doc = new jsPDF({
    orientation: isLandscape ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const dateStr = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
  const title = options.title || (investmentBreakdown ? "Investment growth report" : "Calculation report");

  addReportHeader(doc, title, dateStr, pageWidth);
  let startY = investmentBreakdown
    ? addInvestmentSummary(doc, investmentBreakdown.totals, 35, pageWidth)
    : 39;

  if (options.assumption) {
    doc.setFillColor(...REPORT_COLORS.slateSoft);
    doc.roundedRect(16, startY, pageWidth - 32, 10, 2, 2, "F");
    doc.setTextColor(...REPORT_COLORS.muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Calculation basis: ${options.assumption}`, 20, startY + 6);
    startY += 16;
  }

  doc.setTextColor(...REPORT_COLORS.ink);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(investmentBreakdown ? "Annual breakdown" : "Calculation breakdown", 16, startY);
  doc.setTextColor(...REPORT_COLORS.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(
    investmentBreakdown
      ? "Each row separates that year’s activity from cumulative totals. Amounts are rounded to whole units."
      : "Amounts are rounded to whole units.",
    16,
    startY + 5
  );

  autoTable(doc, {
    startY: startY + 9,
    head: [tableHeaders],
    body: tableBody,
    theme: "plain",
    headStyles: {
      fillColor: REPORT_COLORS.ink,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: { top: 2.2, right: 3, bottom: 2.2, left: 3 },
    },
    bodyStyles: {
      textColor: REPORT_COLORS.ink,
      fontSize: 8.5,
      cellPadding: { top: 2.2, right: 3, bottom: 2.2, left: 3 },
    },
    alternateRowStyles: { fillColor: REPORT_COLORS.slateSoft },
    columnStyles: {
      0: { halign: "left", cellWidth: investmentBreakdown ? 34 : "auto" },
      ...Object.fromEntries(tableHeaders.slice(1).map((_, index) => [index + 1, { halign: "right" }])),
    },
    margin: { top: 37, right: 16, bottom: 18, left: 16 },
    willDrawPage: (table) => {
      if (table.pageNumber > 1) addReportHeader(doc, title, dateStr, pageWidth);
    },
    didDrawPage: () => {
      addReportFooter(doc, pageWidth, pageHeight);
    },
  });

  doc.save(filename);
}

export const prefetchPDF = () => {
  // Creating a promise that resolves immediately but triggers the network request
  // webpack/Next.js will see these imports and start loading the chunks
  import("jspdf");
  import("jspdf-autotable");
};

export function downloadCSV(data, headers, filename = "investment_report.csv") {
  const escapeCell = (value) => {
    const raw = value === null || value === undefined ? "" : String(value);
    const escaped = raw.replace(/"/g, '""');
    return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
  };

  const rows = [headers, ...data];
  const csvContent = rows.map((row) => row.map(escapeCell).join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
