import { useMutation } from "@tanstack/react-query";

import { submitCrowdPick } from "~/modules/run/community/application/community.serverfn";

export const useSubmitCrowdPick = () =>
	useMutation({ mutationFn: () => submitCrowdPick() });
