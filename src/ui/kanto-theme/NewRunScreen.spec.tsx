import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import {
	NEW_RUN_EMPTY_LABEL,
	createKantoNewRunScreenProps,
	kantoHandCards,
	kantoNewRunAt,
	kantoNewRunRegistry,
	newRunBuildNote,
} from "~/test/kantoPoll.factory";

import { leadTextOf } from "./Lead.ui";
import { NewRunScreen } from "./NewRunScreen.ui";

const props = createKantoNewRunScreenProps();

const sentence = (text: string) =>
	screen.getAllByText((_, element) => element?.textContent === text).at(-1);

const columns = (root: ParentNode): HTMLElement[] =>
	[...(root.querySelector<HTMLElement>("div.grid")?.children ?? [])].filter(
		(node): node is HTMLElement => node instanceof HTMLElement
	);

const dealt = () => columns(document.body)[1];

const offerOf = (name: string) =>
	dealt().querySelector<HTMLElement>(`[data-config="${name}"]`);

describe("NewRunScreen", () => {
	it("pins its header, so the balance stays with the hand", () => {
		render(<NewRunScreen {...props} />);

		expect(screen.getByText("Storage balance").closest("header")).toHaveClass(
			"md:sticky"
		);
	});

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

	it("leaves the weight unstated in the build's own heading", () => {
		render(<NewRunScreen {...kantoNewRunAt(["js"])} />);

		expect(screen.queryByText(/of 4 weight/)).toBeNull();
		expect(screen.queryByText(/^1 configs/)).toBeNull();
	});

	it("speaks for the empty list without pretending a slot stands open", () => {
		render(<NewRunScreen {...props} />);

		expect(screen.getByText(NEW_RUN_EMPTY_LABEL)).toBeInTheDocument();
		expect(screen.queryByText("empty slot")).not.toBeInTheDocument();
	});

	it("reads the archive on the warm boot panel under the build, never in the header (ADR-153)", () => {
		render(<NewRunScreen {...props} />);

		expect(screen.getByText("Warm boot")).toBeInTheDocument();
		expect(screen.getByText("512 KB archived")).toBeInTheDocument();
		expect(screen.queryByText("archive")).not.toBeInTheDocument();
		expect(columns(document.body)[0]).toContainElement(
			screen.getByText("Warm boot")
		);
	});

	it("draws no warm boot panel when none is given", () => {
		render(<NewRunScreen {...props} warmBoot={undefined} />);

		expect(screen.queryByText("Warm boot")).not.toBeInTheDocument();
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

		expect(sentence(leadTextOf(newRunBuildNote()))).toBeInTheDocument();
	});

	it("opens the run on one pick, in the build and in the registry alike", () => {
		render(<NewRunScreen {...kantoNewRunAt(["js"])} />);

		expect(offerOf(".js")).toHaveClass("opacity-60");
		expect(screen.queryByText(NEW_RUN_EMPTY_LABEL)).not.toBeInTheDocument();
	});

	it("sells no room before the run starts — every run opens on the free four", () => {
		render(<NewRunScreen {...kantoNewRunAt(["js"])} />);

		expect(screen.queryByRole("button", { name: /free weight/ })).toBeNull();
		expect(screen.queryByRole("button", { name: /buy slot/ })).toBeNull();
	});
});

describe("the deal the registry lists", () => {
	it("prices the deal in room rather than in storage", () => {
		render(<NewRunScreen {...props} />);

		expect(dealt()).toHaveTextContent(
			`${kantoHandCards().length} offers · free`
		);
	});

	it("lists every card the run was dealt", () => {
		render(<NewRunScreen {...props} />);

		for (const card of kantoHandCards()) {
			expect(offerOf(card.name ?? "")).not.toBeNull();
		}
	});

	it("heads each card with the group it pays into", () => {
		render(<NewRunScreen {...props} />);

		expect(
			within(screen.getByRole("group", { name: "Coverage" })).getByRole(
				"button",
				{ name: "Install .js" }
			)
		).toBeInTheDocument();
		expect(
			within(screen.getByRole("group", { name: "Answer help" })).getByRole(
				"button",
				{ name: "Install Linter" }
			)
		).toBeInTheDocument();
	});

	it("counts the deal into the groups it holds, and no empty ones", () => {
		render(<NewRunScreen {...props} />);

		expect(screen.getAllByRole("group")).toHaveLength(3);
		expect(
			screen.queryByRole("group", { name: "Risk" })
		).not.toBeInTheDocument();
	});

	it("shows one group alone when the registry is cut to it", () => {
		render(
			<NewRunScreen
				{...props}
				registry={kantoNewRunRegistry([], undefined, "storage")}
			/>
		);

		expect(screen.getAllByRole("group")).toHaveLength(1);
		expect(dealt()).toHaveTextContent("1 offers · free");
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
		).toHaveTextContent("Install");
	});

	it("says a card is already in, rather than dropping its press entirely", () => {
		render(<NewRunScreen {...props} registry={kantoNewRunRegistry(["js"])} />);

		const taken = screen.getByRole("button", { name: "Installed .js" });
		expect(taken).toHaveTextContent("Installed");
		expect(taken).toBeDisabled();
	});

	it("folds the whole shelf from its header", () => {
		render(<NewRunScreen {...props} />);

		expect(
			screen.getAllByRole("button", { name: "collapse all" }).length
		).toBeGreaterThan(0);
	});
});

describe("what it leaves to prep", () => {
	it("prices no band at all, the stakes being prep's screen", () => {
		render(<NewRunScreen {...props} />);

		expect(screen.queryByRole("heading", { name: "At stake" })).toBeNull();
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
