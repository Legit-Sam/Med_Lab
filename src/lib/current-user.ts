import "server-only";

import { getCurrentUser } from "@/lib/auth";

export { getCurrentUser as getCurrentDbUser };
export { getCurrentUser as findCurrentDbUser };
