import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { StoryObj } from "@storybook/react";

import * as AbTest from "./AbTest.stories";
import * as AgentsMd from "./AgentsMd.stories";
import * as Cache from "./Cache.stories";
import * as CodeCoverage from "./CodeCoverage.stories";
import * as ColdStart from "./ColdStart.stories";
import * as Dependabot from "./Dependabot.stories";
import * as Deprecated from "./Deprecated.stories";
import * as DryRun from "./DryRun.stories";
import * as ESLint from "./ESLint.stories";
import * as FocusFamily from "./FocusFamily.stories";
import * as Freemium from "./Freemium.stories";
import * as GarbageCollection from "./GarbageCollection.stories";
import * as GitRebase from "./GitRebase.stories";
import * as IndexedDb from "./IndexedDb.stories";
import * as Intellisense from "./Intellisense.stories";
import * as Length from "./Length.stories";
import * as MooresLaw from "./MooresLaw.stories";
import * as Overclock from "./Overclock.stories";
import * as PlanningPoker from "./PlanningPoker.stories";
import * as Prefetch from "./Prefetch.stories";
import * as Prettierrc from "./Prettierrc.stories";
import * as Reduce from "./Reduce.stories";
import * as Strict from "./Strict.stories";
import * as Stylelint from "./Stylelint.stories";
import * as Telemetry from "./Telemetry.stories";
import * as UnitTests from "./UnitTests.stories";
import * as VendorLockIn from "./VendorLockIn.stories";
import * as VolkswagenCi from "./VolkswagenCi.stories";
import * as Wtfpl from "./Wtfpl.stories";
import * as YarnLock from "./YarnLock.stories";

const PAGES = {
	AbTest,
	AgentsMd,
	Cache,
	CodeCoverage,
	ColdStart,
	Dependabot,
	Deprecated,
	DryRun,
	ESLint,
	FocusFamily,
	Freemium,
	GarbageCollection,
	GitRebase,
	IndexedDb,
	Intellisense,
	Length,
	MooresLaw,
	Overclock,
	PlanningPoker,
	Prefetch,
	Prettierrc,
	Reduce,
	Strict,
	Stylelint,
	Telemetry,
	UnitTests,
	VendorLockIn,
	VolkswagenCi,
	Wtfpl,
	YarnLock,
};

const DEAD_ENDS = ["no poll to show", "nothing answered yet"];

const storiesIn = (page: Record<string, unknown>): [string, StoryObj][] =>
	Object.entries(page).filter(
		(entry): entry is [string, StoryObj] =>
			entry[0] !== "default" &&
			typeof entry[1] === "object" &&
			entry[1] !== null &&
			"render" in entry[1]
	);

afterEach(cleanup);

describe("config story pages", () => {
	it("covers every page with at least one story", () => {
		for (const [name, page] of Object.entries(PAGES))
			expect(storiesIn(page), name).not.toHaveLength(0);
	});

	for (const [pageName, page] of Object.entries(PAGES))
		for (const [storyName, story] of storiesIn(page))
			it(`renders ${pageName}/${storyName} from the engine`, () => {
				const { container } = render(story.render?.({}, {} as never));

				expect(container.textContent ?? "").not.toBe("");
				for (const deadEnd of DEAD_ENDS)
					expect(container.textContent).not.toContain(deadEnd);
			});

	it("arms ESLint's press on a JS poll and refuses it on a CSS one", () => {
		const armed = render(
			ESLint.CrossesOutAWrongAnswer.render?.({}, {} as never)
		);
		expect(armed.container.textContent).toContain("lint 8 KB");
		cleanup();

		const refused = render(ESLint.WaitsForJsOrTs.render?.({}, {} as never));
		expect(refused.container.textContent).toContain("waits for JS or TS");
	});

	it("reads the gate's correct count once .length is installed", () => {
		const shown = render(Length.CountsTheGate.render?.({}, {} as never));
		expect(shown.container.textContent).toMatch(
			/\d+ correct answers? in this gate/
		);
		cleanup();

		const quiet = render(
			Length.NothingCountsWithoutIt.render?.({}, {} as never)
		);
		expect(quiet.container.textContent).not.toMatch(/in this gate/);
	});

	it("counts Dependabot down to the merge and back up after a miss", () => {
		const counting = render(Dependabot.CountingUp.render?.({}, {} as never));
		expect(counting.container.textContent).toContain("bump in 3");
		cleanup();

		const nearly = render(
			Dependabot.OneAnswerFromAnUpgrade.render?.({}, {} as never)
		);
		expect(nearly.container.textContent).toContain("bump in 1");
		cleanup();

		const reset = render(
			Dependabot.AWrongAnswerStartsOver.render?.({}, {} as never)
		);
		expect(reset.container.textContent).toContain("bump in 5");
	});

	it("counts what it can press, never what it cannot", () => {
		const armed = render(
			ESLint.CrossesOutAWrongAnswer.render?.({}, {} as never)
		);
		expect(armed.container.textContent).toContain("1 ready");
		cleanup();

		const refused = render(ESLint.WaitsForJsOrTs.render?.({}, {} as never));
		expect(refused.container.textContent).not.toContain("ready");
	});
});
