import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Delta } from "../Delta.ui";
import {
	StartScreen,
	type DealtConfig,
	type StartScreenProps,
} from "./StartScreen.ui";

const dealt: readonly DealtConfig[] = [
	{
		id: "ts",
		label: ".ts",
		summary: "Common · focus: typescript",
		explainer: "TypeScript polls pay 1.25× coverage.",
		note: <Delta multiplier={1.25} />,
	},
	{
		id: "intellisense",
		label: "Intellisense",
		summary: "Rare · all coverage",
		explainer: "All coverage earns ×1.5.",
	},
	{
		id: "eslint",
		label: "ESLint",
		summary: "Common · JS/TS polls",
		explainer: "Strikes out one wrong answer per gate.",
	},
];

const props: StartScreenProps = {
	theme: "pallet",
	seed: "2026-08-23",
	archive: "1.2 MB",
	dealt,
	dealtFrom: 30,
	pickedIds: [],
	onToggle: () => {},
	slots: [
		{ id: "slot-1" },
		{ id: "slot-2" },
		{ id: "slot-3" },
		{ id: "slot-4", gate: 1 },
	],
	gateName: "Pallet",
	gateNumber: 0,
	gateCount: 12,
	pollCount: 5,
	coverageDemand: 3,
	auditCount: 0,
	stake: { removeOnMiss: 1, coveragePerWrong: -0.3 },
	reward: { coveragePerCorrect: 1, gateRewardKb: 32, slotOpens: 4 },
};

