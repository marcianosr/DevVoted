import { createBrowserClient } from "@supabase/ssr";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
	if (browserClient) {
		return browserClient;
	}

	browserClient = createBrowserClient(
		import.meta.env.VITE_SUPABASE_URL!,
		import.meta.env.VITE_SUPABASE_ANON_KEY!
	);

	return browserClient;
}
