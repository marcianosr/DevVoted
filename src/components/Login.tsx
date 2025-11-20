import { useState } from "react";

import { useMutation } from "@tanstack/react-query";
import { useRouter, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { SecondaryButton } from "~/ui/SecondaryButton";
import { getSupabaseBrowserClient } from "~/utils/supabaseBrowser";

import { Auth } from "./Auth";
import { loginFn } from "../routes/_authed";
import { signupFn } from "../routes/sign-up";

export function Login() {
	const router = useRouter();
	const [githubLoading, setGithubLoading] = useState(false);

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
		setGithubLoading(true);
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
				setGithubLoading(false);
			}
		} catch (error) {
			console.error("Failed to initiate GitHub login:", error);
			setGithubLoading(false);
		}
	};

	return (
		<Auth
			actionText="Login"
			status={loginMutation.status}
			onSubmit={(e) => {
				const formData = new FormData(e.target as HTMLFormElement);

				loginMutation.mutate({
					data: {
						email: formData.get("email") as string,
						password: formData.get("password") as string,
					},
				});
			}}
			afterSubmit={
				<>
					{process.env.NODE_ENV === "development" && (
						<>
							{loginMutation.data && (
								<>
									<div className="text-red-400">
										{loginMutation.data.message}
									</div>
									{loginMutation.data.error &&
									loginMutation.data.message === "Invalid login credentials" ? (
										<div>
											<SecondaryButton
												className="text-blue-500"
												onClick={(e) => {
													const formData = new FormData(
														(e.target as HTMLButtonElement).form!
													);

													signupMutation.mutate({
														data: {
															email: formData.get("email") as string,
															password: formData.get("password") as string,
														},
													});
												}}
												type="button"
											>
												Sign up instead?
											</SecondaryButton>
										</div>
									) : null}
								</>
							)}
							<p className="text-center mt-4 text-sm text-gray-400">
								Don&apos;t have an account?{" "}
								<Link to="/sign-up" className="text-theme underline">
									Sign up
								</Link>
							</p>
						</>
					)}
					<div className="mt-6 pt-6 border-t border-gray-500/20">
						<SecondaryButton
							onClick={handleGithubLogin}
							disabled={githubLoading}
							className="w-full bg-gray-800 dark:bg-gray-700 text-white flex items-center justify-center gap-2"
						>
							{githubLoading ? (
								"Redirecting..."
							) : (
								<>
									<svg
										className="w-5 h-5"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
											clipRule="evenodd"
										/>
									</svg>
									Continue with GitHub
								</>
							)}
						</SecondaryButton>
					</div>
				</>
			}
		/>
	);
}
