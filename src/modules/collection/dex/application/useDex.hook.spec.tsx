import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getConfigdex } from "~/modules/collection/dex/application/configdex.serverfn";
import { getPolldex } from "~/modules/collection/dex/application/polldex.serverfn";
import { getGateRuns } from "~/modules/collection/dex/application/runHistory.serverfn";
import { useDex } from "~/modules/collection/dex/application/useDex.hook";
import { auditdex } from "~/modules/collection/dex/domain/auditdex.model";
import { configdex } from "~/modules/collection/dex/domain/configdex.model";
import { controldex } from "~/modules/collection/dex/domain/controldex.model";
import { gatedex } from "~/modules/collection/dex/domain/gatedex.model";
import type { PolldexEntry } from "~/modules/collection/dex/domain/polldex.model";
import type { RunHistoryEntry } from "~/modules/collection/dex/domain/runHistory.model";
import { getOwnedSwatches } from "~/modules/run/run/application/run.serverfn";
import { getServiceUnlocks } from "~/modules/run/shop/application/serviceUnlock.serverfn";
import { withQueryClient } from "~/test/queryClient.harness";

vi.mock("~/modules/collection/dex/application/polldex.serverfn", () => ({
	getPolldex: vi.fn(),
}));
vi.mock("~/modules/collection/dex/application/configdex.serverfn", () => ({
	getConfigdex: vi.fn(),
}));
vi.mock("~/modules/collection/dex/application/runHistory.serverfn", () => ({
	getGateRuns: vi.fn(),
}));
vi.mock("~/modules/run/run/application/run.serverfn", () => ({
	getOwnedSwatches: vi.fn(),
}));
vi.mock("~/modules/run/shop/application/serviceUnlock.serverfn", () => ({
	getServiceUnlocks: vi.fn(),
}));

const ASH = "ash-ketchum";

const PEWTER_POLL: PolldexEntry = {
	id: 1,
	pollNumber: 1,
	categoryCode: "ts",
	seen: true,
	question: "Which utility type makes every property optional?",
	timesSeen: 4,
	answeredCount: 4,
	correctCount: 3,
	accuracy: 75,
};

const CERULEAN_RUN: RunHistoryEntry = {
	runId: 151,
	endedAt: new Date("2026-05-13"),
	gatesCleared: 2,
	swatchGates: [0, 1],
	coverage: 64,
	band: "healthy",
	won: false,
	heldBy: null,
};

const OWNED_SWATCHES = ["swatch-pallet", "swatch-boulder"];
const UNLOCKS = [{ configId: "eslint", viaMetric: null }];
const PROGRESS = [{ metric: "rebuilds", count: 3 }];

const wrapper = ({ children }: { children: ReactNode }) =>
	withQueryClient(children);

const renderDex = () => renderHook(() => useDex(ASH), { wrapper });

const answerEverything = () => {
	vi.mocked(getPolldex).mockResolvedValue({
		success: true,
		data: { entries: [PEWTER_POLL] },
	});
	vi.mocked(getOwnedSwatches).mockResolvedValue({
		success: true,
		data: { ownedSwatchIds: OWNED_SWATCHES },
	});
	vi.mocked(getGateRuns).mockResolvedValue({
		success: true,
		data: { history: [CERULEAN_RUN] },
	});
	vi.mocked(getConfigdex).mockResolvedValue({
		success: true,
		data: { unlocks: UNLOCKS, progress: PROGRESS },
	});
	vi.mocked(getServiceUnlocks).mockResolvedValue({
		success: true,
		data: { unlockedServiceIds: ["extend"] },
	});
};

describe("useDex", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		answerEverything();
	});

	it("reads every tab's entries from the viewer's own answers", async () => {
		const { result } = renderDex();

		await waitFor(() => expect(result.current.runs).toEqual([CERULEAN_RUN]));
		expect(result.current.polls).toEqual([PEWTER_POLL]);
		expect(result.current.configs).toEqual(configdex(UNLOCKS, PROGRESS));
		expect(result.current.controls).toEqual(controldex(["extend"]));
		expect(result.current.gates).toEqual(gatedex(OWNED_SWATCHES));
		expect(result.current.audits).toEqual(auditdex(gatedex(OWNED_SWATCHES)));
	});

	it("empties only the tab whose answer failed", async () => {
		vi.mocked(getPolldex).mockResolvedValue({
			success: false,
			error: "Pokédex offline",
		});

		const { result } = renderDex();

		await waitFor(() =>
			expect(result.current.controls).toEqual(controldex(["extend"]))
		);
		expect(result.current.polls).toEqual([]);
	});

	it("lists the roster with only starters held before any answer lands", () => {
		const { result } = renderDex();

		expect(result.current.polls).toEqual([]);
		expect(result.current.configs).toEqual([]);
		expect(result.current.controls).toEqual(controldex([]));
		expect(result.current.gates).toEqual(gatedex([]));
		expect(result.current.runs).toEqual([]);
	});
});
