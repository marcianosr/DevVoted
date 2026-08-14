import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { signupFn } from "~/modules/account/auth/application/auth.serverfn";
import { Auth } from "~/modules/account/auth/presentation/Auth.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";

/** Tier 2: wires the signup mutation to the shared auth form. */
export const SignUp = () => {
	const signupMutation = useMutation({
		mutationFn: useServerFn(signupFn),
	});

	return (
		<Auth
			actionText="Sign Up"
			status={signupMutation.status}
			onSubmit={(e) => {
				const formData = new FormData(e.target as HTMLFormElement);

				signupMutation.mutate({
					data: {
						email: formData.get("email") as string,
						password: formData.get("password") as string,
					},
				});
			}}
			afterSubmit={
				signupMutation.data?.error ? (
					<Paragraph tone="cinnabar">{signupMutation.data.message}</Paragraph>
				) : null
			}
		/>
	);
};
