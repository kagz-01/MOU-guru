// db/models/reminder.ts
import { getConnection } from "../connection.ts";

export type Reminder = {
  reminder_id: number;
  mou_id: number;
  kind: "Expiry" | "Milestone" | "Custom";
  fire_on: Date;
  sent: boolean;
  channel: "Email" | "SMS" | "Webhook" | "None";
};

export async function getPendingReminders() {
  const conn = await getConnection();
  try {
    const now = new Date();
    const result = await conn.queryObject<Reminder>`
      SELECT * FROM reminders
      WHERE sent = false AND fire_on <= ${now}
    `;
    return result.rows;
  } finally {
    conn.release();
  }
}

export async function createReminder(reminder: Omit<Reminder, "reminder_id">) {
  const conn = await getConnection();
  try {
    const result = await conn.queryObject<{ reminder_id: number }>`
      INSERT INTO reminders (mou_id, kind, fire_on, sent, channel)
      VALUES (${reminder.mou_id}, ${reminder.kind}, ${reminder.fire_on}, 
              ${reminder.sent}, ${reminder.channel})
      RETURNING reminder_id
    `;
    return result.rows[0].reminder_id;
  } finally {
    conn.release();
  }
}

export async function markReminderSent(id: number) {
  const conn = await getConnection();
  try {
    await conn
      .queryObject`UPDATE reminders SET sent = true WHERE reminder_id = ${id}`;
    return true;
  } finally {
    conn.release();
  }
}
