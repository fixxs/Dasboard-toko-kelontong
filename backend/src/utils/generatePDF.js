import PdfPrinter from 'pdfmake';

const fonts = {
  Roboto: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
};

export const exportToPDF = async ({ title, subtitle, headers, rows, summary }) => {
  const printer = new PdfPrinter(fonts);

  const docDefinition = {
    content: [
      { text: title.toUpperCase(), style: 'header', alignment: 'center' },
      { text: subtitle || '', style: 'subheader', alignment: 'center', margin: [0, 0, 0, 15] },
      {
        table: {
          headerRows: 1,
          widths: Array(headers.length).fill('*'),
          body: [
            headers.map((h) => ({ text: h, style: 'tableHeader', alignment: 'center' })),
            ...rows.map((row) => row.map((cell) => ({ text: String(cell !== undefined && cell !== null ? cell : '-'), fontSize: 9 })))
          ]
        },
        layout: 'lightHorizontalLines'
      }
    ],
    styles: {
      header: {
        fontSize: 16,
        bold: true,
        margin: [0, 0, 0, 5]
      },
      subheader: {
        fontSize: 10,
        color: '#475569'
      },
      tableHeader: {
        bold: true,
        fontSize: 10,
        color: '#FFFFFF',
        fillColor: '#1E40AF'
      }
    },
    defaultStyle: {
      font: 'Roboto'
    }
  };

  if (summary && summary.length > 0) {
    docDefinition.content.push({ text: '\n' });
    summary.forEach((item) => {
      docDefinition.content.push({
        text: `${item.label}: ${item.value}`,
        bold: true,
        fontSize: 10,
        margin: [0, 2, 0, 2]
      });
    });
  }

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  
  return new Promise((resolve, reject) => {
    const chunks = [];
    pdfDoc.on('data', (chunk) => chunks.push(chunk));
    pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
    pdfDoc.on('error', (err) => reject(err));
    pdfDoc.end();
  });
};
