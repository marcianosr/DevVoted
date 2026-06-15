import { eq } from "drizzle-orm";

import { db } from "~/database/db";
import { activeTechDebtsTable } from "~/database/schema";

import {
	ActiveTechDebt,
	ClearProgress,
	isTechDebtTemplateId,
	TechDebtTemplateId,
} from "~/domains/techDebt/models/techDebt.model";

type ActiveTechDebtRow = typeof activeTechDebtsTable.$inferSelect;

const narrowTemplateId = (value: string): TechDebtTemplateId => {
	if (!isTechDebtTemplateId(value)) {
		throw new Error(`Unknown Tech Debt template id in DB: ${value}`);
	}
	return value;
};

/**
 * The progress_state column is json; Drizzle types it as `unknown`. Trusted
 * because the only writer is insertActiveTechDebt which takes a typed
 * ClearProgress input. A future schema-shape migration would need to
 * backfill rows or this narrowing throws.
 */
const narrowProgress = (value: unknown): ClearProgress => {
	if (typeof value !== "object" || value === null || !("kind" in value)) {
		throw new Error("Malformed Tech Debt progress_state row");
	}
	return value as ClearProgress;
};

const toActiveTechDebt = (row: ActiveTechDebtRow): ActiveTechDebt => ({
	id: row.id,
	runId: row.run_id,
	templateId: narrowTemplateId(row.template_id),
	acquiredAt: row.acquired_at,
	progress: narrowProgress(row.progress_state),
});

export const fetchActiveTechDebtsByRun = async (
	runId: number
): Promise<ActiveTechDebt[]> => {
	const rows = await db
		.select()
		.from(activeTechDebtsTable)
		.where(eq(activeTechDebtsTable.run_id, runId));
	return rows.map(toActiveTechDebt);
};

export type InsertActiveTechDebtInput = {
	runId: number;
	templateId: TechDebtTemplateId;
	progress: ClearProgress;
};

export const insertActiveTechDebt = async (
	input: InsertActiveTechDebtInput
): Promise<ActiveTechDebt> => {
	const [row] = await db
		.insert(activeTechDebtsTable)
		.values({
			run_id: input.runId,
			template_id: input.templateId,
			progress_state: input.progress,
		})
		.returning();
	return toActiveTechDebt(row);
};

export const deleteActiveTechDebt = async (id: number): Promise<void> => {
	await db.delete(activeTechDebtsTable).where(eq(activeTechDebtsTable.id, id));
};

export const updateActiveTechDebtProgress = async (
	id: number,
	progress: ClearProgress
): Promise<void> => {
	await db
		.update(activeTechDebtsTable)
		.set({ progress_state: progress })
		.where(eq(activeTechDebtsTable.id, id));
};
