import { describe, it, expect } from "vitest";

import {
	runFactory,
	runToDTO,
	runFromDTO,
	runsToDTOs,
	runsFromDTOs,
	createRun,
	createMockRun,
	createMockRunRecord,
} from "./run";

describe("Run Model", () => {
	describe("runToDTO", () => {
		it("converts database record to DTO", () => {
			const record = createMockRunRecord();
			const result = runToDTO(record);

			expect(result.id).toBe(record.id);
			expect(result.userId).toBe(record.user_id);
			expect(result.status).toBe(record.status);
			expect(result.startedAt).toBe(record.started_at);
			expect(result.finishedAt).toBe(record.finished_at);
			expect(result.createdAt).toBe(record.created_at);
			expect(result.updatedAt).toBe(record.updated_at);
		});

		it("handles null timestamps", () => {
			const record = createMockRunRecord({
				started_at: null,
				finished_at: null,
				created_at: null,
				updated_at: null,
			});

			const result = runToDTO(record);
			expect(result.startedAt).toBeInstanceOf(Date);
			expect(result.createdAt).toBeInstanceOf(Date);
			expect(result.finishedAt).toBeNull();
			expect(result.updatedAt).toBeNull();
		});
	});

	describe("runFromDTO", () => {
		it("converts DTO to database record", () => {
			const dto = createMockRun();
			const result = runFromDTO(dto);

			expect(result.id).toBe(dto.id);
			expect(result.user_id).toBe(dto.userId);
			expect(result.status).toBe(dto.status);
			expect(result.started_at).toBe(dto.startedAt);
			expect(result.finished_at).toBe(dto.finishedAt);
			expect(result.created_at).toBe(dto.createdAt);
			expect(result.updated_at).toBe(dto.updatedAt);
		});
	});

	describe("runsToDTOs", () => {
		it("converts array of records to DTOs", () => {
			const records = [createMockRunRecord(), createMockRunRecord({ id: 2 })];
			const result = runsToDTOs(records);

			expect(result).toHaveLength(2);
			expect(result[0].id).toBe(1);
			expect(result[1].id).toBe(2);
		});

		it("handles empty array", () => {
			const result = runsToDTOs([]);
			expect(result).toEqual([]);
		});
	});

	describe("runsFromDTOs", () => {
		it("converts array of DTOs to records", () => {
			const dtos = [createMockRun(), createMockRun({ id: 2 })];
			const result = runsFromDTOs(dtos);

			expect(result).toHaveLength(2);
			expect(result[0].id).toBe(1);
			expect(result[1].id).toBe(2);
		});

		it("handles empty array", () => {
			const result = runsFromDTOs([]);
			expect(result).toEqual([]);
		});
	});

	describe("createRun", () => {
		it("creates a new run with default values", () => {
			const result = createRun();

			expect(result.id).toBe(0);
			expect(result.userId).toBe("");
			expect(result.status).toBe("active");
			expect(result.startedAt).toBeInstanceOf(Date);
			expect(result.finishedAt).toBeNull();
			expect(result.createdAt).toBeInstanceOf(Date);
			expect(result.updatedAt).toBeInstanceOf(Date);
		});

		it("merges partial values with defaults", () => {
			const result = createRun({
				userId: "custom-user-id",
				status: "finished",
			});

			expect(result.userId).toBe("custom-user-id");
			expect(result.status).toBe("finished");
			expect(result.id).toBe(0);
		});
	});

	describe("runFactory", () => {
		it("exposes all factory methods", () => {
			expect(runFactory.toDTO).toBe(runToDTO);
			expect(runFactory.fromDTO).toBe(runFromDTO);
			expect(runFactory.toDTOs).toBe(runsToDTOs);
			expect(runFactory.fromDTOs).toBe(runsFromDTOs);
			expect(runFactory.create).toBe(createRun);
		});
	});
});
