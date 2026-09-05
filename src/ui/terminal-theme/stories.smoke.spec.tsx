import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { createElement, type ComponentType, type ReactElement } from "react";

const modules = import.meta.glob("./**/*.stories.tsx", { eager: true });

type Meta = {
	component?: ComponentType<Record<string, unknown>>;
	excludeStories?: readonly string[] | string;
};
type Story = {
	args?: Record<string, unknown>;
	render?: (args: Record<string, unknown>) => ReactElement;
};

const isExcluded = (meta: Meta, name: string) => {
	const list = meta.excludeStories;
	if (list === undefined) return false;
	return typeof list === "string" ? name === list : list.includes(name);
};

const storyExports = (record: Record<string, unknown>, meta: Meta) =>
	Object.entries(record).filter(
		([name]) => name !== "default" && !isExcluded(meta, name)
	);

// Storybook reads every named export as a story, so a helper other story files
// import renders as a story with no args and throws on the first `.map`. Six
// Dex panels shipped that way. An array or a function can never be a story, so
// naming it in excludeStories is the only thing that keeps it off the sidebar.
describe("no story file exports anything that cannot be a story", () => {
	for (const [path, mod] of Object.entries(modules)) {
		const record = mod as Record<string, unknown>;
		const meta = (record.default ?? {}) as Meta;

		for (const [name, value] of storyExports(record, meta)) {
			it(`${path} → ${name}`, () => {
				expect(Array.isArray(value)).toBe(false);
				expect(typeof value).toBe("object");
				expect(value).not.toBeNull();
			});
		}
	}
});

// One test per story, so a screen whose props changed under it fails here
// instead of in Storybook. Stories sit outside tsconfig, so this is the only
// automated thing between a prop rename and a broken page.
describe("every terminal-theme story renders", () => {
	for (const [path, mod] of Object.entries(modules)) {
		const record = mod as Record<string, unknown>;
		const meta = (record.default ?? {}) as Meta;

		for (const [name, value] of storyExports(record, meta)) {
			if (typeof value !== "object" || value === null) continue;
			if (Array.isArray(value)) continue;
			const story = value as Story;

			it(`${path} → ${name}`, () => {
				if (story.render === undefined && meta.component === undefined) return;
				const args = story.args ?? {};
				const element: ReactElement =
					story.render !== undefined
						? story.render(args)
						: createElement(meta.component!, args);
				expect(() => render(element)).not.toThrow();
			});
		}
	}
});
