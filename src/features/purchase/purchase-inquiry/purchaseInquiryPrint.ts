const formatDate = (value: string | Date) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const escapeHtml = (text: string) =>
  String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const getItemName = (itemId: number | null, items: any[]) => {
  if (!itemId) return '—';
  const item = items.find(i => i.id === itemId);
  return item?.itemName || `Item #${itemId}`;
};

export function buildPurchaseInquiryPrintHtml(inquiry: any, company: any, items: any[] = []) {
  const lines = inquiry?.lineItems ?? [];
  const companyAddress = [company?.address_line_1, company?.address_line_2, company?.place, company?.pin_code]
    .filter(p => p != null && String(p).trim() !== '')
    .join(', ');

  const lineRows = lines
    .map(
      (line: any, index: number) => `
      <tr>
        <td class="center">${index + 1}</td>
        <td>${escapeHtml(getItemName(line.itemId, items))}</td>
        <td>${escapeHtml(line.description || '—')}</td>
        <td class="right">${line.qty ?? 0}</td>
        <td class="center">${escapeHtml(line.unitId ? String(line.unitId) : '—')}</td>
        <td class="center">${escapeHtml(line.hsnCode || '—')}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Purchase Inquiry #${inquiry?.id ?? ''}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 12px;
      color: #1a1a1a;
      padding: 24px 28px;
      line-height: 1.45;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #1a3a6e;
      padding-bottom: 14px;
      margin-bottom: 18px;
    }
    .company-name {
      font-size: 22px;
      font-weight: 700;
      color: #1a3a6e;
      margin-bottom: 6px;
    }
    .doc-title h1 {
      font-size: 24px;
      font-weight: 700;
      color: #1a3a6e;
      text-align: right;
    }
    .doc-title .meta {
      margin-top: 6px;
      font-size: 12px;
      text-align: right;
    }
    .details-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 18px;
      background: #f5f7fa;
      padding: 12px 14px;
      border-radius: 4px;
      border: 1px solid #e0e4ea;
    }
    .detail-item label {
      display: block;
      font-size: 10px;
      text-transform: uppercase;
      color: #666;
      margin-bottom: 2px;
    }
    .detail-item span { font-weight: 600; }
    table.items {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    table.items th {
      background: #1a3a6e;
      color: #fff;
      font-size: 10px;
      font-weight: 600;
      padding: 8px 6px;
      text-align: left;
      border: 1px solid #15305a;
    }
    table.items td {
      padding: 7px 6px;
      border: 1px solid #ddd;
      vertical-align: top;
    }
    table.items tbody tr:nth-child(even) { background: #f9fafb; }
    .center { text-align: center; }
    .right { text-align: right; }
    .remarks-block {
      margin-top: 12px;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .remarks-block h3 {
      font-size: 12px;
      margin-bottom: 6px;
      color: #1a3a6e;
    }
    .remarks-block p {
      white-space: pre-wrap;
      font-size: 11px;
    }
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 48px;
      gap: 40px;
    }
    .sign-box {
      flex: 1;
      text-align: center;
    }
    .sign-line {
      border-top: 1px solid #333;
      margin-top: 56px;
      padding-top: 8px;
      font-weight: 600;
    }
    .sign-sub { font-size: 10px; color: #666; margin-top: 4px; }
    @media print {
      body { padding: 12px 16px; }
      @page { margin: 12mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company-name">${escapeHtml(company?.company_name || 'Company Name')}</div>
      ${companyAddress ? `<p>${escapeHtml(companyAddress)}</p>` : ''}
      ${company?.gst_no ? `<p><strong>GSTIN:</strong> ${escapeHtml(company.gst_no)}</p>` : ''}
    </div>
    <div class="doc-title">
      <h1>PURCHASE INQUIRY</h1>
      <div class="meta">
        <p><strong>Inquiry No:</strong> ${escapeHtml(String(inquiry?.id ?? '—'))}</p>
        <p><strong>Enquiry Date:</strong> ${formatDate(inquiry?.enquiryDate)}</p>
      </div>
    </div>
  </div>

  <div class="details-grid">
    <div class="detail-item">
      <label>Approval Path</label>
      <span>${escapeHtml(inquiry?.approvalPath || '—')}</span>
    </div>
    <div class="detail-item">
      <label>Ref SO No.</label>
      <span>${inquiry?.refSalesOrderId ? escapeHtml(`SO #${inquiry.refSalesOrderId}`) : '—'}</span>
    </div>
    <div class="detail-item">
      <label>Ref Production No.</label>
      <span>${escapeHtml(inquiry?.refProductionNo || '—')}</span>
    </div>
    <div class="detail-item">
      <label>Supplier</label>
      <span>${escapeHtml(inquiry?.supplier?.companyName || '—')}</span>
    </div>
    <div class="detail-item">
      <label>Required Delivery Date</label>
      <span>${formatDate(inquiry?.requiredDeliveryDate)}</span>
    </div>
    <div class="detail-item">
      <label>Valid Till Date</label>
      <span>${formatDate(inquiry?.validTillDate)}</span>
    </div>
    <div class="detail-item">
      <label>Unit Plant</label>
      <span>${escapeHtml(inquiry?.plantUnit?.unit_name || '—')}</span>
    </div>
    <div class="detail-item">
      <label>Ref Purchase Indent</label>
      <span>${inquiry?.refPurchaseIndentId ? escapeHtml(`Indent #${inquiry.refPurchaseIndentId}`) : '—'}</span>
    </div>
    <div class="detail-item">
      <label>Doc Attachment</label>
      <span>${inquiry?.docAttachmentRequired ? 'Yes' : 'No'}</span>
    </div>
  </div>

  <table class="items">
    <thead>
      <tr>
        <th class="center" style="width:32px">#</th>
        <th>Item Code/Name</th>
        <th>Description</th>
        <th class="right" style="width:50px">Qty</th>
        <th class="center" style="width:50px">Unit</th>
        <th class="center" style="width:70px">HSN Code</th>
      </tr>
    </thead>
    <tbody>
      ${lineRows || '<tr><td colspan="6" class="center">No line items</td></tr>'}
    </tbody>
  </table>

  ${
    inquiry?.remarks
      ? `<div class="remarks-block">
    <h3>Remarks</h3>
    <p>${escapeHtml(inquiry.remarks)}</p>
  </div>`
      : ''
  }

  <div class="signatures">
    <div class="sign-box">
      <div class="sign-line">Prepared By</div>
      <p class="sign-sub">Purchase Department</p>
    </div>
    <div class="sign-box">
      <div class="sign-line">Approved By</div>
      <p class="sign-sub">Authorized Signatory</p>
    </div>
  </div>
</body>
</html>`;
}

export function printPurchaseInquiry(inquiry: any, company: any, items: any[] = []) {
  const html = buildPurchaseInquiryPrintHtml(inquiry, company, items);
  const printWindow = window.open('', '_blank', 'width=960,height=720');

  if (!printWindow) {
    alert('Please allow pop-ups to print the purchase inquiry.');
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };

  setTimeout(() => {
    if (printWindow.document.readyState === 'complete') {
      printWindow.focus();
      printWindow.print();
    }
  }, 400);
}

