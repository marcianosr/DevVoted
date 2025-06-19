import { createFileRoute } from "@tanstack/react-router";

const PollDetail: React.FC = () => {
	const { pollId } = Route.useParams();

	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-4">Poll ID: {pollId}</h1>
			<p className="text-gray-600">
				This is a placeholder for poll content with ID: {pollId}
			</p>
		</div>
	);
};

export const Route = createFileRoute("/polls/$pollId")({
	component: PollDetail,
});
