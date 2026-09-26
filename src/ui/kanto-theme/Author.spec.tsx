import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Author } from "./Author.ui";

const BORDER = "/borders/grass.png";
const PHOTO = "/editors/brock.png";

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

	it("appends the author's role after a separator", () => {
		render(<Author handle="matthijsgroen" role="Poll editor" />);

		expect(
			screen.getByText(creditIs("Created by @matthijsgroen · Poll editor"))
		).toBeInTheDocument();
	});

	it("omits the separator when the author holds no role", () => {
		render(<Author handle="matthijsgroen" />);

		expect(screen.queryByText(/·/)).not.toBeInTheDocument();
	});

	it("sets an earned title on its own line, not after the role separator", () => {
		render(
			<Author
				handle="matthijsgroen"
				role="Poll editor"
				title="Git Maintainer"
			/>
		);

		expect(
			screen.getByText(creditIs("Created by @matthijsgroen · Poll editor"))
		).toBeInTheDocument();
		expect(screen.getByText("Git Maintainer")).toBeInTheDocument();
	});

	it("wears an earned title without a role, which most players have", () => {
		render(<Author handle="matthijsgroen" title="Git Maintainer" />);

		expect(screen.getByText("Git Maintainer")).toBeInTheDocument();
		expect(screen.queryByText(/·/)).not.toBeInTheDocument();
	});

	it("draws no title line for an account wearing none", () => {
		render(<Author handle="matthijsgroen" role="Poll editor" />);

		expect(screen.queryByText("Git Maintainer")).not.toBeInTheDocument();
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

	it("leaves the link brighter than the credit around it", () => {
		render(<Author handle="matthijsgroen" role="Poll editor" />);

		const link = screen.getByRole("link", { name: "@matthijsgroen" });

		expect(link).toHaveClass("text-theme-soft");
		expect(link.parentElement).toHaveClass("text-theme-muted");
	});

	it("sets the credit in the kit's smallest prose", () => {
		render(<Author handle="matthijsgroen" role="Poll editor" />);

		const link = screen.getByRole("link", { name: "@matthijsgroen" });

		expect(link.parentElement).toHaveClass("text-xs");
	});
});
