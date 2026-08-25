import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PriceTag } from "./PriceTag.ui";

// The tag reads its row's open state off the DOM, so a test has to give it one.
const inRow = (tag: React.ReactNode, open = false) => (
	<details open={open} className="group/entry">
		<summary>Deprecated{tag}</summary>
		<p>rare</p>
	</details>
);

describe("PriceTag", () => {
	it("quotes the price when there is a price to quote", () => {
		render(<PriceTag kb={32} on="Stylelint" onUse={vi.fn()} />);

		expect(
			screen.getByRole("button", { name: "install Stylelint for 32 KB" })
		).toBeInTheDocument();
		expect(screen.getByText("32 KB")).toBeInTheDocument();
	});

	it("says free rather than 0 KB, in the colour of a gain", () => {
		render(<PriceTag kb={0} on="Freemium" onUse={vi.fn()} />);

		expect(screen.getByText("free")).toBeInTheDocument();
		expect(screen.getByRole("button")).toHaveClass("text-celadon");
	});

	it("carries the install verb for its row's open state to reveal", () => {
		render(<PriceTag kb={128} on="Deprecated" onUse={vi.fn()} />);

		expect(screen.getByText("install · 128 KB")).toBeInTheDocument();
	});

	it("leaves the first tap to the row, so nothing is bought by opening it", async () => {
		const onUse = vi.fn();
		const user = userEvent.setup();
		render(inRow(<PriceTag kb={128} on="Deprecated" onUse={onUse} />));

		await user.click(screen.getByRole("button"));

		expect(onUse).not.toHaveBeenCalled();
		expect(screen.getByRole("group")).toHaveAttribute("open");
	});

	it("spends on the second tap, once the row is already open", async () => {
		const onUse = vi.fn();
		const user = userEvent.setup();
		render(inRow(<PriceTag kb={128} on="Deprecated" onUse={onUse} />, true));

		await user.click(screen.getByRole("button"));

		expect(onUse).toHaveBeenCalledOnce();
		expect(screen.getByRole("group")).toHaveAttribute("open");
	});

	it("strikes a price already paid and refuses to charge it twice", () => {
		render(<PriceTag kb={64} on=".length" state="owned" onUse={vi.fn()} />);

		const tag = screen.getByRole("button", { name: ".length 64 KB" });
		expect(tag).toBeDisabled();
		expect(tag).toHaveClass("line-through");
	});

	it("reddens a price beyond reach and refuses it", () => {
		render(
			<PriceTag kb={512} on="WTFPL" state="unaffordable" onUse={vi.fn()} />
		);

		const tag = screen.getByRole("button");
		expect(tag).toBeDisabled();
		expect(tag).toHaveClass("text-cinnabar");
	});

	// A shelf of red tags reads as "you are broke". Half of it meaning "you are
	// full" is a different problem with a different fix, so it gets a different
	// colour.
	it("greys a price the pipeline has no room for, rather than reddening it", () => {
		render(
			<PriceTag kb={32} on="Stylelint" state="unavailable" onUse={vi.fn()} />
		);

		const tag = screen.getByRole("button");
		expect(tag).toBeDisabled();
		expect(tag).toHaveClass("text-zinc-500");
		expect(tag).not.toHaveClass("text-cinnabar");
	});

	it("greens a price that can actually be paid", () => {
		render(<PriceTag kb={32} on="Stylelint" onUse={vi.fn()} />);

		expect(screen.getByRole("button")).toHaveClass("text-celadon");
	});

	it("never offers the install verb on a row that cannot be bought", () => {
		render(
			<PriceTag kb={512} on="WTFPL" state="unaffordable" onUse={vi.fn()} />
		);

		expect(screen.queryByText(/install/)).not.toBeInTheDocument();
	});

	it("wears the verb from the start where there is no row to reveal it", () => {
		render(
			<PriceTag
				kb={48}
				on="a sixth offer"
				label="extend"
				state="ready"
				onUse={vi.fn()}
			/>
		);

		const tag = screen.getByRole("button", {
			name: "extend a sixth offer for 48 KB",
		});
		expect(tag).toBeEnabled();
		expect(screen.getByText("extend · 48 KB")).toBeInTheDocument();
	});

	it("spends on a single tap when it is already showing the verb", async () => {
		const onUse = vi.fn();
		const user = userEvent.setup();
		render(
			<PriceTag
				kb={48}
				on="a sixth offer"
				label="extend"
				state="ready"
				onUse={onUse}
			/>
		);

		await user.click(screen.getByRole("button"));

		expect(onUse).toHaveBeenCalledOnce();
	});

	it("invites the press it can accept", () => {
		render(<PriceTag kb={32} on="Stylelint" onUse={() => {}} />);

		expect(screen.getByRole("button")).toHaveClass("cursor-pointer");
	});

	// The dimming lives on the tag, not on the row: a price the run cannot meet
	// should not cost the config its name.
	it("dims itself and refuses the pointer when the price cannot be met", () => {
		render(
			<PriceTag kb={512} on="WTFPL" state="unaffordable" onUse={() => {}} />
		);

		const tag = screen.getByRole("button");
		expect(tag).toBeDisabled();
		expect(tag).toHaveClass(
			"disabled:cursor-not-allowed",
			"disabled:opacity-50"
		);
	});

	// A greyed price with no reason beside it reads as a bug rather than a rule.
	it("says why it refuses, on hover and to a screen reader", () => {
		render(
			<PriceTag
				kb={32}
				on=".ts"
				state="unaffordable"
				hint="Can't install, no free slot"
				onUse={() => {}}
			/>
		);

		expect(screen.getByText("Can't install, no free slot")).toBeInTheDocument();
		expect(
			screen.getByRole("button", {
				name: ".ts 32 KB, Can't install, no free slot",
			})
		).toBeInTheDocument();
	});

	it("stays a bare tag when it has nothing to explain", () => {
		const { container } = render(
			<PriceTag kb={32} on=".ts" onUse={() => {}} />
		);

		expect(container.firstElementChild?.tagName).toBe("BUTTON");
	});
});
