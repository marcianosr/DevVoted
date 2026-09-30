import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { StoryObj } from "@storybook/react";

import * as AbTest from "./AbTest.stories";
import * as AgentsMd from "./AgentsMd.stories";
import * as AndAnd from "./AndAnd.stories";
import * as Cache from "./Cache.stories";
import * as CodeCoverage from "./CodeCoverage.stories";
import * as ColdStart from "./ColdStart.stories";
import * as Database from "./Database.stories";
import * as Dependabot from "./Dependabot.stories";
import * as Deprecated from "./Deprecated.stories";
import * as DryRun from "./DryRun.stories";
import * as FocusFamily from "./FocusFamily.stories";
import * as Freemium from "./Freemium.stories";
import * as GarbageCollection from "./GarbageCollection.stories";
import * as GitRebase from "./GitRebase.stories";
import * as IndexedDb from "./IndexedDb.stories";
import * as Intellisense from "./Intellisense.stories";
import * as Length from "./Length.stories";
import * as Linter from "./Linter.stories";
import * as MooresLaw from "./MooresLaw.stories";
import * as NpmAudit from "./NpmAudit.stories";
import * as Overclock from "./Overclock.stories";
import * as PlanningPoker from "./PlanningPoker.stories";
import * as Prefetch from "./Prefetch.stories";
import * as Prettierrc from "./Prettierrc.stories";
import * as Sla from "./Sla.stories";
import * as Strict from "./Strict.stories";
import * as Telemetry from "./Telemetry.stories";
import * as TryCatch from "./TryCatch.stories";
import * as UnitTests from "./UnitTests.stories";
import * as VendorLockIn from "./VendorLockIn.stories";
import * as VolkswagenCi from "./VolkswagenCi.stories";
import * as Wtfpl from "./Wtfpl.stories";
import * as Yagni from "./Yagni.stories";
import * as YarnLock from "./YarnLock.stories";

const PAGES = {
	AbTest,
	AgentsMd,
	AndAnd,
	Cache,
	CodeCoverage,
	ColdStart,
	Database,
	Dependabot,
	Deprecated,
	DryRun,
	FocusFamily,
	Freemium,
	GarbageCollection,
	GitRebase,
	IndexedDb,
	Intellisense,
	Length,
	Linter,
	MooresLaw,
	NpmAudit,
	Overclock,
	PlanningPoker,
	Prefetch,
	Prettierrc,
	Sla,
	Strict,
	Telemetry,
	TryCatch,
	UnitTests,
	VendorLockIn,
	VolkswagenCi,
	Wtfpl,
	Yagni,
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

	it("arms Linter's press on a JS poll and on a CSS poll alike", () => {
		const onJs = render(
			Linter.CrossesOutAWrongAnswer.render?.({}, {} as never)
		);
		expect(onJs.container.textContent).toContain("lint 8 KB");
		cleanup();

		const onCss = render(Linter.LintsAnyCategory.render?.({}, {} as never));
		expect(onCss.container.textContent).toContain("lint 8 KB");
	});

	it("prices Linter's ladder by version: carried at v1, reset at v2, halved at v3", () => {
		const carried = render(
			Linter.FeeCarriesAcrossTheClearAtV1.render?.({}, {} as never)
		);
		expect(carried.container.textContent).toContain("lint 16 KB");
		cleanup();

		const reset = render(Linter.ResetsEachGateAtV2.render?.({}, {} as never));
		expect(reset.container.textContent).toContain("lint 8 KB");
		cleanup();

		const halved = render(Linter.HalfPriceAtV3.render?.({}, {} as never));
		expect(halved.container.textContent).toContain("lint 4 KB");
	});

	it("names an outage's target in prep once npm audit is installed", () => {
		const named = render(
			NpmAudit.NamesTheOutageTargetInPrep.render?.({}, {} as never)
		);
		expect(named.container.textContent).toMatch(/takes .+ offline/);
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
			Linter.CrossesOutAWrongAnswer.render?.({}, {} as never)
		);
		expect(armed.container.textContent).toContain("1 ready");
		cleanup();

		const idle = render(NpmAudit.SitsThePollOut.render?.({}, {} as never));
		expect(idle.container.textContent).not.toContain("ready");
	});
});
