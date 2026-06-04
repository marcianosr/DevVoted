import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
	equipBorderHandler,
	getArchiveStateHandler,
	purchaseBorderHandler,
} from "./archive.handlers";

export const getArchiveStateServerFn = createServerFn({
	method: "GET",
}).handler(async () => getArchiveStateHandler());

export const purchaseBorderServerFn = createServerFn({ method: "POST" })
	.inputValidator(z.object({ borderId: z.string().min(1) }))
	.handler(async ({ data }) => purchaseBorderHandler({ data }));

export const equipBorderServerFn = createServerFn({ method: "POST" })
	.inputValidator(z.object({ borderId: z.string().min(1).nullable() }))
	.handler(async ({ data }) => equipBorderHandler({ data }));
