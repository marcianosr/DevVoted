import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { saveLook } from "~/modules/account/profile/application/look.serverfn";
import { useArchiveState } from "~/modules/account/profile/application/useArchiveState.hook";
import { useTitleState } from "~/modules/account/profile/application/useTitleState.hook";
import {
	isSameLook,
	toggleTitleIn,
	type Look,
} from "~/modules/account/profile/domain/look.model";
import { storedSwatchIdOf } from "~/modules/account/profile/domain/profileTheme.model";
import { useApiMutation } from "~/shared/hooks/useApiMutation.hook";
import {
	archiveQueryKeys,
	titleQueryKeys,
	userQueryKeys,
} from "~/shared/queryKeys";

export const useSaveLook = (userId: string) => {
	const queryClient = useQueryClient();
	return useApiMutation({
		mutationFn: (look: Look) =>
			saveLook({
				data: {
					borderId: look.borderId,
					titleIds: [...look.titleIds],
					swatchId: look.swatchId,
				},
			}),
		onSuccess: async (result) => {
			if (!result.success) return;
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: archiveQueryKeys.state(userId),
				}),
				queryClient.invalidateQueries({
					queryKey: titleQueryKeys.state(userId),
				}),
				queryClient.invalidateQueries({
					queryKey: userQueryKeys.profile(userId),
				}),
				queryClient.invalidateQueries({
					queryKey: userQueryKeys.card(userId),
				}),
			]);
		},
	});
};

export type LookDraft = ReturnType<typeof useLookDraft>;

export const useLookDraft = (userId: string) => {
	const { view: archive } = useArchiveState(userId);
	const { view: titles } = useTitleState(userId);
	const save = useSaveLook(userId);
	const [draft, setDraft] = useState<Look | null>(null);
	const [tryingOnId, setTryingOnId] = useState<string | null>(null);

	const saved: Look = {
		borderId: archive?.equippedBorderId ?? null,
		titleIds: titles?.equippedTitleIds ?? [],
		swatchId: archive?.equippedSwatchId ?? null,
	};
	const look = draft ?? saved;

	return {
		look,
		tryingOnId,
		isDirty: !isSameLook(look, saved),
		isSaving: save.isPending,
		error: save.errorMessage ?? undefined,
		pickBorder: (borderId: string | null) => {
			setTryingOnId(null);
			setDraft({ ...look, borderId });
		},
		pickSwatch: (swatchId: string) =>
			setDraft({ ...look, swatchId: storedSwatchIdOf(swatchId) }),
		toggleTitle: (titleId: string) =>
			setDraft(toggleTitleIn(look, titleId, titles?.ownedTitleIds ?? [])),
		tryOn: setTryingOnId,
		discard: () => {
			setDraft(null);
			setTryingOnId(null);
		},
		save: () =>
			save.mutate(look, {
				onSuccess: (result) => {
					if (result.success) setDraft(null);
				},
			}),
	};
};
