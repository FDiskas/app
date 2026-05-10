import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { RPCHandler } from "@orpc/server/fetch";
import { renderToString } from "react-dom/server";
import { readFileSync } from "fs";
import { join } from "path";
import { existsSync } from "fs";
import { router } from "./router";
import { prisma } from "./db";
import { getRedirectUrl } from "./utils";
import { RedirectPage } from "./RedirectPage";

const app = new Hono();

// Get the correct path to dist/client
// import.meta.dir gives us src/server, so we go up to src, then up to root, then into dist/client
const distPath = join(import.meta.dir, "../../dist/client");

// Helper function to serve SPA fallback
const serveSPAFallback = () => {
    try {
        const indexPath = join(distPath, "index.html");
        const indexHtml = readFileSync(indexPath, "utf-8");
        return indexHtml;
    } catch (e) {
        throw new Error(`index.html not found at ${join(distPath, "index.html")}. Did you run 'bun run build'?`);
    }
};

// oRPC handler
const orpcHandler = new RPCHandler(router);
app.all("/api/rpc/*", async (c) => {
    const { matched, response } = await orpcHandler.handle(c.req.raw, {
        prefix: "/api/rpc",
    });
    if (matched) return response;
    return c.notFound();
});

// Explicitly serve static assets from dist/client
app.get("/assets/*", (c) => {
    const filePath = join(distPath, c.req.path);
    try {
        const file = Bun.file(filePath);
        return new Response(file);
    } catch {
        return c.notFound();
    }
});

// Serve other static files (favicon, etc.)
app.use("/", serveStatic({ root: distPath }));

// Redirect logic: if slug exists in DB, serve from server; otherwise serve SPA
app.get("/:slug", async (c) => {
    const slug = c.req.param("slug");

    // Check if slug exists as a short link in database
    const link = await prisma.shortLink.findUnique({
        where: { slug },
    });

    // If slug exists in DB, render redirect page
    if (link) {
        const userAgent = c.req.header("user-agent") || "";
        const isMobile = /Android|iPhone|iPad|iPod/i.test(userAgent);
        const redirectUrl = isMobile ? getRedirectUrl(userAgent, link) : null;

        const appName = link.iosName || link.androidName || "App";
        const appIcon = link.iosIcon || link.androidIcon || "";

        const html = renderToString(
            <RedirectPage 
                appName={appName}
                appIcon={appIcon}
                iosId={link.iosId}
                androidId={link.androidId}
                redirectUrl={redirectUrl}
            />
        );

        return c.html(`<!DOCTYPE html>${html}`);
    }

    // If slug doesn't exist in DB, serve SPA fallback
    return c.html(serveSPAFallback());
});

// SPA fallback for multi-segment paths (e.g., /edit/something, /path/to/route)
app.get("*", (c) => {
    return c.html(serveSPAFallback());
});

export default {
    port: 3000,
    fetch: app.fetch,
};
