import ExcelJS from 'exceljs';

export const exportToExcel = async ({ title, sheetName = 'Laporan', columns, data, summaryRows = [] }) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Title Row
  worksheet.mergeCells('A1', `${String.fromCharCode(64 + columns.length)}1`);
  const titleCell = worksheet.getCell('A1');
  titleCell.value = title.toUpperCase();
  titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: '1E293B' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.addRow([]); // Blank row

  // Header Row
  const headerRow = worksheet.addRow(columns.map((col) => col.header));
  headerRow.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFF' } };
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1E40AF' } // Indigo 800
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Data Rows
  data.forEach((item) => {
    const rowValues = columns.map((col) => {
      const val = col.key.split('.').reduce((acc, curr) => (acc ? acc[curr] : ''), item);
      return val !== undefined && val !== null ? val : '-';
    });
    const addedRow = worksheet.addRow(rowValues);
    addedRow.font = { name: 'Arial', size: 10 };
  });

  // Add Summary Rows if provided
  if (summaryRows && summaryRows.length > 0) {
    worksheet.addRow([]);
    summaryRows.forEach((sRow) => {
      const row = worksheet.addRow(sRow);
      row.font = { name: 'Arial', size: 10, bold: true };
    });
  }

  // Adjust Column Widths
  worksheet.columns.forEach((column, index) => {
    let maxLen = columns[index]?.header?.length || 12;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const len = cell.value ? cell.value.toString().length : 0;
      if (len > maxLen) maxLen = len;
    });
    column.width = Math.min(Math.max(maxLen + 4, 12), 40);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};
