import { saveAs } from "file-saver";

export function downloadCSV(data, headers, filename = "investment_data.csv") {
  // data should be an array of arrays: [ ["Year 1", 100, 200], ... ]
  
  const csvContent =
    headers.join(",") +
    "\n" +
    data
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, filename);
}