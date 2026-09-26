import { useState } from "react";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { getSupabaseBrowserClient } from "~/shared/utils/supabaseBrowser";

import {
	loginFn,
	signupFn,
} from "~/modules/account/auth/application/auth.serverfn";
import { Auth } from "~/modules/account/auth/presentation/Auth.ui";

const NO_SUCH_ACCOUNT = "Invalid login credentials";
const SIGN_UP_INSTEAD = "Sign up instead?";

export const Login = () => {
	const router = useRouter();
	const [githubPending, setGithubPending] = useState(false);

	const loginMutation = useMutation({
		mutationFn: loginFn,
		onSuccess: async (data) => {
			if (!data?.error) {
				await router.invalidate();
				router.navigate({ to: "/" });
			}
		},
	});

	const signupMutation = useMutation({
		mutationFn: useServerFn(signupFn),
	});

	const handleGithubLogin = async () => {
		setGithubPending(true);
		try {
			const supabase = getSupabaseBrowserClient();
			const { error } = await supabase.auth.signInWithOAuth({
				provider: "github",
				options: {
					redirectTo: `${window.location.origin}/auth/callback`,
				},
			});

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

	return (
		<Auth
			actionText="Login"
			subTitle="Signup or login with your Github account to continue!"
			status={loginMutation.status}
			onSubmit={(credentials) => loginMutation.mutate({ data: credentials })}
			message={loginMutation.data?.message}
			retry={
				offersSignup
					? {
							label: SIGN_UP_INSTEAD,
							onRetry: (credentials) =>
								signupMutation.mutate({ data: credentials }),
						}
					: undefined
			}
			github={{ pending: githubPending, onPress: handleGithubLogin }}
		/>
	);
};
