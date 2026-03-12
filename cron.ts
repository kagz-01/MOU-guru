// cron.ts
import { processReminders } from "./utils/notifications.ts";
import { createMOUExpiryReminders } from "./utils/reminder.ts";

// Run every hour
const INTERVAL_MS = 60 * 60 * 1000;

async function runCronTasks() {
  console.log("Running cron tasks:", new Date());

  try {
    // Process pending reminders
    await processReminders();

    // Create expiry reminders for MOUs that are about to expire
    await createMOUExpiryReminders();
  } catch (error) {
    console.error("Error in cron tasks:", error);
  }

  // Schedule the next run
  setTimeout(runCronTasks, INTERVAL_MS);
}

// Start the cron job
runCronTasks();
