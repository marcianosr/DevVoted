import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { ensureUserExists } from "~/modules/account/auth/application/userSync.service";
import {
	identifyUser,
	reportHandledFailure,
} from "~/shared/utils/errorReporting";
import { getSupabaseServerClient } from "~/shared/utils/supabase";

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

		throw redirect({
			href: data.redirectUrl || "/",
		});
	});

export const fetchUser = createServerFn({ method: "GET" }).handler(async () => {
	try {
		const supabase = getSupabaseServerClient();
		const { data, error } = await supabase.auth.getUser();

		if (error) {
			reportHandledFailure(error, "fetchUser.getUser");
			return null;
		}

		if (!data.user?.email) return null;

		identifyUser(data.user.id);

		return await ensureUserExists({
			id: data.user.id,
			email: data.user.email,
			displayName:
				data.user.user_metadata?.display_name ||
				data.user.user_metadata?.full_name,
			photoUrl: data.user.user_metadata?.avatar_url,
		});
	} catch (error) {
		reportHandledFailure(error, "fetchUser.ensureUserExists");
		return null;
	}
});
