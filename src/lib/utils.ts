import { NNSOrderRecord } from './appwrite';

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
 * Print order details
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
      <title>Order #${order.id.slice(0, 8)}</title>
      <style>
        body { 
          font-family: 'Arial', sans-serif; 
          padding: 40px; 
          max-width: 800px;
          margin: 0 auto;
          line-height: 1.6;
        }
        h1 { 
          color: #333; 
          border-bottom: 3px solid #333; 
          padding-bottom: 10px;
          margin-bottom: 30px;
        }
        h2 {
          color: #555;
          margin-top: 30px;
          margin-bottom: 15px;
          font-size: 18px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .section { 
          margin: 20px 0; 
          padding: 20px;
          background: #f9f9f9;
          border-radius: 8px;
        }
        .label { 
          font-weight: bold; 
          color: #666;
          width: 180px;
          display: inline-block;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 10px 0; 
        }
        td { 
          padding: 12px 8px; 
          border-bottom: 1px solid #ddd; 
        }
        .brief {
          background: white;
          padding: 15px;
          border-radius: 4px;
          border-left: 4px solid #333;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          color: #666;
          font-size: 12px;
        }
        @media print { 
          button { display: none; }
          body { padding: 20px; }
        }
        button {
          background: #333;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          margin-top: 20px;
        }
        button:hover {
          background: #555;
        }
      </style>
    </head>
    <body>
      <h1>CustoSasho - Order Details</h1>
      
      <div class="section">
        <h2>Customer Information</h2>
        <table>
          <tr><td class="label">Full Name:</td><td>${order.fullName}</td></tr>
          <tr><td class="label">Email:</td><td>${order.email}</td></tr>
          <tr><td class="label">Phone:</td><td>${order.phone || 'N/A'}</td></tr>
          <tr><td class="label">Course:</td><td>${order.course}</td></tr>
          <tr><td class="label">School:</td><td>${order.school}</td></tr>
          <tr><td class="label">Graduation Year:</td><td>${order.graduationYear || 'N/A'}</td></tr>
        </table>
      </div>

      <div class="section">
        <h2>Order Information</h2>
        <table>
          <tr><td class="label">Order ID:</td><td>${order.id}</td></tr>
          <tr><td class="label">Status:</td><td><strong>${statusLabels[order.status] || order.status}</strong></td></tr>
          <tr><td class="label">Priority:</td><td style="text-transform: capitalize;">${order.priority}</td></tr>
          <tr><td class="label">Price:</td><td><strong>¢${order.price}</strong></td></tr>
          <tr><td class="label">Payment Status:</td><td style="text-transform: capitalize;">${order.paymentStatus}</td></tr>
          ${order.paymentMethod ? `<tr><td class="label">Payment Method:</td><td>${order.paymentMethod}</td></tr>` : ''}
          <tr><td class="label">Delivery Method:</td><td style="text-transform: capitalize;">${order.deliveryMethod}</td></tr>
          <tr><td class="label">Tracking Number:</td><td>${order.trackingNumber || 'N/A'}</td></tr>
          <tr><td class="label">Deadline:</td><td>${order.deadline ? new Date(order.deadline).toLocaleDateString() : 'No deadline set'}</td></tr>
        </table>
      </div>

      <div class="section">
        <h2>Design Brief</h2>
        <div class="brief">${order.designBrief}</div>
      </div>

      ${order.adminNotes ? `
      <div class="section">
        <h2>Admin Notes</h2>
        <div class="brief">${order.adminNotes}</div>
      </div>
      ` : ''}

      <div class="footer">
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Submitted:</strong> ${new Date(order.submittedAt).toLocaleString()}</p>
        <p><strong>Last Updated:</strong> ${order.lastStatusUpdate ? new Date(order.lastStatusUpdate).toLocaleString() : 'N/A'}</p>
        <p style="margin-top: 20px;">Printed on ${new Date().toLocaleString()}</p>
      </div>

      <button onclick="window.print()">📄 Print this Order</button>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
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
