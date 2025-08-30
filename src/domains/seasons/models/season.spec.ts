import { describe, it, expect } from "vitest";
import {
	Season,
	seasonToDTO,
	seasonFromDTO,
	seasonsToDTOs,
	seasonsFromDTOs,
	createSeason,
	createMockSeason,
	createMockSeasonRecord,
} from "./season";

describe("Season Model", () => {
	describe("seasonToDTO", () => {
		it("transforms database record to DTO", () => {
			const record = createMockSeasonRecord();
			const dto = seasonToDTO(record);

			expect(dto.id).toBe(record.id);
			expect(dto.name).toBe(record.name);
			expect(dto.description).toBe(record.description);
			expect(dto.status).toBe(record.status);
			expect(dto.startDate).toEqual(record.start_date);
			expect(dto.endDate).toEqual(record.end_date);
			expect(dto.createdAt).toEqual(record.created_at);
			expect(dto.updatedAt).toEqual(record.updated_at);
		});
	});

	describe("seasonFromDTO", () => {
		it("transforms DTO to database record", () => {
			const dto = createMockSeason();
			const record = seasonFromDTO(dto);

			expect(record.id).toBe(dto.id);
			expect(record.name).toBe(dto.name);
			expect(record.description).toBe(dto.description);
			expect(record.status).toBe(dto.status);
			expect(record.start_date).toEqual(dto.startDate);
			expect(record.end_date).toEqual(dto.endDate);
			expect(record.created_at).toEqual(dto.createdAt);
			expect(record.updated_at).toEqual(dto.updatedAt);
		});
	});

	describe("seasonsToDTOs", () => {
		it("transforms array of records to DTOs", () => {
			const records = [
				createMockSeasonRecord(),
				createMockSeasonRecord({ id: 2 }),
			];
			const dtos = seasonsToDTOs(records);

			expect(dtos).toHaveLength(2);
			expect(dtos[0].id).toBe(1);
			expect(dtos[1].id).toBe(2);
		});
	});

	describe("seasonsFromDTOs", () => {
		it("transforms array of DTOs to records", () => {
			const dtos = [createMockSeason(), createMockSeason({ id: 2 })];
			const records = seasonsFromDTOs(dtos);

			expect(records).toHaveLength(2);
			expect(records[0].id).toBe(1);
			expect(records[1].id).toBe(2);
		});
	});

	describe("createSeason", () => {
		it("creates season with default values", () => {
			const season = createSeason();

			expect(season.id).toBe(0);
			expect(season.name).toBe("");
			expect(season.description).toBe(null);
			expect(season.status).toBe("upcoming");
			expect(season.startDate).toBeInstanceOf(Date);
			expect(season.endDate).toBeInstanceOf(Date);
			expect(season.endDate.getTime()).toBeGreaterThan(
				season.startDate.getTime()
			);
		});

		it("creates season with provided values", () => {
			const customSeason = createSeason({
				name: "Banjo-Kazooie Season",
				description: "A season inspired by Rare classics",
				status: "active",
			});

			expect(customSeason.name).toBe("Banjo-Kazooie Season");
			expect(customSeason.description).toBe(
				"A season inspired by Rare classics"
			);
			expect(customSeason.status).toBe("active");
		});
	});

	describe("createMockSeason", () => {
		it("creates mock season with Christmas dates", () => {
			const season = createMockSeason();

			expect(season.name).toBe("Season 1: Core Loop");
			expect(season.status).toBe("active");
			expect(season.startDate.getMonth()).toBe(11); // December (0-indexed)
			expect(season.startDate.getDate()).toBe(13); // 13th
			expect(season.endDate.getMonth()).toBe(11); // December
			expect(season.endDate.getDate()).toBe(26); // Christmas
		});
	});

	describe("createMockSeasonRecord", () => {
		it("creates mock season record with proper database structure", () => {
			const record = createMockSeasonRecord();

			expect(record.name).toBe("Season 1: Core Loop");
			expect(record.status).toBe("active");
			expect(record.start_date).toBeInstanceOf(Date);
			expect(record.end_date).toBeInstanceOf(Date);
		});
	});
});
