import { Hono } from "hono";
import { auth } from "./auth";
import { RPCHandler } from "@orpc/server/fetch";
import { router } from "./router";
import { PrismaClient } from "@prisma/client";
import { getRedirectUrl } from "./utils";

const app = new Hono();
const prisma = new PrismaClient();

// Better-Auth handler
app.on(["POST", "GET"], "/api/auth/*", (c) => {
    return auth.handler(c.req.raw);
});

// oRPC handler
const orpcHandler = new RPCHandler(router);
app.all("/api/rpc/*", async (c) => {
    const { matched, response } = await orpcHandler.handle(c.req.raw, {
        prefix: "/api/rpc",
    });
    if (matched) return response;
    return c.notFound();
});

// Redirect logic
app.get("/:slug", async (c) => {
    const slug = c.req.param("slug");
    if (slug === "api" || slug === "static" || slug === "edit") return; // Skip API, static, and edit

    const link = await prisma.shortLink.findUnique({
        where: { slug },
    });

    if (!link) return c.notFound();

    const userAgent = c.req.header("user-agent") || "";
    const redirectUrl = getRedirectUrl(userAgent, link);

    if (redirectUrl) {
        return c.redirect(redirectUrl);
    }

    // Fallback: Show a landing page or redirect to a default
    return c.html(`
        <html>
            <head>
                <title>Redirecting...</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { background: #020617; color: white; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                    .btn { background: #7c3aed; color: white; padding: 1rem 2rem; border-radius: 0.5rem; text-decoration: none; margin: 1rem; font-weight: bold; }
                </style>
            </head>
            <body>
                <h1>AppLink</h1>
                ${link.iosId ? `<a href="https://apps.apple.com/app/id${link.iosId}" class="btn">Download on App Store</a>` : ""}
                ${link.androidId ? `<a href="https://play.google.com/store/apps/details?id=${link.androidId}" class="btn">Get it on Google Play</a>` : ""}
            </body>
        </html>
    `);
});

export default {
    port: 3000,
    fetch: app.fetch,
};
