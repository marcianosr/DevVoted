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
		rarity: "bit",
		spots: 1,
		summary: "bit · focus: typescript",
		explainer: "TypeScript polls pay 1.25× coverage.",
		note: <Delta multiplier={1.25} />,
	},
	{
		id: "intellisense",
		label: "Intellisense",
		rarity: "nibble",
		spots: 4,
		summary: "nibble · all coverage",
		explainer: "All coverage earns ×1.5.",
	},
	{
		id: "eslint",
		label: "ESLint",
		rarity: "bit",
		spots: 1,
		summary: "bit · JS/TS polls",
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
	spots: 4,
	fits: "nibble",
	gateName: "Pallet",
	pollCount: 5,
	coverageDemand: 3,
	auditCount: 0,
	streakCap: 2,
	stake: { removeOnMiss: 1, coveragePerWrong: -0.3 },
	reward: { coveragePerCorrect: 1, gateRewardKb: 32 },
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

	it("asks for a pick while the pipeline is bare", () => {
		render(<StartScreen {...props} onStart={() => {}} canStart={false} />);

		expect(
			screen.getByRole("button", { name: "Pick a config to start" })
		).toBeDisabled();
	});

	it("offers the start once the engine allows it, spots to spare or not", () => {
		render(
			<StartScreen {...props} pickedIds={["ts"]} onStart={() => {}} canStart />
		);

		expect(
			screen.getByRole("button", { name: "Start the run →" })
		).toBeEnabled();
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

		screen
			.getAllByText(".ts")
			.forEach((node) => expect(node).not.toHaveClass("line-through"));
	});

	it("keeps the line to the name, its grade and its figure", () => {
		render(<StartScreen {...props} />);

		expect(screen.getByText("×1.25")).toBeInTheDocument();
		expect(screen.queryByText("common")).not.toBeInTheDocument();
	});

	it("folds the facts and the full sentence under each config", () => {
		const { container } = render(<StartScreen {...props} />);
		const row = Array.from(
			container.querySelectorAll('details[class~="group/row"]')
		).find((node) =>
			node.textContent?.includes("TypeScript polls pay 1.25× coverage.")
		);

		expect(row).not.toHaveAttribute("open");
		expect(screen.getByText("bit · focus: typescript")).toBeInTheDocument();
	});

	it("ticks a config without folding it", async () => {
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

	it("draws the pipeline as room rather than listing it twice", () => {
		render(<StartScreen {...props} pickedIds={["ts", "eslint"]} />);

		expect(screen.getByText("2 of 4 spots")).toBeInTheDocument();
		expect(screen.queryByText("Not filled yet")).not.toBeInTheDocument();
		expect(screen.getAllByText(".ts")).toHaveLength(2);
		expect(screen.getAllByText("ESLint")).toHaveLength(2);
	});

	it("charges a pick its spots, not one cell each", () => {
		render(<StartScreen {...props} pickedIds={["intellisense"]} />);

		expect(screen.getByText("4 of 4 spots")).toBeInTheDocument();
		expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "4");
	});

	it("takes the width from the capacity it is given, not from a row count", () => {
		render(<StartScreen {...props} spots={1} fits="bit" />);

		expect(screen.getByText("0 of 1 spots")).toBeInTheDocument();
	});

	it("refuses a config the pipeline has no room for", () => {
		render(
			<StartScreen {...props} pickedIds={["ts", "eslint"]} fits="crumb" />
		);

		expect(
			screen.getByRole("checkbox", { name: /Intellisense/ })
		).toBeDisabled();
		expect(screen.queryByText(/needs a/)).not.toBeInTheDocument();
	});

	it("leaves a config that still fits tickable", () => {
		render(<StartScreen {...props} />);

		expect(
			screen.getByRole("checkbox", { name: /Intellisense/ })
		).not.toBeDisabled();
	});

	it("draws each grade as a run of cells, and names it", () => {
		render(<StartScreen {...props} />);

		const nibble = screen.getByText("Intellisense").closest("li");
		const bit = screen.getByText(".ts").closest("li");

		expect(nibble?.querySelectorAll('span[class*="size-1.5"]')).toHaveLength(4);
		expect(bit?.querySelectorAll('span[class*="size-1.5"]')).toHaveLength(1);
		expect(screen.getAllByText("bit")).toHaveLength(2);
		expect(screen.getByText("nibble")).toBeInTheDocument();
	});

	it("states the shape a starter stack would make", () => {
		render(
			<StartScreen
				{...props}
				combos={[
					{
						id: "safe",
						name: "Safe start",
						blurb: "Safer JS/TS focus.",
						shape: "three bits · 1 spare",
						onTake: () => {},
					},
				]}
			/>
		);

		expect(screen.getByText("three bits · 1 spare")).toBeInTheDocument();
	});

	it("draws the pipeline as room and names what still fits", () => {
		render(<StartScreen {...props} pickedIds={["ts"]} />);

		expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "1");
		expect(
			screen.getByText("3 spots free · a nibble fits")
		).toBeInTheDocument();
	});

	it("states the gate's ask, calling no audits none rather than zero", () => {
		render(<StartScreen {...props} />);

		expect(screen.getByText("Pallet gate")).toBeInTheDocument();
		expect(screen.getByText("coverage from 5 polls")).toBeInTheDocument();
		expect(screen.getByText("none")).toBeInTheDocument();
	});

	it("names the gate without placing it in the run", () => {
		render(<StartScreen {...props} />);

		expect(screen.queryByText(/^\d+ \/ \d+$/)).not.toBeInTheDocument();
	});

	it("states what a grade costs against the current width, on hover", () => {
		render(<StartScreen {...props} />);

		expect(screen.getByText("takes 4 of 4 spots")).toBeInTheDocument();
		expect(screen.getAllByText("takes 1 of 4 spots")).toHaveLength(2);
	});

	it("badges the peel in red, on a stake that cannot be folded away", () => {
		const { container } = render(<StartScreen {...props} />);
		const folded = Array.from(container.querySelectorAll("details")).find(
			(node) => node.textContent?.includes("Stake")
		);

		expect(folded).toBeUndefined();
		expect(screen.getByText(/remove 1 config/).parentElement).toHaveClass(
			"text-cinnabar"
		);
	});

	it("prices a wrong answer, which the rewards panel never states", () => {
		render(<StartScreen {...props} />);

		expect(screen.getByText("Wrong answer")).toBeInTheDocument();
		expect(screen.getByText("−0.3")).toBeInTheDocument();
	});

	it("states where this build's streak stops paying", () => {
		render(<StartScreen {...props} streakCap={2.5} />);

		expect(screen.getByText("streak cap")).toBeInTheDocument();
		expect(screen.getByText("×2.5")).toBeInTheDocument();
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
	});

	it("leaves the swatch dashed, since the gate has not handed it over", () => {
		render(<StartScreen {...props} />);

		const row = screen.getByText("Pallet Swatch").closest("li");

		expect(row?.querySelector(".border-dashed")).toBeInTheDocument();
	});

	it("promises no widening among the clear rewards", () => {
		render(<StartScreen {...props} />);

		expect(screen.queryByText(/pipeline widens/)).not.toBeInTheDocument();
	});

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

	it("drops the seed and the archive when the run has neither", () => {
		render(<StartScreen {...props} seed={undefined} archive={undefined} />);

		expect(screen.queryByText(/^seed/)).not.toBeInTheDocument();
		expect(screen.queryByText("archive")).not.toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: "New run" })
		).toBeInTheDocument();
	});
});
