import { createMockDataFactory } from "@/src/test/createMockDataFactory";
import { Run, RunRecord } from "~/domains/runs/models/run";
import { STORAGE_UNITS } from "~/lib/storage";

const run: Run = {
	id: 1,
	userId: "test-user-id",
	status: "active",
	storageLimit: STORAGE_UNITS.MB,
	activeConfigIds: [],
	startedAt: new Date("2024-01-01T00:00:00Z"),
	finishedAt: null,
	createdAt: new Date("2024-01-01T00:00:00Z"),
	updatedAt: new Date("2024-01-01T00:00:00Z"),
};

const runRecord: RunRecord = {
	id: 1,
	user_id: "test-user-id",
	status: "active",
	storage_limit: STORAGE_UNITS.MB,
	active_config_ids: [],
	started_at: new Date("2024-01-01T00:00:00Z"),
	finished_at: null,
	created_at: new Date("2024-01-01T00:00:00Z"),
	updated_at: new Date("2024-01-01T00:00:00Z"),
};

export const createMockRun = createMockDataFactory<Run>(run);
export const createMockRunRecord = createMockDataFactory<RunRecord>(runRecord);

export const createMockRunArray = (count: number = 3): Run[] => {
	return Array.from({ length: count }, (_, i) =>
		createMockRun({
			id: i + 1,
		})
	);
};

export const createMockRunRecordArray = (count: number = 3): RunRecord[] => {
	return Array.from({ length: count }, (_, i) =>
		createMockRunRecord({
			id: i + 1,
		})
	);
};