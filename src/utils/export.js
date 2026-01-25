export async function downloadPDF(data, headers, filename = "investment_report.pdf") {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF();

  // Add a title
  doc.setFontSize(18);
  doc.text("Investment Report", 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);

  // Add date
  const dateStr = new Date().toLocaleDateString();
  doc.text(`Generated on(MM/DD/YY) : ${dateStr}`, 14, 30);

  // Generate Table
  autoTable(doc, {
    startY: 35,
    head: [headers],
    body: data.map(row =>
      row.map(cell =>
        typeof cell === 'number'
          ? Math.round(cell).toLocaleString('en-IN')
          : cell
      )
    ),
    theme: 'striped',
    headStyles: { fillColor: [13, 148, 136] }, // Teal-600 color
    styles: { fontSize: 9 },
    margin: { top: 35 },
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
