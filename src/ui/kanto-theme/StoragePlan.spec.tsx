import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
	KANTO_PLAN_TIER,
	kantoStorageRungs,
	storagePlanCount,
} from "~/test/kantoPoll.factory";

import { StoragePlan, type StorageRung } from "./StoragePlan.ui";

const LADDER: StorageRung[] = [
	{ cap: "256 KB", held: false, revealed: true, onPress: () => {} },
	{ cap: "512 KB", bill: "32 KB a gate", revealed: true, onPress: () => {} },
	{ cap: "1 MB", bill: "96 KB a gate", held: true, revealed: true },
	{ cap: "2 MB", bill: "224 KB a gate", revealed: true, onPress: () => {} },
	{
		cap: "3 MB",
		bill: "448 KB a gate",
		opensAt: "opens once a run has held 2 MB",
	},
];

const rowsOf = () => screen.getAllByRole("listitem");

const sentence = (text: string) =>
	screen.getByText((_, element) => element?.textContent === text);

const gutterOf = (row: Element) => {
	const [upper, dot, lower] = Array.from(row.firstElementChild!.children);
	return { upper, dot, lower };
};

const isLit = (segment: Element) => segment.classList.contains("bg-theme");

describe("StoragePlan", () => {
	it("draws one rung per plan on the ladder", () => {
		render(<StoragePlan rungs={LADDER} />);

		expect(rowsOf()).toHaveLength(LADDER.length);
	});

	it("names the ladder, so the rungs are not a bare list of figures", () => {
		render(<StoragePlan rungs={LADDER} />);

		expect(
			screen.getByRole("list", { name: "storage plan rungs" })
		).toBeInTheDocument();
	});

	it("says which rung is current rather than offering it again", () => {
		render(<StoragePlan rungs={LADDER} />);

		const held = rowsOf()[2];
		expect(held).toHaveTextContent("current");
		expect(held.querySelector("button")).toBeNull();
	});

	it("offers a drop on every rung already climbed past", () => {
		render(<StoragePlan rungs={LADDER} />);

		expect(screen.getAllByRole("button", { name: /^drop to/ })).toHaveLength(2);
	});

	it("prices an open rung on the press itself", () => {
		render(<StoragePlan rungs={LADDER} />);

		const offer = screen.getByRole("button", {
			name: "rent 2 MB · 224 KB a gate",
		});
		expect(offer).toHaveTextContent("224 KB a gate");
		expect(offer).toBeEnabled();
	});

	it("marks the free rung free, and no other rung", () => {
		render(<StoragePlan rungs={LADDER} />);

		expect(screen.getAllByText("free")).toHaveLength(1);
		expect(rowsOf()[0]).toHaveTextContent(/256 KB\s*·\s*free/);
	});

	it("refuses an unaffordable rung as a disabled press, not a label", () => {
		const refused = LADDER.map((rung) =>
			rung.cap === "2 MB"
				? { ...rung, refusal: "bills 224 KB a gate, you hold 96 KB" }
				: rung
		);
		render(<StoragePlan rungs={refused} />);

		expect(screen.getByRole("button", { name: /^rent 2 MB/ })).toBeDisabled();
	});

	it("says why a rung refused, in text rather than on hover", () => {
		const refused = LADDER.map((rung) =>
			rung.cap === "2 MB"
				? { ...rung, refusal: "bills 224 KB a gate, you hold 96 KB" }
				: rung
		);
		const { container } = render(<StoragePlan rungs={refused} />);

		expect(sentence("bills 224 KB a gate, you hold 96 KB")).toBeInTheDocument();
		expect(container.querySelector("[title]")).toBeNull();
	});

	it("withholds a masked rung's cap along with its bill", () => {
		render(<StoragePlan rungs={LADDER} />);

		const masked = rowsOf()[4];
		expect(masked).not.toHaveTextContent("3 MB");
		expect(masked).not.toHaveTextContent("448 KB");
	});

	it("names what opens a masked rung, in visible text", () => {
		const { container } = render(<StoragePlan rungs={LADDER} />);

		expect(sentence("opens once a run has held 2 MB")).toBeInTheDocument();
		expect(container.querySelector("[title]")).toBeNull();
	});

	it("leaves a masked rung unpressable, unlike a refused one", () => {
		render(<StoragePlan rungs={LADDER} />);

		const masked = rowsOf()[4];
		expect(masked).toHaveTextContent("locked");
		expect(masked.querySelector("button")).toBeNull();
	});

	it("drops to the rung the press names", async () => {
		const onPress = vi.fn();
		const rungs = LADDER.map((rung) =>
			rung.cap === "512 KB" ? { ...rung, onPress } : rung
		);
		render(<StoragePlan rungs={rungs} />);

		await userEvent.click(
			screen.getByRole("button", { name: "drop to 512 KB" })
		);

		expect(onPress).toHaveBeenCalledTimes(1);
	});
});

