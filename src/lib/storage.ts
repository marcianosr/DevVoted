export const STORAGE_UNITS = {
	BYTE: 1,
	KB: 1024,
	MB: 1024 * 1024,
	GB: 1024 * 1024 * 1024,
} as const;

const KB_PER_MB = 1024;

export function formatKb(kb: number): string {
	if (kb < KB_PER_MB) return `${kb}KB`;
	const mb = kb / KB_PER_MB;
	return `${mb % 1 === 0 ? mb : mb.toFixed(1)}MB`;
}

export function formatStorage(bytes: number): string {
	if (bytes === 0) return "0 B";

	if (bytes >= STORAGE_UNITS.GB) {
		const gb = bytes / STORAGE_UNITS.GB;
		return gb % 1 === 0 ? `${gb} GB` : `${gb.toFixed(1)} GB`;
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

export function formatStorageDetailed(bytes: number): string {
	const primary = formatStorage(bytes);

	if (bytes >= STORAGE_UNITS.GB && bytes % STORAGE_UNITS.GB !== 0) {
		const mb = Math.round(bytes / STORAGE_UNITS.MB);
		return `${primary} · ${mb.toLocaleString()} MB`;
	}
	if (
		bytes >= STORAGE_UNITS.MB &&
		bytes < STORAGE_UNITS.GB &&
		bytes % STORAGE_UNITS.MB !== 0
	) {
		const kb = Math.round(bytes / STORAGE_UNITS.KB);
		return `${primary} · ${kb.toLocaleString()} KB`;
	}
	return primary;
}

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

export const getStorageUsagePercentage = (
	used: number,
	total: number
): number => {
	if (total === 0) return 0;
	return Math.round((used / total) * 100);
};

export const canAddToStorage = (
	currentUsed: number,
	itemCost: number,
	storageLimit: number
): boolean => currentUsed + itemCost <= storageLimit;
