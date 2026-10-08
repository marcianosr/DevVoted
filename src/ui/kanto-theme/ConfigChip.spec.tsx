import { readFileSync } from "node:fs";

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ConfigChip } from "./ConfigChip.ui";
import { REDACTED } from "./Redaction.ui";
import type { UpgradesProps } from "./Upgrades.ui";

const appCss = readFileSync("src/styles/app.css", "utf8");

const BADGES = [{ label: "×2", color: "viridian" }] as const;

const noop = () => {};

const INFO = {
	description: "Coverage climbs with every correct answer in a row.",
	slots: 2,
	sellPrice: "32 KB",
	version: 1,
	maxVersion: 5,
} as const;

const cardOf = (name: string) =>
	document.querySelector<HTMLElement>(`[data-config="${name}"]`);

const panelOf = (container: HTMLElement) =>
	container.querySelector(".sm\\:absolute");

const tintOf = (node: Element | null) =>
	Array.from(node?.classList ?? []).find((name) =>
		name.startsWith("bg-theme/")
	);

const tintedChip = (container: HTMLElement) =>
	Array.from(container.querySelectorAll("span, div")).find(
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

const SEEN = { ignore: "script, style, [inert] *" };

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

	it("leaves the fold press unboxed, so the head reads as a row not a toolbar", () => {
		render(
			<ConfigChip
				name="Cache"
				badges={[...BADGES]}
				info={INFO}
				onToggleInfo={noop}
			/>
		);

		const fold = screen.getByRole("button", { name: "Expand Cache" });
		expect(fold).toHaveClass("ring-transparent");
		expect(fold).not.toHaveClass("ring-theme-faint");
	});

	it("fills no box when the fold is open, having no box to fill", () => {
		render(
			<ConfigChip
				name="Cache"
				badges={[...BADGES]}
				info={INFO}
				infoOpen
				onToggleInfo={noop}
			/>
		);

		expect(
			screen.getByRole("button", { name: "Collapse Cache" })
		).not.toHaveClass("bg-theme");
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

	it("offers no chevron to a config with no facts to disclose", () => {
		render(<ConfigChip name="Cache" badges={[...BADGES]} />);

		expect(
			screen.queryByRole("button", { name: /Expand|Collapse/ })
		).not.toBeInTheDocument();
	});

	it("offers a chevron once there are facts to disclose", () => {
		render(
			<ConfigChip
				name="Cache"
				badges={[...BADGES]}
				info={INFO}
				onToggleInfo={noop}
			/>
		);

		expect(
			screen.getByRole("button", { name: "Expand Cache" })
		).toBeInTheDocument();
	});

	it("reports itself collapsed, and names the press for what it will do", () => {
		render(
			<ConfigChip
				name="Cache"
				badges={[...BADGES]}
				info={INFO}
				onToggleInfo={noop}
			/>
		);

		expect(
			screen.getByRole("button", { name: "Expand Cache" })
		).toHaveAttribute("aria-expanded", "false");
	});

	it("reports itself expanded, and names the press for what it will do", () => {
		render(
			<ConfigChip
				name="Cache"
				badges={[...BADGES]}
				info={INFO}
				infoOpen
				onToggleInfo={noop}
			/>
		);

		expect(
			screen.getByRole("button", { name: "Collapse Cache" })
		).toHaveAttribute("aria-expanded", "true");
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

		await userEvent.click(screen.getByRole("button", { name: "Expand Cache" }));

		expect(onToggleInfo).toHaveBeenCalledOnce();
	});

	it("summarises the effect on one truncated line while folded", () => {
		render(
			<ConfigChip
				name="Cache"
				badges={[...BADGES]}
				info={INFO}
				onToggleInfo={noop}
			/>
		);

		expect(
			screen.getByText(INFO.description, SEEN).closest(".truncate")
		).toHaveClass("truncate", "w-0", "min-w-full");
	});

	it("rules the action row off from the card body when it carries a press", () => {
		render(
			<ConfigChip
				name="Cache"
				badges={[...BADGES]}
				info={INFO}
				infoOpen
				onToggleInfo={noop}
				onUninstall={noop}
			/>
		);

		expect(
			screen.getByRole("button", { name: /Uninstall/ }).closest(".ml-auto")
				?.parentElement
		).toHaveClass("border-t");
	});

	it("badges the figures of the folded summary too", () => {
		render(
			<ConfigChip
				name="Cache"
				badges={[...BADGES]}
				info={{ ...INFO, description: "+8KB storage per correct answer." }}
				onToggleInfo={noop}
			/>
		);

		expect(screen.getByText("+8KB", SEEN).closest(".truncate")).not.toBeNull();
	});

	it("stops peeking once expanded, stating the effect only once", () => {
		render(
			<ConfigChip
				name="Cache"
				badges={[...BADGES]}
				info={INFO}
				infoOpen
				onToggleInfo={noop}
			/>
		);

		expect(screen.getAllByText(INFO.description)).toHaveLength(1);
		expect(screen.getByText(INFO.description)).not.toHaveClass("truncate");
	});

	it("keeps the version and the price in the folded row, the badges in the fold", () => {
		render(
			<ConfigChip
				name="Cache"
				badges={[{ label: "+8 KB", color: "viridian" }]}
				info={{ ...INFO, version: 2 }}
				onToggleInfo={noop}
				install={{ price: "32 KB", onPress: noop }}
			/>
		);

		expect(screen.getByText("v2", SEEN)).toBeInTheDocument();
		expect(screen.getByText("32 KB", SEEN)).toBeInTheDocument();
		expect(screen.queryByText("+8 KB", SEEN)).toBeNull();
	});

	it("states itself where no panel wired a fold, rather than hiding behind one", () => {
		render(<ConfigChip name="Cache" badges={[...BADGES]} info={INFO} />);

		expect(screen.getByText(INFO.description)).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /Cache/ })).toBeNull();
	});

	it("states them once expanded", () => {
		render(
			<ConfigChip
				name="Cache"
				badges={[...BADGES]}
				info={INFO}
				infoOpen
				onToggleInfo={noop}
			/>
		);

		expect(screen.getByText(INFO.description)).toBeInTheDocument();
		expect(screen.getByText("uninstalls for")).toBeInTheDocument();
		expect(screen.getByText(INFO.sellPrice)).toBeInTheDocument();
	});

	it("names the config whether it is collapsed or expanded", () => {
		const { rerender } = render(
			<ConfigChip
				name="Cache"
				badges={[...BADGES]}
				info={INFO}
				onToggleInfo={noop}
			/>
		);
		expect(screen.getByText("Cache")).toBeInTheDocument();

		rerender(
			<ConfigChip
				name="Cache"
				badges={[...BADGES]}
				info={INFO}
				infoOpen
				onToggleInfo={noop}
			/>
		);
		expect(screen.getByText("Cache")).toBeInTheDocument();
	});

	it("discloses in place rather than over the card, so a phone can reach it", () => {
		const { container } = render(
			<ConfigChip
				name="Cache"
				badges={[...BADGES]}
				info={INFO}
				infoOpen
				onToggleInfo={noop}
			/>
		);

		expect(panelOf(container)).toBeNull();
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
				onToggleInfo={noop}
			/>
		);

		expect(
			screen.getByRole("button", { name: "Expand Intellisense" })
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

		expect(screen.getByText("4")).toHaveClass("badge-theme", "w-9");
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

		expect(screen.queryByText("v1 of 5")).not.toBeInTheDocument();
	});

	it("keeps stating the effect while the upgrade panel is open over it", () => {
		render(
			<ConfigChip
				name="Cache"
				badges={[...BADGES]}
				info={INFO}
				infoOpen
				upgrades={UPGRADES}
				upgradesOpen
			/>
		);

		expect(screen.getByText(INFO.description)).toBeInTheDocument();
	});

	it("floats nothing once the upgrade panel shuts, the card stating its own facts", () => {
		const { container } = render(
			<ConfigChip
				name="Cache"
				badges={[...BADGES]}
				info={INFO}
				infoOpen
				upgrades={UPGRADES}
			/>
		);

		expect(panelOf(container)).toBeNull();
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

	it("names the config it would remove, since the press says only the verb", () => {
		render(
			<ConfigChip name="Cache" badges={[...BADGES]} onUninstall={vi.fn()} />
		);

		expect(
			screen.getByRole("button", { name: "Uninstall Cache" })
		).toBeInTheDocument();
	});

	it("states the storage it hands back on the press itself", () => {
		render(
			<ConfigChip
				name="Cache"
				badges={[...BADGES]}
				info={INFO}
				infoOpen
				onToggleInfo={noop}
				onUninstall={vi.fn()}
			/>
		);

		expect(
			screen.getByRole("button", { name: "Uninstall Cache · +32 KB" })
		).toHaveTextContent(`+${INFO.sellPrice}`);
	});

	it("leaves the refund off the footer once the press is quoting it", () => {
		render(
			<ConfigChip
				name="Cache"
				badges={[...BADGES]}
				info={INFO}
				infoOpen
				onToggleInfo={noop}
				onUninstall={vi.fn()}
			/>
		);

		expect(screen.queryByText("uninstalls for")).not.toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /^Uninstall Cache/ })
		).toHaveTextContent(`+${INFO.sellPrice}`);
	});

	it("reads the head's controls, then uninstall before upgrade at the foot", () => {
		render(
			<ConfigChip
				name="ESLint"
				badges={[
					{ label: "lint 32 KB", hint: "ESLint · lint", onPress: vi.fn() },
				]}
				upgrades={UPGRADES}
				info={INFO}
				infoOpen
				onToggleInfo={noop}
				onUninstall={vi.fn()}
			/>
		);

		expect(
			screen.getAllByRole("button").map((button) => button.ariaLabel)
		).toStrictEqual([
			"Collapse ESLint",
			"ESLint · lint",
			"Uninstall ESLint · +32 KB",
			"Upgrade ESLint to v2 · 64 KB",
		]);
	});
});

