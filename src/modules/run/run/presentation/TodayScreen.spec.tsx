import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
	gateSwatchAt,
	swatchTrackFor,
} from "~/modules/run/gate/application/swatchTrack.viewmodel";
import {
	TodayScreen,
	type TodayScreenProps,
} from "~/modules/run/run/presentation/TodayScreen.ui";

const BUILD = {
	rows: [{ id: "code-coverage", name: "Code Coverage", slots: 2, version: 2 }],
	weight: "4 / 6",
	free: 2,
	shopHref: "/run/shop",
};

const props = (
	overrides: Partial<TodayScreenProps> = {}
): TodayScreenProps => ({
	swatch: gateSwatchAt(3),
	strip: {
		swatches: swatchTrackFor([0, 1, 2], 3),
		runNumber: 14,
		gate: 3,
		gates: 12,
		storage: 106,
	},
	press: {
		label: "Continue to Thunder",
		note: "5 polls ready · prep first",
		pollsLeft: 5,
		onPress: () => {},
	},
	shop: {
		label: "Shop",
		open: true,
		detail: "open until you start",
		highlighted: false,
		onPress: () => {},
	},
	incidents: [],
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
			band: { id: "ok", label: "OK" },
			started: true,
			share: "40%",
			kb: "+40 KB",
		},
	},
	build: BUILD,
	community: {
		count: 38,
		detail: "players answered today",
		ahead: 4,
		aheadDetail: "at Thunder or ahead",
		href: "/run/community",
	},
	...overrides,
});

const press = (name: RegExp) => screen.getByRole("button", { name });

describe("TodayScreen", () => {
	describe("the strip", () => {
		it("states the run, the gate and the balance above the press", () => {
			render(<TodayScreen {...props()} />);

			expect(screen.getByText("#14")).toBeInTheDocument();
			expect(screen.getByText("12")).toBeInTheDocument();
			expect(screen.getByRole("img", { name: "106 KB" })).toBeInTheDocument();
			expect(
				screen.getByRole("img", { name: /swatches discovered/ })
			).toBeInTheDocument();
		});

		it("drops the strip for a player with no run yet", () => {
			render(<TodayScreen {...props({ strip: null })} />);

			expect(
				screen.queryByRole("img", { name: /swatches discovered/ })
			).toBeNull();
		});
	});

	describe("the press", () => {
		it("continues to the next gate when its polls are ready", async () => {
			const onPress = vi.fn();
			render(
				<TodayScreen {...props({ press: { ...props().press, onPress } })} />
			);

			await userEvent.click(
				press(/Continue to Thunder · 5 polls ready · prep first/)
			);

			expect(onPress).toHaveBeenCalledOnce();
		});

		it("shuts while the day waits for the gate to open", () => {
			render(
				<TodayScreen
					{...props({
						press: {
							label: "Thunder opens in 11h 16m",
							note: "today’s polls are done · come back tomorrow",
							pollsLeft: 5,
						},
					})}
				/>
			);

			expect(press(/Thunder opens in 11h 16m/)).toBeDisabled();
		});
	});

	describe("the shop", () => {
		it("opens beside the press and says it stays open until you start", async () => {
			const onPress = vi.fn();
			render(
				<TodayScreen {...props({ shop: { ...props().shop, onPress } })} />
			);

			await userEvent.click(press(/Shop/));

			expect(onPress).toHaveBeenCalledOnce();
			expect(screen.getByText(/open until you start/)).toBeInTheDocument();
		});

		it("names what there is to spend while the day waits", () => {
			render(
				<TodayScreen
					{...props({
						shop: {
							...props().shop,
							detail: "spend 106 KB",
							highlighted: true,
						},
					})}
				/>
			);

			expect(screen.getByText(/spend 106 KB/)).toBeInTheDocument();
		});

		it("refuses mid-gate and names the reason without printing it", () => {
			render(
				<TodayScreen
					{...props({
						shop: {
							label: "Shop",
							hint: "Shop · the shop opens when you clear a gate",
							open: false,
							highlighted: false,
							onPress: () => {},
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
								cue: "waits at Thunder · it replaces one audit",
								sender: "@erika",
							},
						],
					})}
				/>
			);

			expect(screen.getByText("404")).toBeInTheDocument();
			expect(
				screen.getByText("waits at Thunder · it replaces one audit")
			).toBeInTheDocument();
			expect(screen.getByText(/@erika/)).toBeInTheDocument();
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

		it("projects the next gate with its share of coverage", () => {
			render(<TodayScreen {...props()} />);

			expect(screen.getByText("Thunder · next")).toBeInTheDocument();
			expect(screen.getByText("OK 40%")).toBeInTheDocument();
			expect(screen.getByText("+40 KB")).toBeInTheDocument();
		});
	});

	describe("the build", () => {
		it("lists each config with its weight and version, and the weight free", () => {
			render(<TodayScreen {...props()} />);

			expect(screen.getByText("Code Coverage")).toBeInTheDocument();
			expect(screen.getByText("4 / 6")).toBeInTheDocument();
			expect(screen.getByText("weight free")).toBeInTheDocument();
			expect(
				screen.getByRole("link", { name: /change in shop/ })
			).toHaveAttribute("href", "/run/shop");
		});

		it("offers no way to the shop while the shop is shut", () => {
			render(
				<TodayScreen {...props({ build: { ...BUILD, shopHref: undefined } })} />
			);

			expect(screen.queryByRole("link", { name: /change in shop/ })).toBeNull();
		});
	});

	describe("the community strip", () => {
		it("badges the room's count and who is at the gate or ahead", () => {
			render(<TodayScreen {...props()} />);

			expect(screen.getByText("38")).toBeInTheDocument();
			expect(screen.getByText("at Thunder or ahead")).toBeInTheDocument();
			expect(screen.getByRole("link", { name: /Community/ })).toHaveAttribute(
				"href",
				"/run/community"
			);
		});

		it("holds back until the room has been counted", () => {
			render(<TodayScreen {...props({ community: null })} />);

			expect(screen.queryByText("Community")).toBeNull();
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
