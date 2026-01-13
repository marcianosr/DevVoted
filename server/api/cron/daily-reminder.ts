import { defineEventHandler, getHeader, createError } from "nitro/runtime";
import { sendDailyReminder } from "../../../src/domains/notifications/services/slack.service";

export default defineEventHandler(async (event) => {
	// Verify the request is from Vercel Cron (optional but recommended)
	const authHeader = getHeader(event, "authorization");
	const cronSecret = process.env.CRON_SECRET;

	if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
		throw createError({ statusCode: 401, message: "Unauthorized" });
	}

	try {
		await sendDailyReminder();

		return {
			success: true,
			message: "Daily reminder sent successfully",
			timestamp: new Date().toISOString(),
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		console.error("Failed to send daily reminder:", message);

		throw createError({
			statusCode: 500,
			message: `Failed to send daily reminder: ${message}`,
		});
	}
});
