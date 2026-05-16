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

const prTypeLabel = (value: string) => {
  const map: Record<string, string> = {
    MATERIAL: 'Material',
    SERVICE: 'Service',
    CAPITAL: 'Capital',
    CONSUMABLE: 'Consumable'
  };
  return map[value] || value || '—';
};

const getItemName = (itemId: number | null, items: any[]) => {
  if (!itemId) return '—';
  const item = items.find(i => i.id === itemId);
  return item?.itemName || `Item #${itemId}`;
};

export function buildPurchaseIndentPrintHtml(indent: any, company: any, items: any[] = []) {
  const lines = indent?.lineItems ?? [];
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
        <td class="center">${formatDate(line.requiredDate)}</td>
        <td>${escapeHtml(line.suggestedVendor?.companyName || '—')}</td>
        <td>${escapeHtml(line.details || '—')}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Purchase Indent #${indent?.id ?? ''}</title>
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
      <h1>PURCHASE INDENT</h1>
      <div class="meta">
        <p><strong>Indent No:</strong> ${escapeHtml(String(indent?.id ?? '—'))}</p>
        <p><strong>Indent Date:</strong> ${formatDate(indent?.indentDate)}</p>
      </div>
    </div>
  </div>

  <div class="details-grid">
    <div class="detail-item">
      <label>PR Approval Path</label>
      <span>${escapeHtml(indent?.prApprovalPath || '—')}</span>
    </div>
    <div class="detail-item">
      <label>Department</label>
      <span>${escapeHtml(indent?.department ? `${indent.department.code} - ${indent.department.name}` : '—')}</span>
    </div>
    <div class="detail-item">
      <label>Ref SO No.</label>
      <span>${indent?.refSalesOrderId ? escapeHtml(`SO #${indent.refSalesOrderId}`) : '—'}</span>
    </div>
    <div class="detail-item">
      <label>Ref Prod Pln No.</label>
      <span>${escapeHtml(indent?.refProdPlnNo || '—')}</span>
    </div>
    <div class="detail-item">
      <label>Plant Unit</label>
      <span>${escapeHtml(indent?.plantUnit?.unit_name || '—')}</span>
    </div>
    <div class="detail-item">
      <label>Type of PR</label>
      <span>${escapeHtml(prTypeLabel(indent?.typeOfPr))}</span>
    </div>
    <div class="detail-item">
      <label>Doc Attachment</label>
      <span>${indent?.docAttachmentRequired ? 'Yes' : 'No'}</span>
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
        <th class="center" style="width:80px">Require Date</th>
        <th>Suggested Vendor</th>
        <th>Details</th>
      </tr>
    </thead>
    <tbody>
      ${lineRows || '<tr><td colspan="8" class="center">No line items</td></tr>'}
    </tbody>
  </table>

  ${
    indent?.remarks
      ? `<div class="remarks-block">
    <h3>Remarks</h3>
    <p>${escapeHtml(indent.remarks)}</p>
  </div>`
      : ''
  }

  <div class="signatures">
    <div class="sign-box">
      <div class="sign-line">Prepared By</div>
      <p class="sign-sub">Department</p>
    </div>
    <div class="sign-box">
      <div class="sign-line">Approved By</div>
      <p class="sign-sub">Authorized Signatory</p>
    </div>
  </div>
</body>
</html>`;
}

export function printPurchaseIndent(indent: any, company: any, items: any[] = []) {
  const html = buildPurchaseIndentPrintHtml(indent, company, items);
  const printWindow = window.open('', '_blank', 'width=960,height=720');

  if (!printWindow) {
    alert('Please allow pop-ups to print the purchase indent.');
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