describe("StartScreen", () => {
	it("titles the screen by the job, not by the number of picks", () => {
		render(<StartScreen {...props} />);

		expect(screen.getByText("Configure your pipeline")).toBeInTheDocument();
		expect(screen.queryByText(/to go/)).not.toBeInTheDocument();
	});

	it("names the run by its seed and states what the archive holds", () => {
		render(<StartScreen {...props} />);

		expect(
			screen.getByRole("heading", { name: "New run" })
		).toBeInTheDocument();
		expect(screen.getByText("seed 2026-08-23")).toBeInTheDocument();
		expect(screen.getByText("1.2 MB")).toBeInTheDocument();
	});

	it("says how wide the draw was, so seven of thirty reads as a sample", () => {
		render(<StartScreen {...props} />);

		expect(screen.getByText(/3 dealt from 30/)).toBeInTheDocument();
	});

	it("counts the picks still owed on the button", () => {
		render(<StartScreen {...props} onStart={() => {}} />);

		expect(
			screen.getByRole("button", { name: "Pick 3 to start" })
		).toBeDisabled();
	});

	it("counts down as picks land", () => {
		render(
			<StartScreen {...props} pickedIds={["ts", "eslint"]} onStart={() => {}} />
		);

		expect(
			screen.getByRole("button", { name: "Pick 1 to start" })
		).toBeInTheDocument();
	});

	it("turns the button live once the last pick lands", () => {
		render(
			<StartScreen
				{...props}
				pickedIds={["ts", "intellisense", "eslint"]}
				onStart={() => {}}
			/>
		);

		expect(
			screen.getByRole("button", { name: "Start the run →" })
		).toBeEnabled();
	});

	it("stretches the start button across its column", () => {
		render(<StartScreen {...props} onStart={() => {}} />);

		expect(screen.getByRole("button", { name: /to start/ })).toHaveClass(
			"w-full"
		);
	});

	it("reports which config was ticked", async () => {
		const onToggle = vi.fn();
		render(<StartScreen {...props} onToggle={onToggle} />);

		await userEvent.click(screen.getByText("Intellisense"));

		expect(onToggle).toHaveBeenCalledWith("intellisense");
	});

	it("ticks a draft without striking it, since picking is not a sentence", () => {
		render(<StartScreen {...props} pickedIds={["ts"]} />);

		// Twice over: once on the deal, once in the pipeline it just filled.
		screen
			.getAllByText(".ts")
			.forEach((node) => expect(node).not.toHaveClass("line-through"));
	});

	it("keeps the line to the name, its rarity and its figure", () => {
		render(<StartScreen {...props} />);

		expect(screen.getByText("×1.25")).toBeInTheDocument();
		expect(screen.getAllByText("common").length).toBeGreaterThan(0);
	});

	it("folds the rarity and the full sentence under each config", () => {
		const { container } = render(<StartScreen {...props} />);
		const row = Array.from(
			container.querySelectorAll('details[class~="group/row"]')
		).find((node) =>
			node.textContent?.includes("TypeScript polls pay 1.25× coverage.")
		);

		expect(row).not.toHaveAttribute("open");
		expect(screen.getByText("Common · focus: typescript")).toBeInTheDocument();
	});

	it("ticks a config without folding it, and folds without ticking", async () => {
		const onToggle = vi.fn();
		const { container } = render(
			<StartScreen {...props} onToggle={onToggle} />
		);
		const row = Array.from(
			container.querySelectorAll('details[class~="group/row"]')
		).find((node) =>
			node.textContent?.includes("TypeScript polls pay 1.25× coverage.")
		) as HTMLDetailsElement;

		await userEvent.click(screen.getByText(".ts"));

		expect(onToggle).toHaveBeenCalledWith("ts");
		expect(row.open).toBe(false);
	});

	// The card sells a playstyle, not a bill of materials: the deal underneath is
	// where a config gets read, and listing three of them made the card the
	// tallest thing on the screen.
	it("sells a combo on its name and its playstyle, never on its contents", () => {
		render(
			<StartScreen
				{...props}
				combos={[
					{
						id: "typescript",
						name: "Safe start",
						blurb: "stack on typescript, with a lint to save you once",
						onTake: () => {},
					},
				]}
			/>
		);

		const card = screen.getByText("Safe start").closest("div");

		expect(card).toHaveTextContent("with a lint to save you once");
		expect(card).not.toHaveTextContent("Intellisense");
	});

	it("offers the curated stack as one press rather than three", async () => {
		const onTake = vi.fn();
		render(
			<StartScreen
				{...props}
				combos={[
					{
						id: "typescript",
						name: "Safe start",
						blurb: "stack on typescript, with a lint to save you once",
						onTake,
					},
				]}
			/>
		);

		await userEvent.click(screen.getByRole("button", { name: "take these" }));

		expect(onTake).toHaveBeenCalledOnce();
	});

	it("rerolls the deal, saying on the button where the money comes from", async () => {
		const onUse = vi.fn();
		render(<StartScreen {...props} rebuild={{ cost: "24 KB", onUse }} />);

		expect(
			screen.getByText("Paid from your archive, not from this run's storage.")
		).toBeInTheDocument();
		await userEvent.click(
			screen.getByRole("button", { name: "rebuild 24 KB" })
		);

		expect(onUse).toHaveBeenCalledOnce();
	});

	it("hangs a padlock on every dealt config once locking is priced", () => {
		render(
			<StartScreen {...props} lock={{ cost: "8 KB", onToggle: () => {} }} />
		);

		expect(
			screen.getByRole("button", { name: "Lock .ts for 8 KB" })
		).toBeInTheDocument();
	});

	it("releases a config that is already held", async () => {
		const onToggle = vi.fn();
		render(
			<StartScreen
				{...props}
				dealt={dealt.map((config) =>
					config.id === "ts" ? { ...config, locked: true } : config
				)}
				lock={{ cost: "8 KB", onToggle }}
			/>
		);

		await userEvent.click(screen.getByRole("button", { name: "Release .ts" }));

		expect(onToggle).toHaveBeenCalledWith("ts");
	});

	it("shows no padlocks and no reroll when neither is on offer", () => {
		render(<StartScreen {...props} />);

		expect(
			screen.queryByRole("button", { name: /Lock/ })
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /rebuild/ })
		).not.toBeInTheDocument();
	});

	it("stands the pipeline's slots empty until the picks land", () => {
		render(<StartScreen {...props} />);

		expect(screen.getByText("0 of 3")).toBeInTheDocument();
		expect(screen.getAllByText("empty")).toHaveLength(3);
		expect(screen.getByText("opens when gate 1 clears")).toBeInTheDocument();
	});

	it("fills a slot with each config picked, leaving the rest empty", () => {
		render(<StartScreen {...props} pickedIds={["ts", "eslint"]} />);

		expect(screen.getByText("2 of 3")).toBeInTheDocument();
		expect(screen.getAllByText("empty")).toHaveLength(1);
		expect(screen.getAllByText(".ts")).toHaveLength(2);
		expect(screen.getAllByText("ESLint")).toHaveLength(2);
	});

	it("takes the number of picks from the slots, not from a second count", () => {
		render(
			<StartScreen
				{...props}
				slots={[{ id: "only" }, { id: "later", gate: 1 }]}
			/>
		);

		expect(screen.getByText("0 of 1")).toBeInTheDocument();
	});

	it("states the gate's ask, calling no audits none rather than zero", () => {
		render(<StartScreen {...props} />);

		expect(screen.getByText("Pallet gate")).toBeInTheDocument();
		expect(screen.getByText("coverage from 5 polls")).toBeInTheDocument();
		expect(screen.getByText("none")).toBeInTheDocument();
	});

	// The peel is the one cost on this panel that is a loss, so it wears the
	// losing colour rather than sitting in the same grey as the demands.
	// The build is chosen against this panel, so it is the one section here that
	// cannot be folded away.
	it("badges the peel in red, on a stake that cannot be folded away", () => {
		const { container } = render(<StartScreen {...props} />);
		const folded = Array.from(container.querySelectorAll("details")).find(
			(node) => node.textContent?.includes("Stake")
		);

		expect(folded).toBeUndefined();
		// Chip tints the wrapper, not the Text it nests inside.
		expect(screen.getByText(/remove 1 config/).parentElement).toHaveClass(
			"text-cinnabar"
		);
	});

	// The rewards panel prices a correct answer and said nothing about a wrong
	// one, so the only number a player could plan against was the upside.
	it("prices a wrong answer, which the rewards panel never states", () => {
		render(<StartScreen {...props} />);

		expect(screen.getByText("Wrong answer")).toBeInTheDocument();
		expect(screen.getByText("−0.3")).toBeInTheDocument();
	});

	it("counts the audits when the gate has any", () => {
		render(<StartScreen {...props} auditCount={2} />);

		expect(screen.getByText("2")).toHaveClass("text-saffron");
	});

	it("badges what a clear pays, the way every other figure is badged", () => {
		render(<StartScreen {...props} />);

		expect(screen.getByText("+1").parentElement).toHaveClass("bg-celadon/15");
		expect(screen.getByText("+32 KB").parentElement).toHaveClass(
			"bg-celadon/15"
		);
		expect(screen.getByText("opens").parentElement).toHaveClass(
			"bg-celadon/15"
		);
	});

	it("leaves the swatch dashed, since the gate has not handed it over", () => {
		render(<StartScreen {...props} />);

		// The label and the badge are siblings under the row, not parent and child,
		// so the assertion has to climb to the list item that holds both.
		const row = screen.getByText("Pallet Swatch").closest("li");

		expect(row?.querySelector(".border-dashed")).toBeInTheDocument();
	});

	it("drops the slot reward on a gate that opens none", () => {
		render(
			<StartScreen
				{...props}
				reward={{ coveragePerCorrect: 1, gateRewardKb: 32 }}
			/>
		);

		expect(screen.queryByText("opens")).not.toBeInTheDocument();
	});

	// The engine offers three openings, and the name is what a player picks
	// between — reducing them to one nameless suggestion threw both away.
	it("offers every curated opening, each by its own name", () => {
		render(
			<StartScreen
				{...props}
				combos={[
					{
						id: "react",
						name: "Gamble",
						blurb: "Fast but risky.",
						onTake: () => {},
					},
					{
						id: "typescript",
						name: "Safe start",
						blurb: "Safer JS/TS focus.",
						recommended: true,
						onTake: () => {},
					},
				]}
			/>
		);

		expect(screen.getByText("Gamble")).toBeInTheDocument();
		expect(screen.getByText("Safe start")).toBeInTheDocument();
		expect(screen.getAllByRole("button", { name: "take these" })).toHaveLength(
			2
		);
	});

	it("flags the opening a first run should take", () => {
		render(
			<StartScreen
				{...props}
				combos={[
					{
						id: "react",
						name: "Gamble",
						blurb: "Fast but risky.",
						onTake: () => {},
					},
					{
						id: "typescript",
						name: "Safe start",
						blurb: "Safer JS/TS focus.",
						recommended: true,
						onTake: () => {},
					},
				]}
			/>
		);

		expect(screen.getAllByText("Recommended")).toHaveLength(1);
	});

	it("takes the opening the player pressed, not the first one", async () => {
		const onTakeSecond = vi.fn();
		render(
			<StartScreen
				{...props}
				combos={[
					{
						id: "react",
						name: "Gamble",
						blurb: "Fast but risky.",
						onTake: () => {},
					},
					{
						id: "typescript",
						name: "Safe start",
						blurb: "Safer JS/TS focus.",
						onTake: onTakeSecond,
					},
				]}
			/>
		);

		const [, second] = screen.getAllByRole("button", { name: "take these" });
		await userEvent.click(second);

		expect(onTakeSecond).toHaveBeenCalledOnce();
	});

	// A run with no seed and nothing banked should say less, not make numbers up.
	it("drops the seed and the archive when the run has neither", () => {
		render(<StartScreen {...props} seed={undefined} archive={undefined} />);

		expect(screen.queryByText(/^seed/)).not.toBeInTheDocument();
		expect(screen.queryByText("archive")).not.toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: "New run" })
		).toBeInTheDocument();
	});
});
