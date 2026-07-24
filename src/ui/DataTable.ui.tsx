import { useState, type ReactNode } from "react";

import {
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type RowData,
	type SortDirection,
	type SortingState,
} from "@tanstack/react-table";
import { clsx } from "clsx";

// Per-column layout hints, read in the header/cell renderers below.
declare module "@tanstack/react-table" {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface ColumnMeta<TData extends RowData, TValue> {
		align?: "left" | "right";
		/** This column absorbs remaining width; the rest stay content-width. */
		grow?: boolean;
	}
}

type DataTableProps<TData> = {
	columns: ColumnDef<TData>[];
	data: TData[];
	initialSorting?: SortingState;
	rowClassName?: (row: TData) => string;
	emptyMessage?: ReactNode;
};

const ariaSortOf = (
	sorted: false | SortDirection
): "ascending" | "descending" | "none" => {
	if (sorted === "asc") return "ascending";
	if (sorted === "desc") return "descending";
	return "none";
};

const SortIndicator = ({ sorted }: { sorted: false | SortDirection }) => (
	<span aria-hidden className={clsx("text-[0.85em]", !sorted && "opacity-30")}>
		{sorted === "asc" ? "▲" : sorted === "desc" ? "▼" : "↕"}
	</span>
);

export const DataTable = <TData,>({
	columns,
	data,
	initialSorting = [],
	rowClassName,
	emptyMessage = "No rows.",
}: DataTableProps<TData>) => {
	const [sorting, setSorting] = useState<SortingState>(initialSorting);

	const table = useReactTable({
		data,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		enableSortingRemoval: false,
		// Predictable: every column sorts ascending on first click, not
		// desc-first for numbers (TanStack's default).
		sortDescFirst: false,
	});

	const rows = table.getRowModel().rows;

	return (
		<div className="overflow-x-auto">
			<table className="w-full min-w-[36rem] border-collapse text-left">
				<thead>
					<tr className="border-b border-zinc-700">
						{table.getFlatHeaders().map((header) => {
							const { align = "left", grow } =
								header.column.columnDef.meta ?? {};
							const sorted = header.column.getIsSorted();
							const label = flexRender(
								header.column.columnDef.header,
								header.getContext()
							);
							return (
								<th
									key={header.id}
									aria-sort={ariaSortOf(sorted)}
									className={clsx(
										"pb-2 text-xs font-normal uppercase text-zinc-400",
										align === "right" ? "text-right" : "text-left",
										grow ? "w-full" : "whitespace-nowrap"
									)}
								>
									{header.column.getCanSort() ? (
										<button
											type="button"
											onClick={header.column.getToggleSortingHandler()}
											className="inline-flex items-center gap-1 uppercase hover:text-zinc-200"
										>
											{label}
											<SortIndicator sorted={sorted} />
										</button>
									) : (
										label
									)}
								</th>
							);
						})}
					</tr>
				</thead>
				<tbody>
					{rows.length === 0 ? (
						<tr>
							<td
								colSpan={columns.length}
								className="py-6 text-center text-sm text-zinc-400"
							>
								{emptyMessage}
							</td>
						</tr>
					) : (
						rows.map((row) => (
							<tr
								key={row.id}
								className={clsx(
									"border-b border-zinc-800",
									rowClassName?.(row.original)
								)}
							>
								{row.getVisibleCells().map((cell) => {
									const { align = "left", grow } =
										cell.column.columnDef.meta ?? {};
									return (
										<td
											key={cell.id}
											className={clsx(
												"py-3 pr-4 align-top",
												align === "right" ? "text-right" : "text-left",
												grow ? "w-full" : "whitespace-nowrap"
											)}
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</td>
									);
								})}
							</tr>
						))
					)}
				</tbody>
			</table>
		</div>
	);
};
