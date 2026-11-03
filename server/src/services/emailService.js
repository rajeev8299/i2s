import nodemailer from 'nodemailer';
import prisma from '../config/db.js';
import { logAudit } from './auditService.js';

/**
 * Creates and returns a configured Nodemailer transporter.
 * If SMTP credentials are configured in environment variables, it connects to that SMTP server.
 * If not configured, in development it utilizes an Ethereal/mock transport or logs the email body safely.
 */
let cachedTransporter = null;

export const getMailTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production',
      },
    });
    return cachedTransporter;
  }

  // Fallback transporter when live SMTP credentials are not yet configured in .env
  // Provides full simulation with complete preview logging without crashing
  cachedTransporter = {
    isSimulated: true,
    sendMail: async (mailOptions) => {
      console.log('----------------------------------------------------');
      console.log(`[EMAIL DISPATCH - SIMULATED / DEV MODE]`);
      console.log(`To: ${mailOptions.to}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`From: ${mailOptions.from}`);
      console.log(`[HTML Body Length]: ${mailOptions.html?.length || 0} characters`);
      console.log('----------------------------------------------------');
      return {
        messageId: `simulated-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@imagination2software.com`,
        accepted: [mailOptions.to],
        rejected: [],
        response: '250 Simulated delivery OK (Configure SMTP_HOST in .env for external relay)',
      };
    },
  };

  return cachedTransporter;
};

/**
 * Generates the clean, responsive HTML welcome email template.
 */
export const buildWelcomeEmailHtml = ({
  userName,
  userEmail,
  departmentName,
  assignedRole,
  loginUrl,
}) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to I2S — Your Account Has Been Approved</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1E293B;
      line-height: 1.6;
    }
    .wrapper {
      width: 100%;
      background-color: #F8FAFC;
      padding: 30px 15px;
      box-sizing: border-box;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
      border: 1px solid #E2E8F0;
    }
    .header {
      background: linear-gradient(135deg, #1765E8 0%, #0F4098 100%);
      padding: 30px 40px;
      text-align: center;
      color: #FFFFFF;
    }
    .header-logo {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin: 0;
      color: #FFFFFF;
    }
    .header-sub {
      font-size: 14px;
      opacity: 0.9;
      margin-top: 4px;
      color: #E2E8F0;
    }
    .content {
      padding: 36px 40px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #0F172A;
      margin-bottom: 16px;
    }
    .lead-text {
      font-size: 15px;
      color: #334155;
      margin-bottom: 24px;
    }
    .card {
      background-color: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 20px 24px;
      margin-bottom: 28px;
    }
    .card-title {
      font-size: 14px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #1765E8;
      margin-top: 0;
      margin-bottom: 14px;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 8px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 14px;
      border-bottom: 1px dashed #E2E8F0;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      color: #64748B;
      font-weight: 500;
    }
    .detail-value {
      color: #0F172A;
      font-weight: 700;
      text-align: right;
    }
    .status-badge {
      display: inline-block;
      background-color: #DCFCE7;
      color: #166534;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 12px;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0 24px;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #1765E8 0%, #104AB3 100%);
      color: #FFFFFF !important;
      font-size: 15px;
      font-weight: 700;
      text-decoration: none;
      padding: 13px 32px;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(23, 101, 232, 0.25);
    }
    .help-text {
      font-size: 13px;
      color: #64748B;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #E2E8F0;
    }
    .footer {
      background-color: #F1F5F9;
      padding: 20px 40px;
      text-align: center;
      font-size: 12px;
      color: #64748B;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1 class="header-logo">Imagination2Software</h1>
        <div class="header-sub">I2S Business Management Platform</div>
      </div>
      <div class="content">
        <div class="greeting">Dear ${userName},</div>
        <p class="lead-text">
          Welcome to I2S! We are pleased to inform you that your registration request has been approved. Your account is now approved, and you have been assigned to the following department.
        </p>

        <div class="card">
          <div class="card-title">Account Details</div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 7px 0; color: #64748B; font-size: 14px; font-weight: 500;">Name:</td>
              <td style="padding: 7px 0; color: #0F172A; font-size: 14px; font-weight: 700; text-align: right;">${userName}</td>
            </tr>
            <tr>
              <td style="padding: 7px 0; color: #64748B; font-size: 14px; font-weight: 500;">Email:</td>
              <td style="padding: 7px 0; color: #0F172A; font-size: 14px; font-weight: 700; text-align: right;">${userEmail}</td>
            </tr>
            <tr>
              <td style="padding: 7px 0; color: #64748B; font-size: 14px; font-weight: 500;">Assigned Department:</td>
              <td style="padding: 7px 0; color: #1765E8; font-size: 14px; font-weight: 700; text-align: right;">${departmentName}</td>
            </tr>
            <tr>
              <td style="padding: 7px 0; color: #64748B; font-size: 14px; font-weight: 500;">Assigned Role:</td>
              <td style="padding: 7px 0; color: #0F172A; font-size: 14px; font-weight: 700; text-align: right;">${assignedRole}</td>
            </tr>
            <tr>
              <td style="padding: 7px 0; color: #64748B; font-size: 14px; font-weight: 500;">Account Status:</td>
              <td style="padding: 7px 0; text-align: right;">
                <span class="status-badge">Approved</span>
              </td>
            </tr>
          </table>
        </div>

        <p style="font-size: 14px; color: #334155; margin-bottom: 20px;">
          You can now sign in to the I2S website using your registered email address and your existing login credentials.
        </p>

        <div class="btn-container">
          <a href="${loginUrl}" class="btn" target="_blank" rel="noopener noreferrer">Sign In to I2S Platform</a>
        </div>

        <div class="help-text">
          Please access the website using the official I2S login page:<br>
          <a href="${loginUrl}" style="color: #1765E8; word-break: break-all;">${loginUrl}</a>
        </div>

        <p style="font-size: 14px; color: #334155; margin-top: 24px; margin-bottom: 0;">
          We look forward to having you as part of the I2S team. Welcome aboard!<br><br>
          Best regards,<br>
          <strong>I2S Team</strong>
        </p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} Imagination2Software (I2S). All rights reserved.<br>
        Confidential Corporate Notification &bull; This is an automated communication.
      </div>
    </div>
  </div>
</body>
</html>`;
};

/**
 * Builds the plain text fallback for the welcome email.
 */
export const buildWelcomeEmailText = ({
  userName,
  userEmail,
  departmentName,
  assignedRole,
  loginUrl,
}) => {
  return `Dear ${userName},

Welcome to I2S!

We are pleased to inform you that your registration request has been approved. Your account is now approved, and you have been assigned to the following department.

Account Details
- Name: ${userName}
- Email: ${userEmail}
- Assigned Department: ${departmentName}
- Assigned Role: ${assignedRole}
- Account Status: Approved

You can now sign in to the I2S website using your registered email address and your existing login credentials.

Please access the website using the official I2S login page:

${loginUrl}

We look forward to having you as part of the I2S team. Welcome aboard!

Best regards,
I2S Team
`;
};

/**
 * Sends the welcome email after registration approval and department assignment.
 * Records the dispatch outcome in the AuditLog so the Admin Panel can track:
 * - Approved — Welcome Email Sent (with message ID & timestamp)
 * - Approved — Email Failed (with error rationale & retry support)
 */
export const sendWelcomeEmail = async ({
  userId,
  userName,
  userEmail,
  departmentName,
  assignedRole,
  loginUrl,
  adminId,
}) => {
  const fromEmail = process.env.COMPANY_EMAIL || 'contact@imagination2software.com';
  const fromName = process.env.COMPANY_NAME || 'Imagination2Software';
  const clientLoginUrl = loginUrl || process.env.CLIENT_URL || 'http://localhost:5173/login';

  const html = buildWelcomeEmailHtml({
    userName,
    userEmail,
    departmentName,
    assignedRole,
    loginUrl: clientLoginUrl,
  });

  const text = buildWelcomeEmailText({
    userName,
    userEmail,
    departmentName,
    assignedRole,
    loginUrl: clientLoginUrl,
  });

  try {
    const transporter = await getMailTransporter();
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: userEmail,
      subject: 'Welcome to I2S — Your Account Has Been Approved',
      text,
      html,
    });

    const isSimulated = !!transporter.isSimulated;
    const messageId = info.messageId || `msg-${Date.now()}`;

    // Record successful audit record
    await logAudit({
      userId: adminId || null,
      action: 'WELCOME_EMAIL_SENT',
      entity: 'User',
      entityId: userId,
      details: {
        to: userEmail,
        departmentName,
        assignedRole,
        messageId,
        sentAt: new Date().toISOString(),
        isSimulated,
        status: 'SENT',
      },
    });

    return {
      success: true,
      messageId,
      isSimulated,
      status: 'SENT',
    };
  } catch (error) {
    console.error(`[Welcome Email Error] Failed to send email to ${userEmail}:`, error.message);

    // Record failure in audit log so Admin can review and retry
    await logAudit({
      userId: adminId || null,
      action: 'WELCOME_EMAIL_FAILED',
      entity: 'User',
      entityId: userId,
      details: {
        to: userEmail,
        departmentName,
        assignedRole,
        error: error.message,
        failedAt: new Date().toISOString(),
        status: 'FAILED',
      },
    });

    return {
      success: false,
      error: error.message,
      status: 'FAILED',
    };
  }
};
