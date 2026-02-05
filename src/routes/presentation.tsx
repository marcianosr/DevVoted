import { createFileRoute } from "@tanstack/react-router";

import { Presentation } from "~/presentation";

export const Route = createFileRoute("/presentation")({
	component: PresentationPage,
});

function PresentationPage() {
	return <Presentation />;
}
