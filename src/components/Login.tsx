import { useRouter, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { loginFn } from "../routes/_authed";
import { signupFn } from "../routes/sign-up";
import { Auth } from "./Auth";
import { SecondaryButton } from "~/ui/SecondaryButton";

export function Login() {
	const router = useRouter();

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
					{loginMutation.data && (
						<>
							<div className="text-red-400">
								{loginMutation.data.message}
							</div>
							{loginMutation.data.error &&
							loginMutation.data.message ===
								"Invalid login credentials" ? (
								<div>
									<SecondaryButton
										className="text-blue-500"
										onClick={(e) => {
											const formData = new FormData(
												(
													e.target as HTMLButtonElement
												).form!
											);

											signupMutation.mutate({
												data: {
													email: formData.get(
														"email"
													) as string,
													password: formData.get(
														"password"
													) as string,
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
						Don't have an account?{" "}
						<Link to="/sign-up" className="text-theme underline">
							Sign up
						</Link>
					</p>
				</>
			}
		/>
	);
}
