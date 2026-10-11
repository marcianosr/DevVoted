import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { gateSwatchAt } from "~/modules/run/gate/application/swatchTrack.viewmodel";
import {
	TodayScreen,
	type TodayScreenProps,
} from "~/modules/run/run/presentation/TodayScreen.ui";

const noop = () => {};

const READOUT = { runNumber: 14, gate: 3, gates: 12 };

const BUILD = {
	rows: [
		{
			id: "code-coverage",
			name: "Code Coverage",
			description: "Every correct answer adds coverage.",
			slots: 2,
			version: 2,
		},
	],
	weight: "4 / 6",
	held: 6,
	free: 2,
	shopHref: "/run/shop",
	openInfo: new Set<string>(),
	onToggleInfo: noop,
};

const WAITING_HEADLINE = {
	readout: READOUT,
	title: "Vermilion opens in",
	clock: { main: "11h 16m", seconds: "59s" },
	subtext: "Today’s polls are done. Back tomorrow!",
	mark: { kind: "lock" },
} satisfies TodayScreenProps["headline"];

const OPEN_SHOP = {
	label: "Shop",
	open: true,
	detail: "open until you start",
	onPress: noop,
} satisfies TodayScreenProps["shop"];

const SHOP_PRESS = {
	kind: "shop",
	label: "To shop",
	note: "spend 106 KB",
	mark: "shop",
	onPress: noop,
} satisfies TodayScreenProps["press"];

const faces = (names: readonly string[]) => names.map((name) => ({ name }));

const props = (
	overrides: Partial<TodayScreenProps> = {}
): TodayScreenProps => ({
	swatch: gateSwatchAt(3),
	headline: {
		readout: READOUT,
		title: "Vermilion",
		clock: null,
		subtext: "5 polls ready · prep first",
		mark: { kind: "polls", count: 5 },
	},
	press: {
		kind: "resume",
		label: "Continue to Vermilion",
		mark: "polls",
		pollsLeft: 5,
		onPress: noop,
	},
	shop: OPEN_SHOP,
	incidents: [],
	community: {
		count: 38,
		detail: "today",
		faces: faces(["Giovanni", "Erika", "Misty"]),
		overflow: 0,
		href: "/run/community",
	},
	runSoFar: {
		earned: "+64 KB",
		rows: [
			{
				gate: 0,
				swatch: gateSwatchAt(0),
				band: { id: "perfect", label: "PERFECT" },
				kb: "+32 KB",
			},
			{
				gate: 1,
				swatch: gateSwatchAt(1),
				band: { id: "healthy", label: "HEALTHY" },
				kb: "+19 KB",
			},
		],
		next: {
			gate: 3,
			swatch: gateSwatchAt(3),
			note: "next",
			quote: {
				band: { id: "ok", label: "OK" },
				kb: "+40 KB",
				started: true,
				share: "40%",
			},
		},
	},
	build: BUILD,
	...overrides,
});

const press = (name: RegExp) => screen.getByRole("button", { name });
const heading = () => screen.getByRole("heading", { level: 1 });

