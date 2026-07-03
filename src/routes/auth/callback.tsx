import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { getSupabaseServerClient } from "~/utils/supabase";

const exchangeCodeForSession = createServerFn({ method: "GET" })
	.validator((data: { code: string }) => data)
	.handler(async ({ data }) => {
		const { code } = data;

		if (!code) {
			return {
				success: false,
				error: "No authorization code provided",
			};
		}

		try {
			const supabase = await getSupabaseServerClient();
			const { data: sessionData, error } =
				await supabase.auth.exchangeCodeForSession(code);

			if (error) {
				return {
					success: false,
					error: error.message,
				};
			}

			return {
				success: true,
				session: sessionData.session,
			};
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: "Failed to exchange code for session",
			};
		}
	});

export const Route = createFileRoute("/auth/callback")({
	validateSearch: (search: Record<string, unknown>) => ({
		code: (search.code as string) || "",
		error: (search.error as string) || undefined,
	}),
	beforeLoad: async ({ search }) => {
		if (search.error) {
			throw redirect({
				to: "/login",
			});
		}

		if (!search.code) {
			throw redirect({
				to: "/login",
			});
		}

		const result = await exchangeCodeForSession({
			data: { code: search.code },
		});

		if (!result.success) {
			throw redirect({
				to: "/login",
			});
		}

		throw redirect({
			to: "/daily-poll",
		});
	},
});
