import nodemailer from "nodemailer";
import { Report } from "@shared/schema";

// Create a reusable transporter for sending emails
const createTransporter = () => {
  const emailUser = process.env.SMTP_EMAIL;
  const emailPass = process.env.SMTP_PASSWORD;

  if (!emailUser || !emailPass) {
    console.warn(
      "⚠️  Email credentials not configured. Email notifications will be disabled."
    );
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
};

/**
 * Send admin notification email when a crime report is submitted
 * This function runs asynchronously and does not block the API response
 */
export async function sendAdminNotification(report: Report, reporterName?: string) {
  const transporter = createTransporter();

  if (!transporter) {
    console.log("📧 Email notifications disabled - no credentials provided");
    return;
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn("⚠️  ADMIN_EMAIL not configured. Admin notification not sent.");
    return;
  }

  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">🚨 New Crime Report Submitted</h2>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #555; margin-top: 0;">Report Details</h3>
          
          <p><strong>Crime Type:</strong> ${escapeHtml(report.category)}</p>
          <p><strong>Title:</strong> ${escapeHtml(report.title)}</p>
          <p><strong>Location:</strong> ${escapeHtml(report.location)}</p>
          <p><strong>Description:</strong> ${escapeHtml(report.description)}</p>
          
          <p><strong>Reporter ID:</strong> ${report.reporterId}</p>
          ${reporterName ? `<p><strong>Reporter Name:</strong> ${escapeHtml(reporterName)}</p>` : ""}
          
          <p><strong>Report ID:</strong> ${report.id}</p>
          <p><strong>Status:</strong> <span style="color: #ff9800; font-weight: bold;">${report.status}</span></p>
          <p><strong>Submitted at:</strong> ${report.createdAt ? new Date(report.createdAt).toLocaleString() : "N/A"}</p>
        </div>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          This is an automated notification from the Crime Tracker System.
        </p>
      </div>
    `;

    const textContent = `
New Crime Report Submitted

Crime Type: ${report.category}
Title: ${report.title}
Location: ${report.location}
Description: ${report.description}

Reporter ID: ${report.reporterId}
${reporterName ? `Reporter Name: ${reporterName}\n` : ""}Report ID: ${report.id}
Status: ${report.status}
Submitted at: ${report.createdAt ? new Date(report.createdAt).toLocaleString() : "N/A"}
    `;

    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: adminEmail,
      subject: `🚨 Crime Report Alert - ${report.category} at ${report.location}`,
      text: textContent,
      html: htmlContent,
    });

    console.log(
      `✅ Admin notification email sent for report #${report.id} to ${adminEmail}`
    );
  } catch (error) {
    console.error(
      "❌ Failed to send admin notification email:",
      error instanceof Error ? error.message : error
    );
    // Don't throw - email failure should not crash the app
  }
}

/**
 * Utility function to escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
