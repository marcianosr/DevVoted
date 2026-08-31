import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SlotTrack, type SlotTrackConfig } from "./SlotTrack.ui";

const coldStart: SlotTrackConfig = {
	id: "cold-start",
	label: "Cold Start",
	slots: 2,
};
const js: SlotTrackConfig = {
	id: "js",
	label: ".js",
	slots: 1,
};
const freemium: SlotTrackConfig = {
	id: "freemium",
	label: "Freemium",
	slots: 8,
};

const widthsIn = (track: HTMLElement): string[] =>
	Array.from(track.children).map((cell) =>
		cell instanceof HTMLElement ? cell.style.width : ""
	);

const track = () => screen.getByRole("meter");

describe(SlotTrack, () => {
	it("gives each config a bar as wide as the slots it takes", () => {
		render(<SlotTrack configs={[coldStart, js]} slots={4} maxSlots={8} />);

		const [twoSlot, oneSlot] = widthsIn(track());
		expect(twoSlot).toBe("40%");
		expect(oneSlot).toBe("20%");
	});

	it("cuts the free room into one box per slot, so vacancy is countable", () => {
		render(<SlotTrack configs={[coldStart, js]} slots={8} />);

		const [, , ...free] = widthsIn(track());
		expect(free).toEqual(["12.5%", "12.5%", "12.5%", "12.5%", "12.5%"]);
	});

	it("ends in a one-slot stub while the ladder still sells room", () => {
		render(<SlotTrack configs={[coldStart]} slots={3} maxSlots={8} />);

		expect(widthsIn(track())).toEqual(["50%", "25%", "25%"]);
	});

	it("draws no stub once every slot on the ladder is bought", () => {
		render(<SlotTrack configs={[coldStart]} slots={3} maxSlots={3} />);

		expect(widthsIn(track())).toEqual([
			"66.66666666666666%",
			"33.33333333333333%",
		]);
	});

	it("keeps the stub one slot wide however much is left to rent", () => {
		render(<SlotTrack configs={[js]} slots={2} maxSlots={24} />);

		expect(new Set(widthsIn(track())).size).toBe(1);
	});

	it("drops the stub once there is nothing left to rent", () => {
		render(<SlotTrack configs={[]} slots={8} maxSlots={8} />);

		expect(track().children).toHaveLength(8);
		expect(
			screen.queryByText("Clear a gate for more room, or rent a slot now")
		).not.toBeInTheDocument();
	});

	it("dashes the free room and hatches the room it cannot reach", () => {
		render(<SlotTrack configs={[js]} slots={4} maxSlots={24} />);

		const cells = Array.from(track().children);
		const free = cells[1];
		expect(free).toHaveClass("border-dashed");
		expect(free).not.toHaveClass("bg-hatched");

		const hatched = cells.at(-1)?.querySelector("[aria-hidden]");
		expect(hatched).toHaveClass("bg-hatched");
		expect(hatched).not.toHaveClass("border-dashed");
	});

	it("prints nothing inside the hatching — no gate, no figure", () => {
		render(<SlotTrack configs={[js]} slots={4} maxSlots={24} />);

		const stub = Array.from(track().children).at(-1);
		expect(stub?.querySelector("[aria-hidden]")?.textContent).toBe("");
	});

	it("explains on the stub where the room comes from", () => {
		render(<SlotTrack configs={[js]} slots={4} maxSlots={8} />);

		const said = screen.getAllByText("Buy a slot in the shop for more room");
		expect(said).toHaveLength(2);
		expect(said.some((node) => node.className.includes("sr-only"))).toBe(true);
	});

	it("widens past a byte when rented slots take it there", () => {
		render(<SlotTrack configs={[freemium]} slots={16} maxSlots={16} />);

		expect(widthsIn(track())[0]).toBe("50%");
		expect(track()).toHaveAttribute("aria-valuemax", "16");
	});

	it("counts the free room and names the biggest size that still fits", () => {
		render(<SlotTrack configs={[coldStart, js]} slots={8} fits={4} />);

		expect(screen.getByText("5 slots free · fits up to 4")).toBeInTheDocument();
	});

	it("counts one free slot in the singular", () => {
		render(<SlotTrack configs={[coldStart, js]} slots={4} fits={1} />);

		expect(screen.getByText("1 slot free · fits up to 1")).toBeInTheDocument();
	});

	it("says how to make room once nothing fits", () => {
		render(<SlotTrack configs={[freemium]} slots={8} fits={null} />);

		expect(
			screen.getByText("full · minify or uninstall to make room")
		).toBeInTheDocument();
	});

	it("names the overflow when the build outgrew its capacity", () => {
		render(<SlotTrack configs={[freemium]} slots={4} />);

		expect(
			screen.getByText("over capacity by 4 · minify, uninstall, or buy a slot")
		).toBeInTheDocument();
		expect(track()).toHaveAttribute("aria-valuenow", "8");
		expect(track()).toHaveAttribute("aria-valuemax", "4");
	});

	it("leaves every lesser grade on its own coloured edge", () => {
		render(<SlotTrack configs={[coldStart, js]} slots={4} />);

		Array.from(track().children).forEach((bar) =>
			expect(bar.className).not.toContain("legendary-ring")
		);
	});

	it("trades the ring for the dotted edge once a byte is minified", () => {
		render(
			<SlotTrack
				configs={[{ ...freemium, slots: 4, minified: true }]}
				slots={4}
			/>
		);

		const [minified] = Array.from(track().children);
		expect(minified.className).toContain("border-dotted");
		expect(minified.className).not.toContain("legendary-ring");
	});

	it("gives the excess bar the losing colour rather than its grade's", () => {
		render(<SlotTrack configs={[freemium]} slots={4} />);

		const [excess] = Array.from(track().children);
		expect(excess.className).toContain("border-cinnabar");
		expect(excess.className).not.toContain("text-saffron");
	});

	it("marks a minified config apart from a whole one", () => {
		render(
			<SlotTrack
				configs={[{ ...freemium, slots: 4, minified: true }, js]}
				slots={8}
			/>
		);

		const [minified, whole] = Array.from(track().children);
		expect(minified.className).toContain("border-dotted");
		expect(whole.className).not.toContain("border-dotted");
	});

	it("states the occupancy on the meter rather than in a header", () => {
		render(<SlotTrack configs={[coldStart, js]} slots={4} />);

		expect(track()).toHaveAttribute("aria-label", "3 of 4 slots used");
		expect(screen.queryByText("3 of 4 slots")).not.toBeInTheDocument();
	});

	it("prices the next slot on the hatching and says the width it makes", () => {
		render(
			<SlotTrack
				configs={[js]}
				slots={4}
				maxSlots={24}
				buy={{ costKb: 16, makes: 5, onUse: () => {} }}
			/>
		);

		const stub = screen.getByRole("button", {
			name: "Install a new slot · makes 5 · 16 KB",
		});
		expect(stub).toHaveTextContent("16 KB");
		expect(stub).toHaveClass("bg-hatched");
	});

	it("buys the slot on the hatching press", async () => {
		const onUse = vi.fn();
		render(
			<SlotTrack
				configs={[js]}
				slots={4}
				maxSlots={24}
				buy={{ costKb: 16, makes: 5, onUse }}
			/>
		);

		await userEvent.click(screen.getByRole("button", { name: /Install/ }));

		expect(onUse).toHaveBeenCalledOnce();
	});

	it("carries the refusal on the stub rather than a price it cannot charge", () => {
		render(
			<SlotTrack
				configs={[js]}
				slots={4}
				maxSlots={24}
				buy={{
					costKb: 768,
					refusal: "Costs 768 KB, you have 400.",
					onUse: () => {},
				}}
			/>
		);

		expect(
			screen.getByRole("button", { name: /Costs 768 KB, you have 400\./ })
		).toBeDisabled();
	});

	it("cashes on the empty slot nearest the hatching, quoted as income", () => {
		render(
			<SlotTrack
				configs={[js]}
				slots={4}
				maxSlots={24}
				cash={{ costKb: 16, makes: 3, onUse: () => {} }}
			/>
		);

		const cashOut = screen.getByRole("button", {
			name: "Cash an empty slot · makes 3 · +16 KB",
		});
		expect(cashOut).toHaveTextContent("+16 KB");
		expect(Array.from(track().children).at(-2)).toContainElement(cashOut);
	});

	it("cashes the slot on the empty press", async () => {
		const onUse = vi.fn();
		render(
			<SlotTrack
				configs={[js]}
				slots={4}
				cash={{ costKb: 16, makes: 3, onUse }}
			/>
		);

		await userEvent.click(screen.getByRole("button", { name: /Cash/ }));

		expect(onUse).toHaveBeenCalledOnce();
	});

	it("leaves the free room inert while the four free slots are all there is", () => {
		render(
			<SlotTrack
				configs={[js]}
				slots={4}
				maxSlots={24}
				cash={{
					refusal: "Nothing to cash — the first four slots are free.",
					onUse: () => {},
				}}
			/>
		);

		expect(
			screen.queryByRole("button", { name: /Cash/ })
		).not.toBeInTheDocument();
	});

	it("keeps the hatching a plain hint where no shop is selling", () => {
		render(<SlotTrack configs={[js]} slots={4} maxSlots={24} />);

		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("lends the caption to an armed press, so the verb reads without a hover", () => {
		render(
			<SlotTrack
				configs={[js]}
				slots={4}
				maxSlots={24}
				buy={{ costKb: 16, makes: 5, armed: true, onUse: () => {} }}
			/>
		);

		expect(
			screen.getByText("Install a new slot · makes 5 · 16 KB · press again")
		).toBeInTheDocument();
		expect(screen.queryByText("3 slots free")).not.toBeInTheDocument();
	});

	it("marks an armed press on its edge, since the cell has no room to grow", () => {
		const { rerender } = render(
			<SlotTrack
				configs={[js]}
				slots={4}
				maxSlots={24}
				buy={{ costKb: 16, makes: 5, onUse: () => {} }}
			/>
		);
		expect(screen.getByRole("button", { name: /Install/ })).toHaveClass(
			"border-edge"
		);

		rerender(
			<SlotTrack
				configs={[js]}
				slots={4}
				maxSlots={24}
				buy={{ costKb: 16, makes: 5, armed: true, onUse: () => {} }}
			/>
		);
		expect(screen.getByRole("button", { name: /Install/ })).toHaveClass(
			"border-celadon"
		);
	});

	it("names the second step on the armed press itself, not only in the caption", () => {
		render(
			<SlotTrack
				configs={[js]}
				slots={4}
				maxSlots={24}
				buy={{ costKb: 16, makes: 5, armed: true, onUse: () => {} }}
			/>
		);

		expect(
			screen.getByRole("button", {
				name: "Install a new slot · makes 5 · 16 KB, press again to confirm",
			})
		).toBeInTheDocument();
	});

	it("reports every press the same way, leaving arm-or-act to its owner", async () => {
		const onUse = vi.fn();
		render(
			<SlotTrack
				configs={[js]}
				slots={4}
				maxSlots={24}
				buy={{ costKb: 16, makes: 5, armed: true, onUse }}
			/>
		);

		await userEvent.click(screen.getByRole("button", { name: /Install/ }));

		expect(onUse).toHaveBeenCalledOnce();
	});

	it("gives up the arming when the press loses focus", () => {
		const onDismiss = vi.fn();
		render(
			<SlotTrack
				configs={[js]}
				slots={4}
				maxSlots={24}
				buy={{ costKb: 16, armed: true, onUse: () => {}, onDismiss }}
			/>
		);

		fireEvent.blur(screen.getByRole("button", { name: /Install/ }));

		expect(onDismiss).toHaveBeenCalledOnce();
	});

	it("gives up the arming on Escape, so a keyboard is never committed", () => {
		const onDismiss = vi.fn();
		render(
			<SlotTrack
				configs={[js]}
				slots={4}
				maxSlots={24}
				buy={{ costKb: 16, armed: true, onUse: () => {}, onDismiss }}
			/>
		);

		fireEvent.keyDown(screen.getByRole("button", { name: /Install/ }), {
			key: "Escape",
		});

		expect(onDismiss).toHaveBeenCalledOnce();
	});
});
