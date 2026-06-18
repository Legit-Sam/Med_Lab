import "server-only";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

import { getCurrentUser } from "@/lib/auth";

export { getCurrentUser as getCurrentDbUser };
export { getCurrentUser as findCurrentDbUser };
