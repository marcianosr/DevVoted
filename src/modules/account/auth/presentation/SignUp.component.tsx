import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { signupFn } from "~/modules/account/auth/application/auth.serverfn";
import { Auth } from "~/modules/account/auth/presentation/Auth.ui";

export const SignUp = () => {
	const signupMutation = useMutation({
		mutationFn: useServerFn(signupFn),
	});

	return (
		<Auth
			actionText="Sign Up"
			status={signupMutation.status}
			onSubmit={(credentials) => signupMutation.mutate({ data: credentials })}
			message={
				signupMutation.data?.error ? signupMutation.data.message : undefined
			}
		/>
	);
};
