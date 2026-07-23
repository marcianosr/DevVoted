import type { Meta, StoryObj } from "@storybook/react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "./DataTable.ui";

type Fruit = { name: string; stock: number; price: number };

const columns: ColumnDef<Fruit>[] = [
	{
		id: "name",
		header: "Name",
		accessorFn: (row) => row.name,
		meta: { grow: true },
		cell: ({ row }) => row.original.name,
	},
	{
		id: "stock",
		header: "Stock",
		accessorFn: (row) => row.stock,
		meta: { align: "right" },
		cell: ({ row }) => row.original.stock,
	},
	{
		id: "price",
		header: "Price",
		accessorFn: (row) => row.price,
		meta: { align: "right" },
		cell: ({ row }) => `$${row.original.price.toFixed(2)}`,
	},
];

const data: Fruit[] = [
	{ name: "Oran Berry", stock: 12, price: 2.5 },
	{ name: "Sitrus Berry", stock: 3, price: 4.0 },
	{ name: "Pecha Berry", stock: 27, price: 1.25 },
];

const meta: Meta<typeof DataTable<Fruit>> = {
	component: DataTable,
	title: "UI/DataTable",
	decorators: [
		(Story) => (
			<div className="bg-black p-6 text-zinc-100">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof DataTable<Fruit>>;

export const Sortable: Story = {
	args: { columns, data, initialSorting: [{ id: "name", desc: false }] },
};

export const Empty: Story = {
	args: { columns, data: [], emptyMessage: "No berries in stock." },
};
