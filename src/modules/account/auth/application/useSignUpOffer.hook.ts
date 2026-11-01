import { useNavigate } from "@tanstack/react-router";

import { useViewer } from "~/modules/account/auth/application/useViewer.hook";
import type { SignUpOfferProps } from "~/modules/account/auth/presentation/SignUpOffer.ui";

export const useSignUpOffer = (): { signUp?: SignUpOfferProps } => {
	const viewer = useViewer();
	const navigate = useNavigate();

	if (viewer?.isGuest !== true) return {};

	return { signUp: { onSignUp: () => navigate({ to: "/login" }) } };
};