describe("ConfigChip's width", () => {
	it("fills the cell it is given, the row deciding the column rather than the card", () => {
		const { container } = render(
			<ConfigChip
				name="Cache"
				badges={[...BADGES]}
				info={INFO}
				onToggleInfo={noop}
			/>
		);

		expect(cardOf("Cache")).toHaveClass("w-full");
		expect(container.querySelector(".w-82")).toBeNull();
	});

	it("keeps a config with no facts content-width, so a rival's build reads as a row", () => {
		render(<ConfigChip name="Code Coverage" badges={[...BADGES]} />);

		expect(cardOf("Code Coverage")).toHaveClass("w-fit", "max-w-full");
	});

	it("leaves the name its own content as a floor, taking no min-w-0", () => {
		render(
			<ConfigChip
				name="Code Coverage"
				badges={[...BADGES]}
				info={INFO}
				onToggleInfo={noop}
			/>
		);

		const name = screen.getByText("Code Coverage");
		const seat = name.parentElement;

		expect(name).toHaveClass("break-words");
		expect(seat).toHaveClass("flex-1");
		expect(name).not.toHaveClass("min-w-0");
		expect(seat).not.toHaveClass("min-w-0");
	});

	it("seats the uninstall press in its own row under the card, sized to its label and aligned right", () => {
		render(
			<ConfigChip
				name="Code Coverage"
				badges={[...BADGES]}
				info={INFO}
				infoOpen
				onToggleInfo={noop}
				onUninstall={noop}
			/>
		);

		const row = screen.getByText("Code Coverage").parentElement;
		const uninstall = screen.getByRole("button", { name: /^Uninstall/ });

		expect(row).toHaveClass("flex-wrap");
		expect(row).not.toContainElement(uninstall);
		expect(uninstall).not.toHaveClass("w-full");
		expect(uninstall.parentElement).toHaveClass("justify-end");
	});

	it("seats a badge in the meta row at the foot, where it cannot squeeze the name", () => {
		render(
			<ConfigChip
				name="Code Coverage"
				badges={[{ label: "JavaScript or TypeScript only", color: "pewter" }]}
				info={INFO}
				infoOpen
				onToggleInfo={noop}
			/>
		);

		const badge = screen.getByText("JavaScript or TypeScript only", SEEN);
		const row = screen.getByText("Code Coverage").parentElement;

		expect(row).not.toContainElement(badge);
		expect(row?.compareDocumentPosition(badge) ?? 0).toBe(
			Node.DOCUMENT_POSITION_FOLLOWING
		);
	});
});

