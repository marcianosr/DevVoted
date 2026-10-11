import type { Meta, StoryObj } from "@storybook/react";

import {
	FIRST_STEP,
	SETTLED_STEP,
	demoCardFor,
	heroFor,
} from "~/modules/account/auth/application/loginDemo.viewmodel";
import { LoginScreen } from "~/modules/account/auth/presentation/LoginScreen.ui";

const noop = () => {};

const meta: Meta<typeof LoginScreen> = {
	component: LoginScreen,
	title: "Account/LoginScreen",
	args: {
		theme: "cerulean",
		hero: heroFor(),
		card: demoCardFor(FIRST_STEP),
		github: { pending: false, onPress: noop },
		wikiHref: "/wiki",
	},
};
export default meta;

type Story = StoryObj<typeof LoginScreen>;

export const Idle: Story = {};

export const Picked: Story = {
	args: { card: demoCardFor({ poll: 0, phase: "picked" }) },
};

export const Leaving: Story = {
	args: { card: demoCardFor({ poll: 0, phase: "leaving" }) },
};

export const SecondPoll: Story = {
	args: { card: demoCardFor({ poll: 1, phase: "enter" }) },
};

export const Reduced: Story = {
	args: { card: demoCardFor(SETTLED_STEP) },
};

export const Redirecting: Story = {
	args: { github: { pending: true, onPress: noop } },
};

export const Phone: Story = {
	parameters: { viewport: { defaultViewport: "mobile1" } },
};

const DEV_EMAIL = {
	method: "email",
	onMethod: noop,
	email: { actionText: "Login", status: "idle", onSubmit: noop },
} as const;

export const DevelopmentEmail: Story = {
	args: { devSignIn: DEV_EMAIL },
};

export const DevelopmentGithub: Story = {
	args: { devSignIn: { ...DEV_EMAIL, method: "github" } },
};
