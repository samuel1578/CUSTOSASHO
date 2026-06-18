import { NNSOrderRecord } from './appwrite';
import logo from '../assets/logo.png';

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

/**
 * Check if deadline is overdue
 */
export const isDeadlineOverdue = (deadline: string | null): boolean => {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
};

/**
 * Check if deadline is approaching (within 3 days)
 */
export const isDeadlineApproaching = (deadline: string | null): boolean => {
  if (!deadline) return false;
  const deadlineDate = new Date(deadline);
  const today = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(today.getDate() + 3);

  return deadlineDate > today && deadlineDate <= threeDaysFromNow;
};

/**
 * Format deadline display
 */
export const formatDeadline = (deadline: string | null): string => {
  if (!deadline) return 'No deadline';

  const date = new Date(deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
  } else if (diffDays === 0) {
    return 'Due today';
  } else if (diffDays === 1) {
    return 'Due tomorrow';
  } else if (diffDays <= 7) {
    return `Due in ${diffDays} days`;
  } else {
    return date.toLocaleDateString();
  }
};

/**
 * Print order details (Admin Receipt)
 */
export const printOrderDetails = (order: NNSOrderRecord) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const statusLabels: Record<string, string> = {
    pending_review: 'Pending Review',
    in_design: 'In Design',
    design_complete: 'Design Complete',
    awaiting_approval: 'Awaiting Approval',
    approved: 'Approved',
    revision_requested: 'Revision Requested',
    in_production: 'In Production',
    quality_check: 'Quality Check',
    ready_for_pickup: 'Ready for Pickup',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    on_hold: 'On Hold',
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Admin Receipt - #${order.id.slice(0, 8)}</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
          padding: 40px; 
          max-width: 800px;
          margin: 0 auto;
          line-height: 1.6;
          color: #1a1a1a;
          background: white;
        }
        header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-left: 2px solid #C9A84C;
          padding-left: 20px;
          margin-bottom: 40px;
        }
        .logo-box {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo-img {
          height: 50px;
        }
        .brand-name {
          font-family: serif;
          font-weight: 300;
          color: #666;
          font-size: 14px;
          letter-spacing: 1px;
        }
        h2 {
          color: #C9A84C;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin: 30px 0 15px 0;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
        }
        .field-row {
          display: flex;
          padding: 8px 0;
          border-bottom: 1px solid #f9f9f9;
        }
        .label {
          width: 200px;
          color: #888;
          font-size: 13px;
        }
        .value {
          flex: 1;
          color: #1a1a1a;
          font-weight: 500;
          font-size: 14px;
        }
        .brief {
          padding: 15px;
          background: #fcfcfc;
          border: 1px solid #f0f0f0;
          font-size: 14px;
          white-space: pre-wrap;
        }
        .footer {
          margin-top: 60px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #999;
          font-size: 11px;
          display: flex;
          justify-content: space-between;
        }
        @media print {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        @media screen and (max-width: 768px) {
          body { font-size: 14px; }
          .field-row { flex-direction: column; }
        }
        button {
          background: #1a1a1a;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          margin-top: 30px;
          float: right;
        }
      </style>
    </head>
    <body>
      <header>
        <div class="logo-box">
          <img src="${logo}" class="logo-img" />
          <span class="brand-name">CustoSasho</span>
        </div>
        <div style="text-align: right">
          <div style="font-size: 12px; font-weight: bold">Internal Order Record</div>
          <div style="font-size: 10px; color: #999">#${order.id.slice(0, 8)}</div>
        </div>
      </header>
      
      <h2>Customer Details</h2>
      <div class="field-row"><div class="label">Full Name</div><div class="value">${order.fullName}</div></div>
      <div class="field-row"><div class="label">Email Address</div><div class="value">${order.email}</div></div>
      <div class="field-row"><div class="label">Phone Number</div><div class="value">${order.phone || '—'}</div></div>
      <div class="field-row"><div class="label">Course / Programme</div><div class="value">${order.course}</div></div>
      <div class="field-row"><div class="label">School</div><div class="value">${order.school}</div></div>
      <div class="field-row"><div class="label">Graduation Year</div><div class="value">${order.graduationYear || '—'}</div></div>

      <h2>Production Info</h2>
      <div class="field-row"><div class="label">Order Status</div><div class="value">${statusLabels[order.status] || order.status}</div></div>
      <div class="field-row"><div class="label">Priority Level</div><div class="value" style="text-transform: capitalize;">${order.priority}</div></div>
      <div class="field-row"><div class="label">Payment Status</div><div class="value" style="text-transform: capitalize;">${order.paymentStatus}</div></div>
      <div class="field-row"><div class="label">Delivery Method</div><div class="value" style="text-transform: capitalize;">${order.deliveryMethod}</div></div>
      ${order.trackingNumber && order.trackingNumber !== 'N/A' ? `<div class="field-row"><div class="label">Tracking Number</div><div class="value">${order.trackingNumber}</div></div>` : ''}
      ${order.deadline ? `<div class="field-row"><div class="label">Deadline</div><div class="value">${new Date(order.deadline).toLocaleDateString()}</div></div>` : ''}

      <h2>Design Brief</h2>
      <div class="brief">${order.designBrief}</div>

      <div class="footer">
        <div>ID: ${order.id.slice(0, 8)} | Submitted: ${new Date(order.submittedAt).toLocaleDateString()}</div>
        <div>Printed: ${new Date().toLocaleString()}</div>
      </div>

      <button onclick="window.print()">Print Order Record</button>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 500);
};