describe("ConfigChip when locked withholds the new affordances", () => {
	it("withholds the weight it was never given, rather than guessing one", () => {
		const { container } = render(<ConfigChip locked />);

		expect(container.querySelector(".badge-theme")).toBeNull();
	});

	it("offers neither an upgrade nor an uninstall", () => {
		render(<ConfigChip locked />);

		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});
});

describe("ConfigChip when locked but told the way in", () => {
	const PATHS = [
		{
			text: "Answer 10 HTML polls correctly",
			progress: { count: 4, target: 10 },
		},
		{ text: "Answer 25 polls", progress: { count: 43, target: 25 } },
	];

	const rulesIn = (container: HTMLElement) =>
		container.querySelectorAll(".border-t");

	it("states a weight it is handed, a list grouped by weight having named it already", () => {
		render(<ConfigChip locked slots={2} unlock={PATHS} />);

		expect(screen.getByText("2")).toBeVisible();
	});

	it("withholds the name all the same, which is the secret", () => {
		render(<ConfigChip locked slots={2} unlock={PATHS} />);

		expect(screen.getByText(REDACTED)).toBeVisible();
	});

	it("wears a dashed edge, an empty socket play already underway can fill", () => {
		const { container } = render(
			<ConfigChip locked slots={2} unlock={PATHS} />
		);

		expect(container.firstElementChild).toHaveClass("border-dashed");
	});

	it("leaves a blackout's edge solid, no path being live to fill it", () => {
		const { container } = render(<ConfigChip locked />);

		expect(container.firstElementChild).not.toHaveClass("border-dashed");
	});

	it("withholds the paths while collapsed", () => {
		render(<ConfigChip locked slots={2} unlock={PATHS} onToggleInfo={noop} />);

		expect(screen.queryByText(/^unlock · /)).not.toBeInTheDocument();
	});

	it("states the paths in place once opened, rather than over the card", () => {
		render(
			<ConfigChip
				locked
				slots={2}
				unlock={PATHS}
				infoOpen
				onToggleInfo={noop}
			/>
		);

		expect(screen.getByText("4/10").parentElement).toHaveTextContent(
			"unlock · Answer 10 HTML polls correctly"
		);
	});

	it("names the press for the state it opens, never for the config", () => {
		render(<ConfigChip locked slots={2} unlock={PATHS} onToggleInfo={noop} />);

		expect(
			screen.getByRole("button", { name: "Expand Locked config" })
		).toBeVisible();
	});

	it("closes under the paths, having no version and nothing to sell", () => {
		const { container } = render(
			<ConfigChip
				locked
				slots={2}
				unlock={PATHS}
				infoOpen
				onToggleInfo={noop}
			/>
		);

		expect(rulesIn(container)).toHaveLength(1);
	});
});

