import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import {
	COPY,
	ProfileCollection,
	type ProfileCollectionProps,
} from "./ProfileCollection.ui";

const props = (
	overrides: Partial<ProfileCollectionProps> = {}
): ProfileCollectionProps => ({
	counts: [
		{ label: "polls", figure: "41 of 96", held: 41, total: 96 },
		{ label: "configs", figure: "12 of 46", held: 12, total: 46 },
		{ label: "titles", figure: "2 of 16", held: 2, total: 16 },
	],
	meta: "completion only · 2.4 MB archive",
	note: "Which polls they have seen stays private.",
	...overrides,
});

describe("ProfileCollection", () => {
	it("names the panel and rides the archive on its heading", () => {
		render(<ProfileCollection {...props()} />);

		expect(screen.getByRole("heading", { name: COPY.label })).toBeVisible();
		expect(screen.getByText(/2.4 MB archive/)).toBeVisible();
	});

	it("states each collection as a figure, not only as a bar", () => {
		render(<ProfileCollection {...props()} />);

		expect(screen.getByText("polls")).toBeVisible();
		expect(screen.getByText("41 of 96")).toBeVisible();
		expect(screen.getByText("2 of 16")).toBeVisible();
	});

	it("says what a visitor is not being shown", () => {
		render(<ProfileCollection {...props()} />);

		expect(screen.getByText(/stays private/)).toBeVisible();
	});

	it("states an untouched collection as zero rather than hiding the row", () => {
		render(
			<ProfileCollection
				{...props({
					counts: [{ label: "polls", figure: "0 of 96", held: 0, total: 96 }],
				})}
			/>
		);

		expect(screen.getByText("0 of 96")).toBeVisible();
	});
});
