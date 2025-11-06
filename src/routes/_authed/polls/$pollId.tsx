import { createFileRoute } from "@tanstack/react-router";

const PollDetail: React.FC = () => {
	return <h1>Poll id</h1>;
};

export const Route = createFileRoute("/_authed/polls/$pollId")({
	component: PollDetail,
});
