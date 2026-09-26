import { describe, expect, it, afterEach, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

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

const props = createKantoPollScreenProps();

const LOCK_IN = { label: "Lock in", note: "pick an answer first" };

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

		expect(container.firstChild).toHaveAttribute("data-gate-theme", "volcano");
		expect(container.firstChild).not.toHaveAttribute("data-screen-theme");
	});

	it("follows the gate when the gate changes", () => {
		const { container } = render(
			<PollScreen
				{...props}
				header={{ ...props.header, swatch: gateSwatchAt(11) }}
			/>
		);

		expect(container.firstChild).toHaveAttribute("data-gate-theme", "elite");
	});

	it("leads with the gate, its track and the run's balance", () => {
		render(<PollScreen {...props} />);

		expect(screen.getByText("#9 - Volcano Gate")).toBeInTheDocument();
		expect(screen.getByRole("img", { name: "1.8 MB" })).toBeInTheDocument();
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

		rerender(<PollScreen {...props} author={{ handle: "marciano" }} />);
		expect(screen.getByRole("link", { name: "@marciano" })).toBeInTheDocument();
	});

	it("closes the poll panel on one footer: the credit beside the hint", () => {
		render(<PollScreen {...props} author={{ handle: "marciano" }} />);

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
				author={{ handle: "marciano" }}
				categoryLeader={{
					category: "TypeScript",
					leader: {
						handle: "@sabrina",
						githubLogin: "sabrina",
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

	it("runs the screen as header, audits, the poll row, then the build", () => {
		const { container } = render(<PollScreen {...props} />);

		const body = container.querySelector("section > div");
		const order = Array.from(body?.children ?? []).map((child) =>
			child.tagName.toLowerCase()
		);

		expect(order).toEqual(["header", "section", "div", "footer"]);
	});

	it("stands the poll and the coverage readout in one row, poll first", () => {
		render(<PollScreen {...props} />);

		const row = pollCategory().closest("section")?.parentElement;
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

		expect(within(head).getByText("35 of 40")).toBeInTheDocument();
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
		expect(screen.queryByText(/You have scored/)).toBeNull();
		expect(screen.queryByText("Score")).toBeNull();
	});

	it("still explains what a poll pays while the meter is down", () => {
		render(<PollScreen {...props} coverage={{ locked: true }} />);

		expect(
			screen.getByRole("button", { name: "How a correct answer is counted" })
		).toBeInTheDocument();
	});

	it("explains what a correct answer is worth, for a reader and on hover", () => {
		render(<PollScreen {...props} />);

		expect(
			screen.getByRole("button", { name: "How a correct answer is counted" })
		).toHaveTextContent("what a poll pays");
	});

	it("says what the run has scored and what the gate scores it out of", () => {
		render(<PollScreen {...props} />);

		expect(
			screen.getByText(
				(_, node) =>
					node?.textContent ===
					"You have scored 35 units across 50 slots, which is 70.0% coverage."
			)
		).toBeInTheDocument();
	});

	it("shows what this gate's polls paid, and no earlier gate's", () => {
		render(<PollScreen {...props} />);

		expect(screen.getByText("Score")).toBeInTheDocument();
		expect(screen.queryByLabelText(/^Pallet/)).toBeNull();
	});

	it("leaves the explainer out when a call site has nothing to explain", () => {
		render(
			<PollScreen {...props} coverage={{ bar: kantoPollReadout().bar }} />
		);

		expect(screen.queryByText("Score")).toBeNull();
		expect(screen.queryByText(/You have scored/)).toBeNull();
	});

	it("accounts for an answer on the chip that paid it, not in a region of its own", () => {
		render(
			<PollScreen
				{...props}
				coverage={{
					...kantoPollReadout(),
					paid: {
						rows: [
							{
								swatch: gateSwatchAt(0),
								correct: 1,
								polls: 5,
								current: true,
								payouts: {
									total: "1.25",
									slots: [
										{
											figure: "1.25",
											color: "viridian",
											receipt: [
												{
													label: ".js",
													tags: [{ label: "×1.25" }],
													detail: "matches JavaScript",
													figures: [{ label: "+0.25" }],
												},
												{
													label: "paid",
													figures: [{ label: "1.25" }],
													total: true,
												},
											],
										},
									],
								},
							},
						],
					},
				}}
			/>
		);

		expect(screen.queryByText("what this answer paid")).toBeNull();
		expect(screen.getByText("matches JavaScript")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "poll 1 — paid 1.25" })
		).toBeInTheDocument();
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
					label: "Lock in 2 answers",
					note: "2 picked",
					onPress: () => {},
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
				author={{ handle: "marciano" }}
				commit={{ label: "Lock in", note: "pick an answer first" }}
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
				commit={{ label: "Lock in", note: "pick every answer that fits" }}
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

	it("states the poll's shape on a line of its own, beside its category", () => {
		render(<PollScreen {...createKantoPollScreenProps()} />);

		const meta = pollMeta();

		expect(meta.firstElementChild).toHaveTextContent("TypeScript");
		expect(meta.previousElementSibling).toBeNull();
	});

	it("keeps that line when the band is withheld: the poll's shape is not the band's", () => {
		render(
			<PollScreen {...createKantoPollScreenProps({ facts: undefined })} />
		);

		expect(screen.getByText("3 options · single answer")).toBeInTheDocument();
		expect(screen.queryByText("brutal")).not.toBeInTheDocument();
	});

	it("follows the question down the page once the readout sits beside it", () => {
		render(<PollScreen {...props} />);

		const panel = screen
			.getByRole("heading", { name: "Coverage" })
			.closest("section");

		expect(panel).toHaveClass("lg:sticky", "lg:top-4");
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
