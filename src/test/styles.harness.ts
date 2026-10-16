import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const ENTRY = "src/styles/app.css";
const LOCAL_IMPORT = /^@import "(\.{1,2}\/[^"]+)";$/gm;

const inlined = (file: string): string =>
	readFileSync(file, "utf8").replace(LOCAL_IMPORT, (_, target: string) =>
		inlined(resolve(dirname(file), target))
	);

export const allStyles = (): string => inlined(ENTRY);