/**
 * Print order details (Member Receipt)
 */
export const printOrderDetailsUser = (order: NNSOrderRecord) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const statusLabels: Record<string, string> = {
    pending_review: 'Pending Review',
    in_design: 'In Design',
    design_complete: 'Design Complete',
    awaiting_approval: 'Awaiting Approval',
    approved: 'Approved',
    revision_requested: 'Revision Requested',
    in_production: 'In Production',
    quality_check: 'Quality Check',
    ready_for_pickup: 'Ready for Pickup',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    on_hold: 'On Hold',
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Order Receipt - ${order.fullName}</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
          padding: 0; 
          margin: 0;
          line-height: 1.6;
          color: white;
          background: #0a0a0a;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          border-top: 4px solid #C9A84C;
        }
        header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 50px;
        }
        .logo-box {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .logo-img {
          height: 60px;
        }
        .brand-name {
          font-weight: bold;
          color: #C9A84C;
          font-size: 24px;
          letter-spacing: 1px;
        }
        h2 {
          color: #C9A84C;
          font-size: 14px;
          text-transform: uppercase;
          font-weight: bold;
          letter-spacing: 2px;
          margin: 40px 0 20px 0;
        }
        .card {
          background: #1a1a1a;
          border-left: 3px solid #C9A84C;
          padding: 20px;
          margin-bottom: 15px;
          border-radius: 0 8px 8px 0;
        }
        .field-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .label {
          color: #888;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 4px;
        }
        .value {
          color: white;
          font-weight: 500;
          font-size: 15px;
        }
        .price-box {
          background: #C9A84C;
          color: #0a0a0a;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin-top: 30px;
        }
        .price-label {
          font-size: 12px;
          text-transform: uppercase;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .price-value {
          font-size: 32px;
          font-weight: 900;
        }
        .brief-card {
          background: #1a1a1a;
          padding: 25px;
          border-radius: 8px;
          font-size: 15px;
          border: 1px solid #333;
          white-space: pre-wrap;
        }
        .footer {
          margin-top: 80px;
          text-align: center;
          padding-bottom: 40px;
        }
        .thank-you {
          color: #C9A84C;
          font-style: italic;
          font-size: 18px;
          margin-bottom: 15px;
        }
        .footer-meta {
          color: #666;
          font-size: 12px;
        }
        @media print { 
          button { display: none; }
          body { background: #0a0a0a !important; color: white !important; }
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        @media screen and (max-width: 768px) {
          body { font-size: 14px; }
          .field-grid { grid-template-columns: 1fr; }
        }
        button {
          background: #C9A84C;
          color: #0a0a0a;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          margin-top: 20px;
          transition: opacity 0.2s;
        }
        button:hover {
          opacity: 0.9;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <div class="logo-box">
            <img src="${logo}" class="logo-img" />
            <span class="brand-name">CustoSasho</span>
          </div>
          <div style="text-align: right">
            <div class="label">Receipt Number</div>
            <div class="value">#${order.id.slice(0, 8)}</div>
          </div>
        </header>

        <div class="card">
          <div class="field-grid">
            <div>
              <div class="label">Customer</div>
              <div class="value">${order.fullName}</div>
            </div>
            <div>
              <div class="label">Contact</div>
              <div class="value">${order.email}</div>
              <div class="value" style="font-size: 13px; margin-top: 2px;">${order.phone || ''}</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="field-grid">
            <div>
              <div class="label">Programme</div>
              <div class="value">${order.course}</div>
            </div>
            <div>
              <div class="label">Institution</div>
              <div class="value">${order.school}</div>
              <div class="value" style="font-size: 13px; margin-top: 2px;">Class of ${order.graduationYear || 'N/A'}</div>
            </div>
          </div>
        </div>

        <h2>Order Status</h2>
        <div class="card">
          <div class="field-grid">
            <div>
              <div class="label">Current Status</div>
              <div class="value">${statusLabels[order.status] || order.status}</div>
            </div>
            <div>
              <div class="label">Delivery Method</div>
              <div class="value" style="text-transform: capitalize;">${order.deliveryMethod}</div>
            </div>
          </div>
        </div>

        <div class="price-box">
          <div class="price-label">Total Amount Paid / Due</div>
          <div class="price-value">¢${order.price}</div>
          <div style="font-size: 11px; margin-top: 5px; opacity: 0.8; text-transform: uppercase; letter-spacing: 1px;">
            Payment Status: ${order.paymentStatus}
          </div>
        </div>

        <h2>Your Design Brief</h2>
        <div class="brief-card">${order.designBrief}</div>

        <div class="footer">
          <div class="thank-you">Thank you for your order</div>
          <div class="footer-meta">
            Order ID: ${order.id} | Submitted: ${new Date(order.submittedAt).toLocaleDateString()}
          </div>
        </div>

        <div style="text-align: center;">
          <button onclick="window.print()">Download Receipt (PDF)</button>
        </div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 500);
};

/**
 * Generate email notification template
 */
export const generateStatusUpdateEmail = (order: NNSOrderRecord, newStatus: string): string => {
  const statusMessages: Record<string, string> = {
    'pending_review': 'Your order is being reviewed by our team.',
    'in_design': 'Our designers are working on your custom stole!',
    'design_complete': 'Your design is complete and awaiting your approval.',
    'awaiting_approval': 'Please review and approve your design.',
    'approved': 'Design approved! Moving to production.',
    'in_production': 'Your stole is being crafted.',
    'quality_check': 'Final quality inspection in progress.',
    'ready_for_pickup': 'Your order is ready for pickup!',
    'out_for_delivery': 'Your order is on the way!',
    'delivered': 'Order delivered successfully!',
  };

  const statusLabel = newStatus.replace(/_/g, ' ').toUpperCase();

  return `Dear ${order.fullName},

Great news! Your custom stole order has been updated.

ORDER STATUS UPDATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: ${statusLabel}
${statusMessages[newStatus] || 'Your order status has been updated.'}

ORDER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order ID: #${order.id.slice(0, 8)}
Course: ${order.course}
Price: ¢${order.price}
${order.trackingNumber ? `Tracking Number: ${order.trackingNumber}` : ''}
${order.deadline ? `Expected Completion: ${new Date(order.deadline).toLocaleDateString()}` : ''}

${order.status === 'ready_for_pickup' || order.status === 'out_for_delivery' ? `
Please contact us to arrange ${order.deliveryMethod === 'pickup' ? 'pickup' : 'delivery'}.
` : ''}

If you have any questions, please don't hesitate to contact us.

Best regards,
CustoSasho Team
Custom Graduation Stoles | Crafted to Represent`;
};

/**
 * Scroll to an element with offset and smooth behavior
 */
export const scrollToElement = (elementId: string, offset = 100) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const bodyRect = document.body.getBoundingClientRect().top;
  const elementRect = element.getBoundingClientRect().top;
  const elementPosition = elementRect - bodyRect;
  const offsetPosition = elementPosition - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth',
  });
};

/**
 * Robust scroll lock for mobile devices
 */
export const setScrollLock = (lock: boolean) => {
  if (typeof document === 'undefined') return;

  const body = document.body;
  const scrollLockClass = 'scroll-lock';

  if (lock) {
    // Save current scroll position
    const scrollY = window.scrollY;
    body.style.top = `-${scrollY}px`;
    body.classList.add(scrollLockClass);
  } else {
    // Retrieve scroll position
    const scrollY = Math.abs(parseInt(body.style.top || '0', 10));
    body.classList.remove(scrollLockClass);
    body.style.removeProperty('top');
    window.scrollTo(0, scrollY);
  }
};
