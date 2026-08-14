import * as Sentry from "@sentry/react";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { ensureUserExists } from "~/modules/account/auth/application/userSync.service";
import { getSupabaseServerClient } from "~/shared/utils/supabase";

/**
 * Both live here rather than beside the routes that call them. `Login` needs
 * `loginFn` and `/_authed` renders `Login` on an auth error, so defining the
 * server function in the route file made the two import each other.
 */
export const loginFn = createServerFn({ method: "POST" })
	.validator((d: { email: string; password: string }) => d)
	.handler(async ({ data }) => {
		const supabase = await getSupabaseServerClient();
		const { error } = await supabase.auth.signInWithPassword({
			email: data.email,
			password: data.password,
		});

		if (error) {
			return {
				error: true,
				message: error.message,
			};
		}
	});

export const signupFn = createServerFn({ method: "POST" })
	.validator(
		(d: { email: string; password: string; redirectUrl?: string }) => d
	)
	.handler(async ({ data }) => {
		const supabase = await getSupabaseServerClient();
		const { error } = await supabase.auth.signUp({
			email: data.email,
			password: data.password,
		});
		if (error) {
			return {
				error: true,
				message: error.message,
			};
		}

		// Redirect to the prev page stored in the "redirect" search param
		throw redirect({
			href: data.redirectUrl || "/",
		});
	});

/**
 * The session's user, created in our own tables on first sight. Returns null
 * rather than throwing on any failure: the root route builds its context from
 * this, and a logged-out visitor is the ordinary case, not an error.
 */
export const fetchUser = createServerFn({ method: "GET" }).handler(async () => {
	try {
		const supabase = getSupabaseServerClient();
		const { data, error } = await supabase.auth.getUser();

		if (error) {
			Sentry.captureException(error, {
				level: "warning",
				extra: { operation: "fetchUser.getUser" },
			});
			return null;
		}

		if (!data.user?.email) return null;

		return await ensureUserExists({
			id: data.user.id,
			email: data.user.email,
			displayName:
				data.user.user_metadata?.display_name ||
				data.user.user_metadata?.full_name,
			photoUrl: data.user.user_metadata?.avatar_url,
		});
	} catch (error) {
		Sentry.captureException(error, {
			level: "warning",
			extra: { operation: "fetchUser.ensureUserExists" },
		});
		return null;
	}
});
