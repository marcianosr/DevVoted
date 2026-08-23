import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PriceTag } from "./PriceTag.ui";

// The tag reads its row's open state off the DOM, so the tests have to give it
// the row it lives in.
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

		expect(screen.getByText("install · 128")).toBeInTheDocument();
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
		expect(screen.getByText("extend · 48")).toBeInTheDocument();
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
});
