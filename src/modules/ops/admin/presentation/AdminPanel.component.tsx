import { useState } from "react";

import { useMutation } from "@tanstack/react-query";

import {
	getAdminDashboard,
	sendReminderEmail,
} from "~/modules/ops/admin/application/admin.serverfn";
import {
	type AdminUser,
	adminPanelDataFor,
	reminderFailureFor,
} from "~/modules/ops/admin/application/adminPanel.viewmodel";
import {
	AdminPanel as AdminPanelUI,
	AdminPanelError,
	AdminPanelLoading,
} from "~/modules/ops/admin/presentation/AdminPanel.ui";
import { useApiQuery } from "~/shared/hooks/useApiQuery.hook";
import { adminQueryKeys } from "~/shared/queryKeys";

const NO_DASHBOARD = "The admin panel could not be loaded.";

export const AdminPanel = () => {
	const dashboard = useApiQuery({
		queryKey: adminQueryKeys.dashboard(),
		queryFn: () => getAdminDashboard(),
	});
	const [sentTo, setSentTo] = useState<ReadonlySet<string>>(new Set());
	const [failure, setFailure] = useState<string | null>(null);

	const reminder = useMutation({
		mutationFn: async (user: AdminUser) => {
			const response = await sendReminderEmail({
				data: { email: user.email, displayName: user.displayName },
			});
			if (!response.success) throw new Error(response.error);
			return user;
		},
		onSuccess: (user) => {
			setFailure(null);
			setSentTo((sent) => new Set([...sent, user.id]));
		},
		onError: (_error, user) => setFailure(reminderFailureFor(user.email)),
	});

	if (dashboard.isPending) return <AdminPanelLoading />;
	if (dashboard.view === null) {
		return <AdminPanelError message={dashboard.errorMessage ?? NO_DASHBOARD} />;
	}

	return (
		<AdminPanelUI
			{...adminPanelDataFor(dashboard.view)}
			message={failure === null ? undefined : { type: "error", text: failure }}
			sendingTo={reminder.isPending ? (reminder.variables?.id ?? null) : null}
			sentTo={sentTo}
			onSendReminder={(user) => reminder.mutate(user)}
		/>
	);
};
