export type Difficulty = "low" | "medium" | "high" | "critical";

export const DIFFICULTY_CLASSES: Record<Difficulty, string> = {
	low: "text-blue-400 border-blue-400",
	medium: "text-green-400 border-green-400",
	high: "text-orange-400 border-orange-400",
	critical: "text-red-500 border-red-500",
};

export type SlotStatus = "in-progress" | "passed" | "failed" | "skipped";

export const STATUS_ICON: Record<SlotStatus, React.ReactNode> = {
	"in-progress": (
		<span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse inline-block" />
	),
	passed: <span className="text-green-400">✓</span>,
	failed: <span className="text-red-400">✗</span>,
	skipped: <span className="text-gray-500">⊘</span>,
};
