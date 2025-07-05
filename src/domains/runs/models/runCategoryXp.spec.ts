import { describe, it, expect } from "vitest";
import { 
	runCategoryXpFactory, 
	runCategoryXpToDTO, 
	runCategoryXpFromDTO, 
	runCategoryXpsToDTOs, 
	runCategoryXpsFromDTOs, 
	createRunCategoryXp,
} from "./runCategoryXp";
import { createMockRunCategoryXp, createMockRunCategoryXpRecord } from "../factories/runCategoryXp";

describe("RunCategoryXp Model", () => {
	describe("runCategoryXpToDTO", () => {
		it("converts database record to DTO", () => {
			const record = createMockRunCategoryXpRecord();
			const result = runCategoryXpToDTO(record);
			
			expect(result.id).toBe(record.id);
			expect(result.runId).toBe(record.run_id);
			expect(result.categoryCode).toBe(record.category_code);
			expect(result.currentXp).toBe(record.current_xp);
			expect(result.currentStreak).toBe(record.current_streak);
			expect(result.bestStreak).toBe(record.best_streak);
			expect(result.createdAt).toBe(record.created_at);
			expect(result.updatedAt).toBe(record.updated_at);
		});

		it("handles null timestamps", () => {
			const record = createMockRunCategoryXpRecord({
				created_at: null,
				updated_at: null,
			});

			const result = runCategoryXpToDTO(record);
			expect(result.createdAt).toBeInstanceOf(Date);
			expect(result.updatedAt).toBeNull();
		});
	});

	describe("runCategoryXpFromDTO", () => {
		it("converts DTO to database record", () => {
			const dto = createMockRunCategoryXp();
			const result = runCategoryXpFromDTO(dto);
			
			expect(result.id).toBe(dto.id);
			expect(result.run_id).toBe(dto.runId);
			expect(result.category_code).toBe(dto.categoryCode);
			expect(result.current_xp).toBe(dto.currentXp);
			expect(result.current_streak).toBe(dto.currentStreak);
			expect(result.best_streak).toBe(dto.bestStreak);
			expect(result.created_at).toBe(dto.createdAt);
			expect(result.updated_at).toBe(dto.updatedAt);
		});
	});

	describe("runCategoryXpsToDTOs", () => {
		it("converts array of records to DTOs", () => {
			const records = [
				createMockRunCategoryXpRecord(),
				createMockRunCategoryXpRecord({ id: 2, category_code: "css" }),
			];
			const result = runCategoryXpsToDTOs(records);
			
			expect(result).toHaveLength(2);
			expect(result[0].id).toBe(1);
			expect(result[1].id).toBe(2);
			expect(result[1].categoryCode).toBe("css");
		});

		it("handles empty array", () => {
			const result = runCategoryXpsToDTOs([]);
			expect(result).toEqual([]);
		});
	});

	describe("runCategoryXpsFromDTOs", () => {
		it("converts array of DTOs to records", () => {
			const dtos = [
				createMockRunCategoryXp(),
				createMockRunCategoryXp({ id: 2, categoryCode: "css" }),
			];
			const result = runCategoryXpsFromDTOs(dtos);
			
			expect(result).toHaveLength(2);
			expect(result[0].id).toBe(1);
			expect(result[1].id).toBe(2);
			expect(result[1].category_code).toBe("css");
		});

		it("handles empty array", () => {
			const result = runCategoryXpsFromDTOs([]);
			expect(result).toEqual([]);
		});
	});

	describe("createRunCategoryXp", () => {
		it("creates a new run category XP with default values", () => {
			const result = createRunCategoryXp();
			
			expect(result.id).toBe(0);
			expect(result.runId).toBe(0);
			expect(result.categoryCode).toBe("");
			expect(result.currentXp).toBe(0);
			expect(result.currentStreak).toBe(0);
			expect(result.bestStreak).toBe(0);
			expect(result.createdAt).toBeInstanceOf(Date);
			expect(result.updatedAt).toBeInstanceOf(Date);
		});

		it("merges partial values with defaults", () => {
			const result = createRunCategoryXp({
				runId: 123,
				categoryCode: "typescript",
				currentXp: 50,
			});
			
			expect(result.runId).toBe(123);
			expect(result.categoryCode).toBe("typescript");
			expect(result.currentXp).toBe(50);
			expect(result.id).toBe(0);
			expect(result.currentStreak).toBe(0);
		});
	});

	describe("runCategoryXpFactory", () => {
		it("exposes all factory methods", () => {
			expect(runCategoryXpFactory.toDTO).toBe(runCategoryXpToDTO);
			expect(runCategoryXpFactory.fromDTO).toBe(runCategoryXpFromDTO);
			expect(runCategoryXpFactory.toDTOs).toBe(runCategoryXpsToDTOs);
			expect(runCategoryXpFactory.fromDTOs).toBe(runCategoryXpsFromDTOs);
			expect(runCategoryXpFactory.create).toBe(createRunCategoryXp);
		});
	});
});