describe("TodayScreen", () => {
	describe("the headline", () => {
		it("names the gate ahead over the run's readout", () => {
			render(<TodayScreen {...props()} />);

			expect(heading()).toHaveTextContent("Vermilion");
			expect(screen.getByText("#14")).toBeInTheDocument();
			expect(
				screen.getByText("5 polls ready · prep first")
			).toBeInTheDocument();
		});

		it("states when the gate opens over a ticking clock while the day waits", () => {
			const { container } = render(
				<TodayScreen {...props({ headline: WAITING_HEADLINE })} />
			);

			expect(heading()).toHaveTextContent("Vermilion opens in");
			expect(heading()).toHaveTextContent("11h 16m");
			expect(heading()).toHaveTextContent("59s");
			expect(container.querySelector(".hub-breathe svg")).not.toBeNull();
		});

		it("drops the readout before a run is live", () => {
			render(
				<TodayScreen
					{...props({ headline: { ...props().headline, readout: null } })}
				/>
			);

			expect(screen.queryByText("#14")).toBeNull();
		});
	});

	describe("the press", () => {
		it("continues to the next gate when its polls are ready", async () => {
			const onPress = vi.fn();
			render(
				<TodayScreen {...props({ press: { ...props().press, onPress } })} />
			);

			await userEvent.click(press(/Continue to Vermilion/));

			expect(onPress).toHaveBeenCalledOnce();
		});

		it("refuses the climb while the day waits", () => {
			render(
				<TodayScreen
					{...props({ press: { ...props().press, onPress: undefined } })}
				/>
			);

			expect(press(/Continue to Vermilion/)).toBeDisabled();
		});

		it("leads to the shop with the balance to spend while the day waits", async () => {
			const onPress = vi.fn();
			render(
				<TodayScreen
					{...props({
						headline: WAITING_HEADLINE,
						press: { ...SHOP_PRESS, onPress },
						shop: null,
					})}
				/>
			);

			await userEvent.click(press(/To shop · spend 106 KB/));

			expect(onPress).toHaveBeenCalledOnce();
			expect(screen.queryByRole("button", { name: /^Shop/ })).toBeNull();
		});
	});

	describe("the shop beside the press", () => {
		it("opens and says it stays open until you start", async () => {
			const onPress = vi.fn();
			render(<TodayScreen {...props({ shop: { ...OPEN_SHOP, onPress } })} />);

			await userEvent.click(press(/Shop/));

			expect(onPress).toHaveBeenCalledOnce();
			expect(screen.getByText(/open until you start/)).toBeInTheDocument();
		});

		it("refuses mid-gate and names the reason without printing it", () => {
			render(
				<TodayScreen
					{...props({
						shop: {
							label: "Shop",
							hint: "Shop · the shop opens when you clear a gate",
							open: false,
							onPress: noop,
						},
					})}
				/>
			);

			expect(
				press(/Shop · the shop opens when you clear a gate/)
			).toBeDisabled();
		});
	});

	describe("an incoming incident", () => {
		it("shows as an audit row with who filed it", () => {
			render(
				<TodayScreen
					{...props({
						incidents: [
							{
								id: "not-found",
								code: 404,
								name: "Not Found",
								cue: "waits at Vermilion · it replaces one audit",
								sender: "@erika",
							},
						],
					})}
				/>
			);

			expect(screen.getByText("404")).toBeInTheDocument();
			expect(
				screen.getByText("waits at Vermilion · it replaces one audit")
			).toBeInTheDocument();
			expect(screen.getByText(/@erika/)).toBeInTheDocument();
		});
	});

	describe("the community row", () => {
		it("stacks the faces of who answered today and leads to the room", () => {
			render(<TodayScreen {...props()} />);

			expect(screen.getByText("GI")).toBeInTheDocument();
			expect(screen.getByText("38")).toBeInTheDocument();
			expect(screen.getByRole("link", { name: /Community/ })).toHaveAttribute(
				"href",
				"/run/community"
			);
		});

		it("folds the room past the faces shown into a count, not a press", () => {
			render(
				<TodayScreen
					{...props({ community: { ...props().community!, overflow: 4 } })}
				/>
			);

			expect(screen.getByText("+4")).toBeInTheDocument();
			expect(screen.queryByRole("button", { name: /more players/ })).toBeNull();
		});

		it("holds back until the room has been counted", () => {
			render(<TodayScreen {...props({ community: null })} />);

			expect(screen.queryByText("Community")).toBeNull();
		});
	});

	describe("the run so far", () => {
		it("lists each closed gate with its grade and what it earned", () => {
			render(<TodayScreen {...props()} />);

			expect(screen.getByText("Pallet")).toBeInTheDocument();
			expect(screen.getByText("PERFECT")).toHaveAttribute(
				"data-screen-theme",
				"cerulean"
			);
			expect(screen.getByText("+32 KB")).toBeInTheDocument();
			expect(screen.getByText("+64 KB")).toBeInTheDocument();
		});

		it("quotes the next gate with its share of coverage while polls are open", () => {
			render(<TodayScreen {...props()} />);

			expect(screen.getByText("next")).toBeInTheDocument();
			expect(screen.getByText("OK 40%")).toBeInTheDocument();
			expect(screen.getByText("+40 KB")).toBeInTheDocument();
		});

		it("says the next gate opens tomorrow and quotes nothing while the day waits", () => {
			render(
				<TodayScreen
					{...props({
						runSoFar: {
							...props().runSoFar!,
							next: {
								gate: 3,
								swatch: gateSwatchAt(3),
								note: "opens tomorrow",
								quote: null,
							},
						},
					})}
				/>
			);

			expect(screen.getByText("opens tomorrow")).toBeInTheDocument();
			expect(screen.queryByText("+40 KB")).toBeNull();
		});

		it("folds under its own heading, open on arrival", () => {
			render(<TodayScreen {...props()} />);

			expect(screen.getByText("Run so far").closest("details")).toHaveAttribute(
				"open"
			);
		});
	});

	describe("the build", () => {
		it("lists each config with its weight and version, and the weight free", () => {
			render(<TodayScreen {...props()} />);

			expect(press(/Code Coverage/)).toBeInTheDocument();
			expect(screen.getByText("4 / 6")).toBeInTheDocument();
			expect(screen.getByText("weight free")).toBeInTheDocument();
			expect(
				screen.getByRole("link", { name: /change in shop/ })
			).toHaveAttribute("href", "/run/shop");
		});

		it("draws the weight bar with one coloured segment per config, the room apart", () => {
			const { container } = render(<TodayScreen {...props()} />);

			expect(
				container.querySelectorAll(".weight-track > li[data-screen-theme]")
			).toHaveLength(1);
			expect(container.querySelectorAll(".weight-track > li")).toHaveLength(2);
		});

		it("opens a config row on its description", async () => {
			const onToggleInfo = vi.fn();
			render(<TodayScreen {...props({ build: { ...BUILD, onToggleInfo } })} />);

			await userEvent.click(press(/Code Coverage/));

			expect(onToggleInfo).toHaveBeenCalledWith("code-coverage");
		});

		it("states the description once the row is open", () => {
			render(
				<TodayScreen
					{...props({
						build: { ...BUILD, openInfo: new Set(["code-coverage"]) },
					})}
				/>
			);

			expect(
				screen.getByText("Every correct answer adds coverage.")
			).toBeInTheDocument();
		});

		it("offers no way to the shop while the shop is shut", () => {
			render(
				<TodayScreen {...props({ build: { ...BUILD, shopHref: undefined } })} />
			);

			expect(screen.queryByRole("link", { name: /change in shop/ })).toBeNull();
		});
	});

	it("states a refused start rather than dropping it", () => {
		render(
			<TodayScreen
				{...props({ refusal: "You already have a run going today." })}
			/>
		);

		expect(
			screen.getByText("You already have a run going today.")
		).toBeInTheDocument();
	});
});
