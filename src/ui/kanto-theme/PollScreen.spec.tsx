import { describe, expect, it, afterEach, vi } from "vitest";
import { act, render, screen, within } from "@testing-library/react";

import {
	createKantoBuildFooterProps,
	createKantoBuildProps,
	createKantoCoverageBarProps,
	createKantoHeaderProps,
	createKantoPollScreenProps,
	kantoPollReadout,
	createKantoQuestionProps,
	kantoAudits,
} from "~/test/kantoPoll.factory";
import { gateSwatchAt } from "~/test/swatchTrack.factory";
import { stubResizeObserver } from "~/test/resizeObserver.harness";

import { PollScreen } from "./PollScreen.ui";
import { navRunOf, renderWithNavRun } from "~/test/navRun.harness";

type FakeAnimation = { onfinish: (() => void) | null; cancel: () => void };

const props = createKantoPollScreenProps();

const LOCK_IN = { lock: { label: "Lock in", note: "pick an answer first" } };

const sendRow = () =>
	screen.getByRole("button", { name: /^Lock in/ }).parentElement;

const buildSheet = (container: HTMLElement) =>
	container.querySelector(".build-footer");

const POLL_SHAPE = "3 options · single answer";

const pollMeta = () => {
	const meta = screen.getByText(POLL_SHAPE).closest("div");
	if (!(meta instanceof HTMLElement)) throw new Error("no poll meta row");
	return meta;
};

