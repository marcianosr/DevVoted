import { describe, it, expect } from "vitest";

import {
	runCategoryCoverageFactory,
	runCategoryCoverageToDTO,
	runCategoryCoverageFromDTO,
	runCategoryCoveragesToDTOs,
	runCategoryCoveragesFromDTOs,
	createRunCategoryCoverage,
} from "./runCategoryCoverage.model";
import {
	createMockRunCategoryCoverage,
	createMockRunCategoryCoverageRecord,
} from "./runCategoryCoverage.mock";

describe("RunCategoryCoverage Model", () => {
	describe("runCategoryCoverageToDTO", () => {
		it("converts database record to DTO", () => {
			const record = createMockRunCategoryCoverageRecord();
			const result = runCategoryCoverageToDTO(record);

			expect(result.id).toBe(record.id);
			expect(result.runId).toBe(record.run_id);
			expect(result.categoryCode).toBe(record.category_code);
			expect(result.currentCoverage).toBe(record.current_coverage);
			expect(result.currentStreak).toBe(record.current_streak);
			expect(result.bestStreak).toBe(record.best_streak);
			expect(result.createdAt).toBe(record.created_at);
			expect(result.updatedAt).toBe(record.updated_at);
		});

		it("handles null timestamps", () => {
			const record = createMockRunCategoryCoverageRecord({
				created_at: null,
				updated_at: null,
			});

			const result = runCategoryCoverageToDTO(record);
			expect(result.createdAt).toBeInstanceOf(Date);
			expect(result.updatedAt).toBeNull();
		});
	});

	describe("runCategoryCoverageFromDTO", () => {
		it("converts DTO to database record", () => {
			const dto = createMockRunCategoryCoverage();
			const result = runCategoryCoverageFromDTO(dto);

			expect(result.id).toBe(dto.id);
			expect(result.run_id).toBe(dto.runId);
			expect(result.category_code).toBe(dto.categoryCode);
			expect(result.current_coverage).toBe(dto.currentCoverage);
			expect(result.current_streak).toBe(dto.currentStreak);
			expect(result.best_streak).toBe(dto.bestStreak);
			expect(result.created_at).toBe(dto.createdAt);
			expect(result.updated_at).toBe(dto.updatedAt);
		});
	});

	describe("runCategoryCoveragesToDTOs", () => {
		it("converts array of records to DTOs", () => {
			const records = [
				createMockRunCategoryCoverageRecord(),
				createMockRunCategoryCoverageRecord({ id: 2, category_code: "css" }),
			];
			const result = runCategoryCoveragesToDTOs(records);

			expect(result).toHaveLength(2);
			expect(result[0].id).toBe(1);
			expect(result[1].id).toBe(2);
			expect(result[1].categoryCode).toBe("css");
		});

		it("handles empty array", () => {
			const result = runCategoryCoveragesToDTOs([]);
			expect(result).toEqual([]);
		});
	});

	describe("runCategoryCoveragesFromDTOs", () => {
		it("converts array of DTOs to records", () => {
			const dtos = [
				createMockRunCategoryCoverage(),
				createMockRunCategoryCoverage({ id: 2, categoryCode: "css" }),
			];
			const result = runCategoryCoveragesFromDTOs(dtos);

			expect(result).toHaveLength(2);
			expect(result[0].id).toBe(1);
			expect(result[1].id).toBe(2);
			expect(result[1].category_code).toBe("css");
		});

		it("handles empty array", () => {
			const result = runCategoryCoveragesFromDTOs([]);
			expect(result).toEqual([]);
		});
	});

	describe("createRunCategoryCoverage", () => {
		it("creates a new run category coverage with default values", () => {
			const result = createRunCategoryCoverage();

			expect(result.id).toBe(0);
			expect(result.runId).toBe(0);
			expect(result.categoryCode).toBe("js");
			expect(result.currentCoverage).toBe(0);
			expect(result.currentStreak).toBe(0);
			expect(result.bestStreak).toBe(0);
			expect(result.createdAt).toBeInstanceOf(Date);
			expect(result.updatedAt).toBeInstanceOf(Date);
		});

		it("merges partial values with defaults", () => {
			const result = createRunCategoryCoverage({
				runId: 123,
				categoryCode: "ts",
				currentCoverage: 50,
			});

			expect(result.runId).toBe(123);
			expect(result.categoryCode).toBe("ts");
			expect(result.currentCoverage).toBe(50);
			expect(result.id).toBe(0);
			expect(result.currentStreak).toBe(0);
		});
	});

	describe("runCategoryCoverageFactory", () => {
		it("exposes all factory methods", () => {
			expect(runCategoryCoverageFactory.toDTO).toBe(runCategoryCoverageToDTO);
			expect(runCategoryCoverageFactory.fromDTO).toBe(
				runCategoryCoverageFromDTO
			);
			expect(runCategoryCoverageFactory.toDTOs).toBe(
				runCategoryCoveragesToDTOs
			);
			expect(runCategoryCoverageFactory.fromDTOs).toBe(
				runCategoryCoveragesFromDTOs
			);
			expect(runCategoryCoverageFactory.create).toBe(createRunCategoryCoverage);
		});
	});
});
