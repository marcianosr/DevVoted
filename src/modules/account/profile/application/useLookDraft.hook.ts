import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { saveLook } from "~/modules/account/profile/application/look.serverfn";
import { useArchiveState } from "~/modules/account/profile/application/useArchiveState.hook";
import { useTitleState } from "~/modules/account/profile/application/useTitleState.hook";
import {
	isSameLook,
	toggleTitleIn,
	type Look,
} from "~/modules/account/profile/domain/look.model";
import { archiveQueryKeys, titleQueryKeys } from "~/shared/queryKeys";

const useSaveLook = (userId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (look: Look) => {
			const response = await saveLook({
				data: { borderId: look.borderId, titleIds: [...look.titleIds] },
			});
			if (!response.success) throw new Error(response.error);
			return response.data;
		},
		onSuccess: () =>
			Promise.all([
				queryClient.invalidateQueries({
					queryKey: archiveQueryKeys.state(userId),
				}),
				queryClient.invalidateQueries({
					queryKey: titleQueryKeys.state(userId),
				}),
			]),
	});
};

export type LookDraft = ReturnType<typeof useLookDraft>;

export const useLookDraft = (userId: string) => {
	const { data: archive } = useArchiveState(userId);
	const { data: titles } = useTitleState(userId);
	const save = useSaveLook(userId);
	const [draft, setDraft] = useState<Look | null>(null);
	const [tryingOnId, setTryingOnId] = useState<string | null>(null);

	const saved: Look = {
		borderId: archive?.equippedBorderId ?? null,
		titleIds: titles?.equippedTitleIds ?? [],
	};
	const look = draft ?? saved;

	return {
		look,
		tryingOnId,
		isDirty: !isSameLook(look, saved),
		isSaving: save.isPending,
		error: save.error?.message,
		pickBorder: (borderId: string | null) => {
			setTryingOnId(null);
			setDraft({ ...look, borderId });
		},
		toggleTitle: (titleId: string) =>
			setDraft(toggleTitleIn(look, titleId, titles?.ownedTitleIds ?? [])),
		tryOn: setTryingOnId,
		save: () => save.mutate(look, { onSuccess: () => setDraft(null) }),
	};
};