const pollCategory = () => within(pollMeta()).getByText("TypeScript");

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("PollScreen", () => {
	it("takes its colour from the gate it is running, not from a prop", () => {
		const { container } = render(<PollScreen {...props} />);

		expect(container.firstChild).toHaveAttribute(
			"data-gate-theme",
			"gate-cinnabar"
		);
		expect(container.firstChild).not.toHaveAttribute("data-screen-theme");
	});

	it("follows the gate when the gate changes", () => {
		const { container } = render(
			<PollScreen
				{...props}
				header={{ ...props.header, swatch: gateSwatchAt(11) }}
			/>
		);

		expect(container.firstChild).toHaveAttribute(
			"data-gate-theme",
			"gate-indigo-elite"
		);
	});

	it("leads with the gate and hands the nav its track and the run's balance", () => {
		const { container } = renderWithNavRun(<PollScreen {...props} />);

		expect(screen.getByText("Cinnabar Gate")).toBeInTheDocument();
		const nav = navRunOf(container);
		expect(nav).toContainElement(
			screen.getByRole("img", { name: /swatches discovered/ })
		);
		expect(nav).toContainElement(screen.getByRole("img", { name: "1.8 MB" }));
	});

	it("posts every audit the gate is running", () => {
		render(<PollScreen {...props} />);

		expect(screen.getByText(kantoAudits[0].name)).toBeInTheDocument();
		expect(screen.getByText(kantoAudits[1].name)).toBeInTheDocument();
	});

	it("posts no audit strip on a clean gate", () => {
		render(<PollScreen {...props} audits={[]} />);

		expect(screen.queryByText(kantoAudits[0].name)).not.toBeInTheDocument();
	});

	it("keeps the build in a footer that folds shut under the poll", () => {
		const { container } = render(
			<PollScreen
				{...props}
				buildFooter={createKantoBuildFooterProps({ open: false })}
			/>
		);

		expect(screen.getByText("Build")).toBeInTheDocument();
		expect(container.querySelector("footer details")).not.toHaveAttribute(
			"open"
		);
	});

	it("opens the build footer when the run asks for it", () => {
		const { container } = render(
			<PollScreen
				{...props}
				buildFooter={createKantoBuildFooterProps({ open: true })}
			/>
		);

		expect(container.querySelector("footer details")).toHaveAttribute("open");
	});

	it("opens the skipped fold inside the footer when the run asks for it", () => {
		const { container } = render(
			<PollScreen
				{...props}
				buildFooter={createKantoBuildFooterProps({
					build: createKantoBuildProps({ skippedOpen: true }),
					open: true,
				})}
			/>
		);

		const folds = container.querySelectorAll("footer details");
		expect(folds).toHaveLength(2);
		expect(folds[1]).toHaveAttribute("open");
	});

	it("prices a wrong answer beside the poll's own facts", () => {
		render(<PollScreen {...props} />);

		expect(screen.getByText("wrong costs")).toBeInTheDocument();
		expect(screen.getByText("0.77")).toBeInTheDocument();
	});

	it("says nothing about the cost of a miss when there is none to name", () => {
		render(<PollScreen {...props} wrongCost={undefined} />);

		expect(screen.queryByText("wrong costs")).not.toBeInTheDocument();
	});

	it("badges the category the poll was drawn from, up in the panel head", () => {
		render(<PollScreen {...props} />);

		expect(pollCategory()).toHaveClass("badge-theme");
	});

	it("lets the category badge take a colour of its own", () => {
		render(<PollScreen {...props} />);

		expect(pollCategory()).toHaveAttribute("data-screen-theme", "cinnabar");
	});

	it("counts the options and names a single-answer poll", () => {
		render(<PollScreen {...props} />);

		expect(screen.getByText("3 options · single answer")).toBeInTheDocument();
	});

	it("names a multiple-answer poll in the plural", () => {
		render(
			<PollScreen
				{...props}
				question={createKantoQuestionProps({ answerType: "multiple" })}
			/>
		);

		expect(
			screen.getByText("3 options · multiple answers")
		).toBeInTheDocument();
	});

	it("prices a wrong answer beside the poll's own facts", () => {
		render(<PollScreen {...props} />);

		expect(screen.getByText("wrong costs")).toBeInTheDocument();
		expect(screen.getByText("0.77")).toHaveAttribute(
			"data-screen-theme",
			"cinnabar"
		);
	});

	it("heads the poll on one row, not on a count above it", () => {
		render(<PollScreen {...props} />);

		expect(
			screen.queryByRole("heading", { name: /out of/ })
		).not.toBeInTheDocument();

		const head = pollMeta();
		expect(head).toHaveTextContent("single answer");
		expect(head.previousElementSibling).toBeNull();
	});

	it("counts the audits that are firing", () => {
		render(<PollScreen {...props} />);

		expect(screen.getByText("2 firing")).toBeInTheDocument();
	});

	it("asks the poll's question and offers its answers", () => {
		render(<PollScreen {...props} />);

		expect(
			screen.getByRole("heading", {
				name: "Which utility type makes every property optional?",
			})
		).toBeInTheDocument();
		expect(screen.getByText("Partial<T>")).toBeInTheDocument();
	});

	it("closes on the controls hint", () => {
		render(<PollScreen {...props} />);

		expect(
			screen.getByText("tap any config to open it · press A, B or C to answer")
		).toBeInTheDocument();
	});

	it("drops the hint line when none is given", () => {
		render(<PollScreen {...props} hint={undefined} />);

		expect(screen.queryByText(/press A, B or C/)).not.toBeInTheDocument();
	});

	it("credits the poll's author only when one is known", () => {
		const { rerender } = render(<PollScreen {...props} />);
		expect(screen.queryByText(/Created by/)).not.toBeInTheDocument();

		rerender(
			<PollScreen
				{...props}
				author={{ handle: "marciano", userId: "marciano-id" }}
			/>
		);
		expect(screen.getByRole("link", { name: "@marciano" })).toBeInTheDocument();
	});

	it("closes the poll panel on one footer: the credit beside the hint", () => {
		render(
			<PollScreen
				{...props}
				author={{ handle: "marciano", userId: "marciano-id" }}
			/>
		);

		const footer = screen
			.getByRole("link", { name: "@marciano" })
			.closest("footer");

		expect(footer).toHaveTextContent("press A, B or C to answer");
		expect(footer?.closest("section")).toHaveTextContent(
			"Which utility type makes every property optional?"
		);
	});

	it("stands the category's leader under the credit rather than inside it", () => {
		render(
			<PollScreen
				{...props}
				author={{ handle: "marciano", userId: "marciano-id" }}
				categoryLeader={{
					category: "TypeScript",
					leader: {
						userId: "sabrina",
						handle: "@sabrina",
						figure: "17 in a row",
					},
				}}
			/>
		);

		const footer = screen
			.getByRole("link", { name: "@marciano" })
			.closest("footer");

		expect(footer).toHaveTextContent("press A, B or C to answer");
		expect(footer).not.toHaveTextContent("17 in a row");
		expect(screen.getByText("17 in a row")).toBeInTheDocument();
	});

	it("leaves the leader out when the category has none to state", () => {
		render(<PollScreen {...props} />);

		expect(screen.queryByText("unranked")).not.toBeInTheDocument();
		expect(screen.queryByText("leader")).not.toBeInTheDocument();
	});

	it("runs the screen as the header, the poll row, then the build", () => {
		const { container } = render(<PollScreen {...props} />);

		const body = container.querySelector("section > div");
		const order = Array.from(body?.children ?? []).map((child) =>
			child.tagName.toLowerCase()
		);

		expect(order).toEqual(["header", "section", "div", "footer"]);
	});

	it("stands the poll and the coverage readout in one row, poll first", () => {
		render(<PollScreen {...props} />);

		const row = pollCategory().closest("section")?.parentElement?.parentElement;
		const panels = Array.from(row?.children ?? []);

		expect(panels).toHaveLength(2);
		expect(panels[1]).toHaveTextContent("Coverage");
		expect(row).toHaveClass("lg:grid-cols-[minmax(0,1fr)_24rem]");
	});

	it("reads coverage in a panel of its own rather than inside the header", () => {
		const { container } = render(<PollScreen {...props} />);

		const bar = screen.getByRole("img", { name: /needed/ });

		expect(container.querySelector("header")).not.toContainElement(bar);
		expect(bar.closest("section")).toHaveTextContent("Coverage");
	});

	it("heads the coverage panel with the band it is standing in", () => {
		render(<PollScreen {...props} />);

		const head = screen
			.getByRole("heading", { name: "Coverage" })
			.closest<HTMLElement>("header");
		if (head === null) throw new Error("Coverage heads no panel");

		expect(within(head).getByText("70%")).toBeInTheDocument();
		expect(within(head).getByText("SHAKY")).toBeInTheDocument();
	});

	it("keeps the panel and drops the reading when the meter is down", () => {
		render(<PollScreen {...props} coverage={{ locked: true }} />);

		const panel = screen
			.getByRole("heading", { name: "Coverage" })
			.closest<HTMLElement>("section");
		if (panel === null) throw new Error("Coverage heads no panel");

		expect(
			within(panel).getByText("Coverage reading unavailable")
		).toBeInTheDocument();
		expect(within(panel).queryByText("35 of 40")).toBeNull();
		expect(within(panel).queryByText("SHAKY")).toBeNull();
		expect(screen.queryByText(/You hold/)).toBeNull();
		expect(screen.queryByText("Accuracy")).toBeNull();
	});

	it("leaves what a poll pays to prep, with no tooltip on the coverage panel", () => {
		render(<PollScreen {...props} />);

		expect(
			screen.queryByRole("button", { name: "How a correct answer is counted" })
		).toBeNull();
		expect(screen.queryByText("what a poll pays")).toBeNull();
	});

	it("says what the run holds as a share of the bar, never the gate's codebase", () => {
		render(<PollScreen {...props} />);

		expect(
			screen.getByText(
				(_, node) => node?.textContent === "You hold 70.0% coverage."
			)
		).toBeInTheDocument();
		expect(screen.queryByText(/\bchanges?\b/i)).toBeNull();
	});

	it("draws this gate's accuracy as one multiplier bar, under the coverage bar", () => {
		render(<PollScreen {...props} />);

		expect(screen.getByText("Accuracy")).toBeInTheDocument();
		expect(
			screen.getByRole("img", { name: "Accuracy ×1.32, up to ×1.74" })
		).toBeInTheDocument();
	});

	it("says what accuracy does beside the multiplier it reads", () => {
		render(<PollScreen {...props} />);

		const note = screen.getByText("multiplies the bar when the gate closes");

		expect(note.closest("section")).toHaveTextContent("×1.32 · up to ×1.74");
	});

	it("leaves the track out when a call site has nothing to track", () => {
		render(
			<PollScreen {...props} coverage={{ bar: kantoPollReadout().bar }} />
		);

		expect(screen.queryByText("Accuracy")).toBeNull();
		expect(screen.queryByText(/You hold/)).toBeNull();
	});

	it("states coverage exactly once, so no row says it again", () => {
		render(<PollScreen {...props} />);

		expect(screen.getAllByRole("img", { name: /needed/ })).toHaveLength(1);
	});

	it("carries no footer action until the poll asks for one", () => {
		render(<PollScreen {...props} />);

		expect(
			screen.queryByRole("button", { name: /Submit/ })
		).not.toBeInTheDocument();
	});

	it("sends the answer from the poll panel's own row, stating the count it acts on", () => {
		render(
			<PollScreen
				{...props}
				question={createKantoQuestionProps({
					answerType: "multiple",
					pickedIds: ["option-1", "option-2"],
				})}
				commit={{
					lock: {
						label: "Lock in 2 answers",
						note: "2 picked",
						onPress: () => {},
					},
				}}
			/>
		);

		const send = screen.getByRole("button", { name: /^Lock in 2 answers/ });

		expect(send).toBeEnabled();
		expect(send.closest("section")).toHaveTextContent(
			"Which utility type makes every property optional?"
		);
		expect(screen.getByText("2 picked")).toBeInTheDocument();
	});

	it("pins the send, and stands it above the credit rather than under it", () => {
		render(
			<PollScreen
				{...props}
				author={{ handle: "marciano", userId: "marciano-id" }}
				commit={LOCK_IN}
			/>
		);

		const row = sendRow();

		expect(row).toHaveClass("sticky");
		expect(row).not.toHaveClass("bg-theme-faint");
		expect(row?.nextElementSibling).toContainElement(
			screen.getByRole("link", { name: "@marciano" })
		);
	});

	it("grounds the row once the screen's footer rides in it instead of the send", () => {
		render(
			<PollScreen
				{...props}
				commit={undefined}
				footer={{ action: { label: "Next poll", onPress: () => {} } }}
			/>
		);

		expect(
			screen.getByRole("button", { name: /Next poll/ }).closest("footer")
				?.parentElement
		).toHaveClass("bg-theme-faint");
	});

	it("holds the viewport floor itself, rather than riding on the sheet", () => {
		render(<PollScreen {...props} commit={LOCK_IN} />);

		expect(sendRow()).toHaveClass("sticky", "bottom-0");
		expect(sendRow()).not.toHaveAttribute("style");
	});

	it("leaves the build sheet in the flow until the screen can measure it", () => {
		const { container } = render(<PollScreen {...props} commit={LOCK_IN} />);

		expect(container.querySelector(".build-footer")).not.toHaveClass("sticky");
	});

	it("seats the sheet on the send once the send has been measured", () => {
		const observer = stubResizeObserver();
		const { container } = render(<PollScreen {...props} commit={LOCK_IN} />);

		observer.resizeTo(64);

		expect(buildSheet(container)).toHaveClass("sticky", "z-20");
		expect(buildSheet(container)).toHaveStyle({ bottom: "64px" });
		expect(sendRow()).toHaveClass("bottom-0");
	});

	it("re-seats the sheet when the send grows under it", () => {
		const observer = stubResizeObserver();
		const { container } = render(<PollScreen {...props} commit={LOCK_IN} />);

		observer.resizeTo(64);
		observer.resizeTo(112);

		expect(buildSheet(container)).toHaveStyle({ bottom: "112px" });
	});

	it("keeps the sheet on the layer above the send", () => {
		const observer = stubResizeObserver();
		const { container } = render(<PollScreen {...props} commit={LOCK_IN} />);

		observer.resizeTo(64);

		expect(sendRow()).toHaveClass("z-10");
		expect(buildSheet(container)).toHaveClass("z-20");
	});

	it("refuses the commit while nothing is picked, and says what it wants", () => {
		render(
			<PollScreen
				{...props}
				question={createKantoQuestionProps({
					answerType: "multiple",
					pickedIds: [],
				})}
				commit={{
					lock: { label: "Lock in", note: "pick every answer that fits" },
				}}
			/>
		);

		expect(screen.getByRole("button", { name: /^Lock in/ })).toBeDisabled();
		expect(screen.getByText("pick every answer that fits")).toBeInTheDocument();
	});

	it("hands the answered poll's press the same slot the send rode", () => {
		render(
			<PollScreen
				{...props}
				commit={undefined}
				footer={{ action: { label: "Next poll", onPress: () => {} } }}
			/>
		);

		const next = screen.getByRole("button", { name: /Next poll/ });

		expect(next.closest(".build-footer")).toBeNull();
		expect(next.closest("footer")?.parentElement).toHaveClass(
			"sticky",
			"bottom-0"
		);
	});

	it("closes the screen on that one bar, with no panel left over", () => {
		const { container } = render(
			<PollScreen
				{...props}
				footer={{ action: { label: "Next poll", onPress: () => {} } }}
			/>
		);

		const body = container.querySelector("section > div");
		const order = Array.from(body?.children ?? []).map((child) =>
			child.tagName.toLowerCase()
		);

		expect(order).toEqual(["header", "section", "div", "footer"]);
	});

	it("pins the coverage bar where the answer landed", () => {
		const { container } = render(
			<PollScreen
				{...props}
				header={createKantoHeaderProps({
					bar: createKantoCoverageBarProps({ pin: true }),
				})}
			/>
		);

		expect(container.querySelector(".coverage-bar-pin")).toBeInTheDocument();
	});
});

