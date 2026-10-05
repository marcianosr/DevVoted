import type { Meta, StoryObj } from "@storybook/react";

import { STORAGE_UNITS } from "~/shared/lib/storage";

import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";

import { AppNav, type AppNavProps, type NavViewer } from "./AppNav.ui";
import { KANTO_COLORS } from "./colors";

const HOME = "/";
const SIGN_IN = "/login";
const RUN = "/run";
const COMMUNITY = "/run/community";
const WIKI = "/wiki";
const SUGGEST = "/polls/new";
const BORDER = "/borders/border-ts-lavender.svg";

const NARROW = 360;

const VIEWER: NavViewer = {
	name: "marciano_schildmeijer",
	borderUrl: BORDER,
	archivedStorage: 0,
	profileHref: "/profile/marciano",
	suggestedHref: "/polls",
	signOutHref: "/logout",
};

const meta: Meta<typeof AppNav> = {
	component: AppNav,
	title: "Kanto/AppNav",
	args: {
		homeHref: HOME,
		signInHref: SIGN_IN,
		run: { href: RUN, pollsLeft: 5, active: false },
		community: { href: COMMUNITY, active: false },
		wiki: { href: WIKI, active: false },
		suggest: { href: SUGGEST, active: false, reward: "+16 KB" },
	},
};
export default meta;

type Story = StoryObj<typeof AppNav>;

export const SignedOut: Story = {};

export const SignedIn: Story = {
	args: { viewer: VIEWER },
};

export const OnTheHub: Story = {
	args: {
		viewer: VIEWER,
		run: { href: RUN, pollsLeft: 3, active: true },
	},
};

export const OnePollLeft: Story = {
	args: {
		viewer: VIEWER,
		run: { href: RUN, pollsLeft: 1, active: true },
	},
};

export const DaySpent: Story = {
	args: {
		viewer: VIEWER,
		run: { href: RUN, active: true },
	},
};

export const OnTheCommunity: Story = {
	args: {
		viewer: VIEWER,
		community: { href: COMMUNITY, active: true },
		wiki: { href: WIKI, active: false },
	},
};

export const OnTheSuggestion: Story = {
	args: {
		viewer: VIEWER,
		suggest: { href: SUGGEST, active: true, reward: "+16 KB" },
	},
};

export const Decorated: Story = {
	args: {
		viewer: {
			...VIEWER,
			titles: ["Gym Leader", "Summit", "Flawless"],
			archivedStorage: 296 * STORAGE_UNITS.KB,
		},
	},
	play: async ({ canvasElement }) => {
		canvasElement.querySelector("details")?.setAttribute("open", "");
	},
};

export const Narrow: Story = {
	args: {
		viewer: VIEWER,
		run: { href: RUN, pollsLeft: 3, active: true },
	},
	decorators: [
		(Story) => (
			<div style={{ width: NARROW }}>
				<Story />
			</div>
		),
	],
};

const SWEEP = "flex flex-col gap-2";

const SWEPT: AppNavProps = {
	homeHref: HOME,
	signInHref: SIGN_IN,
	run: { href: RUN, pollsLeft: 3, active: true },
	community: { href: COMMUNITY, active: false },
	wiki: { href: WIKI, active: false },
	suggest: { href: SUGGEST, active: false },
	viewer: VIEWER,
};

export const AcrossGates: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className={SWEEP}>
			{ALL_SWATCHES.map((swatch) => (
				<div key={swatch.gate} data-gate-theme={swatch.theme}>
					<AppNav {...SWEPT} />
				</div>
			))}
		</div>
	),
};

export const AcrossThemes: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className={SWEEP}>
			{KANTO_COLORS.map((theme) => (
				<div key={theme} data-screen-theme={theme}>
					<AppNav {...SWEPT} />
				</div>
			))}
		</div>
	),
};