describe("ConfigChip's footer", () => {
	const FACTS = { description: "Rerolls the shelf.", slots: 1 };

	const cardWith = (info: typeof FACTS & { version?: number }) =>
		render(
			<ConfigChip
				name="Hot Reload"
				badges={[]}
				slots={1}
				info={info}
				infoOpen
				onToggleInfo={noop}
			/>
		);

	it("draws no footer for a card with no version, no price and no badge", () => {
		cardWith(FACTS);

		expect(screen.queryByText(/^v\d/)).toBeNull();
	});

	it("draws one as soon as there is a version to name", () => {
		cardWith({ ...FACTS, version: 2 });

		expect(screen.getByText("v2", SEEN)).toBeInTheDocument();
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

	it("hovers on the chip itself rather than through the sheet's wrapper", async () => {
		const onHover = vi.fn();
		const { container } = render(
			<ConfigChip
				{...CHIP}
				upgrades={UPGRADES}
				upgradesOpen
				onHover={onHover}
			/>
		);

		const card = tintedChip(container);
		expect(card).not.toBe(container.firstChild);

		await userEvent.hover(card!);

		expect(onHover).toHaveBeenCalledTimes(1);
	});

	it("takes a card with a verb where an offer would show a price", async () => {
		const onPress = vi.fn();
		render(<ConfigChip name=".js" badges={[]} install={{ onPress }} />);

		await userEvent.click(screen.getByRole("button", { name: "Install .js" }));

		expect(onPress).toHaveBeenCalledOnce();
	});

	it("keeps the install press quiet and puts the theme on the price", () => {
		render(
			<ConfigChip
				name=".js"
				badges={[]}
				install={{ onPress: vi.fn(), price: "32 KB" }}
			/>
		);

		const install = screen.getByRole("button", {
			name: "Install .js \u00b7 32 KB",
		});

		expect(install).not.toHaveAttribute("data-screen-theme");
		expect(screen.getByText("32 KB")).toHaveClass("badge-theme");
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

describe("a chip naming which of its prices is pointed at", () => {
	const CHIP = { name: "Cache", slots: 4, badges: [] };

	it("names the install press, so the header can price the draft", async () => {
		const onQuote = vi.fn();
		render(
			<ConfigChip
				{...CHIP}
				install={{ onPress: vi.fn(), price: "64 KB" }}
				onQuote={onQuote}
			/>
		);

		await userEvent.hover(
			screen.getByRole("button", { name: "Install Cache · 64 KB" })
		);

		expect(onQuote).toHaveBeenCalledWith("install");
	});

	it("names the uninstall press, which pays rather than charges", async () => {
		const onQuote = vi.fn();
		render(
			<ConfigChip
				{...CHIP}
				info={INFO}
				onUninstall={vi.fn()}
				onQuote={onQuote}
			/>
		);

		await userEvent.hover(
			screen.getByRole("button", { name: /^Uninstall Cache/ })
		);

		expect(onQuote).toHaveBeenCalledWith("uninstall");
	});

	it("names the upgrade press, so a card carrying two prices cannot confuse them", async () => {
		const onQuote = vi.fn();
		render(
			<ConfigChip
				{...CHIP}
				info={INFO}
				upgrades={UPGRADES}
				onUninstall={vi.fn()}
				onToggleUpgrades={vi.fn()}
				onQuote={onQuote}
			/>
		);

		await userEvent.hover(
			screen.getByRole("button", { name: /^Upgrade Cache to v2/ })
		);

		expect(onQuote).toHaveBeenCalledWith("upgrade");
	});

	it("names nothing once the pointer leaves the price", async () => {
		const onQuote = vi.fn();
		render(
			<ConfigChip
				{...CHIP}
				install={{ onPress: vi.fn(), price: "64 KB" }}
				onQuote={onQuote}
			/>
		);

		const press = screen.getByRole("button", { name: "Install Cache · 64 KB" });
		await userEvent.hover(press);
		await userEvent.unhover(press);

		expect(onQuote).toHaveBeenLastCalledWith();
	});

	it("leaves the card's own hover alone, which the weight track still needs", async () => {
		const onHover = vi.fn();
		const onQuote = vi.fn();
		render(
			<ConfigChip
				{...CHIP}
				install={{ onPress: vi.fn(), price: "64 KB" }}
				onHover={onHover}
				onQuote={onQuote}
			/>
		);

		await userEvent.hover(screen.getByText("Cache"));

		expect(onHover).toHaveBeenCalledTimes(1);
		expect(onQuote).not.toHaveBeenCalled();
	});
});

describe("ConfigChip's card presses and fold", () => {
	it("installs through a primary press naming the price, sized to its label", () => {
		render(
			<ConfigChip
				name="IndexedDB"
				badges={[]}
				info={INFO}
				infoOpen
				onToggleInfo={noop}
				install={{ price: "32 KB", onPress: noop }}
			/>
		);

		const install = screen.getByRole("button", {
			name: "Install IndexedDB · 32 KB",
		});

		expect(install).toHaveTextContent("Install · 32 KB");
		expect(install).toHaveClass("press-sheen", "segment-theme", "h-8");
		expect(install).not.toHaveClass("w-full");
	});

	it("folds the press away with the description, like the mock's row", () => {
		const { container } = render(
			<ConfigChip
				name="IndexedDB"
				badges={[]}
				info={INFO}
				onToggleInfo={noop}
				install={{ price: "32 KB", onPress: noop }}
			/>
		);

		expect(screen.queryByRole("button", { name: /^Install/ })).toBeNull();
		expect(container.querySelector(".config-fold")).toHaveTextContent(
			"Install · 32 KB"
		);
	});

	it("names the refund in the folded row of an installed config", () => {
		render(
			<ConfigChip
				name=".js"
				badges={[]}
				info={{ ...INFO, sellPrice: "16 KB" }}
				onToggleInfo={noop}
				onUninstall={noop}
			/>
		);

		expect(screen.getByText("+16 KB", SEEN)).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
	});

	it("greys out an offer the player cannot afford, its press disabled", () => {
		const { container } = render(
			<ConfigChip
				name="IndexedDB"
				badges={[]}
				info={INFO}
				infoOpen
				onToggleInfo={noop}
				skipped
				install={{ price: "32 KB", onPress: noop, disabled: true }}
			/>
		);

		expect(container.querySelector("[data-config]")).toHaveClass(
			"opacity-60",
			"grayscale"
		);
		expect(screen.getByRole("button", { name: /^Install/ })).toBeDisabled();
	});

	it("uninstalls through a red press that names the refund in its own dark text", () => {
		render(
			<ConfigChip
				name=".css"
				badges={[]}
				info={{ ...INFO, sellPrice: "16 KB" }}
				infoOpen
				onToggleInfo={noop}
				onUninstall={noop}
			/>
		);

		const uninstall = screen.getByRole("button", { name: /^Uninstall .css/ });

		expect(uninstall).toHaveTextContent(/^Uninstall · \+16 KB$/);
		expect(uninstall.querySelector("[data-screen-theme]")).toBeNull();
		expect(uninstall).toHaveAttribute("data-screen-theme", "cinnabar");
		expect(uninstall).not.toHaveClass("press-sheen");
	});

	it("holds a folded card's details in an inert, hidden fold it can animate open", () => {
		const { container, rerender } = render(
			<ConfigChip name="Cache" badges={[]} info={INFO} onToggleInfo={noop} />
		);

		const fold = container.querySelector(".config-fold");

		expect(fold).toHaveAttribute("inert");
		expect(fold).toHaveAttribute("aria-hidden", "true");
		expect(fold).not.toHaveAttribute("data-open");

		rerender(
			<ConfigChip
				name="Cache"
				badges={[]}
				info={INFO}
				infoOpen
				onToggleInfo={noop}
			/>
		);

		expect(fold).not.toHaveAttribute("inert");
		expect(fold).toHaveAttribute("data-open", "true");
	});

	it("seats the install press in a folded card's head when asked to", async () => {
		const onPress = vi.fn();
		render(
			<ConfigChip
				name="Cache"
				badges={[]}
				info={INFO}
				onToggleInfo={noop}
				install={{ onPress }}
				installWhenFolded
			/>
		);

		await userEvent.click(screen.getByRole("button", { name: /^Install/ }));

		expect(onPress).toHaveBeenCalledOnce();
	});

	it("keeps the install press in the fold of a folded card by default", () => {
		render(
			<ConfigChip
				name="Cache"
				badges={[]}
				info={INFO}
				onToggleInfo={noop}
				install={{ onPress: noop }}
			/>
		);

		expect(screen.queryByRole("button", { name: /^Install/ })).toBeNull();
	});

	it("moves the install press back into the fold once the card is open", () => {
		render(
			<ConfigChip
				name="Cache"
				badges={[]}
				info={INFO}
				infoOpen
				onToggleInfo={noop}
				install={{ onPress: noop }}
				installWhenFolded
			/>
		);

		expect(screen.getAllByRole("button", { name: /^Install/ })).toHaveLength(1);
	});

	it("upgrades through a prismatic press beside uninstall", () => {
		render(
			<ConfigChip
				name=".css"
				badges={[]}
				info={INFO}
				infoOpen
				onToggleInfo={noop}
				upgrades={UPGRADES}
				onToggleUpgrades={noop}
				onUninstall={noop}
			/>
		);

		const uninstall = screen.getByRole("button", { name: /^Uninstall/ });
		const upgrade = screen.getByRole("button", { name: /^Upgrade .css/ });

		expect(upgrade).toHaveClass("press-prismatic");
		expect(upgrade).not.toHaveClass("w-full");
		expect(upgrade).toHaveTextContent(/^↑ v2 · /);
		expect(upgrade.parentElement).toBe(uninstall.parentElement);
	});

	it("pads a folded row as much below as above, and tightens it once open", () => {
		const { rerender } = render(
			<ConfigChip name=".js" badges={[]} info={INFO} onToggleInfo={noop} />
		);
		const head = () =>
			screen
				.getByRole("button", { name: /(Expand|Collapse) \.js/ })
				.closest(".pt-3");

		expect(head()).toHaveClass("pb-3");

		rerender(
			<ConfigChip
				name=".js"
				badges={[]}
				info={INFO}
				infoOpen
				onToggleInfo={noop}
			/>
		);
		expect(head()).toHaveClass("pb-1");
	});

	it("seats the meta and the presses on one line at the foot", () => {
		render(
			<ConfigChip
				name="IndexedDB"
				badges={[]}
				info={{ ...INFO, sellPrice: "16 KB" }}
				infoOpen
				onToggleInfo={noop}
				install={{ price: "32 KB", onPress: noop }}
			/>
		);

		const meta = screen.getByText("uninstalls for", SEEN);
		const install = screen.getByRole("button", { name: /^Install/ });
		const row = install.parentElement?.parentElement;

		expect(row).toHaveClass("flex-wrap", "items-center");
		expect(row).toContainElement(meta);
	});
});

describe("ConfigChip's armed install", () => {
	const SCALE = { from: 4, to: 12, perGateKb: 64 };
	const armedCard = (onCancel = vi.fn(), infoOpen = true) =>
		render(
			<ConfigChip
				name="AGENTS.md"
				badges={[...BADGES]}
				info={INFO}
				infoOpen={infoOpen}
				onToggleInfo={noop}
				install={{
					price: "256 KB",
					onPress: noop,
					scale: SCALE,
					armed: true,
					onCancel,
				}}
			/>
		);

	it("states inside the card that the build does not fit, and what it costs", () => {
		armedCard();

		const card = cardOf("AGENTS.md");
		expect(card).toHaveTextContent("Doesn't fit.");
		expect(card).toHaveTextContent("pay now−256 KB");
		expect(card).toHaveTextContent("upkeep−64 KBevery gate");
		expect(card).toHaveClass("border-saffron");
	});

	it("installs from a saffron press that still names the confirmation", () => {
		armedCard();

		const press = screen.getByRole("button", {
			name: /Confirm installing AGENTS.md/,
		});
		expect(press).toHaveTextContent("Install · 256 KB");
		expect(press).toHaveClass("press-raised");
		expect(press.closest("[data-screen-theme]")).toHaveAttribute(
			"data-screen-theme",
			"saffron"
		);
	});

	it("disarms through cancel", async () => {
		const onCancel = vi.fn();
		armedCard(onCancel);

		await userEvent.click(screen.getByRole("button", { name: "cancel" }));

		expect(onCancel).toHaveBeenCalledOnce();
	});

	it("replaces the foot, so nothing else is offered while it asks", () => {
		armedCard();

		expect(screen.queryByText("uninstalls for", SEEN)).not.toBeInTheDocument();
		expect(screen.getAllByRole("button", { name: /AGENTS.md/ })).toHaveLength(
			2
		);
	});

	it("keeps asking while the card is folded", () => {
		armedCard(vi.fn(), false);

		expect(screen.getByText("Doesn't fit.", SEEN)).toBeInTheDocument();
	});

	it("leaves a bare chip's warning in the sheet beside it", () => {
		const { container } = render(
			<ConfigChip
				name=".js"
				badges={[]}
				install={{ price: "32 KB", onPress: noop, scale: SCALE, armed: true }}
			/>
		);

		expect(panelOf(container)).toHaveTextContent("Doesn't fit.");
		expect(
			screen.getByRole("button", { name: /Confirm installing .js/ })
		).toHaveTextContent("Confirm");
	});

	it("keeps a bare chip's upgrade sheet at its start", () => {
		const { container } = render(
			<ConfigChip
				name="Cache"
				badges={[...BADGES]}
				upgrades={UPGRADES}
				upgradesOpen
			/>
		);

		expect(panelOf(container)).toHaveClass("sm:left-0");
	});
});

describe("ConfigChip's armed upgrade", () => {
	const REFUSED = {
		...UPGRADES,
		refusal: "32 KB short",
		rungs: UPGRADES.rungs.map((rung) =>
			rung.state === "offered" ? { ...rung, disabled: true } : rung
		),
	};
	const armedCard = ({
		onBuy = vi.fn(),
		onToggleUpgrades = vi.fn(),
		upgrades = UPGRADES,
		infoOpen = true,
	} = {}) =>
		render(
			<ConfigChip
				name="Cache"
				badges={[...BADGES]}
				info={INFO}
				infoOpen={infoOpen}
				onToggleInfo={noop}
				onUninstall={noop}
				upgrades={{
					...upgrades,
					changes: [{ from: "×1.25", to: "×1.5" }],
					onBuy,
				}}
				upgradesOpen
				onToggleUpgrades={onToggleUpgrades}
			/>
		);

	it("states inside the card what the upgrade changes and costs, rather than floating a sheet", () => {
		const { container } = armedCard();

		const card = cardOf("Cache");
		expect(card).toHaveTextContent("Upgrade to v2.");
		expect(card).toHaveTextContent("versionv1→v2");
		expect(card).toHaveTextContent("effect×1.25→×1.5");
		expect(card).toHaveTextContent("pay now−64 KB");
		expect(card).toHaveClass("border-saffron");
		expect(panelOf(container)).toBeNull();
	});

	it("upgrades from a prismatic press that names the confirmation", async () => {
		const onBuy = vi.fn();
		armedCard({ onBuy });

		const press = screen.getByRole("button", {
			name: "Confirm upgrading Cache to v2 · 64 KB",
		});
		expect(press).toHaveTextContent("Upgrade · 64 KB");
		expect(press).toHaveClass("press-prismatic");

		await userEvent.click(press);
		expect(onBuy).toHaveBeenCalledWith(2);
	});

	it("disarms through cancel", async () => {
		const onToggleUpgrades = vi.fn();
		armedCard({ onToggleUpgrades });

		await userEvent.click(screen.getByRole("button", { name: "cancel" }));

		expect(onToggleUpgrades).toHaveBeenCalledOnce();
	});

	it("replaces the foot, so uninstall is not offered while it asks", () => {
		armedCard();

		expect(
			screen.queryByRole("button", { name: /^Uninstall/ })
		).not.toBeInTheDocument();
	});

	it("keeps asking while the card is folded", () => {
		armedCard({ infoOpen: false });

		expect(screen.getByText("Upgrade to v2.", SEEN)).toBeInTheDocument();
	});

	it("states the refusal and holds the confirm press shut", () => {
		armedCard({ upgrades: REFUSED });

		expect(screen.getByText("32 KB short")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /^Confirm upgrading Cache/ })
		).toBeDisabled();
	});
});

describe("ConfigChip's upgrade-ready pennant", () => {
	const foldedCard = (
		props: {
			infoOpen?: boolean;
			upgrades?: UpgradesProps;
			upgradesOpen?: boolean;
		} = {}
	) =>
		render(
			<ConfigChip
				name="Cache"
				badges={[...BADGES]}
				info={INFO}
				onToggleInfo={noop}
				upgrades={UPGRADES}
				onToggleUpgrades={noop}
				{...props}
			/>
		);
	const readyBorderOf = (container: HTMLElement) =>
		[...container.querySelectorAll(".press-prismatic")].find(
			(element) => element.textContent === "v1"
		) ?? null;

	it("borders the folded row's pennant when an upgrade is on offer and payable", () => {
		const { container } = foldedCard();

		expect(readyBorderOf(container)).toHaveTextContent("v1");
	});

	it("drops the border once the card is open, the press itself being in view", () => {
		const { container } = foldedCard({ infoOpen: true });

		expect(readyBorderOf(container)).toBeNull();
	});

	it("stays still for an upgrade the player cannot take", () => {
		const { container } = foldedCard({
			upgrades: {
				...UPGRADES,
				rungs: UPGRADES.rungs.map((rung) =>
					rung.state === "offered" ? { ...rung, disabled: true } : rung
				),
			},
		});

		expect(readyBorderOf(container)).toBeNull();
	});

	it("stays still once every version is held", () => {
		const { container } = foldedCard({ upgrades: OWNED_OUT });

		expect(readyBorderOf(container)).toBeNull();
	});

	it("stays still while the upgrade is armed, the card already asking", () => {
		const { container } = foldedCard({ upgradesOpen: true });

		expect(readyBorderOf(container)).toBeNull();
	});
});
