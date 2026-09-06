import { describe, expect, it } from "vitest";

import {
	configdex,
	type ConfigdexEntry,
	grantedCountIn,
} from "~/modules/collection/dex/domain/configdex.model";
import { CONFIG_LIST } from "~/modules/run/config/domain/configRoster.model";
import { FREE_CONFIG_IDS } from "~/modules/run/config/domain/configUnlock.model";
import { STARTER_PROVENANCE } from "~/modules/run/config/domain/unlockCaption.model";

const entryOf = (
	entries: readonly ConfigdexEntry[],
	configId: string
): ConfigdexEntry => {
	const found = entries.find((entry) =>
		entry.state === "granted"
			? entry.config.id === configId
			: entry.id === configId
	);
	if (!found) throw new Error(`${configId} missing from the dex`);
	return found;
};

describe(configdex, () => {
	it("catalogues the whole roster in roster order", () => {
		const entries = configdex([], []);
		expect(entries).toHaveLength(CONFIG_LIST.length);
	});

	it("shows the free set granted as starters even without ledger rows", () => {
		const entries = configdex([], []);
		for (const configId of FREE_CONFIG_IDS) {
			expect(entryOf(entries, configId)).toMatchObject({
				state: "granted",
				starter: true,
				provenance: STARTER_PROVENANCE,
			});
		}
	});

	it("locks an unearned config behind both paths with live counts", () => {
		const entries = configdex(
			[],
			[
				{ metric: "community-peeks", count: 3 },
				{ metric: "polls-answered", count: 43 },
			]
		);
		expect(entryOf(entries, "telemetry")).toEqual({
			state: "locked",
			id: "telemetry",
			slots: 2,
			thematic: {
				kind: "counted",
				text: "Peek the community split 5 times",
				count: 3,
				target: 5,
			},
			fallback: {
				kind: "counted",
				text: "Answer 100 polls",
				count: 43,
				target: 100,
			},
		});
	});

	it("defaults an untouched metric to zero progress", () => {
		const locked = entryOf(configdex([], []), "telemetry");
		if (locked.state !== "locked") throw new Error("expected locked");
		expect(locked.thematic).toMatchObject({ count: 0 });
		expect(locked.fallback).toMatchObject({ count: 0 });
	});

	it("renders a one-shot path as a checkbox without counts", () => {
		const locked = entryOf(configdex([], []), "volkswagen-ci");
		if (locked.state !== "locked") throw new Error("expected locked");
		expect(locked.thematic).toEqual({
			kind: "one-shot",
			text: "Clear Marsh's Mirror audit without a miss",
			done: false,
		});
	});

	it("flips an earned row to its thematic provenance", () => {
		const entries = configdex(
			[{ configId: "telemetry", viaMetric: "community-peeks" }],
			[]
		);
		expect(entryOf(entries, "telemetry")).toMatchObject({
			state: "granted",
			starter: false,
			provenance: "Earned: peeked the community split 5 times",
		});
	});

	it("prints a fallback grant as the polls it took", () => {
		const entries = configdex(
			[{ configId: "telemetry", viaMetric: "polls-answered" }],
			[]
		);
		expect(entryOf(entries, "telemetry")).toMatchObject({
			provenance: "Earned: answered 100 polls",
		});
	});

	it("exposes no config on a locked entry", () => {
		const locked = entryOf(configdex([], []), "telemetry");
		expect(locked.config).toBeUndefined();
	});
});

describe(grantedCountIn, () => {
	it("counts the granted entries only", () => {
		const entries = configdex(
			[{ configId: "telemetry", viaMetric: "community-peeks" }],
			[]
		);
		expect(grantedCountIn(entries)).toBe(FREE_CONFIG_IDS.length + 1);
	});
});
