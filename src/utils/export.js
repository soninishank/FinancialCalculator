import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function downloadPDF(data, headers, filename = "investment_report.pdf") {
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