describe("PollScreen's fact band", () => {
	it("states how the room did and what this account did, above the question", () => {
		render(<PollScreen {...createKantoPollScreenProps()} />);

		expect(screen.getByText("brutal")).toBeInTheDocument();
		expect(screen.getByText("seen before")).toBeInTheDocument();
	});

	it("leads the poll's own line with its number, then its category", () => {
		render(<PollScreen {...createKantoPollScreenProps({ step: 3 })} />);

		const meta = pollMeta();

		expect(meta.firstElementChild).toHaveTextContent("3");
		expect(meta.children[1]).toHaveTextContent("TypeScript");
		expect(meta.previousElementSibling).toBeNull();
	});

	it("states the keyboard tip on the poll's line for a mouse player only", () => {
		render(
			<PollScreen
				{...createKantoPollScreenProps({
					keysHint: "press a letter to answer",
				})}
			/>
		);

		const tip = screen.getByText("press a letter to answer");

		expect(pollMeta()).toContainElement(tip);
		expect(tip.parentElement).toHaveClass("hidden", "pointer-fine:inline");
	});

	it("draws no lock-in when the poll answers on the tap", () => {
		render(<PollScreen {...props} commit={{}} />);

		expect(
			screen.queryByRole("button", { name: /^Lock in/ })
		).not.toBeInTheDocument();
	});

	it("keeps that line when the band is withheld: the poll's shape is not the band's", () => {
		render(
			<PollScreen {...createKantoPollScreenProps({ facts: undefined })} />
		);

		expect(screen.getByText("3 options · single answer")).toBeInTheDocument();
		expect(screen.queryByText("brutal")).not.toBeInTheDocument();
	});

	it("leaves the readout in the flow, the header being the pinned edge now", () => {
		render(<PollScreen {...props} />);

		const panel = screen
			.getByRole("heading", { name: "Coverage" })
			.closest("section");

		expect(panel).not.toHaveClass("lg:sticky");
		expect(panel).not.toHaveClass("sticky");
	});

	it("stands the pinned readout on an opaque ground, the screen passing under it", () => {
		render(<PollScreen {...props} />);

		const panel = screen
			.getByRole("heading", { name: "Coverage" })
			.closest("section");

		expect(panel).toHaveClass("bg-theme-faint");
	});
});

