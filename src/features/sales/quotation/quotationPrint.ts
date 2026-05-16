const formatDate = (value: string | Date) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const formatMoney = (value: number) =>
  `₹${(Number(value) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const escapeHtml = (text: string) =>
  String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const getBillingAddress = (customer: any) => {
  const addresses = customer?.addresses ?? [];
  return addresses.find((a: any) => a.type === 'BILLING') || addresses[0];
};

const formatAddress = (parts: (string | number | null | undefined)[]) =>
  parts.filter(p => p != null && String(p).trim() !== '').join(', ');

export function buildQuotationPrintHtml(quotation: any, company: any) {
  const customer = quotation?.customer ?? {};
  const billing = getBillingAddress(customer);
  const contact = quotation?.contactPerson;
  const bank = quotation?.bankAccount;
  const lines = quotation?.lineItems ?? [];

  const companyAddress = formatAddress([
    company?.address_line_1,
    company?.address_line_2,
    company?.place,
    company?.pin_code ? `- ${company.pin_code}` : ''
  ]);

  const customerAddress = billing
    ? formatAddress([billing.addressLine, billing.place, billing.pinCode])
    : '—';

  const lineRows = lines
    .map(
      (line: any, index: number) => `
      <tr>
        <td class="center">${index + 1}</td>
        <td>${escapeHtml(line.description || '—')}</td>
        <td class="center">${escapeHtml(line.hsnCode || '—')}</td>
        <td class="right">${line.qty ?? 0}</td>
        <td class="right">${formatMoney(line.rate)}</td>
        <td class="right">${line.discountPercentage ?? 0}%</td>
        <td class="right">${formatMoney(line.taxableAmount)}</td>
        <td class="right">${formatMoney(line.cgstAmount)}<br/><small>(${line.cgstRate ?? 0}%)</small></td>
        <td class="right">${formatMoney(line.sgstAmount)}<br/><small>(${line.sgstRate ?? 0}%)</small></td>
        <td class="right">${formatMoney(line.lineTotal)}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Quotation #${quotation?.id ?? ''}</title>
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
    .doc-title {
      text-align: right;
    }
    .doc-title h1 {
      font-size: 26px;
      font-weight: 700;
      color: #1a3a6e;
      letter-spacing: 1px;
    }
    .doc-title .meta {
      margin-top: 6px;
      font-size: 12px;
    }
    .parties {
      display: flex;
      gap: 20px;
      margin-bottom: 18px;
    }
    .party-box {
      flex: 1;
      border: 1px solid #ccc;
      padding: 12px 14px;
      border-radius: 4px;
    }
    .party-box h3 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #555;
      margin-bottom: 8px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 4px;
    }
    .party-box p { margin-bottom: 4px; }
    .party-box strong { color: #222; }
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
    small { font-size: 9px; color: #666; }
    .bottom-section {
      display: flex;
      gap: 20px;
      align-items: flex-start;
      margin-top: 8px;
    }
    .terms-block {
      flex: 1;
      min-width: 0;
    }
    .terms-block h3 {
      font-size: 12px;
      margin-bottom: 6px;
      color: #1a3a6e;
    }
    .terms-block p {
      white-space: pre-wrap;
      font-size: 11px;
      color: #333;
    }
    .totals-block {
      width: 280px;
      flex-shrink: 0;
    }
    .totals-table {
      width: 100%;
      border-collapse: collapse;
    }
    .totals-table td {
      padding: 6px 10px;
      border: 1px solid #ddd;
    }
    .totals-table td:last-child {
      text-align: right;
      font-weight: 600;
    }
    .totals-table tr.grand td {
      background: #1a3a6e;
      color: #fff;
      font-size: 14px;
      font-weight: 700;
    }
    .bank-block {
      margin-top: 14px;
      padding: 10px 12px;
      border: 1px dashed #999;
      border-radius: 4px;
      font-size: 11px;
    }
    .bank-block h3 { font-size: 11px; margin-bottom: 6px; color: #1a3a6e; }
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
      ${company?.phone ? `<p><strong>Mobile:</strong> ${escapeHtml(company.phone)}${company.phone_2 ? ` / ${escapeHtml(company.phone_2)}` : ''}</p>` : ''}
      ${company?.email_id ? `<p><strong>Email:</strong> ${escapeHtml(company.email_id)}</p>` : ''}
      ${company?.gst_no ? `<p><strong>GSTIN:</strong> ${escapeHtml(company.gst_no)}</p>` : ''}
      ${company?.pan_no ? `<p><strong>PAN:</strong> ${escapeHtml(company.pan_no)}</p>` : ''}
    </div>
    <div class="doc-title">
      <h1>QUOTATION</h1>
      <div class="meta">
        <p><strong>Quotation No:</strong> ${escapeHtml(String(quotation?.id ?? '—'))}</p>
        <p><strong>Date:</strong> ${formatDate(quotation?.quoteDate)}</p>
        <p><strong>Valid Till:</strong> ${formatDate(quotation?.expiryDate)}</p>
      </div>
    </div>
  </div>

  <div class="parties">
    <div class="party-box">
      <h3>Quotation To</h3>
      <p><strong>${escapeHtml(customer?.companyName || '—')}</strong></p>
      ${customer?.legalName ? `<p>${escapeHtml(customer.legalName)}</p>` : ''}
      ${contact?.name ? `<p><strong>Contact:</strong> ${escapeHtml(contact.name)}${contact.designation ? ` (${escapeHtml(contact.designation)})` : ''}</p>` : ''}
      ${contact?.mobileNo ? `<p><strong>Mobile:</strong> ${escapeHtml(contact.mobileNo)}</p>` : ''}
      ${customer?.email ? `<p><strong>Email:</strong> ${escapeHtml(customer.email)}</p>` : ''}
      <p><strong>Address:</strong> ${escapeHtml(customerAddress)}</p>
      <p><strong>GSTIN:</strong> ${escapeHtml(quotation?.gstNo || billing?.gstNo || '—')}</p>
      ${customer?.panNo ? `<p><strong>PAN:</strong> ${escapeHtml(customer.panNo)}</p>` : ''}
    </div>
  </div>

  <div class="details-grid">
    <div class="detail-item">
      <label>Quote Type</label>
      <span>${quotation?.quoteType === 'SERVICE' ? 'Service' : 'Goods'}</span>
    </div>
    <div class="detail-item">
      <label>Payment Terms</label>
      <span>${escapeHtml(quotation?.paymentTerms?.term_name || '—')}</span>
    </div>
    <div class="detail-item">
      <label>Contact No.</label>
      <span>${escapeHtml(customer?.contactNo || '—')}</span>
    </div>
    <div class="detail-item">
      <label>Vendor Code</label>
      <span>${escapeHtml(customer?.vendorCode || '—')}</span>
    </div>
  </div>

  <table class="items">
    <thead>
      <tr>
        <th class="center" style="width:32px">#</th>
        <th>Description</th>
        <th class="center" style="width:70px">HSN/SAC</th>
        <th class="right" style="width:50px">Qty</th>
        <th class="right" style="width:72px">Rate</th>
        <th class="right" style="width:52px">Disc%</th>
        <th class="right" style="width:80px">Taxable</th>
        <th class="right" style="width:80px">CGST</th>
        <th class="right" style="width:80px">SGST</th>
        <th class="right" style="width:80px">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${lineRows || '<tr><td colspan="10" class="center">No line items</td></tr>'}
    </tbody>
  </table>

  <div class="bottom-section">
    <div class="terms-block">
      <h3>Terms &amp; Conditions</h3>
      <p>${escapeHtml(quotation?.termsAndConditions || '—')}</p>
      ${
        bank
          ? `<div class="bank-block">
        <h3>Bank Details</h3>
        <p><strong>Bank:</strong> ${escapeHtml(bank.bank_name)} | <strong>A/C:</strong> ${escapeHtml(bank.account_number)}</p>
        <p><strong>IFSC:</strong> ${escapeHtml(bank.ifsc_code || '—')} | <strong>Branch:</strong> ${escapeHtml(bank.branch_name || '—')}</p>
        ${bank.account_name ? `<p><strong>A/C Name:</strong> ${escapeHtml(bank.account_name)}</p>` : ''}
      </div>`
          : ''
      }
    </div>
    <div class="totals-block">
      <table class="totals-table">
        <tr><td>Subtotal (incl. tax)</td><td>${formatMoney(quotation?.grossAmount)}</td></tr>
        <tr><td>CGST Total</td><td>${formatMoney(quotation?.cgstAmount)}</td></tr>
        <tr><td>SGST Total</td><td>${formatMoney(quotation?.sgstAmount)}</td></tr>
        <tr><td>Shipping Charge</td><td>${formatMoney(quotation?.shippingCharge)}</td></tr>
        <tr class="grand"><td>Grand Total</td><td>${formatMoney(quotation?.grandTotal)}</td></tr>
      </table>
    </div>
  </div>

  <div class="signatures">
    <div class="sign-box">
      <div class="sign-line">For ${escapeHtml(company?.company_name || 'Company')}</div>
      <p class="sign-sub">Authorized Signatory</p>
    </div>
    <div class="sign-box">
      <div class="sign-line">For ${escapeHtml(customer?.companyName || 'Customer')}</div>
      <p class="sign-sub">Accepted By</p>
    </div>
  </div>
</body>
</html>`;
}

export function printQuotation(quotation: any, company: any) {
  const html = buildQuotationPrintHtml(quotation, company);
  const printWindow = window.open('', '_blank', 'width=960,height=720');

  if (!printWindow) {
    alert('Please allow pop-ups to print the quotation.');
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
