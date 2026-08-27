/**
 * emailTemplates.ts
 * Centralized, production-grade, responsive HTML email templates for Aartha.
 * 
 * Standards:
 * - Clean semantic typography with system + Inter fallbacks
 * - Brand palette: Dark Navy (#0F1F35), Amber Accent (#D97706), Slate Neutral (#F3F4F6)
 * - Anti-phishing security cues & clear CTA buttons
 * - Transactional footer with legal compliance notices
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://aartha.site';

function baseEmailWrapper(contentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Aartha Notification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0F1F35; text-align: left;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px;">AARTHA</span>
                    <span style="display: block; font-size: 11px; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase; margin-top: 2px;">India's Verified Manufacturing Network</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content Body -->
          <tr>
            <td style="padding: 32px; font-size: 15px; line-height: 1.6; color: #334155;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
              <p style="margin: 0 0 8px 0;">This is an automated operational notification regarding your Aartha account or sourcing activity.</p>
              <p style="margin: 0 0 12px 0;">Need assistance? Reach our sourcing desk at <a href="mailto:support@aartha.site" style="color: #d97706; text-decoration: none; font-weight: 500;">support@aartha.site</a></p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">&copy; ${new Date().getFullYear()} Aartha Platform. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// 1. Account Verification OTP
export function getOtpEmail(otp: string, recipientEmail: string): { subject: string; html: string } {
  const content = `
    <h2 style="font-size: 20px; font-weight: 700; color: #0F1F35; margin: 0 0 16px 0;">Verify Your Corporate Account</h2>
    <p style="margin: 0 0 16px 0;">Thank you for registering on Aartha. Use the 6-digit verification code below to confirm your business profile:</p>
    
    <div style="background-color: #f1f5f9; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
      <span style="font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0F1F35; display: inline-block; margin-left: 8px;">${otp}</span>
    </div>

    <p style="font-size: 13px; color: #64748b; margin: 0 0 16px 0;"><strong>Security Notice:</strong> This code is valid for <strong>2 minutes</strong>. Never disclose this code to anyone. Aartha personnel will never ask for your verification code.</p>
    <p style="font-size: 13px; color: #94a3b8; margin: 0;">If you did not initiate this request for <code>${recipientEmail}</code>, please contact <a href="mailto:security@aartha.site" style="color: #d97706;">security@aartha.site</a> immediately.</p>
  `;
  return {
    subject: `Aartha Verification Code: ${otp}`,
    html: baseEmailWrapper(content),
  };
}

// 2. Password Reset Code
export function getPasswordResetEmail(otp: string, email: string): { subject: string; html: string } {
  const content = `
    <h2 style="font-size: 20px; font-weight: 700; color: #0F1F35; margin: 0 0 16px 0;">Password Reset Request</h2>
    <p style="margin: 0 0 16px 0;">We received a request to reset the password for your account associated with <strong>${email}</strong>.</p>
    
    <div style="background-color: #f1f5f9; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
      <span style="font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0F1F35; display: inline-block; margin-left: 8px;">${otp}</span>
    </div>

    <p style="font-size: 13px; color: #64748b; margin: 0 0 16px 0;">This password reset code will expire in <strong>15 minutes</strong>. If you did not request a password change, you can safely ignore this email — your account remains secure.</p>
  `;
  return {
    subject: `Aartha Password Reset Code: ${otp}`,
    html: baseEmailWrapper(content),
  };
}

// 3. Supplier Application Confirmation
export function getSupplierApplicationEmail(params: {
  contactName: string;
  companyName: string;
  applicationId: string;
  gstin: string;
  city: string;
  category: string;
}): { subject: string; html: string } {
  const content = `
    <h2 style="font-size: 20px; font-weight: 700; color: #0F1F35; margin: 0 0 16px 0;">Supplier Verification Application Logged</h2>
    <p style="margin: 0 0 16px 0;">Dear ${params.contactName},</p>
    <p style="margin: 0 0 20px 0;">Thank you for submitting <strong>${params.companyName}</strong> for physical verification on Aartha.</p>
    
    <table width="100%" cellpadding="8" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; margin-bottom: 24px;">
      <tr><td style="color: #64748b; width: 40%;">Application ID:</td><td style="font-weight: 600; color: #0F1F35;">${params.applicationId}</td></tr>
      <tr><td style="color: #64748b;">GSTIN / Reg:</td><td style="font-weight: 600; color: #0F1F35;">${params.gstin}</td></tr>
      <tr><td style="color: #64748b;">Industrial Cluster:</td><td style="font-weight: 600; color: #0F1F35;">${params.city}</td></tr>
      <tr><td style="color: #64748b;">Category:</td><td style="font-weight: 600; color: #0F1F35;">${params.category}</td></tr>
    </table>

    <h3 style="font-size: 15px; font-weight: 600; color: #0F1F35; margin: 0 0 8px 0;">Next Verification Steps:</h3>
    <ol style="margin: 0 0 20px 0; padding-left: 20px; font-size: 14px; color: #475569;">
      <li style="margin-bottom: 6px;">Compliance audit of submitted GSTIN and statutory registrations.</li>
      <li style="margin-bottom: 6px;">Our field auditor will coordinate the on-site facility verification and GPS perimeter audit.</li>
      <li>Upon approval, your verified profile and trust badge will be published to global procurement buyers.</li>
    </ol>
  `;
  return {
    subject: `Aartha Application Received — ${params.applicationId}`,
    html: baseEmailWrapper(content),
  };
}

// 4. RFQ Submission Confirmation (to Buyer)
export function getRfqSubmittedEmail(params: {
  contactName: string;
  companyName: string;
  rfqId: string;
  product: string;
  quantity: string;
  unit: string;
  category: string;
}): { subject: string; html: string } {
  const content = `
    <h2 style="font-size: 20px; font-weight: 700; color: #0F1F35; margin: 0 0 16px 0;">RFQ Successfully Submitted</h2>
    <p style="margin: 0 0 16px 0;">Dear ${params.contactName},</p>
    <p style="margin: 0 0 20px 0;">Your sourcing requirement for <strong>${params.product}</strong> has been logged in the Aartha verified network.</p>
    
    <table width="100%" cellpadding="8" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; margin-bottom: 24px;">
      <tr><td style="color: #64748b; width: 40%;">RFQ Reference:</td><td style="font-weight: 600; color: #0F1F35;">${params.rfqId}</td></tr>
      <tr><td style="color: #64748b;">Product:</td><td style="font-weight: 600; color: #0F1F35;">${params.product}</td></tr>
      <tr><td style="color: #64748b;">Required Volume:</td><td style="font-weight: 600; color: #0F1F35;">${params.quantity} ${params.unit}</td></tr>
      <tr><td style="color: #64748b;">Category:</td><td style="font-weight: 600; color: #0F1F35;">${params.category}</td></tr>
    </table>

    <p style="margin: 0 0 20px 0;">Our matching algorithm and sourcing desk are routing this requirement to verified manufacturers in matching industrial clusters. You will be notified as soon as verified quotes are submitted.</p>

    <div style="text-align: center; margin: 28px 0 12px 0;">
      <a href="${BASE_URL}/dashboard" style="background-color: #0F1F35; color: #ffffff; text-decoration: none; padding: 12px 24px; font-weight: 600; font-size: 14px; border-radius: 6px; display: inline-block;">View Sourcing Dashboard</a>
    </div>
  `;
  return {
    subject: `Aartha RFQ Logged — ${params.rfqId} (${params.product})`,
    html: baseEmailWrapper(content),
  };
}

// 5. Direct Enquiry Routed (to Buyer)
export function getEnquiryRoutedEmail(params: {
  contactName: string;
  companyName: string;
  enquiryId: string;
  productName: string;
  quantity: string;
  unit: string;
  targetSupplier: string;
}): { subject: string; html: string } {
  const content = `
    <h2 style="font-size: 20px; font-weight: 700; color: #0F1F35; margin: 0 0 16px 0;">Direct Factory Enquiry Dispatched</h2>
    <p style="margin: 0 0 16px 0;">Dear ${params.contactName},</p>
    <p style="margin: 0 0 20px 0;">Your direct enquiry for <strong>${params.productName}</strong> has been transmitted directly to the verified supplier.</p>
    
    <table width="100%" cellpadding="8" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; margin-bottom: 24px;">
      <tr><td style="color: #64748b; width: 40%;">Enquiry Reference:</td><td style="font-weight: 600; color: #0F1F35;">${params.enquiryId}</td></tr>
      <tr><td style="color: #64748b;">Target Supplier:</td><td style="font-weight: 600; color: #0F1F35;">${params.targetSupplier}</td></tr>
      <tr><td style="color: #64748b;">Quantity:</td><td style="font-weight: 600; color: #0F1F35;">${params.quantity} ${params.unit}</td></tr>
    </table>

    <p style="margin: 0 0 20px 0;">Verified suppliers on Aartha respond on average within 2 to 4 business hours. Track responses and message the factory directly via your procurement workspace.</p>
  `;
  return {
    subject: `Aartha Enquiry Dispatched — ${params.enquiryId}`,
    html: baseEmailWrapper(content),
  };
}

// 6. Payment Confirmation (Aartha Protect)
export function getPaymentConfirmedEmail(params: {
  buyerName: string;
  orderId: string;
  poNumber: string;
  amountInrFormatted: string;
  providerPaymentRef: string;
}): { subject: string; html: string } {
  const content = `
    <h2 style="font-size: 20px; font-weight: 700; color: #0F1F35; margin: 0 0 16px 0;">Payment Protected & Confirmed</h2>
    <p style="margin: 0 0 16px 0;">Dear ${params.buyerName},</p>
    <p style="margin: 0 0 20px 0;">Your payment for Purchase Order <strong>${params.poNumber}</strong> has been successfully captured and registered under Aartha Protect.</p>
    
    <table width="100%" cellpadding="8" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; margin-bottom: 24px;">
      <tr><td style="color: #64748b; width: 40%;">Order ID:</td><td style="font-weight: 600; color: #0F1F35;">${params.orderId}</td></tr>
      <tr><td style="color: #64748b;">PO Number:</td><td style="font-weight: 600; color: #0F1F35;">${params.poNumber}</td></tr>
      <tr><td style="color: #64748b;">Total Amount:</td><td style="font-weight: 700; color: #0F1F35;">₹${params.amountInrFormatted}</td></tr>
      <tr><td style="color: #64748b;">Payment Ref:</td><td style="font-weight: 600; color: #0F1F35;">${params.providerPaymentRef}</td></tr>
      <tr><td style="color: #64748b;">Protection Status:</td><td style="font-weight: 600; color: #059669;">Payment Confirmed (Protected)</td></tr>
    </table>

    <p style="font-size: 13px; color: #475569; margin: 0 0 20px 0;"><strong>Aartha Protect Guarantee:</strong> Settlement release occurs strictly upon delivery and inspection milestone approval. The factory has been notified to initiate production.</p>
  `;
  return {
    subject: `Payment Confirmed: PO ${params.poNumber} (Aartha Protect)`,
    html: baseEmailWrapper(content),
  };
}
