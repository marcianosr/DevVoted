import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
	COMMUNITY_LABEL,
	kantoRunOver,
	kantoRunSummit,
	NEW_RUN_LABEL,
	RUN_OVER_TITLE,
	SUMMIT_TITLE,
} from "~/test/kantoRunOver.factory";

import { RunOverScreen } from "./RunOverScreen.ui";

const DEAD = kantoRunOver();

const panelFor = (label: string): HTMLElement => {
	const heading = screen.getByRole("heading", { name: label });
	const panel = heading.closest("section");
	if (panel === null) throw new Error(`no panel around "${label}"`);
	return panel;
};

describe("RunOverScreen", () => {
	it("names the run over and says where it stopped", () => {
		render(<RunOverScreen {...DEAD} />);

		expect(
			screen.getByRole("heading", { level: 1, name: RUN_OVER_TITLE })
		).toBeInTheDocument();
		expect(screen.getByText(/stopped at Lavender/)).toBeInTheDocument();
	});

	it("turns the screen red on a death and keeps the gate's colour on a summit", () => {
		const { container, unmount } = render(<RunOverScreen {...DEAD} />);

		expect(container.querySelector("[data-screen-theme='cinnabar']")).not.toBe(
			null
		);

		unmount();

		const summit = render(<RunOverScreen {...kantoRunSummit()} />);

		expect(
			summit.container.querySelector("[data-gate-theme='champion']")
		).not.toBe(null);
	});

	it("reports the coverage held against the window the run opened", () => {
		render(<RunOverScreen {...DEAD} />);

		const coverage = panelFor("coverage");

		expect(coverage).toHaveTextContent("14 against a window of 25");
	});

	it("names every gate the run played and totals them beneath", () => {
		render(<RunOverScreen {...DEAD} />);

		const gates = panelFor("gate by gate");

		for (const name of [
			"Pallet",
			"Boulder",
			"Cascade",
			"Thunder",
			"Lavender",
		]) {
			expect(screen.getByText(name)).toBeInTheDocument();
		}
		expect(gates).toHaveTextContent("total");
		expect(gates).toHaveTextContent("14 of 25");
	});

	it("flags the gate that paid the most", () => {
		render(<RunOverScreen {...DEAD} />);

		expect(panelFor("gate by gate")).toHaveTextContent("best was Pallet");
	});

	it("scores each category against the polls it was asked", () => {
		render(<RunOverScreen {...DEAD} />);

		const categories = panelFor("by category");

		expect(categories).toHaveTextContent("CSS");
		expect(categories).toHaveTextContent("TypeScript");
	});

	it("says what the build cost to run across the whole climb", () => {
		render(<RunOverScreen {...DEAD} />);

		const build = panelFor("the build at the end");

		expect(build).toHaveTextContent("9 weight");
		expect(build).toHaveTextContent("96 KB");
		expect(build).toHaveTextContent("4 gates");
	});

	it("splits the run balance into what banks and what burns", () => {
		render(<RunOverScreen {...DEAD} />);

		const storage = panelFor("storage");

		expect(storage).toHaveTextContent("archived this run");
		expect(storage).toHaveTextContent("run balance, lost");
	});

	it("leaves out the account archive until a caller knows it", () => {
		const { unmount } = render(<RunOverScreen {...DEAD} />);

		expect(screen.queryByText("archive after the run")).toBe(null);

		unmount();
		render(<RunOverScreen {...kantoRunOver({ archiveAfterKb: 8_400 })} />);

		expect(screen.getByText("archive after the run")).toBeInTheDocument();
	});

	it("keeps the swatches and marks the build and balance as gone", () => {
		render(<RunOverScreen {...DEAD} />);

		const unlocked = panelFor("unlocked");

		expect(unlocked).toHaveTextContent("4 swatches on your profile");
		expect(unlocked).toHaveTextContent("kept");
		expect(unlocked).toHaveTextContent("The build and the run balance");
		expect(unlocked).toHaveTextContent("gone");
	});

	it("names each registered config with its chip, not with bare text", () => {
		render(<RunOverScreen {...DEAD} />);

		const unlocked = panelFor("unlocked");

		expect(unlocked).toHaveTextContent("Cache");
		expect(unlocked).toHaveTextContent("Able to install in future builds");
	});

	it("offers a new run as the press and the community as the way out", async () => {
		const onNewRun = vi.fn();
		const onCommunity = vi.fn();

		render(
			<RunOverScreen
				{...DEAD}
				footer={{
					...DEAD.footer,
					action: { ...DEAD.footer.action, onPress: onNewRun },
					asides: [{ label: COMMUNITY_LABEL, onPress: onCommunity }],
				}}
			/>
		);

		await userEvent.click(
			screen.getByRole("button", { name: new RegExp(`^${NEW_RUN_LABEL}`) })
		);
		await userEvent.click(
			screen.getByRole("button", { name: COMMUNITY_LABEL })
		);

		expect(onNewRun).toHaveBeenCalledOnce();
		expect(onCommunity).toHaveBeenCalledOnce();
	});

	it("titles a summited run as the climb finishing, not as a loss", () => {
		render(<RunOverScreen {...kantoRunSummit()} />);

		expect(
			screen.getByRole("heading", { level: 1, name: SUMMIT_TITLE })
		).toBeInTheDocument();
		expect(screen.getByText(/summited/)).toBeInTheDocument();
	});
});
