import { useMutation } from "@tanstack/react-query";

import type { FireAuditInput } from "~/modules/run/incident/application/incident.validation";
import { fireAudit } from "~/modules/run/incident/application/incident.serverfn";
import { useRunCommit } from "~/modules/run/run/application/useRunCommit.hook";

export const useFireAudit = () => {
	const { commit } = useRunCommit();

	const mutation = useMutation({
		mutationFn: (data: FireAuditInput) => fireAudit({ data }),
		onSuccess: (result) => {
			if (result.success) commit(result);
		},
	});

	const refused =
		mutation.data?.success === false && mutation.variables !== undefined
			? {
					targetRunId: mutation.variables.targetRunId,
					reason: mutation.data.error,
				}
			: undefined;

	return { ...mutation, refused };
};
