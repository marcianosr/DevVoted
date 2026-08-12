import type { ColumnDef } from "@tanstack/react-table";

import { getCategoryMetadata } from "~/shared/lib/categories";
import type { ParagraphTone } from "~/ui/typography/Paragraph.component";
import { Paragraph } from "~/ui/typography/Paragraph.component";

import {
	dexNumber,
	formatDexNumber,
	type PolldexEntry,
} from "~/modules/collection/dex/domain/polldex.model";

const REDACTED = "???";

const ACCURACY_HIGH = 70;
const ACCURACY_MID = 40;

const accuracyTone = (accuracy: number): ParagraphTone => {
	if (accuracy >= ACCURACY_HIGH) return "viridian";
	if (accuracy >= ACCURACY_MID) return "saffron";
	return "cinnabar";
};

export const polldexColumns: ColumnDef<PolldexEntry>[] = [
	{
		id: "id",
		header: "ID",
		accessorFn: (entry) => dexNumber(entry),
		cell: ({ row }) => (
			<Paragraph as="span" tone="muted" className="tabular-nums">
				{formatDexNumber(row.original)}
			</Paragraph>
		),
	},
	{
		id: "question",
		header: "Question",
		enableSorting: false,
		meta: { grow: true },
		cell: ({ row }) => (
			<Paragraph as="span" tone={row.original.seen ? "default" : "muted"}>
				{row.original.question ?? REDACTED}
			</Paragraph>
		),
	},
	{
		id: "category",
		header: "Category",
		accessorFn: (entry) => getCategoryMetadata(entry.categoryCode).name,
		cell: ({ row }) => (
			<Paragraph as="span" tone={row.original.seen ? "default" : "muted"}>
				{row.original.seen
					? getCategoryMetadata(row.original.categoryCode).name
					: REDACTED}
			</Paragraph>
		),
	},
	{
		id: "seen",
		header: "Seen",
		accessorFn: (entry) => entry.timesSeen,
		meta: { align: "right" },
		cell: ({ row }) => (
			<Paragraph as="span" tone="muted" className="tabular-nums">
				{row.original.seen ? `×${row.original.timesSeen}` : "—"}
			</Paragraph>
		),
	},
	{
		id: "accuracy",
		header: "Accuracy",
		// Unanswered polls sort to the end regardless of direction.
		accessorFn: (entry) => entry.accuracy ?? undefined,
		sortUndefined: "last",
		meta: { align: "right" },
		cell: ({ row }) => {
			const { accuracy } = row.original;
			return (
				<Paragraph
					as="span"
					tone={accuracy !== null ? accuracyTone(accuracy) : "muted"}
					className="font-bold tabular-nums"
				>
					{accuracy !== null ? `${accuracy}%` : "—"}
				</Paragraph>
			);
		},
	},
];
