import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { AvatarChip, initialsOf } from "./AvatarChip.ui";

describe("initialsOf", () => {
	it("takes the first letters of the first two words", () => {
		expect(initialsOf("Lisa Boekesteijn")).toBe("LB");
	});

	it("takes the first two characters of a single word", () => {
		expect(initialsOf("jdoornbos")).toBe("JD");
	});

	it("drops a leading @ before reading the handle", () => {
		expect(initialsOf("@marciano dev")).toBe("MD");
	});

	it("falls back to a question mark on an empty name", () => {
		expect(initialsOf("  ")).toBe("?");
	});
});

describe("AvatarChip", () => {
	it("shows the initials when there is no photo", () => {
		render(<AvatarChip name="Lisa Boekesteijn" />);
		expect(screen.getByText("LB")).toBeInTheDocument();
	});

	it("shows the photo instead of the initials when it has one", () => {
		const { container } = render(
			<AvatarChip name="Owen" photoUrl="https://github.com/owen.png" />
		);
		expect(container.querySelector("img")?.getAttribute("src")).toBe(
			"https://github.com/owen.png"
		);
		expect(screen.queryByText("OW")).not.toBeInTheDocument();
	});

	it("wears the equipped border over the face", () => {
		const { container } = render(
			<AvatarChip name="Owen" borderUrl="/borders/x.png" />
		);
		const frames = [...container.querySelectorAll("img")];
		expect(frames.map((img) => img.getAttribute("src"))).toContain(
			"/borders/x.png"
		);
	});

	it("rings the viewer's own chip", () => {
		const { container } = render(<AvatarChip name="you" you />);
		expect(container.innerHTML).toContain("ring-cerulean");
	});

	it("carries the name for assistive tech and hover alike", () => {
		render(<AvatarChip name="Owen" />);
		expect(screen.getByRole("img", { name: "Owen" })).toBeInTheDocument();
		expect(screen.getByTitle("Owen")).toBeInTheDocument();
	});
});
