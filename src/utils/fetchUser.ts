import { ensureUserExists } from "~/domains/users/services/userSync.service";
import { Sentry } from "./sentry";
import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "../utils/supabase";

export const fetchUser = createServerFn({ method: "GET" }).handler(async () => {
	try {
		const supabase = getSupabaseServerClient();
		const { data, error } = await supabase.auth.getUser();

		if (error) {
			Sentry.captureException(error, {
				level: "warning",
				extra: {
					operation: "fetchUser.getUser",
				},
			});
			return null;
		}

		if (!data.user?.email) {
			return null;
		}

		const user = await ensureUserExists({
			id: data.user.id,
			email: data.user.email,
			displayName:
				data.user.user_metadata?.display_name ||
				data.user.user_metadata?.full_name,
			photoUrl: data.user.user_metadata?.avatar_url,
		});

		return user;
	} catch (error) {
		Sentry.captureException(error, {
			level: "warning",
			extra: {
				operation: "fetchUser.ensureUserExists",
			},
		});
		return null;
	}
});
