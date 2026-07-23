import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "./DataTable.ui";

type Row = { name: string; n: number };

const data: Row[] = [
	{ name: "Bravo", n: 2 },
	{ name: "Alpha", n: 1 },
	{ name: "Charlie", n: 3 },
];

const columns: ColumnDef<Row>[] = [
	{
		id: "name",
		header: "Name",
		accessorFn: (row) => row.name,
		cell: ({ row }) => row.original.name,
	},
	{
		id: "count",
		header: "Count",
		accessorFn: (row) => row.n,
		meta: { align: "right" },
		cell: ({ row }) => row.original.n,
	},
	{ id: "static", header: "Static", enableSorting: false, cell: () => "-" },
];

const firstColumnOrder = () =>
	screen
		.getAllByRole("row")
		.slice(1) // drop the header row
		.map((row) => within(row).getAllByRole("cell")[0].textContent);

describe(DataTable, () => {
	it("renders the data in source order before any sort", () => {
		render(<DataTable columns={columns} data={data} />);
		expect(firstColumnOrder()).toEqual(["Bravo", "Alpha", "Charlie"]);
	});

	it("sorts ascending, then descending, when a sortable header is clicked", () => {
		render(<DataTable columns={columns} data={data} />);
		const nameHeaderButton = screen.getByRole("button", { name: "Name" });

		fireEvent.click(nameHeaderButton);
		expect(firstColumnOrder()).toEqual(["Alpha", "Bravo", "Charlie"]);
		expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute(
			"aria-sort",
			"ascending"
		);

		fireEvent.click(nameHeaderButton);
		expect(firstColumnOrder()).toEqual(["Charlie", "Bravo", "Alpha"]);
		expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute(
			"aria-sort",
			"descending"
		);
	});

	it("honours initialSorting", () => {
		render(
			<DataTable
				columns={columns}
				data={data}
				initialSorting={[{ id: "count", desc: false }]}
			/>
		);
		expect(firstColumnOrder()).toEqual(["Alpha", "Bravo", "Charlie"]);
	});

	it("does not make a non-sortable column interactive", () => {
		render(<DataTable columns={columns} data={data} />);
		expect(screen.queryByRole("button", { name: "Static" })).toBeNull();
	});

	it("applies rowClassName to each row", () => {
		render(
			<DataTable
				columns={columns}
				data={data}
				rowClassName={(row) => (row.n === 1 ? "is-lowest" : "")}
			/>
		);
		const alphaRow = screen.getByText("Alpha").closest("tr");
		expect(alphaRow).toHaveClass("is-lowest");
	});

	it("renders the empty message when there is no data", () => {
		render(
			<DataTable columns={columns} data={[]} emptyMessage="Nothing here" />
		);
		expect(screen.getByText("Nothing here")).toBeInTheDocument();
	});
});
