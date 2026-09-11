import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
	SHOP_CAPACITY_SLOTS,
	kantoShopBuild,
	slotDealsAt,
	usedSlotsOf,
} from "~/test/kantoPoll.factory";

import { Build } from "./Build.ui";
import type { ConfigChipProps } from "./ConfigChip.ui";

const RUNNING = [
	{ name: "Cache", badges: [{ label: "×1.75", color: "viridian" }] },
	{ name: "ESLint", badges: [{ label: "lint 32 KB", color: "cerulean" }] },
] satisfies ConfigChipProps[];

const SKIPPED = [
	{
		name: "Cold Start",
		badges: [{ label: "spent", color: "pewter" }],
		skipped: true,
	},
	{
		name: "Stylelint",
		badges: [{ label: "CSS only", color: "pewter" }],
		skipped: true,
	},
] satisfies ConfigChipProps[];

describe("Build", () => {
	it("titles the band without shouting it", () => {
		render(<Build configs={RUNNING} />);

		expect(screen.getByText("Build")).toBeInTheDocument();
		expect(screen.queryByText("BUILD")).not.toBeInTheDocument();
	});

	it("counts skipped configs into the total, not just the visible ones", () => {
		render(<Build configs={RUNNING} skipped={SKIPPED} />);

		expect(screen.getByText("4 configs")).toBeInTheDocument();
	});

	it("drops its own title row when something above it names the band", () => {
		render(<Build configs={RUNNING} heading={false} />);

		expect(screen.queryByText("Build")).not.toBeInTheDocument();
		expect(screen.queryByText("2 configs")).not.toBeInTheDocument();
		expect(screen.getByText("Cache")).toBeInTheDocument();
	});

	it("lists every running config as a chip", () => {
		render(<Build configs={RUNNING} />);

		expect(screen.getByText("Cache")).toBeInTheDocument();
		expect(screen.getByText("ESLint")).toBeInTheDocument();
	});

	it("hides the fold entirely when nothing is skipped", () => {
		const { container } = render(<Build configs={RUNNING} />);

		expect(container.querySelector("details")).toBeNull();
	});

	it("summarises the fold by count and by why nothing is due", () => {
		render(
			<Build
				configs={RUNNING}
				skipped={SKIPPED}
				skippedNote="nothing to do on this poll"
			/>
		);

		expect(
			screen.getByText("2 skipped · nothing to do on this poll")
		).toBeInTheDocument();
	});

	it("summarises by count alone when no reason is given", () => {
		render(<Build configs={RUNNING} skipped={SKIPPED} />);

		expect(screen.getByText("2 skipped")).toBeInTheDocument();
	});

	it("keeps the fold shut by default", () => {
		const { container } = render(<Build configs={RUNNING} skipped={SKIPPED} />);

		expect(container.querySelector("details")).not.toHaveAttribute("open");
	});

	it("opens the fold on request", () => {
		const { container } = render(
			<Build configs={RUNNING} skipped={SKIPPED} skippedOpen />
		);

		expect(container.querySelector("details")).toHaveAttribute("open");
	});

	it("keeps the skipped configs inside the fold, apart from the running ones", () => {
		const { container } = render(
			<Build configs={RUNNING} skipped={SKIPPED} skippedOpen />
		);

		const fold = container.querySelector("details");
		expect(fold).not.toBeNull();
		if (fold === null) return;

		expect(within(fold).getByText("Cold Start")).toBeInTheDocument();
		expect(within(fold).queryByText("Cache")).not.toBeInTheDocument();
	});

	it("wraps the chips rather than letting a full build overflow the screen", () => {
		render(<Build configs={RUNNING} />);

		expect(screen.getByText("Cache").closest(".flex-wrap")).not.toBeNull();
	});

	const WITH_PANELS = [
		{
			name: "Cache",
			badges: [{ label: "×1.75", color: "viridian" }],
			info: {
				name: "Cache",
				description: "Coverage climbs with every correct answer in a row.",
				slots: 2,
				sellPrice: "32 KB",
			},
		},
		{
			name: "ESLint",
			badges: [{ label: "lint 32 KB", color: "cerulean" }],
			info: {
				name: "ESLint",
				description: "Cross out a wrong answer on JS/TS polls.",
				slots: 1,
				sellPrice: "16 KB",
			},
		},
	] satisfies ConfigChipProps[];

	it("opens the panel of the named config and no other", () => {
		render(<Build configs={WITH_PANELS} openInfo="Cache" />);

		expect(screen.getByRole("button", { name: "About Cache" })).toHaveAttribute(
			"aria-expanded",
			"true"
		);
		expect(
			screen.getByRole("button", { name: "About ESLint" })
		).toHaveAttribute("aria-expanded", "false");
	});

	it("opens nothing when no config is named", () => {
		render(<Build configs={WITH_PANELS} />);

		for (const name of ["About Cache", "About ESLint"]) {
			expect(screen.getByRole("button", { name })).toHaveAttribute(
				"aria-expanded",
				"false"
			);
		}
	});

	it("reports which config was asked about, so the parent can pin it", async () => {
		const onToggleInfo = vi.fn();
		render(<Build configs={WITH_PANELS} onToggleInfo={onToggleInfo} />);

		await userEvent.click(screen.getByRole("button", { name: "About ESLint" }));

		expect(onToggleInfo).toHaveBeenCalledWith("ESLint");
	});

	it("reaches configs inside the skipped fold too", async () => {
		const onToggleInfo = vi.fn();
		render(
			<Build
				configs={RUNNING}
				skipped={WITH_PANELS.map((config) => ({ ...config, skipped: true }))}
				skippedOpen
				onToggleInfo={onToggleInfo}
			/>
		);

		await userEvent.click(screen.getByRole("button", { name: "About Cache" }));

		expect(onToggleInfo).toHaveBeenCalledWith("Cache");
	});

	it("hands a locked config no panel to open", () => {
		render(<Build configs={[{ locked: true }]} />);

		expect(
			screen.queryByRole("button", { name: /About/ })
		).not.toBeInTheDocument();
	});
});

