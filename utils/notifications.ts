// utils/notifications.ts
import {
  getPendingReminders,
  markReminderSent,
} from "../db/models/reminder.ts";
import { getMOUById } from "../db/models/mou.ts";
import { getConnection } from "../db/connection.ts";

// Function to send email (simplified - would use an email service in production)
function sendEmail(to: string, subject: string, body: string) {
  console.log(`Sending email to ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  // In a real app, integrate with an email service
  // like SendGrid, Mailgun, etc.
  return true;
}

export async function processReminders() {
  const reminders = await getPendingReminders();

  for (const reminder of reminders) {
    const mou = await getMOUById(reminder.mou_id);
    if (!mou) continue;

    // Get admin users to notify
    const admins = await getAllAdminUsers();

    // Build notification message
    let subject = "";
    let body = "";

    if (reminder.kind === "Expiry") {
      subject = `MOU Expiration Alert: ${mou.title} (${mou.reference_no})`;
      body = `
        The MOU "${mou.title}" with reference number ${mou.reference_no} 
        is expiring on ${new Date(mou.end_date).toLocaleDateString()}.
        
        Please review and take appropriate action.
      `;
    } else if (reminder.kind === "Milestone") {
      subject = `MOU Milestone Alert: ${mou.title} (${mou.reference_no})`;
      body = `
        A milestone for MOU "${mou.title}" with reference number ${mou.reference_no} 
        is due on ${new Date(reminder.fire_on).toLocaleDateString()}.
        
        Please check the milestone details in the system.
      `;
    } else {
      subject = `MOU Alert: ${mou.title} (${mou.reference_no})`;
      body = `
        A reminder has been triggered for MOU "${mou.title}" with reference number ${mou.reference_no}.
        
        Please log in to the system to check the details.
      `;
    }

    // Send notifications based on channel
    if (reminder.channel === "Email") {
      for (const admin of admins) {
        await sendEmail(admin.email, subject, body);
      }
    }

    // Mark reminder as sent
    await markReminderSent(reminder.reminder_id);
  }
}

async function getAllAdminUsers() {
  const conn = await getConnection();
  try {
    const result = await conn.queryObject<{ user_id: number; email: string }>`
      SELECT user_id, email FROM app_users WHERE role = 'admin'
    `;
    return result.rows;
  } finally {
    conn.release();
  }
}
