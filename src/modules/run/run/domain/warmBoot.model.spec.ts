import { describe, expect, it } from "vitest";

import { STORAGE_UNITS } from "~/shared/lib/storage";

import {
	BOOT_CACHE_RUNGS,
	EXTEND_CARRY_BYTES,
	PIN_CARRY_BYTES,
} from "~/modules/run/run/domain/rules.model";
import { createRun } from "~/modules/run/run/domain/run.model";
import { handed, pool } from "~/modules/run/run/domain/run.factory";
import {
	bootRun,
	carries,
	warmBootOrderOf,
	warmBootRefusalOf,
} from "~/modules/run/run/domain/warmBoot.model";

const EVERYTHING = ["bootCache", "extend", "pin"];

describe("warmBootRefusalOf", () => {
	it("refuses an empty pick: there is nothing to pay for", () => {
		expect(warmBootRefusalOf({ serviceIds: [] }, EVERYTHING)).toBe("empty");
	});

	it("refuses a rung the ladder does not have", () => {
		expect(
			warmBootRefusalOf({ bootCacheRung: 3, serviceIds: [] }, EVERYTHING)
		).toBe("no-rung");
	});

	it("refuses Boot Cache until the account has unlocked it", () => {
		expect(warmBootRefusalOf({ bootCacheRung: 0, serviceIds: [] }, [])).toBe(
			"locked"
		);
	});

	it("refuses a service picked twice", () => {
		expect(
			warmBootRefusalOf({ serviceIds: ["extend", "extend"] }, EVERYTHING)
		).toBe("repeated");
	});

	it("refuses a service that is never carried, Rebuild and Boot Cache included", () => {
		expect(warmBootRefusalOf({ serviceIds: ["rebuild"] }, EVERYTHING)).toBe(
			"uncarriable"
		);
		expect(warmBootRefusalOf({ serviceIds: ["bootCache"] }, EVERYTHING)).toBe(
			"uncarriable"
		);
	});

	it("refuses a carried service the account has not unlocked", () => {
		expect(warmBootRefusalOf({ serviceIds: ["pin"] }, ["extend"])).toBe(
			"locked"
		);
	});

	it("accepts a rung and every unlocked carried service together", () => {
		expect(
			warmBootRefusalOf(
				{ bootCacheRung: 1, serviceIds: ["extend", "pin"] },
				EVERYTHING
			)
		).toBeNull();
	});
});

describe("warmBootOrderOf", () => {
	it("prices a rung and the carried services together, in archive bytes", () => {
		expect(
			warmBootOrderOf({ bootCacheRung: 1, serviceIds: ["extend", "pin"] })
		).toEqual({
			storageKb: 128,
			serviceIds: ["extend", "pin"],
			archiveBytes:
				256 * STORAGE_UNITS.KB + EXTEND_CARRY_BYTES + PIN_CARRY_BYTES,
		});
	});

	it("banks nothing when no rung is picked", () => {
		expect(warmBootOrderOf({ serviceIds: ["extend"] })).toEqual({
			storageKb: 0,
			serviceIds: ["extend"],
			archiveBytes: EXTEND_CARRY_BYTES,
		});
	});

	it("reads the rung's own figures", () => {
		expect(warmBootOrderOf({ bootCacheRung: 2, serviceIds: [] })).toMatchObject(
			{
				storageKb: BOOT_CACHE_RUNGS[2]?.storageKb,
				archiveBytes: BOOT_CACHE_RUNGS[2]?.archiveBytes,
			}
		);
	});
});

describe("carries", () => {
	it("reads false off a run that never booted, however the field is spelled", () => {
		expect(carries(createRun(pool(5), handed), "extend")).toBe(false);
		expect(carries({ warmBoot: null }, "extend")).toBe(false);
	});

	it("reads what the boot carried in", () => {
		const booted = bootRun(createRun(pool(5), handed), {
			storageKb: 0,
			serviceIds: ["pin"],
			archiveBytes: PIN_CARRY_BYTES,
		});

		expect(carries(booted, "pin")).toBe(true);
		expect(carries(booted, "extend")).toBe(false);
	});
});

describe("bootRun", () => {
	const fresh = createRun(pool(5), handed);
	const boot = {
		storageKb: 128,
		serviceIds: ["extend"],
		archiveBytes: 256 * STORAGE_UNITS.KB + EXTEND_CARRY_BYTES,
	} as const;

	it("banks the rung's storage, records the boot and logs what was paid", () => {
		const booted = bootRun(fresh, boot);

		expect(booted.storage).toBe(128);
		expect(booted.warmBoot).toEqual(boot);
		expect(booted.log[booted.log.length - 1]).toBe(
			"Warm boot: 128 KB banked, carrying Extend the registry (-320 KB archive)."
		);
	});

	it("boots a run once: a second boot is refused untouched", () => {
		const booted = bootRun(fresh, boot);

		expect(bootRun(booted, boot)).toBe(booted);
	});
});
