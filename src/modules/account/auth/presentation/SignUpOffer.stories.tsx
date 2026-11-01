import type { Meta, StoryObj } from "@storybook/react";

import { SignUpOffer } from "~/modules/account/auth/presentation/SignUpOffer.ui";

const meta: Meta<typeof SignUpOffer> = {
	component: SignUpOffer,
	title: "Account/SignUpOffer",
	args: { onSignUp: () => {} },
};
export default meta;

type Story = StoryObj<typeof SignUpOffer>;

export const AtAGateClose: Story = {};
