import { Platform, Alert, PermissionsAndroid } from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import jsPDF from 'jspdf';

// Try importing RNHTMLtoPDF dynamically if available natively
let RNHTMLtoPDF: any = null;
try {
  RNHTMLtoPDF = require('react-native-html-to-pdf');
} catch (e) {
  console.log('RNHTMLtoPDF native module not linked, will use jsPDF fallback.');
}

export const generateReceiptHtml = (transaction: any, transactionId: string): string => {
  const stationName = transaction.stationName || transaction.station?.name || 'Nayara Fuel Station';
  const dateStr = transaction.date || new Date().toLocaleDateString('en-GB');
  const timeStr = transaction.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const workerName = transaction.workerName || 'Pump Attendant';
  const workerId = transaction.workerId || '';
  const customerName = transaction.customerName || '';
  const customerId = transaction.customerId || '';
  const groupName = transaction.groupName || '';
  const fuelType = transaction.fuelType || 'Fuel';
  const quantity = Number(transaction.quantity || transaction.litres || transaction.liters || 0);
  const fuelTotal = Number(transaction.fuelTotal || (transaction.amount + (transaction.discountAmount || 0)));
  const discountAmount = Number(transaction.discountAmount || 0);
  const discountPercentage = Number(transaction.discountPercentage || 0);
  const finalAmount = Number(transaction.amount || 0);
  const status = (transaction.status || 'Completed').toUpperCase();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1e293b;
      padding: 24px;
      margin: 0;
      background-color: #ffffff;
    }
    .receipt-container {
      max-width: 550px;
      margin: 0 auto;
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      padding: 28px;
      background: #ffffff;
    }
    .header {
      text-align: center;
      border-bottom: 2px dashed #cbd5e1;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 800;
      color: #003E5C;
      letter-spacing: 1.5px;
      margin: 0 0 6px 0;
      text-transform: uppercase;
    }
    .station-sub {
      font-size: 14px;
      color: #64748b;
      font-weight: 600;
    }
    .status-badge {
      display: inline-block;
      margin-top: 12px;
      padding: 6px 16px;
      background-color: #e6f4ea;
      color: #137333;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
      border: 1px solid #ceead6;
    }
    .info-group {
      margin-bottom: 20px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      font-size: 14px;
    }
    .info-label {
      color: #64748b;
      font-weight: 500;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.5px;
    }
    .info-value {
      color: #0f172a;
      font-weight: 700;
      text-align: right;
    }
    .id-highlight {
      color: #003E5C;
      font-family: 'Courier New', Courier, monospace;
      font-size: 16px;
      font-weight: 800;
    }
    .divider {
      height: 1px;
      background-color: #e2e8f0;
      margin: 16px 0;
    }
    .item-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }
    .item-table th {
      background-color: #f1f5f9;
      color: #334155;
      font-size: 12px;
      font-weight: 700;
      text-align: left;
      padding: 10px 12px;
      text-transform: uppercase;
    }
    .item-table td {
      padding: 12px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 14px;
      color: #1e293b;
    }
    .total-box {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 18px;
      margin-top: 20px;
    }
    .discount-text {
      color: #16a34a;
      font-weight: 700;
    }
    .grand-total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 2px solid #cbd5e1;
    }
    .grand-total-label {
      font-size: 14px;
      font-weight: 800;
      color: #003E5C;
      text-transform: uppercase;
    }
    .grand-total-value {
      font-size: 26px;
      font-weight: 900;
      color: #003E5C;
    }
    .footer {
      text-align: center;
      margin-top: 28px;
      padding-top: 16px;
      border-top: 1px dashed #cbd5e1;
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="header">
      <div class="brand-title">FuelPoint</div>
      <div class="station-sub">${stationName}</div>
      <div class="status-badge">${status}</div>
    </div>

    <div class="info-group">
      <div class="info-row">
        <span class="info-label">Receipt / Txn ID</span>
        <span class="info-value id-highlight">${transactionId}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Date & Time</span>
        <span class="info-value">${dateStr}, ${timeStr}</span>
      </div>
    </div>

    <div class="divider"></div>

    <div class="info-group">
      <div class="info-row">
        <span class="info-label">Worker / Attendant</span>
        <span class="info-value">${workerName} ${workerId ? `(${workerId})` : ''}</span>
      </div>
      ${customerName || customerId ? `
      <div class="info-row">
        <span class="info-label">Customer</span>
        <span class="info-value">${customerName || 'Customer'} ${customerId ? `(${customerId})` : ''}</span>
      </div>` : ''}
      ${groupName ? `
      <div class="info-row">
        <span class="info-label">Group Name</span>
        <span class="info-value">${groupName}</span>
      </div>` : ''}
    </div>

    <table class="item-table">
      <thead>
        <tr>
          <th>Fuel Description</th>
          <th style="text-align: center;">Qty (Ltrs)</th>
          <th style="text-align: right;">Fuel Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>${fuelType}</strong></td>
          <td style="text-align: center;">${quantity > 0 ? quantity.toFixed(2) : '-'}</td>
          <td style="text-align: right;">₹${fuelTotal.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <div class="total-box">
      <div class="info-row">
        <span class="info-label">Subtotal Amount</span>
        <span class="info-value">₹${fuelTotal.toFixed(2)}</span>
      </div>
      ${discountAmount > 0 ? `
      <div class="info-row">
        <span class="info-label discount-text">Discount (${discountPercentage}%)</span>
        <span class="info-value discount-text">- ₹${discountAmount.toFixed(2)}</span>
      </div>` : ''}
      <div class="grand-total-row">
        <span class="grand-total-label">Final Amount Paid</span>
        <span class="grand-total-value">₹${finalAmount.toFixed(2)}</span>
      </div>
    </div>

    <div class="footer">
      Thank you for your business!<br/>
      Keep this receipt for your records. Transaction ID: <strong>${transactionId}</strong>
    </div>
  </div>
</body>
</html>
  `;
};

const requestStoragePermission = async () => {
  if (Platform.OS === 'android' && Platform.Version < 33) {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission Required',
          message: 'FuelPoint requires storage permission to save your receipt PDF on your device.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Storage permission error:', err);
      return true;
    }
  }
  return true;
};

export const downloadReceiptPdf = async (transaction: any): Promise<string> => {
  if (!transaction) throw new Error('Transaction details not available');

  // Extract human-readable transaction ID for file naming
  const transactionId = String(
    transaction.displayId || transaction.receiptNo || transaction.transactionId || transaction.id || 'TXN_RECEIPT'
  ).trim();

  // Sanitize filename to ensure it is valid on mobile filesystems
  const sanitizedFileName = transactionId.replace(/[/\\?%*:|"<>]/g, '_');
  const fileNameWithExt = `${sanitizedFileName}.pdf`;

  await requestStoragePermission();

  const htmlContent = generateReceiptHtml(transaction, transactionId);

  let targetPath = '';

  // Determine target directory on mobile device
  let targetDir = Platform.OS === 'android'
    ? RNFS.DownloadDirectoryPath || RNFS.DocumentDirectoryPath || RNFS.ExternalStorageDirectoryPath
    : RNFS.DocumentDirectoryPath;

  targetPath = `${targetDir}/${fileNameWithExt}`;

  let pdfGeneratedSuccessfully = false;

  // Method 1: Try RNHTMLtoPDF native module if available
  if (RNHTMLtoPDF && typeof RNHTMLtoPDF.convert === 'function') {
    try {
      const pdfOptions = {
        html: htmlContent,
        fileName: sanitizedFileName,
        directory: Platform.OS === 'android' ? 'Download' : 'Documents',
      };

      const pdfFile = await RNHTMLtoPDF.convert(pdfOptions);
      if (pdfFile && pdfFile.filePath) {
        // Copy created file to target path if needed
        if (pdfFile.filePath !== targetPath) {
          try {
            if (await RNFS.exists(targetPath)) {
              await RNFS.unlink(targetPath);
            }
            await RNFS.copyFile(pdfFile.filePath, targetPath);
          } catch (copyErr) {
            console.log('Using original pdf path:', pdfFile.filePath);
            targetPath = pdfFile.filePath;
          }
        }
        pdfGeneratedSuccessfully = true;
      }
    } catch (htmlToPdfErr) {
      console.warn('RNHTMLtoPDF failed, falling back to jsPDF:', htmlToPdfErr);
    }
  }

  // Method 2: jsPDF Fallback if Method 1 is unavailable or throws error
  if (!pdfGeneratedSuccessfully) {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const stationName = transaction.stationName || transaction.station?.name || 'Nayara Fuel Station';
      const dateStr = transaction.date || new Date().toLocaleDateString('en-GB');
      const timeStr = transaction.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const workerName = transaction.workerName || 'Pump Attendant';
      const fuelType = transaction.fuelType || 'Fuel';
      const quantity = Number(transaction.quantity || transaction.litres || transaction.liters || 0);
      const fuelTotal = Number(transaction.fuelTotal || (transaction.amount + (transaction.discountAmount || 0)));
      const discountAmount = Number(transaction.discountAmount || 0);
      const discountPercentage = Number(transaction.discountPercentage || 0);
      const finalAmount = Number(transaction.amount || 0);

      // PDF Content Design
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(0, 62, 92); // #003E5C
      doc.text('FUELPOINT RECEIPT', 105, 20, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(100, 116, 139);
      doc.text(stationName, 105, 27, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(19, 115, 51); // Green badge
      doc.text('[ VERIFIED & SETTLED ]', 105, 33, { align: 'center' });

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(20, 38, 190, 38);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('Receipt / Txn ID:', 20, 47);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 62, 92);
      doc.text(transactionId, 60, 47);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('Date & Time:', 20, 54);
      doc.setFont('helvetica', 'normal');
      doc.text(`${dateStr}, ${timeStr}`, 60, 54);

      doc.setFont('helvetica', 'bold');
      doc.text('Worker / Attendant:', 20, 61);
      doc.setFont('helvetica', 'normal');
      doc.text(`${workerName} ${transaction.workerId ? `(${transaction.workerId})` : ''}`, 65, 61);

      if (transaction.customerName || transaction.customerId) {
        doc.setFont('helvetica', 'bold');
        doc.text('Customer:', 20, 68);
        doc.setFont('helvetica', 'normal');
        doc.text(`${transaction.customerName || 'Customer'} ${transaction.customerId ? `(${transaction.customerId})` : ''}`, 60, 68);
      }

      if (transaction.groupName) {
        doc.setFont('helvetica', 'bold');
        doc.text('Group Name:', 20, 75);
        doc.setFont('helvetica', 'normal');
        doc.text(transaction.groupName, 60, 75);
      }

      doc.line(20, 81, 190, 81);

      // Table Headers
      doc.setFillColor(241, 245, 249);
      doc.rect(20, 85, 170, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      doc.text('FUEL DESCRIPTION', 24, 90.5);
      doc.text('QTY (LTRS)', 110, 90.5, { align: 'center' });
      doc.text('AMOUNT', 184, 90.5, { align: 'right' });

      // Table Row
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text(String(fuelType), 24, 101);
      doc.text(quantity > 0 ? quantity.toFixed(2) : '-', 110, 101, { align: 'center' });
      doc.text(`Rs. ${fuelTotal.toFixed(2)}`, 184, 101, { align: 'right' });

      doc.line(20, 106, 190, 106);

      // Totals Box
      doc.setFillColor(248, 250, 252);
      doc.rect(20, 112, 170, 36, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(20, 112, 170, 36, 'S');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('Subtotal Fuel Amount:', 25, 120);
      doc.setTextColor(30, 41, 59);
      doc.text(`Rs. ${fuelTotal.toFixed(2)}`, 184, 120, { align: 'right' });

      if (discountAmount > 0) {
        doc.setTextColor(22, 163, 74);
        doc.text(`Discount (${discountPercentage}%):`, 25, 127);
        doc.text(`- Rs. ${discountAmount.toFixed(2)}`, 184, 127, { align: 'right' });
      }

      doc.setDrawColor(203, 213, 225);
      doc.line(25, 133, 185, 133);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(0, 62, 92);
      doc.text('FINAL AMOUNT PAID:', 25, 142);
      doc.setFontSize(15);
      doc.text(`Rs. ${finalAmount.toFixed(2)}`, 184, 142, { align: 'right' });

      // Footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text('Thank you for your visit!', 105, 160, { align: 'center' });
      doc.text(`Transaction Reference: ${transactionId}`, 105, 165, { align: 'center' });

      // Output base64 and write to filesystem
      const pdfDataUri = doc.output('datauristring');
      const base64Data = pdfDataUri.split(',')[1];

      if (await RNFS.exists(targetPath)) {
        await RNFS.unlink(targetPath);
      }
      await RNFS.writeFile(targetPath, base64Data, 'base64');
      pdfGeneratedSuccessfully = true;
    } catch (jsPdfErr) {
      console.error('jsPDF generation error:', jsPdfErr);
      throw jsPdfErr;
    }
  }

  // Offer share / save to Files dialog if possible
  try {
    const fileUrl = Platform.OS === 'android' ? `file://${targetPath}` : targetPath;
    if (Share && typeof Share.open === 'function') {
      await Share.open({
        url: fileUrl,
        type: 'application/pdf',
        filename: sanitizedFileName,
        title: `Receipt ${transactionId}`,
        subject: `Fuel Receipt - ${transactionId}`,
        failOnCancel: false,
      });
    }
  } catch (shareErr) {
    console.log('Share prompt dismissed or unavailable:', shareErr);
  }

  return targetPath;
};
