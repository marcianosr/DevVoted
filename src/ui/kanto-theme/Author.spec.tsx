import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Author } from "./Author.ui";

const BORDER = "/borders/grass.png";
const PHOTO = "/editors/brock.png";

// The handle is a link now, so the credit spans several elements.
const creditIs = (whole: string) => (_: string, element: Element | null) =>
	element?.textContent === whole &&
	!Array.from(element.children).some((child) => child.textContent === whole);

describe("Author", () => {
	it("credits the handle, with its at sign", () => {
		render(<Author handle="matthijsgroen" />);

		expect(
			screen.getByText(creditIs("Created by @matthijsgroen"))
		).toBeInTheDocument();
	});

	it("does not double the at sign on a handle that already has one", () => {
		render(<Author handle="@matthijsgroen" />);

		expect(
			screen.getByText(creditIs("Created by @matthijsgroen"))
		).toBeInTheDocument();
	});

	it("appends the author's title after a separator", () => {
		render(<Author handle="matthijsgroen" title="Poll editor" />);

		expect(
			screen.getByText(creditIs("Created by @matthijsgroen · Poll editor"))
		).toBeInTheDocument();
	});

	it("omits the separator when the author has no title", () => {
		render(<Author handle="matthijsgroen" />);

		expect(screen.queryByText(/·/)).not.toBeInTheDocument();
	});

	it("draws the photo it is handed rather than deriving one from the handle", () => {
		const { container } = render(
			<Author handle="matthijsgroen" photoUrl={PHOTO} />
		);

		expect(container.querySelector("img")).toHaveAttribute("src", PHOTO);
	});

	it("leaves the initial bare for an author with no photo", () => {
		const { container } = render(<Author handle="matthijsgroen" />);

		expect(container.querySelectorAll("img")).toHaveLength(0);
		expect(screen.getByText("M")).toBeInTheDocument();
	});

	it("lays the equipped border over the avatar when the user has one", () => {
		const { container } = render(
			<Author handle="matthijsgroen" photoUrl={PHOTO} borderUrl={BORDER} />
		);

		const images = Array.from(container.querySelectorAll("img"));
		expect(images).toHaveLength(2);
		expect(images[1]).toHaveAttribute("src", BORDER);
		expect(images[1]).toHaveClass("scale-120");
	});

	it("draws no frame for a user with nothing equipped", () => {
		const { container } = render(
			<Author handle="matthijsgroen" photoUrl={PHOTO} />
		);

		expect(container.querySelectorAll("img")).toHaveLength(1);
	});

	it("keeps the avatar square so border art is not clipped", () => {
		const { container } = render(<Author handle="matthijsgroen" />);

		const face = container.querySelector("span > span");
		expect(face).toHaveClass("rounded-sm");
		expect(face?.className).not.toMatch(/rounded-full/);
	});

	it("sits the handle's initial behind the photo as a fallback", () => {
		render(<Author handle="matthijsgroen" photoUrl={PHOTO} />);

		expect(screen.getByText("M")).toBeInTheDocument();
	});

	it("rules off from whatever sits above it", () => {
		const { container } = render(<Author handle="matthijsgroen" />);

		expect(container.firstChild).toHaveClass("border-t", "border-edge", "pt-3");
	});

	it("drops its own rule for a host that already rules, such as a panel footer", () => {
		const { container } = render(
			<Author handle="matthijsgroen" rule={false} />
		);

		expect(container.firstChild).not.toHaveClass("border-t", "pt-3");
	});

	it("shrinks the avatar to sit on one line with footer text", () => {
		const { container } = render(<Author handle="matthijsgroen" size="sm" />);

		expect(container.querySelector("span")).toHaveClass("size-9");
	});

	it("stands the avatar full size when nothing asks it to shrink", () => {
		const { container } = render(<Author handle="matthijsgroen" />);

		expect(container.querySelector("span")).toHaveClass("size-12");
	});

	it("points the handle at the author's GitHub, opened away from the run", () => {
		render(<Author handle="@matthijsgroen" />);

		const link = screen.getByRole("link", { name: "@matthijsgroen" });

		expect(link).toHaveAttribute("href", "https://github.com/matthijsgroen");
		expect(link).toHaveAttribute("target", "_blank");
		expect(link).toHaveAttribute("rel", "noreferrer");
	});

	it("leaves the link at full strength while the credit around it stays quiet", () => {
		render(<Author handle="matthijsgroen" title="Poll editor" />);

		const link = screen.getByRole("link", { name: "@matthijsgroen" });

		expect(link.className).not.toMatch(/opacity-/);
		expect(screen.getByText("Created by")).toHaveClass("opacity-60");
	});
});
