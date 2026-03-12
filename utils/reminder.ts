// utils/reminders.ts
import { getConnection } from "../db/connection.ts";
import { createReminder } from "../db/models/reminder.ts";

export async function createMOUExpiryReminders() {
  const conn = await getConnection();
  try {
    // Get MOUs expiring in the next 30 days without existing expiry reminders
    const result = await conn.queryObject<{ mou_id: number; end_date: Date }>`
      SELECT m.mou_id, m.end_date
      FROM mous m
      LEFT JOIN reminders r ON m.mou_id = r.mou_id AND r.kind = 'Expiry'
      WHERE m.status IN ('Active', 'Pending Approval')
      AND m.end_date BETWEEN now() AND now() + INTERVAL '30 days'
      AND r.reminder_id IS NULL
    `;

    for (const row of result.rows) {
      // Create a reminder for 7 days before expiry
      const fireDate = new Date(row.end_date);
      fireDate.setDate(fireDate.getDate() - 7);

      await createReminder({
        mou_id: row.mou_id,
        kind: "Expiry",
        fire_on: fireDate,
        sent: false,
        channel: "Email",
      });
    }
  } finally {
    conn.release();
  }
}
