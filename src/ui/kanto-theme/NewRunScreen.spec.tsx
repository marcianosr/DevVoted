import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import {
	NEW_RUN_EMPTY_LABEL,
	SUGGESTED_LABEL,
	createKantoNewRunScreenProps,
	kantoHandCards,
	kantoNewRunAt,
	kantoNewRunRegistry,
	newRunBuildNote,
	newRunRegistryNote,
} from "~/test/kantoPoll.factory";

import { NewRunScreen } from "./NewRunScreen.ui";

const props = createKantoNewRunScreenProps();

const COLUMN_SELECTOR = "div.grid > div";

const columns = (root: ParentNode): HTMLElement[] => [
	...root.querySelectorAll<HTMLElement>(COLUMN_SELECTOR),
];

const dealt = () => columns(document.body)[1];

const offerOf = (name: string) =>
	within(dealt())
		.getByRole("button", { name: `About ${name}` })
		.closest<HTMLElement>(".rounded-lg");

describe("NewRunScreen", () => {
	it("stands the build beside the registry it is dealt from", () => {
		render(<NewRunScreen {...props} />);

		expect(screen.getByText("Build")).toBeInTheDocument();
		expect(screen.getByText("Registry")).toBeInTheDocument();
	});

	it("holds the build down one column and the deal down the other", () => {
		const { container } = render(<NewRunScreen {...props} />);

		const [holding, dealing] = columns(container);

		expect(within(holding).getByText("Build")).toBeInTheDocument();
		expect(within(holding).getByText(NEW_RUN_EMPTY_LABEL)).toBeInTheDocument();
		expect(within(dealing).getByText("Registry")).toBeInTheDocument();
		expect(within(dealing).queryByText("Build")).toBeNull();
	});

	it("reads the build before the registry, as the shop screen does", () => {
		render(<NewRunScreen {...props} />);

		expect(
			screen
				.getByText("Build")
				.compareDocumentPosition(screen.getByText("Registry")) &
				Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	});

	it("leaves the room for sale under the readout it would widen", () => {
		render(<NewRunScreen {...props} />);

		const offer = screen.getByRole("button", {
			name: /^carry 8 free weight/,
		});

		expect(
			screen.getByText("Build").compareDocumentPosition(offer) &
				Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	});

	it("opens on a build that weighs nothing and bills nothing", () => {
		render(<NewRunScreen {...props} />);

		expect(
			screen.getByText("0 weight · 0 covered · 0 billable")
		).toBeInTheDocument();
	});

	it("counts the room it has left without re-counting the chips beside it", () => {
		render(<NewRunScreen {...kantoNewRunAt(["js"])} />);

		expect(screen.queryByText(/^1 configs/)).toBeNull();
	});

	it("speaks for the empty list without pretending a slot stands open", () => {
		render(<NewRunScreen {...props} />);

		expect(screen.getByText(NEW_RUN_EMPTY_LABEL)).toBeInTheDocument();
		expect(screen.queryByText("empty slot")).not.toBeInTheDocument();
	});

	it("sells free weight rather than a numbered slot", () => {
		render(<NewRunScreen {...props} />);

		expect(
			screen.getByRole("button", { name: /^carry 8 free weight/ })
		).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /^open slot/ })).toBeNull();
	});

	it("prices the offer in the purse the header names, there being two", () => {
		render(<NewRunScreen {...props} />);

		expect(screen.getByText("256 KB archive")).toBeInTheDocument();
	});

	it("reads the archive as the purse the header holds", () => {
		render(<NewRunScreen {...props} />);

		expect(screen.getByText("512 KB")).toBeInTheDocument();
		expect(screen.getByText("archive")).toBeInTheDocument();
	});

	it("titles itself the new run, under the gate it is about to run", () => {
		render(<NewRunScreen {...props} />);

		expect(screen.getByText("New run")).toBeInTheDocument();
		expect(screen.getByText("gate 0 · Pallet")).toBeInTheDocument();
	});

	it("leaves the swatch track to state the shape of the climb", () => {
		render(<NewRunScreen {...props} />);

		expect(screen.queryByText(/gates, one a day/)).toBeNull();
	});

	it("stands its panels on the page, shedding the screen's own frame", () => {
		const { container } = render(<NewRunScreen {...props} />);

		expect(container.firstElementChild).not.toHaveClass("bg-theme-faint");
		expect(container.firstElementChild).not.toHaveClass("rounded-3xl");
	});

	it("wears the gate it is about to run", () => {
		const { container } = render(<NewRunScreen {...props} />);

		expect(container.firstElementChild).toHaveAttribute(
			"data-gate-theme",
			"pallet"
		);
		expect(container.firstElementChild).not.toHaveAttribute(
			"data-screen-theme"
		);
	});

	it("states what the build's own weight costs, under the build", () => {
		render(<NewRunScreen {...props} />);

		expect(screen.getByText(newRunBuildNote())).toBeInTheDocument();
	});

	it("opens the run on one pick, in the build and in the registry alike", () => {
		render(<NewRunScreen {...kantoNewRunAt(["js"])} />);

		expect(
			screen.getByText("1 weight · 1 covered · 0 billable")
		).toBeInTheDocument();
		expect(offerOf(".js")).toHaveClass("opacity-60");
		expect(screen.queryByText(NEW_RUN_EMPTY_LABEL)).not.toBeInTheDocument();
	});

	it("opens the free line higher once the archive has bought one", () => {
		render(<NewRunScreen {...kantoNewRunAt(["js"], 1, 1024)} />);

		expect(
			screen.getByRole("button", { name: /^carry 12 free weight/ })
		).toBeInTheDocument();
	});

	it("refuses an offer the archive cannot pay for, with the shortfall", () => {
		render(<NewRunScreen {...kantoNewRunAt([], 0, 32)} />);

		const stub = screen.getByRole("button", { name: /^carry 8 free weight/ });

		expect(stub).toBeDisabled();
		expect(screen.getByText("224 KB short")).toBeInTheDocument();
	});
});

