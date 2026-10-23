import { auth } from "@/lib/auth/server";

// Neon Auth exchanges the OAuth verifier on the landing route and sets the
// application session cookies before the protected page is rendered.
export default auth.middleware({ loginUrl: "/auth" });

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