describe("the poll clock (ADR-169)", () => {
	it("badges the clock beside the poll's facts", () => {
		render(
			<PollScreen
				{...createKantoPollScreenProps()}
				clock={{ label: "Vite ×1.5 · 12s", color: "viridian" }}
			/>
		);

		expect(screen.getByText("Vite ×1.5 · 12s")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
	});
});

describe("PollScreen while an answer lands", () => {
	const rightAnswer = createKantoQuestionProps({
		pickedIds: ["option-1"],
		options: createKantoQuestionProps().options.map((option, index) => ({
			...option,
			state: index === 0 ? "right" : "idle",
		})),
	});

	const answered = () =>
		screen.getByText(POLL_SHAPE).closest("section")?.parentElement;

	it("shakes the poll card after a wrong answer", () => {
		render(<PollScreen {...props} shake="poll-1" />);

		expect(answered()).toHaveClass("answer-shake");
	});

	it("holds the card still otherwise", () => {
		render(<PollScreen {...props} />);

		expect(answered()).not.toHaveClass("answer-shake");
	});

	it("slides a card in when it arrives and sends it away when it leaves", () => {
		const { rerender } = render(<PollScreen {...props} pollKey="poll-1" />);

		expect(answered()).toHaveClass("poll-card-enter");
		expect(answered()).not.toHaveClass("poll-card-leave");

		rerender(<PollScreen {...props} pollKey="poll-1" leaving />);
		expect(answered()).toHaveClass("poll-card-leave");
	});

	it("marks a revealed card so its options stay put", () => {
		const { rerender } = render(<PollScreen {...props} />);

		expect(answered()).not.toHaveClass("poll-card-revealed");

		rerender(<PollScreen {...props} revealed />);
		expect(answered()).toHaveClass("poll-card-revealed");
	});

	it("deals a fresh card for the next poll, not the same one restyled", () => {
		const { rerender } = render(<PollScreen {...props} pollKey="poll-1" />);
		const first = answered();

		rerender(<PollScreen {...props} pollKey="poll-1" />);
		expect(answered()).toBe(first);

		rerender(<PollScreen {...props} pollKey="poll-2" />);
		expect(answered()).not.toBe(first);
	});

	it("pops a combo over the card in vermillion and announces it", () => {
		render(<PollScreen {...props} combo="3 in a row!" />);

		const combo = screen.getByText("3 in a row!");

		expect(combo).toHaveAttribute("role", "status");
		expect(combo).toHaveClass("poll-combo");
		expect(combo).toHaveAttribute("data-screen-theme", "vermillion");
		expect(answered()).toContainElement(combo);
	});

	it("pops no combo without one", () => {
		const { container } = render(<PollScreen {...props} />);

		expect(container.querySelector(".poll-combo")).toBeNull();
	});

	it("pops the gain beside the answer, lands it on the bar, then rides it to the new fill", () => {
		const onFlightLanded = vi.fn();
		const animation: FakeAnimation = { onfinish: null, cancel: vi.fn() };
		const animate = vi.fn(() => animation);
		Object.defineProperty(HTMLElement.prototype, "animate", {
			value: animate,
			configurable: true,
		});

		render(
			<PollScreen
				{...props}
				question={rightAnswer}
				flight={{ figure: "+12%", id: "poll-1", fromHeld: 24, toHeld: 36 }}
				onFlightLanded={onFlightLanded}
			/>
		);

		expect(screen.getByText("+12%")).toBeInTheDocument();
		expect(animate).toHaveBeenLastCalledWith(expect.any(Array), {
			duration: 1040,
			fill: "forwards",
		});
		expect(onFlightLanded).not.toHaveBeenCalled();

		act(() => animation.onfinish?.());

		expect(onFlightLanded).toHaveBeenCalledTimes(1);
		expect(screen.getByText("+12%")).toBeInTheDocument();
		expect(animate).toHaveBeenLastCalledWith(expect.any(Array), {
			duration: 750,
		});

		act(() => animation.onfinish?.());

		expect(onFlightLanded).toHaveBeenCalledTimes(1);
		expect(screen.queryByText("+12%")).toBeNull();
		Reflect.deleteProperty(HTMLElement.prototype, "animate");
	});

	it("lands at once, with no chip, for a player who asked for less motion", () => {
		const onFlightLanded = vi.fn();
		vi.stubGlobal("matchMedia", () => ({ matches: true }));
		Object.defineProperty(HTMLElement.prototype, "animate", {
			value: vi.fn(),
			configurable: true,
		});

		render(
			<PollScreen
				{...props}
				question={rightAnswer}
				flight={{ figure: "+12%", id: "poll-1", fromHeld: 24, toHeld: 36 }}
				onFlightLanded={onFlightLanded}
			/>
		);

		expect(onFlightLanded).toHaveBeenCalledTimes(1);
		expect(screen.queryByText("+12%")).toBeNull();
		Reflect.deleteProperty(HTMLElement.prototype, "animate");
	});
});
