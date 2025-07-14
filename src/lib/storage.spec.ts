import { describe, it, expect } from "vitest";
import {
  formatStorage,
  parseStorage,
  getStorageUsagePercentage,
  canAddToStorage,
  STORAGE_UNITS,
} from "./storage";

describe("Storage utilities", () => {
  describe("formatStorage", () => {
    it("formats bytes correctly", () => {
      expect(formatStorage(0)).toBe("0 B");
      expect(formatStorage(512)).toBe("512 B");
      expect(formatStorage(1023)).toBe("1023 B");
    });

    it("formats KB correctly", () => {
      expect(formatStorage(1024)).toBe("1 KB");
      expect(formatStorage(1536)).toBe("1.5 KB");
      expect(formatStorage(2048)).toBe("2 KB");
    });

    it("formats MB correctly", () => {
      expect(formatStorage(STORAGE_UNITS.MB)).toBe("1 MB");
      expect(formatStorage(1.5 * STORAGE_UNITS.MB)).toBe("1.5 MB");
      expect(formatStorage(2 * STORAGE_UNITS.MB)).toBe("2 MB");
    });

    it("formats GB correctly", () => {
      expect(formatStorage(STORAGE_UNITS.GB)).toBe("1.0 GB");
      expect(formatStorage(1.5 * STORAGE_UNITS.GB)).toBe("1.5 GB");
    });
  });

  describe("parseStorage", () => {
    it("parses bytes correctly", () => {
      expect(parseStorage("512")).toBe(512);
      expect(parseStorage("512B")).toBe(512);
      expect(parseStorage("512 B")).toBe(512);
    });

    it("parses KB correctly", () => {
      expect(parseStorage("1KB")).toBe(1024);
      expect(parseStorage("1.5KB")).toBe(1536);
      expect(parseStorage("2 KB")).toBe(2048);
    });

    it("parses MB correctly", () => {
      expect(parseStorage("1MB")).toBe(STORAGE_UNITS.MB);
      expect(parseStorage("1.5 MB")).toBe(1.5 * STORAGE_UNITS.MB);
    });

    it("throws error for invalid format", () => {
      expect(() => parseStorage("invalid")).toThrow("Invalid storage format");
      expect(() => parseStorage("1.5.5MB")).toThrow("Invalid storage format");
    });
  });

  describe("getStorageUsagePercentage", () => {
    it("calculates percentage correctly", () => {
      expect(getStorageUsagePercentage(512, 1024)).toBe(50);
      expect(getStorageUsagePercentage(1024, 1024)).toBe(100);
      expect(getStorageUsagePercentage(0, 1024)).toBe(0);
    });

    it("handles zero total storage", () => {
      expect(getStorageUsagePercentage(100, 0)).toBe(0);
    });
  });

  describe("canAddToStorage", () => {
    it("returns true when storage is available", () => {
      expect(canAddToStorage(512, 256, 1024)).toBe(true);
      expect(canAddToStorage(0, 1024, 1024)).toBe(true);
    });

    it("returns false when storage would be exceeded", () => {
      expect(canAddToStorage(512, 513, 1024)).toBe(false);
      expect(canAddToStorage(1024, 1, 1024)).toBe(false);
    });

    it("returns true when exactly at limit", () => {
      expect(canAddToStorage(512, 512, 1024)).toBe(true);
    });
  });
});