const formatDate = (value: string | Date | null | undefined) => {
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

const formatAddressParts = (parts: (string | number | null | undefined)[]) =>
  parts.filter(p => p != null && String(p).trim() !== '').join(', ') || '—';

const getBillingAddress = (customer: any) => {
  const addresses = customer?.addresses ?? [];
  return addresses.find((a: any) => a.type === 'BILLING') || addresses[0];
};

const getShippingAddressRecord = (invoice: any) => {
  const customer = invoice?.customer ?? {};
  const addresses = customer?.addresses ?? [];
  if (invoice?.shippingAddress) return invoice.shippingAddress;
  return addresses.find((a: any) => a.type === 'SHIPPING');
};

const buildPartyBlock = (invoice: any, type: 'bill' | 'ship') => {
  const customer = invoice?.customer ?? {};
  const contact = invoice?.contactPerson;
  const billing = getBillingAddress(customer);
  const shippingRecord = getShippingAddressRecord(invoice);

  if (type === 'bill') {
    const addrText =
      invoice?.billingAddressText?.trim() ||
      (billing ? formatAddressParts([billing.addressLine, billing.place, billing.pinCode]) : '') ||
      '—';

    return `
      <p><strong>${escapeHtml(customer?.companyName || '—')}</strong></p>
      ${customer?.legalName ? `<p>${escapeHtml(customer.legalName)}</p>` : ''}
      ${contact?.name ? `<p><strong>Contact:</strong> ${escapeHtml(contact.name)}${contact.designation ? ` (${escapeHtml(contact.designation)})` : ''}</p>` : ''}
      ${contact?.mobileNo ? `<p><strong>Mobile:</strong> ${escapeHtml(contact.mobileNo)}</p>` : ''}
      ${customer?.email ? `<p><strong>Email:</strong> ${escapeHtml(customer.email)}</p>` : ''}
      <p><strong>Address:</strong> ${escapeHtml(addrText)}</p>
      <p><strong>GSTIN:</strong> ${escapeHtml(invoice?.gstNo || billing?.gstNo || '—')}</p>
      ${customer?.panNo ? `<p><strong>PAN:</strong> ${escapeHtml(customer.panNo)}</p>` : ''}
    `;
  }

  const shipText =
    invoice?.shippingAddressText?.trim() ||
    (shippingRecord
      ? formatAddressParts([
          shippingRecord.addressLine,
          shippingRecord.place,
          shippingRecord.pinCode
        ])
      : '') ||
    '—';

  const attention = shippingRecord?.attentionName;

  return `
    <p><strong>${escapeHtml(customer?.companyName || '—')}</strong></p>
    ${attention ? `<p><strong>Attention:</strong> ${escapeHtml(attention)}</p>` : ''}
    <p><strong>Address:</strong> ${escapeHtml(shipText)}</p>
    ${shippingRecord?.gstNo ? `<p><strong>GSTIN:</strong> ${escapeHtml(shippingRecord.gstNo)}</p>` : ''}
  `;
};

const parseEwayDetails = (raw: string | null | undefined) => {
  if (!raw?.trim()) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const buildEwaySection = (invoice: any) => {
  const eway = parseEwayDetails(invoice?.ewayBillDetails);
  if (!eway) return '';

  const rows = [
    ['Eway Bill No.', eway.ewayBillNo],
    ['Vehicle No.', eway.vehicleNo],
    ['Transporter', eway.transporterName],
    ['LR No.', eway.lrNo],
    ['LR Date', eway.lrDate ? formatDate(eway.lrDate) : '']
  ].filter(([, v]) => v != null && String(v).trim() !== '');

  if (!rows.length) return '';

  return `
    <div class="eway-block">
      <h3>Dispatch / Eway Bill Details</h3>
      <div class="eway-grid">
        ${rows
          .map(
            ([label, value]) => `
          <div class="detail-item">
            <label>${escapeHtml(label)}</label>
            <span>${escapeHtml(String(value))}</span>
          </div>`
          )
          .join('')}
      </div>
    </div>`;
};

const buildBankBlock = (bank: any) => {
  if (!bank) return '';
  return `
    <div class="bank-block">
      <h3>Bank Details</h3>
      <p><strong>${escapeHtml(bank.bank_name || '—')}</strong></p>
      ${bank.account_name ? `<p>A/c Name: ${escapeHtml(bank.account_name)}</p>` : ''}
      ${bank.account_number ? `<p>A/c No.: ${escapeHtml(bank.account_number)}</p>` : ''}
      ${bank.ifsc_code ? `<p>IFSC: ${escapeHtml(bank.ifsc_code)}</p>` : ''}
      ${bank.branch_name ? `<p>Branch: ${escapeHtml(bank.branch_name)}</p>` : ''}
    </div>`;
};

export function buildTaxInvoicePrintHtml(invoice: any, company: any) {
  const lines = invoice?.lineItems ?? [];
  const bank = invoice?.bankAccount;

  const companyAddress = formatAddressParts([
    company?.address_line_1,
    company?.address_line_2,
    company?.place,
    company?.pin_code ? `- ${company.pin_code}` : ''
  ]);

  const lineRows = lines
    .map(
      (line: any, index: number) => `
      <tr>
        <td class="center">${index + 1}</td>
        <td>${escapeHtml(line.description || line.itemDetails || '—')}</td>
        <td class="center">${escapeHtml(line.customerItemCode || '—')}</td>
        <td class="center">${escapeHtml(line.hsnCode || '—')}</td>
        <td class="right">${line.qty ?? 0}</td>
        <td class="right">${formatMoney(line.rate)}</td>
        <td class="right">${line.discountPercentage ?? 0}%</td>
        <td class="right">${formatMoney(line.taxableAmount)}</td>
        <td class="right">${formatMoney(line.cgstAmount)}<br/><small>(${line.cgstRate ?? 0}%)</small></td>
        <td class="right">${formatMoney(line.sgstAmount)}<br/><small>(${line.sgstRate ?? 0}%)</small></td>
        <td class="right">${formatMoney(line.igstAmount)}<br/><small>(${line.igstRate ?? 0}%)</small></td>
        <td class="right">${formatMoney(line.lineTotal)}</td>
      </tr>`
    )
    .join('');

  const roundOffRow =
    invoice?.roundOffEnabled && Number(invoice?.roundOff)
      ? `<tr><td>Round Off</td><td>${formatMoney(invoice.roundOff)}</td></tr>`
      : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Tax Invoice ${escapeHtml(invoice?.invoiceNo || '')}</title>
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
    .doc-title { text-align: right; }
    .doc-title h1 {
      font-size: 26px;
      font-weight: 700;
      color: #1a3a6e;
      letter-spacing: 1px;
    }
    .doc-title .meta { margin-top: 6px; font-size: 12px; }
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
    .eway-block, .bank-block {
      margin-bottom: 14px;
      padding: 10px 14px;
      border: 1px solid #e0e4ea;
      border-radius: 4px;
      background: #fafbfc;
    }
    .eway-block h3, .bank-block h3 {
      font-size: 11px;
      text-transform: uppercase;
      color: #555;
      margin-bottom: 8px;
    }
    .eway-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
    }
    .remarks-block {
      margin-bottom: 14px;
      padding: 8px 12px;
      border-left: 3px solid #1a3a6e;
      background: #f9fafb;
    }
    table.items {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 11px;
    }
    table.items th {
      background: #1a3a6e;
      color: #fff;
      font-size: 9px;
      font-weight: 600;
      padding: 8px 5px;
      text-align: left;
      border: 1px solid #15305a;
    }
    table.items td {
      padding: 7px 5px;
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
    .terms-block { flex: 1; min-width: 0; }
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
    .totals-block { width: 300px; flex-shrink: 0; }
    .totals-table { width: 100%; border-collapse: collapse; }
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
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 48px;
      gap: 40px;
    }
    .sign-box { flex: 1; text-align: center; }
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
      <h1>TAX INVOICE</h1>
      <div class="meta">
        <p><strong>Invoice No:</strong> ${escapeHtml(invoice?.invoiceNo || '—')}</p>
        <p><strong>Invoice Date:</strong> ${formatDate(invoice?.invoiceDate)}</p>
        ${invoice?.dueDate ? `<p><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</p>` : ''}
      </div>
    </div>
  </div>

  <div class="parties">
    <div class="party-box">
      <h3>Bill To</h3>
      ${buildPartyBlock(invoice, 'bill')}
    </div>
    <div class="party-box">
      <h3>Ship To</h3>
      ${buildPartyBlock(invoice, 'ship')}
    </div>
  </div>

  <div class="details-grid">
    <div class="detail-item">
      <label>Supply Type</label>
      <span>${escapeHtml(invoice?.supplyType || '—')}</span>
    </div>
    <div class="detail-item">
      <label>Plant Unit</label>
      <span>${escapeHtml(invoice?.plantUnit?.unit_name || '—')}</span>
    </div>
    <div class="detail-item">
      <label>Warehouse</label>
      <span>${escapeHtml(invoice?.warehouse?.name || '—')}</span>
    </div>
    <div class="detail-item">
      <label>Payment Terms</label>
      <span>${escapeHtml(invoice?.paymentTerms?.term_name || '—')}</span>
    </div>
    <div class="detail-item">
      <label>Customer PO</label>
      <span>${escapeHtml(invoice?.customerPoNo || '—')}${invoice?.customerPoDate ? ` (${formatDate(invoice.customerPoDate)})` : ''}</span>
    </div>
    <div class="detail-item">
      <label>Sales Order</label>
      <span>${invoice?.refSalesOrderId ? `#${invoice.refSalesOrderId}` : escapeHtml(invoice?.salesOrderNo || '—')}</span>
    </div>
    <div class="detail-item">
      <label>Despatch Doc.</label>
      <span>${escapeHtml(invoice?.despatchDocNo || '—')}</span>
    </div>
    <div class="detail-item">
      <label>Despatch Through</label>
      <span>${escapeHtml(invoice?.despatchThrough || '—')}</span>
    </div>
    <div class="detail-item">
      <label>Destination</label>
      <span>${escapeHtml(invoice?.destination || '—')}</span>
    </div>
  </div>

  ${buildEwaySection(invoice)}
  ${buildBankBlock(bank)}
  ${invoice?.remarks ? `<div class="remarks-block"><strong>Remarks:</strong> ${escapeHtml(invoice.remarks)}</div>` : ''}

  <table class="items">
    <thead>
      <tr>
        <th class="center" style="width:28px">#</th>
        <th>Description</th>
        <th class="center" style="width:64px">Cust. Code</th>
        <th class="center" style="width:58px">HSN</th>
        <th class="right" style="width:44px">Qty</th>
        <th class="right" style="width:68px">Rate</th>
        <th class="right" style="width:44px">Disc%</th>
        <th class="right" style="width:72px">Taxable</th>
        <th class="right" style="width:68px">CGST</th>
        <th class="right" style="width:68px">SGST</th>
        <th class="right" style="width:68px">IGST</th>
        <th class="right" style="width:72px">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${lineRows || '<tr><td colspan="12" class="center">No line items</td></tr>'}
    </tbody>
  </table>

  <div class="bottom-section">
    <div class="terms-block">
      <h3>Terms &amp; Conditions</h3>
      <p>${escapeHtml(invoice?.termsAndConditions || '—')}</p>
    </div>
    <div class="totals-block">
      <table class="totals-table">
        <tr><td>Taxable Amount</td><td>${formatMoney(invoice?.grossAmount)}</td></tr>
        <tr><td>CGST Total</td><td>${formatMoney(invoice?.cgstAmount)}</td></tr>
        <tr><td>SGST Total</td><td>${formatMoney(invoice?.sgstAmount)}</td></tr>
        <tr><td>IGST Total</td><td>${formatMoney(invoice?.igstAmount)}</td></tr>
        <tr><td>Shipping Charge</td><td>${formatMoney(invoice?.shippingCharge)}</td></tr>
        <tr><td>TCS</td><td>${formatMoney(invoice?.tcsAmount)}</td></tr>
        ${roundOffRow}
        <tr class="grand"><td>Grand Total</td><td>${formatMoney(invoice?.grandTotal)}</td></tr>
      </table>
    </div>
  </div>

  <div class="signatures">
    <div class="sign-box">
      <div class="sign-line">For ${escapeHtml(company?.company_name || 'Company')}</div>
      <p class="sign-sub">Authorized Signatory</p>
    </div>
    <div class="sign-box">
      <div class="sign-line">For ${escapeHtml(invoice?.customer?.companyName || 'Customer')}</div>
      <p class="sign-sub">Received By</p>
    </div>
  </div>
</body>
</html>`;
}

export function printTaxInvoice(invoice: any, company: any) {
  const html = buildTaxInvoicePrintHtml(invoice, company);
  const printWindow = window.open('', '_blank', 'width=960,height=720');

  if (!printWindow) {
    alert('Please allow pop-ups to print the tax invoice.');
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
