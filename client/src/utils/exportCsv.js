/**
 * Exports JSON array to a downloadable CSV file
 * @param {Array<Object>} data Array of objects to export
 * @param {string} filename Name of the downloaded CSV file
 */
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }

  // Extract headers
  const headers = Object.keys(data[0]);

  // Construct CSV content
  const csvRows = [];
  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header];
      if (val === null || val === undefined) {
        return '""';
      }
      const stringified = String(val).replace(/"/g, '""');
      return `"${stringified}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
