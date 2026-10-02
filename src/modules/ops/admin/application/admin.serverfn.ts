import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
	getAdminDashboardService,
	sendReminderEmailService,
} from "~/modules/ops/admin/application/admin.service";
import { withAdminUser } from "~/shared/utils/authorization";

export const getAdminDashboard = createServerFn({ method: "GET" }).handler(() =>
	withAdminUser(() => getAdminDashboardService())
);

export const sendReminderEmail = createServerFn({ method: "POST" })
	.validator(z.object({ email: z.email(), displayName: z.string().min(1) }))
	.handler(({ data }) => withAdminUser(() => sendReminderEmailService(data)));
