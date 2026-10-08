import type { Meta, StoryObj } from "@storybook/react";

import { Auth } from "~/modules/account/auth/presentation/Auth.ui";

const noop = () => {};

const GITHUB = { pending: false, onPress: noop };

const meta: Meta<typeof Auth> = {
	component: Auth,
	title: "Account/Auth",
	args: { actionText: "Login", status: "idle", onSubmit: noop },
};
export default meta;

type Story = StoryObj<typeof Auth>;

export const Login: Story = {
	args: { github: GITHUB },
};

export const Redirecting: Story = {
	args: { github: { pending: true, onPress: noop } },
};

export const NoSuchAccount: Story = {
	args: {
		github: GITHUB,
		message: "Invalid login credentials",
		retry: { label: "Sign up instead?", onRetry: noop },
	},
};

export const SignUp: Story = {
	args: { actionText: "Sign Up" },
};
