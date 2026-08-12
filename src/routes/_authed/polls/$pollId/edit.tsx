import { useMutation } from "@tanstack/react-query";
import {
	createFileRoute,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import {
	getPollByIdWithOptions,
	updatePollServerFn,
} from "~/domains/polls/api/polls";
import { PollForm } from "~/domains/polls/components/PollForm.component";
import { ADMIN_EMAILS } from "~/shared/utils/adminAuth";
import { getSupabaseServerClient } from "~/shared/utils/supabase";

const checkAdminAccess = createServerFn({ method: "GET" }).handler(async () => {
	const supabase = await getSupabaseServerClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		return { hasAccess: false };
	}

	const hasAccess = ADMIN_EMAILS.includes(user.email as any);
	return { hasAccess };
});

export const Route = createFileRoute("/_authed/polls/$pollId/edit")({
	beforeLoad: async () => {
		const result = await checkAdminAccess();
		if (!result.hasAccess) {
			throw new Error("Admin access required");
		}
	},
	loader: async ({ params }) => {
		const response = await getPollByIdWithOptions({
			data: { id: Number(params.pollId) },
		});

		if (!response.success) {
			throw new Error(response.error);
		}

		return response.data;
	},
	errorComponent: ({ error }) => {
		if (error.message === "Admin access required") {
			return (
				<div className="flex items-center justify-center min-h-screen">
					<div className="text-center">
						<h1 className="text-2xl text-red-600 mb-4">Access Denied</h1>
						<p>This area is restricted to administrators only.</p>
					</div>
				</div>
			);
		}
		return (
			<div className="max-w-3xl mx-auto p-4">
				<h1 className="text-red-500 text-3xl">Error loading poll</h1>
				<p className="text-gray-400 mt-2">{error.message}</p>
			</div>
		);
	},
	pendingComponent: () => (
		<div className="max-w-3xl mx-auto p-4">
			<div className="animate-pulse">Loading poll...</div>
		</div>
	),
	component: EditPoll,
});

function EditPoll() {
	const router = useRouter();
	const navigate = useNavigate();
	const { poll, options } = Route.useLoaderData();

	const updateMutation = useMutation({
		mutationFn: async (
			data: Parameters<typeof updatePollServerFn>[0]["data"]
		) => {
			const response = await updatePollServerFn({ data });
			if (!response.success) {
				throw new Error(response.error);
			}
			return response.data;
		},
		onSuccess: async () => {
			await router.invalidate();
			navigate({ to: "/polls/$pollId", params: { pollId: String(poll.id) } });
		},
	});

	const handleSubmit = async (
		formData: Omit<Parameters<typeof updatePollServerFn>[0]["data"], "id">
	) => {
		await updateMutation.mutateAsync({
			id: poll.id,
			...formData,
		});
	};

	return (
		<div className="max-w-3xl mx-auto p-4">
			<h1 className="text-3xl font-bold text-theme mb-6">
				Edit Poll #{poll.pollNumber ?? poll.id}
			</h1>

			{updateMutation.error && (
				<div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
					<p className="text-red-400">{updateMutation.error.message}</p>
				</div>
			)}

			<PollForm
				initialData={{ ...poll, options }}
				onSubmit={handleSubmit}
				isSubmitting={updateMutation.isPending}
				isAdmin
			/>
		</div>
	);
}
