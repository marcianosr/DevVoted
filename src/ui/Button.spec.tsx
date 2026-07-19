import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { Button } from "./Button.component";

describe("Button", () => {
	it("renders its children and fires onClick", () => {
		const onClick = vi.fn();
		render(<Button onClick={onClick}>Start</Button>);
		fireEvent.click(screen.getByRole("button", { name: "Start" }));
		expect(onClick).toHaveBeenCalledOnce();
	});

	it("greys out the primary fill when disabled", () => {
		render(<Button disabled>Start</Button>);
		const button = screen.getByRole("button");
		expect(button).toBeDisabled();
		expect(button).toHaveClass("bg-zinc-800");
	});

	it("is disabled while loading", () => {
		render(<Button isLoading>Saving…</Button>);
		expect(screen.getByRole("button")).toBeDisabled();
	});

	it("shrinks the primary padding at the small size", () => {
		render(<Button size="small">Click</Button>);
		expect(screen.getByRole("button")).toHaveClass("px-3", "py-2");
	});

	it("outlines the danger variant in cinnabar", () => {
		render(<Button variant="danger">Delete</Button>);
		expect(screen.getByRole("button")).toHaveClass("border-cinnabar");
	});

	it("outlines the secondary variant in the theme color and shrinks with size", () => {
		render(
			<Button variant="secondary" size="small">
				Review answers →
			</Button>
		);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("border-theme", "text-theme");
		expect(button).toHaveClass("px-3", "py-1.5");
	});

	it("follows the category theme in the theme variant", () => {
		render(<Button variant="theme">Rebuild</Button>);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("border-theme", "text-theme");
		expect(button).not.toHaveClass("border-cerulean");
	});
});
