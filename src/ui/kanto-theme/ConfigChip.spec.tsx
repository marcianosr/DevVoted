import { readFileSync } from "node:fs";

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ConfigChip } from "./ConfigChip.ui";
import { REDACTED } from "./Redaction.ui";

const appCss = readFileSync("src/styles/app.css", "utf8");

const BADGES = [{ label: "×2", color: "viridian" }] as const;

const INFO = {
	name: "Cache",
	description: "Coverage climbs with every correct answer in a row.",
	slots: 2,
	sellPrice: "32 KB",
} as const;

const panelOf = (container: HTMLElement) =>
	container.querySelector(".absolute");

const tintOf = (node: Element | null) =>
	Array.from(node?.classList ?? []).find((name) =>
		name.startsWith("bg-theme/")
	);

const tintedChip = (container: HTMLElement) =>
	Array.from(container.querySelectorAll("span")).find(
		(node) => tintOf(node) !== undefined
	);

const declaration = (utility: string, property: string) => {
	const block = appCss.slice(appCss.indexOf(`@utility ${utility} {`));
	const body = block.slice(0, block.indexOf("}"));
	const line = body
		.split("\n")
		.find((row) => row.trim().startsWith(`${property}:`));
	return line?.trim();
};

describe("ConfigChip", () => {
	it("names the config and its badge", () => {
		render(
			<ConfigChip
				name="Cache"
				badges={[{ label: "×1.75", color: "viridian" }]}
			/>
		);

		expect(screen.getByText("Cache")).toBeInTheDocument();
		expect(screen.getByText("×1.75")).toBeInTheDocument();
	});

	it("draws a 1px edge in the ambient theme's faintest border", () => {
		const { container } = render(
			<ConfigChip name="Cache" badges={[...BADGES]} />
		);

		expect(container.firstChild).toHaveClass("border", "border-theme-faint");
	});

	it("rings the info button in a utility app.css declares", () => {
		render(<ConfigChip name="Cache" badges={[...BADGES]} info={INFO} />);

		expect(screen.getByRole("button", { name: "About Cache" })).toHaveClass(
			"ring-theme-faint"
		);
		expect(appCss).toContain("@utility ring-theme-faint");
	});

	it("carries an alpha of the screen's colour rather than an opaque rung", () => {
		const { container } = render(
			<ConfigChip name="Cache" badges={[...BADGES]} />
		);

		expect(tintOf(container.firstElementChild)).toBeDefined();
		expect(container.firstChild).not.toHaveClass("bg-theme-raised");
	});

	it("resolves that alpha through the registered colour, which is what makes it emit at all", () => {
		expect(appCss).toContain("@theme inline {");
		expect(appCss).toContain("--color-theme: var(--theme-color);");
	});

	it("leaves the chip itself unthemed so the edge follows the screen", () => {
		const { container } = render(
			<ConfigChip name="Cache" badges={[...BADGES]} />
		);

		expect(container.firstChild).not.toHaveAttribute("data-screen-theme");
	});

	it("hands the badge its own colour, apart from the chip's edge", () => {
		render(
			<ConfigChip name="Cache" badges={[{ label: "×2", color: "saffron" }]} />
		);

		expect(screen.getByText("×2")).toHaveAttribute(
			"data-screen-theme",
			"saffron"
		);
	});

	it("stays as wide as its contents", () => {
		const { container } = render(
			<ConfigChip name="Cache" badges={[...BADGES]} />
		);

		expect(container.firstChild).toHaveClass("w-fit");
	});

	it("prefixes a version with v and tags it apart from the name", () => {
		render(<ConfigChip name=".ts" badges={[...BADGES]} version={4} />);

		expect(screen.getByText("v4")).toHaveClass("badge-theme");
		expect(screen.getByText(".ts")).not.toHaveClass("badge-theme");
	});

	it("omits the version entirely when the config has none", () => {
		render(<ConfigChip name="AGENTS.md" badges={[...BADGES]} />);

		expect(screen.queryByText(/^v\d/)).not.toBeInTheDocument();
	});

	it("strikes a lost config's name and colours it from the badge", () => {
		render(
			<ConfigChip
				name="Intellisense"
				badges={[{ label: "424", color: "cinnabar" }]}
				lost
			/>
		);

		const name = screen.getByText("Intellisense");
		expect(name).toHaveClass("line-through", "text-theme-soft");
		expect(name).toHaveAttribute("data-screen-theme", "cinnabar");
	});

	it("leaves a held config's name unstruck and untinted", () => {
		render(<ConfigChip name="Cache" badges={[...BADGES]} />);

		const name = screen.getByText("Cache");
		expect(name).toHaveClass("text-theme-faint");
		expect(name).not.toHaveClass("line-through");
		expect(name).not.toHaveAttribute("data-screen-theme");
	});

	it("lines up several badges, in the order given", () => {
		render(
			<ConfigChip
				name="A/B Test"
				badges={[
					{ label: "arm A", color: "cerulean" },
					{ label: "×1.25", color: "viridian" },
				]}
			/>
		);

		expect(screen.getByText("arm A")).toHaveAttribute(
			"data-screen-theme",
			"cerulean"
		);
		expect(screen.getByText("×1.25")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
	});

	it("tints a lost name from the last badge rather than the first", () => {
		render(
			<ConfigChip
				name="A/B Test"
				badges={[
					{ label: "arm A", color: "cerulean" },
					{ label: "424", color: "cinnabar" },
				]}
				lost
			/>
		);

		expect(screen.getByText("A/B Test")).toHaveAttribute(
			"data-screen-theme",
			"cinnabar"
		);
	});

	it("renders a badgeless config without tinting its lost name", () => {
		render(<ConfigChip name="Intellisense" badges={[]} lost />);

		const name = screen.getByText("Intellisense");
		expect(name).toHaveClass("line-through");
		expect(name).not.toHaveAttribute("data-screen-theme");
	});

	it("keeps text-theme-soft identical to the badge's ink", () => {
		const ink = declaration("text-theme-soft", "color");
		const badgeInk = declaration("badge-theme", "color");

		expect(ink).toBeDefined();
		expect(badgeInk).toBeDefined();
		expect(ink).toBe(badgeInk);
	});
});

describe("ConfigChip when locked", () => {
	it("withholds the config's name", () => {
		render(<ConfigChip locked />);

		expect(screen.getByText(REDACTED)).toBeInTheDocument();
	});

	it("carries no theme attribute, since a colour would name the family", () => {
		const { container } = render(<ConfigChip locked />);

		expect(
			container.querySelector("[data-screen-theme]")
		).not.toBeInTheDocument();
	});

	it("shows no badge, so the number of its effects stays hidden too", () => {
		const { container } = render(<ConfigChip locked />);

		expect(container.querySelector(".badge-theme")).not.toBeInTheDocument();
	});

	it("shows no version", () => {
		const { container } = render(<ConfigChip locked />);

		expect(container.textContent).not.toMatch(/v\d/);
	});

	it("names the locked state for a screen reader", () => {
		render(<ConfigChip locked />);

		expect(screen.getByText("Locked config")).toHaveClass("sr-only");
	});

	it("keeps the chip's edge and shape", () => {
		const { container } = render(<ConfigChip locked />);

		expect(container.firstChild).toHaveClass(
			"border",
			"border-theme-faint",
			"rounded-lg"
		);
	});
});

describe("ConfigChip states and controls", () => {
	it("dims a skipped chip whole, so its badge reads as inert", () => {
		const { container } = render(
			<ConfigChip
				name="Cold Start"
				badges={[{ label: "spent", color: "pewter" }]}
				skipped
			/>
		);

		expect(container.firstChild).toHaveClass("opacity-60");
	});

	it("mutes a skipped config's name below the faint copy around it", () => {
		render(
			<ConfigChip
				name="Cold Start"
				badges={[{ label: "spent", color: "pewter" }]}
				skipped
			/>
		);

		expect(screen.getByText("Cold Start")).toHaveClass("text-theme-muted");
	});

	it("leaves a running chip at full strength", () => {
		const { container } = render(
			<ConfigChip name="Cache" badges={[...BADGES]} />
		);

		expect(container.firstChild).not.toHaveClass("opacity-60");
		expect(screen.getByText("Cache")).toHaveClass("text-theme-faint");
	});

	it("lets a lost config keep its strike when it is also skipped", () => {
		const { container } = render(
			<ConfigChip
				name="Intellisense"
				badges={[{ label: "424", color: "cinnabar" }]}
				lost
				skipped
			/>
		);

		expect(screen.getByText("Intellisense")).toHaveClass("line-through");
		expect(container.firstChild).toHaveClass("opacity-60");
	});

	it("stands 38px tall on 8px by 16px of padding", () => {
		const { container } = render(
			<ConfigChip name="Cache" badges={[...BADGES]} />
		);

		expect(container.firstChild).toHaveClass("py-2", "px-4");
	});

	it("sets the chip's copy at 14px", () => {
		const { container } = render(
			<ConfigChip name="Cache" badges={[...BADGES]} />
		);

		expect(container.firstChild).toHaveClass("text-sm");
	});

	it("keeps a locked chip the same size as an unlocked one", () => {
		const { container: unlocked } = render(
			<ConfigChip name="Cache" badges={[...BADGES]} />
		);
		const { container: locked } = render(<ConfigChip locked />);

		expect(locked.firstElementChild?.className).toBe(
			unlocked.firstElementChild?.className
		);
	});

	it("hands a pressable badge straight through as a control", () => {
		render(
			<ConfigChip
				name="ESLint"
				badges={[{ label: "lint 32 KB", onPress: vi.fn() }]}
			/>
		);

		expect(
			screen.getByRole("button", { name: "lint 32 KB" })
		).toBeInTheDocument();
	});

	it("keeps a decorative badge inert beside a pressable one", () => {
		render(
			<ConfigChip
				name="A/B Test"
				badges={[
					{ label: "arm A", armed: true, onPress: vi.fn() },
					{ label: "×1.25", color: "viridian" },
				]}
			/>
		);

		expect(screen.getAllByRole("button")).toHaveLength(1);
		expect(screen.getByText("×1.25")).toHaveClass("badge-theme");
	});

	it("offers no info button to a config with no panel", () => {
		render(<ConfigChip name="Cache" badges={[...BADGES]} />);

		expect(
			screen.queryByRole("button", { name: /About/ })
		).not.toBeInTheDocument();
	});

	it("offers an info button once there is a panel to open", () => {
		render(<ConfigChip name="Cache" badges={[...BADGES]} info={INFO} />);

		expect(
			screen.getByRole("button", { name: "About Cache" })
		).toBeInTheDocument();
	});

	it("reports the panel shut until it is pinned", () => {
		render(<ConfigChip name="Cache" badges={[...BADGES]} info={INFO} />);

		expect(screen.getByRole("button", { name: "About Cache" })).toHaveAttribute(
			"aria-expanded",
			"false"
		);
	});

	it("reports the panel open once pinned", () => {
		render(
			<ConfigChip name="Cache" badges={[...BADGES]} info={INFO} infoOpen />
		);

		expect(screen.getByRole("button", { name: "About Cache" })).toHaveAttribute(
			"aria-expanded",
			"true"
		);
	});

	it("asks its parent to toggle, since the chip holds no state", async () => {
		const onToggleInfo = vi.fn();
		render(
			<ConfigChip
				name="Cache"
				badges={[...BADGES]}
				info={INFO}
				onToggleInfo={onToggleInfo}
			/>
		);

		await userEvent.click(screen.getByRole("button", { name: "About Cache" }));

		expect(onToggleInfo).toHaveBeenCalledOnce();
	});

	it("keeps a shut panel out of the accessibility tree", () => {
		const { container } = render(
			<ConfigChip name="Cache" badges={[...BADGES]} info={INFO} />
		);

		expect(panelOf(container)).toHaveAttribute("aria-hidden", "true");
	});

	it("never carries a shut and an open visibility at once", () => {
		for (const infoOpen of [true, false]) {
			const { container } = render(
				<ConfigChip
					name="Cache"
					badges={[...BADGES]}
					info={INFO}
					infoOpen={infoOpen}
				/>
			);

			const panel = panelOf(container);
			const classes = (panel?.className ?? "").split(" ");

			expect(classes.includes("visible")).toBe(infoOpen);
			expect(classes.includes("invisible")).toBe(!infoOpen);
			expect(classes.includes("opacity-100")).toBe(infoOpen);
			expect(classes.includes("opacity-0")).toBe(!infoOpen);
		}
	});

	it("takes pointer events back once pinned, so a tap cannot fall through", () => {
		const { container: shut } = render(
			<ConfigChip name="Cache" badges={[...BADGES]} info={INFO} />
		);
		const { container: open } = render(
			<ConfigChip name="Cache" badges={[...BADGES]} info={INFO} infoOpen />
		);

		expect(panelOf(shut)).toHaveClass("pointer-events-none");
		expect(panelOf(open)).toHaveClass("pointer-events-auto");
	});

	it("still reveals on hover and on keyboard focus while shut", () => {
		const { container } = render(
			<ConfigChip name="Cache" badges={[...BADGES]} info={INFO} />
		);

		const panel = panelOf(container);
		expect(panel).toHaveClass("group-hover/info:visible");
		expect(panel).toHaveClass("group-has-[:focus-visible]/info:visible");
	});

	it("exposes the panel once it is pinned", () => {
		render(
			<ConfigChip name="Cache" badges={[...BADGES]} info={INFO} infoOpen />
		);

		expect(screen.getByText(INFO.description)).toBeInTheDocument();
	});

	it("withholds the panel from a locked config along with its name", () => {
		render(<ConfigChip locked />);

		expect(screen.queryByRole("button")).not.toBeInTheDocument();
		expect(screen.getByText("Locked config")).toHaveClass("sr-only");
	});

	it("keeps the info button on a config an audit knocked offline", () => {
		render(
			<ConfigChip
				name="Intellisense"
				badges={[{ label: "424", color: "cinnabar" }]}
				lost
				info={INFO}
			/>
		);

		expect(
			screen.getByRole("button", { name: "About Intellisense" })
		).toBeInTheDocument();
		expect(screen.getByText("Intellisense")).toHaveClass("line-through");
	});
});

describe("ConfigChip's weight", () => {
	it("leads with the slot count the config takes up", () => {
		render(<ConfigChip name="Cache" badges={[...BADGES]} slots={2} />);

		expect(screen.getByText("2")).toBeInTheDocument();
	});

	it("puts the weight ahead of the name, where a rail can line them up", () => {
		const { container } = render(
			<ConfigChip name="Cache" badges={[...BADGES]} slots={2} />
		);

		expect(container.firstElementChild?.firstElementChild).toHaveTextContent(
			"2"
		);
	});

	it("omits the block entirely for a chip with no slot count", () => {
		render(<ConfigChip name="AGENTS.md" badges={[...BADGES]} />);

		expect(screen.queryByText("2")).not.toBeInTheDocument();
	});

	it("hands the block to Weight rather than painting one here", () => {
		render(<ConfigChip name="Cache" badges={[...BADGES]} slots={4} />);

		expect(screen.getByText("4")).toHaveClass("badge-theme", "w-7");
	});
});

const UPGRADES = {
	name: "Cache",
	description: "Each version warms the cache further.",
	rungs: [
		{ version: 1, effect: "×1.25", state: "owned" as const, held: true },
		{
			version: 2,
			effect: "×1.5",
			state: "offered" as const,
			price: "64 KB",
		},
		{ version: 3, effect: "×1.75", state: "future" as const, price: "96 KB" },
	],
};

const OWNED_OUT = {
	...UPGRADES,
	rungs: [{ version: 3, effect: "×1.75", state: "owned" as const, held: true }],
};

describe("ConfigChip's upgrade", () => {
	it("offers nothing to upgrade without a ladder to climb", () => {
		render(<ConfigChip name="Cache" badges={[...BADGES]} version={2} />);

		expect(
			screen.queryByRole("button", { name: /Upgrade/ })
		).not.toBeInTheDocument();
	});

	it("offers nothing once every version is bought", () => {
		render(
			<ConfigChip name="Cache" badges={[...BADGES]} upgrades={OWNED_OUT} />
		);

		expect(
			screen.queryByRole("button", { name: /Upgrade/ })
		).not.toBeInTheDocument();
	});

	it("labels the button with the version on offer, not the one held", () => {
		render(
			<ConfigChip
				name="Cache"
				badges={[...BADGES]}
				version={1}
				upgrades={UPGRADES}
			/>
		);

		expect(
			screen.getByRole("button", { name: "Upgrade Cache to v2 · 64 KB" })
		).toBeInTheDocument();
	});

	it("carries the offered price as the detail it reveals on hover", () => {
		render(
			<ConfigChip name="Cache" badges={[...BADGES]} upgrades={UPGRADES} />
		);

		expect(screen.getByText(/64 KB/)).toHaveClass("hidden");
	});

	it("opens the upgrade panel on a press rather than buying outright", async () => {
		const onToggleUpgrades = vi.fn();
		render(
			<ConfigChip
				name="Cache"
				badges={[...BADGES]}
				upgrades={UPGRADES}
				onToggleUpgrades={onToggleUpgrades}
			/>
		);

		await userEvent.click(
			screen.getByRole("button", { name: /Upgrade Cache/ })
		);

		expect(onToggleUpgrades).toHaveBeenCalledOnce();
	});

	it("reports the upgrade panel shut until it is opened", () => {
		render(
			<ConfigChip name="Cache" badges={[...BADGES]} upgrades={UPGRADES} />
		);

		expect(
			screen.getByRole("button", { name: /Upgrade Cache/ })
		).toHaveAttribute("aria-expanded", "false");
	});

	it("shows the offer in the panel once it is open", () => {
		render(
			<ConfigChip
				name="Cache"
				badges={[...BADGES]}
				upgrades={UPGRADES}
				upgradesOpen
			/>
		);

		expect(screen.getByText("×1.25")).toBeInTheDocument();
		expect(screen.getByText("64 KB")).toBeInTheDocument();
	});

	it("gives the one panel slot to the upgrade panel while it is open", () => {
		render(
			<ConfigChip
				name="Cache"
				badges={[...BADGES]}
				info={INFO}
				upgrades={UPGRADES}
				upgradesOpen
			/>
		);

		expect(screen.queryByText(INFO.description)).not.toBeInTheDocument();
	});

	it("hands the slot back to the info panel once the upgrade panel shuts", () => {
		render(
			<ConfigChip
				name="Cache"
				badges={[...BADGES]}
				info={INFO}
				upgrades={UPGRADES}
			/>
		);

		expect(screen.getByText(INFO.description)).toBeInTheDocument();
	});

	it("buys from inside the panel, not from the chip's button", async () => {
		const onBuy = vi.fn();
		render(
			<ConfigChip
				name="Cache"
				badges={[...BADGES]}
				upgrades={{ ...UPGRADES, onBuy }}
				upgradesOpen
			/>
		);

		await userEvent.click(
			screen.getByRole("button", { name: "Buy v2 · 64 KB" })
		);

		expect(onBuy).toHaveBeenCalledWith(2);
	});
});

describe("ConfigChip's uninstall", () => {
	it("offers no uninstall until something can act on it", () => {
		render(<ConfigChip name="Cache" badges={[...BADGES]} />);

		expect(
			screen.queryByRole("button", { name: /Uninstall/ })
		).not.toBeInTheDocument();
	});

	it("uninstalls on the first press", async () => {
		const onUninstall = vi.fn();
		render(
			<ConfigChip name="Cache" badges={[...BADGES]} onUninstall={onUninstall} />
		);

		await userEvent.click(
			screen.getByRole("button", { name: "Uninstall Cache" })
		);

		expect(onUninstall).toHaveBeenCalledOnce();
	});

	it("names the config it would remove, since the glyph names nothing", () => {
		render(
			<ConfigChip name="Cache" badges={[...BADGES]} onUninstall={vi.fn()} />
		);

		expect(screen.getByText("×")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Uninstall Cache" })
		).toBeInTheDocument();
	});

	it("trails the controls in the order the mock reads them", () => {
		render(
			<ConfigChip
				name="ESLint"
				badges={[
					{ label: "lint 32 KB", hint: "ESLint · lint", onPress: vi.fn() },
				]}
				upgrades={UPGRADES}
				info={INFO}
				onUninstall={vi.fn()}
			/>
		);

		expect(
			screen.getAllByRole("button").map((button) => button.ariaLabel)
		).toStrictEqual([
			"ESLint · lint",
			"Upgrade ESLint to v2 · 64 KB",
			"About ESLint",
			"Uninstall ESLint",
		]);
	});
});

describe("ConfigChip at a fixed width", () => {
	it("pins the chip so a column of them aligns on its controls", () => {
		const { container } = render(
			<ConfigChip name="Cache" badges={[...BADGES]} width="fixed" />
		);

		expect(container.firstChild).toHaveClass("w-82");
		expect(container.firstChild).not.toHaveClass("w-fit");
	});

	it("gives the slack to the identity, which is why a short name leaves a gap", () => {
		render(<ConfigChip name=".ts" badges={[...BADGES]} width="fixed" />);

		expect(screen.getByText(".ts").parentElement).toHaveClass("flex-1");
	});

	it("truncates a name too long for the column rather than growing the chip", () => {
		render(
			<ConfigChip name="Code Coverage" badges={[...BADGES]} width="fixed" />
		);

		expect(screen.getByText("Code Coverage")).toHaveClass("truncate");
	});

	it("leaves the default chip content-width", () => {
		const { container } = render(
			<ConfigChip name="Code Coverage" badges={[...BADGES]} />
		);

		expect(container.firstChild).toHaveClass("w-fit");
		expect(container.firstChild).not.toHaveClass("w-82", "w-full");
	});

	it("hands the wrapper the width, so a panel cannot free the chip to grow", () => {
		const { container } = render(
			<ConfigChip
				name="Unit Tests"
				badges={[...BADGES]}
				width="full"
				info={INFO}
			/>
		);

		expect(container.firstChild).toHaveClass("w-full");
		expect(container.firstChild).not.toHaveClass("w-fit");
	});

	it("caps a content-width chip at its container so it cannot overhang", () => {
		const { container } = render(
			<ConfigChip name="Code Coverage" badges={[...BADGES]} info={INFO} />
		);

		expect(container.firstChild).toHaveClass("w-fit", "max-w-full");
	});

	it.each(["fit", "fixed", "full"] as const)(
		"truncates the name rather than overhanging at width %s",
		(width) => {
			render(
				<ConfigChip name="Code Coverage" badges={[...BADGES]} width={width} />
			);

			const name = screen.getByText("Code Coverage");

			expect(name).toHaveClass("truncate");
			expect(name.parentElement).toHaveClass("min-w-0");
		}
	);
});

describe("ConfigChip when locked withholds the new affordances", () => {
	it("withholds the weight, which would leak how big the config is", () => {
		const { container } = render(<ConfigChip locked />);

		expect(container.querySelector(".badge-theme")).toBeNull();
	});

	it("offers neither an upgrade nor an uninstall", () => {
		render(<ConfigChip locked />);

		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});
});

describe("ConfigChip's credit", () => {
	const CHIP = { name: "Cache", slots: 4, badges: [...BADGES] };

	it("marks a chip that paid into the answer just submitted", () => {
		const { container } = render(<ConfigChip {...CHIP} credited />);

		expect(container.firstChild).toHaveAttribute("data-credited", "true");
	});

	it("leaves the attribute off entirely when the chip paid nothing", () => {
		const { container } = render(<ConfigChip {...CHIP} />);

		expect(container.firstChild).not.toHaveAttribute("data-credited");
	});

	it("carries the credit as an attribute, so no class changes and nothing reflows", () => {
		const { container: paid } = render(<ConfigChip {...CHIP} credited />);
		const { container: unpaid } = render(<ConfigChip {...CHIP} />);

		const classesOf = (node: ChildNode | null) =>
			Array.from((node as HTMLElement).classList).sort();

		expect(classesOf(paid.firstChild)).toEqual(classesOf(unpaid.firstChild));
	});
});

describe("ConfigChip's highlight", () => {
	const CHIP = { name: "Cache", slots: 4, badges: [...BADGES] };

	it("lights its edge in the screen's own colour, not the faintest rung", () => {
		const { container } = render(<ConfigChip {...CHIP} highlighted />);

		expect(container.firstChild).toHaveClass("border-theme");
		expect(container.firstChild).not.toHaveClass("border-theme-faint");
	});

	it("never carries both edge colours at once", () => {
		const { container } = render(<ConfigChip {...CHIP} />);

		expect(container.firstChild).toHaveClass("border-theme-faint");
		expect(container.firstChild).not.toHaveClass("border-theme");
	});

	it("keeps its geometry identical lit or unlit, so nothing reflows", () => {
		const { container: lit } = render(<ConfigChip {...CHIP} highlighted />);
		const { container: unlit } = render(<ConfigChip {...CHIP} />);

		const geometryOf = (node: ChildNode | null) =>
			Array.from((node as HTMLElement).classList)
				.filter((name) => !name.startsWith("border-theme"))
				.sort();

		expect(geometryOf(lit.firstChild)).toEqual(geometryOf(unlit.firstChild));
	});

	it("reports a hover, so the track can name the room the chip takes", async () => {
		const onHover = vi.fn();
		render(<ConfigChip {...CHIP} onHover={onHover} />);

		await userEvent.hover(screen.getByText("Cache"));

		expect(onHover).toHaveBeenCalledTimes(1);
	});

	it("reports the pointer leaving, so the highlight does not stick", async () => {
		const onLeave = vi.fn();
		render(<ConfigChip {...CHIP} onLeave={onLeave} />);

		await userEvent.hover(screen.getByText("Cache"));
		await userEvent.unhover(screen.getByText("Cache"));

		expect(onLeave).toHaveBeenCalledTimes(1);
	});

	it("hovers on the chip itself rather than through a wrapper", async () => {
		const onHover = vi.fn();
		const { container } = render(
			<ConfigChip
				{...CHIP}
				info={{
					name: "Cache",
					description: "Warms answers.",
					slots: 4,
					sellPrice: "64 KB",
				}}
				onHover={onHover}
			/>
		);

		const chip = tintedChip(container);
		expect(chip).not.toBe(container.firstChild);

		await userEvent.hover(chip!);

		expect(onHover).toHaveBeenCalledTimes(1);
	});

	it("takes a card with a verb where an offer would show a price", async () => {
		const onPress = vi.fn();
		render(<ConfigChip name=".js" badges={[]} install={{ onPress }} />);

		await userEvent.click(screen.getByRole("button", { name: "Install .js" }));

		expect(onPress).toHaveBeenCalledOnce();
	});

	it("reads the install press as the one that commits", () => {
		render(
			<ConfigChip name=".js" badges={[]} install={{ onPress: vi.fn() }} />
		);

		expect(
			screen.getByRole("button", { name: "Install .js" })
		).not.toHaveAttribute("data-screen-theme");
	});

	it("refuses an install the build has no room for", async () => {
		const onPress = vi.fn();
		render(
			<ConfigChip
				name="Cold Start"
				badges={[]}
				install={{ onPress, disabled: true }}
			/>
		);

		const press = screen.getByRole("button", { name: "Install Cold Start" });
		await userEvent.click(press);

		expect(press).toBeDisabled();
		expect(onPress).not.toHaveBeenCalled();
	});

	it("shows no install press on a chip that is not being offered", () => {
		render(<ConfigChip name=".js" badges={[]} />);

		expect(
			screen.queryByRole("button", { name: "Install .js" })
		).not.toBeInTheDocument();
	});

	describe("carrying why the row exists", () => {
		it("states the provenance inside the chip, beside the name", () => {
			render(
				<ConfigChip
					name="Telemetry"
					slots={2}
					version={2}
					detail="earned: peeked the community split 5 times"
					badges={[{ label: "unlocked", color: "viridian" }]}
					width="full"
				/>
			);

			const detail = screen.getByText(
				"earned: peeked the community split 5 times"
			);

			expect(detail).toHaveClass("text-theme-muted");
			expect(detail.parentElement).toContainElement(
				screen.getByText("Telemetry")
			);
		});

		it("gives the name the room and lets the provenance truncate first", () => {
			render(
				<ConfigChip
					name="Telemetry"
					detail="earned: peeked the community split 5 times"
					badges={[]}
					width="full"
				/>
			);

			expect(
				screen.getByText("earned: peeked the community split 5 times")
			).toHaveClass("flex-1", "truncate");
		});

		it("draws nothing extra when no provenance was given", () => {
			render(<ConfigChip name="Telemetry" badges={[]} />);

			expect(
				screen.getByText("Telemetry").parentElement?.childElementCount
			).toBe(1);
		});
	});
});
