import { createContext, useContext } from "react";

import type { AccountUser } from "~/modules/account/auth/infrastructure/user.repository";

export const ViewerContext = createContext<AccountUser | null>(null);

export const useViewer = (): AccountUser | null => useContext(ViewerContext);
