import { useState } from "react";

import type { SignInWithOAuthCredentials } from "@supabase/supabase-js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { WIKI_PATH } from "~/shared/lib/wikiPath";
import { useViewer } from "~/modules/account/auth/application/useViewer.hook";
import { getSupabaseBrowserClient } from "~/shared/utils/supabaseBrowser";

import {
	demoCardFor,
	heroFor,
	randomLoginTheme,
} from "~/modules/account/auth/application/loginDemo.viewmodel";
import {
	loginFn,
	playAsGuestFn,
	signupFn,
} from "~/modules/account/auth/application/auth.serverfn";
import type { AuthProps } from "~/modules/account/auth/presentation/Auth.ui";
import type { KantoColor } from "~/ui/kanto-theme/colors";
import {
	LoginScreen,
	type SignInMethod,
} from "~/modules/account/auth/presentation/LoginScreen.ui";
import { useLoginDemo } from "~/modules/account/auth/presentation/useLoginDemo.hook";

const NO_SUCH_ACCOUNT = "Invalid login credentials";
const SIGN_UP_INSTEAD = "Sign up instead?";

const isDevelopment = process.env.NODE_ENV === "development";

export type LoginProps = { theme?: KantoColor; identityTaken?: boolean };

const DEFAULT_THEME: KantoColor = "cerulean";

export const loginLoader = (): { theme: KantoColor } => ({
	theme: randomLoginTheme(),
});

const githubCredentials = (): SignInWithOAuthCredentials => ({
	provider: "github",
	options: { redirectTo: `${window.location.origin}/auth/callback` },
});

export const Login = ({
	theme = DEFAULT_THEME,
	identityTaken = false,
}: LoginProps) => {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [githubPending, setGithubPending] = useState(false);
	const [method, setMethod] = useState<SignInMethod>("email");
	const step = useLoginDemo();
	const viewer = useViewer();

	const loginMutation = useMutation({
		mutationFn: loginFn,
		onSuccess: async (data) => {
			if (!data?.error) {
				queryClient.clear();
				await router.invalidate();
				router.navigate({ to: "/" });
			}
		},
	});

	const guestMutation = useMutation({
		mutationFn: () => playAsGuestFn(),
		onSuccess: async (data) => {
			if (data.error) return;
			queryClient.clear();
			await router.invalidate();
			router.navigate({ to: "/run" });
		},
	});

	const signupMutation = useMutation({
		mutationFn: useServerFn(signupFn),
	});

	const linksTheGuest = viewer?.isGuest === true && !identityTaken;

	const handleGithubLogin = async () => {
		setGithubPending(true);
		try {
			const { auth } = getSupabaseBrowserClient();
			const { error } = linksTheGuest
				? await auth.linkIdentity(githubCredentials())
				: await auth.signInWithOAuth(githubCredentials());

			if (error) {
				console.error("GitHub OAuth error:", error);
				setGithubPending(false);
			}
		} catch (error) {
			console.error("Failed to initiate GitHub login:", error);
			setGithubPending(false);
		}
	};

	const offersSignup =
		loginMutation.data?.error === true &&
		loginMutation.data.message === NO_SUCH_ACCOUNT;

	const emailSignIn: AuthProps = {
		actionText: "Login",
		status: loginMutation.status,
		onSubmit: (credentials) => loginMutation.mutate({ data: credentials }),
		message: loginMutation.data?.message,
		retry: offersSignup
			? {
					label: SIGN_UP_INSTEAD,
					onRetry: (credentials) =>
						signupMutation.mutate({ data: credentials }),
				}
			: undefined,
	};

	return (
		<LoginScreen
			theme={theme}
			hero={heroFor()}
			card={demoCardFor(step)}
			github={{ pending: githubPending, onPress: handleGithubLogin }}
			identityTaken={identityTaken}
			guest={
				viewer?.isGuest
					? undefined
					: {
							pending: guestMutation.isPending,
							onPress: () => guestMutation.mutate(),
						}
			}
			wikiHref={WIKI_PATH}
			devSignIn={
				isDevelopment
					? { method, onMethod: setMethod, email: emailSignIn }
					: undefined
			}
		/>
	);
};
