import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/progress")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_authed/progress"!</div>;
}
