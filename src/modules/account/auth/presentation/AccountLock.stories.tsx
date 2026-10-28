import type { Meta, StoryObj } from "@storybook/react";

import { AccountLock } from "~/modules/account/auth/presentation/AccountLock.ui";
import { CommunityScreen } from "~/modules/run/community/presentation/CommunityScreen.ui";
import { ReviewScreen } from "~/modules/run/run/presentation/ReviewScreen.ui";
import { kantoCommunity } from "~/test/kantoCommunity.factory";
import { kantoReview } from "~/test/kantoGate.factory";

const noop = () => {};

const meta: Meta<typeof AccountLock> = {
	component: AccountLock,
	title: "Account/AccountLock",
};
export default meta;

type Story = StoryObj<typeof AccountLock>;

export const OverTheBoard: Story = {
	render: () => (
		<AccountLock onSignIn={noop}>
			<CommunityScreen {...kantoCommunity()} />
		</AccountLock>
	),
};

export const OverTheReview: Story = {
	render: () => (
		<AccountLock onSignIn={noop}>
			<ReviewScreen {...kantoReview()} />
		</AccountLock>
	),
};
