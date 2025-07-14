/**
 * Storage utility functions for formatting and converting storage sizes
 * Used in the economy system where configs have storage costs
 */

const STORAGE_UNITS = {
  BYTE: 1,
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
} as const;

/**
 * Formats storage size in bytes to human-readable format
 * @param bytes - Storage size in bytes
 * @returns Formatted string (e.g., "1.5 MB", "512 KB")
 */
export function formatStorage(bytes: number): string {
  if (bytes === 0) return "0 B";
  
  if (bytes >= STORAGE_UNITS.GB) {
    return `${(bytes / STORAGE_UNITS.GB).toFixed(1)} GB`;
  }
  
  if (bytes >= STORAGE_UNITS.MB) {
    const mb = bytes / STORAGE_UNITS.MB;
    return mb % 1 === 0 ? `${mb} MB` : `${mb.toFixed(1)} MB`;
  }
  
  if (bytes >= STORAGE_UNITS.KB) {
    const kb = bytes / STORAGE_UNITS.KB;
    return kb % 1 === 0 ? `${kb} KB` : `${kb.toFixed(1)} KB`;
  }
  
  return `${bytes} B`;
}

/**
 * Converts storage string to bytes
 * @param storageString - String like "1MB", "512KB", etc.
 * @returns Size in bytes
 */
export function parseStorage(storageString: string): number {
  const normalized = storageString.toUpperCase().trim();
  const match = normalized.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)?$/);
  
  if (!match) {
    throw new Error(`Invalid storage format: ${storageString}`);
  }
  
  const [, value, unit = "B"] = match;
  const numValue = parseFloat(value);
  
  switch (unit) {
    case "GB":
      return Math.round(numValue * STORAGE_UNITS.GB);
    case "MB":
      return Math.round(numValue * STORAGE_UNITS.MB);
    case "KB":
      return Math.round(numValue * STORAGE_UNITS.KB);
    case "B":
    default:
      return Math.round(numValue);
  }
}

/**
 * Calculates storage usage percentage
 * @param used - Used storage in bytes
 * @param total - Total storage in bytes
 * @returns Percentage (0-100)
 */
export function getStorageUsagePercentage(used: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((used / total) * 100);
}

/**
 * Checks if adding an item would exceed storage limit
 * @param currentUsed - Current used storage in bytes
 * @param itemCost - Item storage cost in bytes
 * @param storageLimit - Total storage limit in bytes
 * @returns True if item can be added
 */
export function canAddToStorage(
  currentUsed: number,
  itemCost: number,
  storageLimit: number
): boolean {
  return currentUsed + itemCost <= storageLimit;
}

export { STORAGE_UNITS };