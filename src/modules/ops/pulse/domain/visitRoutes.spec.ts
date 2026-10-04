import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { KNOWN_ROUTE_IDS } from "~/modules/ops/pulse/domain/visit.model";

const generatedRouteIds = (): string[] => {
	const tree = readFileSync(
		resolve(process.cwd(), "src/routeTree.gen.ts"),
		"utf8"
	);
	const block = tree.match(/interface FileRoutesById \{([\s\S]*?)\n\}/);
	if (!block) throw new Error("FileRoutesById not found in routeTree.gen.ts");
	return [...block[1].matchAll(/'([^']+)':/g)].map((match) => match[1]);
};

describe("KNOWN_ROUTE_IDS", () => {
	it("matches the generated route tree, so a new route does not silently lose its visits", () => {
		expect([...KNOWN_ROUTE_IDS].sort()).toEqual(generatedRouteIds().sort());
	});
});
