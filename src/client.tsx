import "./instrument.client";

import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";

import { StartClient } from "@tanstack/react-start/client";

import { reportRecoverableReactError } from "~/shared/utils/errorReporting";

startTransition(() => {
	hydrateRoot(
		document,
		<StrictMode>
			<StartClient />
		</StrictMode>,
		{ onRecoverableError: reportRecoverableReactError }
	);
});
