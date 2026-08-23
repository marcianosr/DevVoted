import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import {
	Disclosure,
	DisclosureBody,
	DISCLOSURE_SUMMARY,
	isExpandable,
} from "./Disclosure.ui";

describe("Disclosure", () => {
	it("rests closed, so a screen opens on its summaries", () => {
		const { container } = render(
			<Disclosure>
				<summary>open me</summary>body
			</Disclosure>
		);

		expect(container.querySelector("details")).not.toHaveAttribute("open");
	});

	it("opens on request", () => {
		const { container } = render(
			<Disclosure defaultOpen>
				<summary>open me</summary>body
			</Disclosure>
		);

		expect(container.querySelector("details")).toHaveAttribute("open");
	});

	// The whole point of the scope: two disclosures must not answer to one name,
	// or an inner caret rotates off the outer one's state.
	it("names its group after its own scope, never another's", () => {
		const { container } = render(
			<Disclosure scope="row">
				<summary>open me</summary>
			</Disclosure>
		);

		expect(container.firstChild).toHaveClass("group/row");
		expect(container.firstChild).not.toHaveClass("group/fold");
	});

	it("defaults to the fold scope, which most disclosures are", () => {
		const { container } = render(
			<Disclosure>
				<summary>open me</summary>
			</Disclosure>
		);

		expect(container.firstChild).toHaveClass("group/fold");
	});

	// Removing list-style also removes the browser's default focus ring, so the
	// reset has to put one back.
	it("hands back a summary reset that keeps the marker hidden and focus visible", () => {
		expect(DISCLOSURE_SUMMARY).toContain("list-none");
		expect(DISCLOSURE_SUMMARY).toContain("[&::-webkit-details-marker]:hidden");
		expect(DISCLOSURE_SUMMARY).toContain("focus-visible:outline-cerulean");
	});
});

describe("isExpandable", () => {
	it("is false when there is nothing to disclose", () => {
		expect(isExpandable(undefined, undefined)).toBe(false);
	});

	it("is true on either half alone", () => {
		expect(isExpandable("a summary", undefined)).toBe(true);
		expect(isExpandable(undefined, "an explainer")).toBe(true);
	});
});

describe("DisclosureBody", () => {
	it("reads the summary quieter than the explainer", () => {
		render(<DisclosureBody summary="the gist" explainer="the detail" />);

		expect(screen.getByText("the gist")).toHaveClass("text-zinc-400");
		expect(screen.getByText("the detail")).not.toHaveClass("text-zinc-400");
	});

	it("omits a half that was not given", () => {
		render(<DisclosureBody explainer="the detail" />);

		expect(screen.getByText("the detail")).toBeInTheDocument();
		expect(screen.getAllByRole("paragraph")).toHaveLength(1);
	});

	it("fades with the row it belongs to", () => {
		const { container } = render(<DisclosureBody summary="the gist" dimmed />);

		expect(container.firstChild).toHaveClass("opacity-50");
	});
});
