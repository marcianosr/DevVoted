type SlackBlock =
	| {
			type: "section";
			text: {
				type: "mrkdwn" | "plain_text";
				text: string;
			};
	  }
	| {
			type: "divider";
	  }
	| {
			type: "actions";
			elements: Array<{
				type: "button";
				text: {
					type: "plain_text";
					text: string;
					emoji?: boolean;
				};
				url?: string;
				style?: "primary" | "danger";
			}>;
	  };

type SlackMessage = {
	text: string;
	blocks?: SlackBlock[];
};

const getWebhookUrl = (): string => {
	const webhookUrl = process.env.SLACK_WEBHOOK_URL;

	if (!webhookUrl) {
		throw new Error("SLACK_WEBHOOK_URL environment variable is not set");
	}

	return webhookUrl;
};

export const sendSlackMessage = async (message: SlackMessage): Promise<void> => {
	const webhookUrl = getWebhookUrl();

	const response = await fetch(webhookUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(message),
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Failed to send Slack message: ${response.status} - ${errorText}`);
	}
};

export const sendDailyReminder = async (): Promise<void> => {
	const appUrl = process.env.APP_URL || "https://devvoted.com";

	const message: SlackMessage = {
		text: "Time to test your developer knowledge! Today's DevVoted quiz is ready.",
		blocks: [
			{
				type: "section",
				text: {
					type: "mrkdwn",
					text: "*Daily DevVoted Reminder*",
				},
			},
			{
				type: "divider",
			},
			{
				type: "section",
				text: {
					type: "mrkdwn",
					text: "A new day, a new challenge! Test your developer knowledge and climb the leaderboard.",
				},
			},
			{
				type: "actions",
				elements: [
					{
						type: "button",
						text: {
							type: "plain_text",
							text: "Play Now",
							emoji: true,
						},
						url: appUrl,
						style: "primary",
					},
				],
			},
		],
	};

	await sendSlackMessage(message);
};