describe("Build's vacancy", () => {
	const FULL = { used: 10, capacity: 10 } as const;
	const ROOMY = { used: 7, capacity: 10 } as const;

	it("opens one box per slot the build has not filled", () => {
		render(<Build configs={RUNNING} slots={ROOMY} />);

		expect(screen.getAllByText("empty slot")).toHaveLength(3);
	});

	it("opens no boxes once every slot is filled", () => {
		render(<Build configs={RUNNING} slots={FULL} />);

		expect(screen.queryByText("empty slot")).not.toBeInTheDocument();
	});

	it("opens no boxes over capacity, rather than counting backwards", () => {
		render(<Build configs={RUNNING} slots={{ used: 12, capacity: 10 }} />);

		expect(screen.queryByText("empty slot")).not.toBeInTheDocument();
	});

	it("hangs the refund on the box nearest the hatching, not on every one", () => {
		render(<Build configs={RUNNING} slots={ROOMY} {...slotDealsAt()} />);

		expect(screen.getAllByText("empty slot")).toHaveLength(2);
		expect(
			screen.getAllByRole("button", { name: /cash this slot back/ })
		).toHaveLength(1);
	});

	it("stands the room for sale after the room still to fill", () => {
		render(<Build configs={RUNNING} slots={ROOMY} {...slotDealsAt()} />);

		const offer = screen.getByRole("button", { name: /buy slot/ });
		const cash = screen.getByRole("button", { name: /cash this slot back/ });

		expect(
			cash.compareDocumentPosition(offer) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	});

	it("keeps the vacancy inside the chip column, so it lines up with it", () => {
		render(<Build configs={RUNNING} layout="column" slots={ROOMY} />);

		const chip = screen.getByText("Cache").closest('span[class*="bg-theme/"]');
		const box = screen.getAllByText("empty slot")[0].parentElement;

		expect(box?.parentElement).toBe(chip?.parentElement);
	});

	it("leaves the poll band no vacancy to draw", () => {
		const { container } = render(<Build configs={RUNNING} />);

		expect(screen.queryByText("empty slot")).not.toBeInTheDocument();
		expect(container.querySelector(".bg-hatched-theme")).toBeNull();
	});
});

describe("Build's slot track", () => {
	const SIZED = [
		{ name: ".ts", slots: 2, badges: [{ label: "×2", color: "viridian" }] },
		{
			name: "Cache",
			slots: 4,
			badges: [{ label: "×1.75", color: "viridian" }],
		},
	] satisfies ConfigChipProps[];

	const SIZED_SKIPPED = [
		{
			name: "Cold Start",
			slots: 1,
			skipped: true,
			badges: [{ label: "spent", color: "pewter" }],
		},
	] satisfies ConfigChipProps[];

	const ROOMY = { used: 6, capacity: 10 } as const;

	const trackOf = (container: HTMLElement) =>
		container.querySelector("[aria-hidden].gap-\\[3px\\]");

	const growsOf = (container: HTMLElement) =>
		Array.from(trackOf(container)!.querySelectorAll<HTMLElement>("span")).map(
			(box) => Number(box.style.flexGrow)
		);

	const captionOf = (container: HTMLElement) =>
		container.querySelector("p")?.textContent;

	it("draws the track on the shop column, above the chips it describes", () => {
		const { container } = render(<Build configs={SIZED} slots={ROOMY} />);

		const track = trackOf(container);
		const chip = screen.getByText("Cache");

		expect(track).not.toBeNull();
		expect(
			track!.compareDocumentPosition(chip) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	});

	it("leaves the poll band no track to draw", () => {
		const { container } = render(<Build configs={SIZED} />);

		expect(trackOf(container)).toBeNull();
	});

	it("draws one box per config, as wide as the config's own slots", () => {
		const { container } = render(<Build configs={SIZED} slots={ROOMY} />);

		expect(growsOf(container).slice(0, SIZED.length)).toEqual([2, 4]);
	});

	it("draws exactly as many slots as the band reports spent", () => {
		const used = usedSlotsOf(kantoShopBuild);
		const { container } = render(
			<Build
				configs={kantoShopBuild}
				layout="column"
				slots={{ used, capacity: SHOP_CAPACITY_SLOTS }}
			/>
		);

		const grows = growsOf(container);

		expect(used).toBe(7);
		expect(grows.slice(0, kantoShopBuild.length)).toEqual(
			kantoShopBuild.map((config) => config.slots)
		);
		expect(grows.reduce((sum, grow) => sum + grow, 0)).toBe(
			SHOP_CAPACITY_SLOTS
		);
	});

	it("counts skipped configs into the track, not just the visible ones", () => {
		const { container } = render(
			<Build
				configs={SIZED}
				skipped={SIZED_SKIPPED}
				slots={{ used: 7, capacity: 10 }}
			/>
		);

		expect(growsOf(container).slice(0, 3)).toEqual([2, 4, 1]);
	});

	it("draws no box for a locked config, which withholds its width", () => {
		const { container } = render(
			<Build configs={[{ locked: true }]} slots={{ used: 0, capacity: 4 }} />
		);

		expect(growsOf(container)).toEqual([1, 1, 1, 1]);
	});

	it("counts the room left over in the band's own sentence", () => {
		render(<Build configs={SIZED} slots={ROOMY} />);

		expect(
			screen.getByText("2 configs · 6 of 10 slots · 4 free")
		).toBeInTheDocument();
	});

	it("names an overflow rather than counting free room backwards", () => {
		render(<Build configs={SIZED} slots={{ used: 12, capacity: 10 }} />);

		expect(
			screen.getByText("2 configs · 12 of 10 slots · over by 2")
		).toBeInTheDocument();
	});

	it("reports the config the pointer is over", async () => {
		const onHighlight = vi.fn();
		render(
			<Build
				configs={SIZED}
				layout="column"
				slots={ROOMY}
				onHighlight={onHighlight}
			/>
		);

		await userEvent.hover(screen.getByText("Cache"));

		expect(onHighlight).toHaveBeenCalledWith("Cache");
	});

	it("clears the highlight when the pointer leaves the chip", async () => {
		const onHighlight = vi.fn();
		render(
			<Build
				configs={SIZED}
				layout="column"
				slots={ROOMY}
				onHighlight={onHighlight}
			/>
		);

		await userEvent.hover(screen.getByText("Cache"));
		await userEvent.unhover(screen.getByText("Cache"));

		expect(onHighlight).toHaveBeenLastCalledWith();
	});

	it("prices the highlighted config on the line under the track", () => {
		const { container } = render(
			<Build configs={SIZED} slots={ROOMY} highlight="Cache" />
		);

		expect(captionOf(container)).toBe("Cache takes 4 slots of 10");
	});

	it("lights the config whose panel is open, so a phone can read the track", () => {
		const { container } = render(
			<Build configs={SIZED} slots={ROOMY} openInfo="Cache" />
		);

		expect(captionOf(container)).toBe("Cache takes 4 slots of 10");
	});

	it("lets a hover beat an open panel, it being the more deliberate of the two", () => {
		const { container } = render(
			<Build configs={SIZED} slots={ROOMY} openInfo="Cache" highlight=".ts" />
		);

		expect(captionOf(container)).toBe(".ts takes 2 slots of 10");
	});

	it("speaks for an empty list without spending a slot on it", () => {
		render(
			<Build
				configs={[]}
				slots={{ used: 0, capacity: 4 }}
				emptyLabel="nothing installed yet"
			/>
		);

		expect(screen.getByText("nothing installed yet")).toBeInTheDocument();
		expect(screen.getAllByText("empty slot")).toHaveLength(4);
	});

	it("drops the placeholder as soon as the build holds anything", () => {
		render(
			<Build
				configs={RUNNING}
				slots={{ used: 2, capacity: 4 }}
				emptyLabel="nothing installed yet"
			/>
		);

		expect(screen.queryByText("nothing installed yet")).not.toBeInTheDocument();
	});

	it("leaves an empty build bare when no screen speaks for it", () => {
		render(<Build configs={[]} slots={{ used: 0, capacity: 4 }} />);

		expect(screen.queryByText("nothing installed yet")).not.toBeInTheDocument();
		expect(screen.getAllByText("empty slot")).toHaveLength(4);
	});

	it("hands the track the resting line it was given", () => {
		render(
			<Build
				configs={[]}
				slots={{ used: 0, capacity: 4 }}
				resting="pick one config and you can play"
			/>
		);

		expect(
			screen.getByText("pick one config and you can play")
		).toBeInTheDocument();
	});

	it("merges the track into one bar when asked for occupancy", () => {
		const { container } = render(
			<Build
				configs={RUNNING}
				slots={{ used: 2, capacity: 4 }}
				track="occupancy"
			/>
		);

		const fills = container.querySelectorAll(".badge-theme[style]");
		expect(fills).toHaveLength(1);
		expect(fills[0]).toHaveStyle({ flexGrow: "2" });
	});

	it("says nothing about hovering a config on an occupancy track", () => {
		render(
			<Build
				configs={RUNNING}
				slots={{ used: 2, capacity: 4 }}
				track="occupancy"
			/>
		);

		expect(
			screen.queryByText("hover a config to find its room on the track")
		).not.toBeInTheDocument();
	});

	it("draws a box per config by default", () => {
		const sized = [
			{ name: "Cache", slots: 1, badges: [] },
			{ name: "Deprecated", slots: 4, badges: [] },
		];
		const { container } = render(
			<Build configs={sized} slots={{ used: 5, capacity: 8 }} />
		);

		const fills = container.querySelectorAll(".badge-theme[style]");
		expect(fills).toHaveLength(2);
		expect(fills[1]).toHaveStyle({ flexGrow: "4" });
	});

	it("draws no bar at all for an empty occupancy track", () => {
		const { container } = render(
			<Build configs={[]} slots={{ used: 0, capacity: 4 }} track="occupancy" />
		);

		expect(container.querySelectorAll(".badge-theme[style]")).toHaveLength(0);
	});
});