describe("the ladder's spine", () => {
	it("lights every segment up to the rung held, and none past it", () => {
		render(<StoragePlan rungs={LADDER} />);

		expect(rowsOf().map((row) => isLit(gutterOf(row).upper))).toEqual([
			true,
			true,
			true,
			false,
			false,
		]);
	});

	it("splits the held rung's own segment, lit above and dim below", () => {
		render(<StoragePlan rungs={LADDER} />);

		const { upper, lower } = gutterOf(rowsOf()[2]);
		expect(isLit(upper)).toBe(true);
		expect(isLit(lower)).toBe(false);
	});

	it("runs each row's lower segment one rung behind its upper", () => {
		render(<StoragePlan rungs={LADDER} />);

		expect(rowsOf().map((row) => isLit(gutterOf(row).lower))).toEqual([
			true,
			true,
			false,
			false,
			false,
		]);
	});

	it("hides the spine's two loose ends without dropping their height", () => {
		render(<StoragePlan rungs={LADDER} />);

		const rows = rowsOf();
		expect(gutterOf(rows[0]).upper).toHaveClass("invisible");
		expect(gutterOf(rows.at(-1)!).lower).toHaveClass("invisible");
		expect(gutterOf(rows[0]).lower).not.toHaveClass("invisible");
		expect(gutterOf(rows[1]).upper).not.toHaveClass("invisible");
	});

	it("keeps the spine out of the reading, it being the same fact twice", () => {
		render(<StoragePlan rungs={LADDER} />);

		expect(rowsOf()[0].firstElementChild).toHaveAttribute("aria-hidden");
	});
});

describe("the ladder's dots", () => {
	it("glows the rung held, so the eye finds it before reading a figure", () => {
		render(<StoragePlan rungs={LADDER} />);

		expect(gutterOf(rowsOf()[2]).dot).toHaveClass(
			"bg-theme",
			"glow-theme-soft"
		);
	});

	it("wears the pressable hue on an open rung", () => {
		render(<StoragePlan rungs={LADDER} />);

		expect(gutterOf(rowsOf()[3]).dot).toHaveAttribute(
			"data-screen-theme",
			"cerulean"
		);
	});

	it("leaves the screen's own theme on every rung that is not an offer", () => {
		render(<StoragePlan rungs={LADDER} />);

		for (const index of [0, 1, 2, 4]) {
			expect(gutterOf(rowsOf()[index]).dot).not.toHaveAttribute(
				"data-screen-theme"
			);
		}
	});

	it("fills a climbed rung in the kit's own claim colour", () => {
		render(<StoragePlan rungs={LADDER} />);

		expect(gutterOf(rowsOf()[0]).dot).toHaveClass("badge-theme");
	});
});

describe("the ladder against the engine", () => {
	it("draws every rung the engine sells", () => {
		render(<StoragePlan rungs={kantoStorageRungs()} />);

		expect(rowsOf()).toHaveLength(storagePlanCount);
	});

	it("reproduces the mock's frame from the engine's own ladder", () => {
		render(<StoragePlan rungs={kantoStorageRungs()} />);

		const rows = rowsOf();
		expect(rows[0]).toHaveTextContent(/256 KB\s*·\s*free/);
		expect(rows[KANTO_PLAN_TIER]).toHaveTextContent("1 MB");
		expect(rows[KANTO_PLAN_TIER]).toHaveTextContent("current");
		expect(
			screen.getByRole("button", { name: "rent 2 MB · 224 KB a gate" })
		).toBeEnabled();
		expect(sentence("opens once a run has held 2 MB")).toBeInTheDocument();
	});

	it("masks every rung above the one the peak opened, never just the next", () => {
		render(<StoragePlan rungs={kantoStorageRungs()} />);

		expect(screen.getAllByText("locked").length).toBeGreaterThan(1);
	});

	it("opens the free rung and one paid rung to an account holding nothing", () => {
		render(<StoragePlan rungs={kantoStorageRungs(0, 0, 0)} />);

		expect(screen.getAllByRole("button", { name: /^rent/ })).toHaveLength(1);
		expect(screen.getAllByText("locked")).toHaveLength(storagePlanCount - 2);
	});

	it("refuses a rung the balance cannot bill", () => {
		render(<StoragePlan rungs={kantoStorageRungs(2, 1024, 96)} />);

		expect(screen.getByRole("button", { name: /^rent 2 MB/ })).toBeDisabled();
		expect(sentence("bills 224 KB a gate, you hold 96 KB")).toBeInTheDocument();
	});
});
