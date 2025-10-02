"use client";

import { ConvexReactClient } from "convex/react";

export const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Export individual functions for direct usage
export { api } from "../../convex/_generated/api";