describe("the deal the registry lists", () => {
	it("prices the deal in room rather than in storage", () => {
		render(<NewRunScreen {...props} />);

		expect(dealt()).toHaveTextContent(
			`${kantoHandCards().length} offers · free a slot`
		);
		expect(screen.getByText(newRunRegistryNote)).toBeInTheDocument();
	});

	it("lists every card the run was dealt", () => {
		render(<NewRunScreen {...props} />);

		for (const card of kantoHandCards()) {
			expect(offerOf(card.name ?? "")).not.toBeNull();
		}
	});

	it("marks the advice recommendedPicks names, and drops it once taken", () => {
		render(<NewRunScreen {...props} />);

		expect(screen.getAllByText(SUGGESTED_LABEL)).toHaveLength(2);
		expect(offerOf(".js")).toContainElement(
			screen.getAllByText(SUGGESTED_LABEL)[0]
		);
	});

	it("deals no advice when nothing is recommended", () => {
		render(
			<NewRunScreen {...props} registry={kantoNewRunRegistry([], 4, false)} />
		);

		expect(screen.queryByText(SUGGESTED_LABEL)).not.toBeInTheDocument();
	});

	it("dims a card too wide for the room left and refuses its press", () => {
		render(
			<NewRunScreen
				{...props}
				registry={kantoNewRunRegistry(["js", "code-coverage", "unit-tests"])}
			/>
		);

		expect(offerOf("Cold Start")).toHaveClass("opacity-60");
		expect(
			screen.getByRole("button", { name: "Install Cold Start" })
		).toBeDisabled();
	});

	it("takes a card with a verb rather than a price", () => {
		render(<NewRunScreen {...props} />);

		expect(
			screen.getByRole("button", { name: "Install .js" })
		).toBeInTheDocument();
	});
});

describe("what it leaves to prep", () => {
	it("prices no band at all, the stakes being prep's screen", () => {
		render(<NewRunScreen {...props} />);

		expect(
			screen.queryByRole("heading", { name: "Objectives and rewards" })
		).toBeNull();
		for (const band of ["PERFECT", "HEALTHY", "SHAKY", "DANGER"]) {
			expect(screen.queryByText(band)).toBeNull();
		}
	});

	it("sends you on to prep by the press alone, with no line about it", () => {
		render(<NewRunScreen {...props} />);

		expect(screen.queryByText(/^Prep shows what/)).toBeNull();
	});

	it("refuses the start while nothing is picked", () => {
		render(<NewRunScreen {...props} />);

		expect(
			screen.getByRole("button", { name: /Pallet gate prep/ })
		).toBeDisabled();
	});

	it("lets the refused start speak for itself, without a scolding line", () => {
		render(<NewRunScreen {...props} />);

		expect(screen.queryByText(/bare build/i)).toBeNull();
	});
});
