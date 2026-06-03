import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { RPCHandler } from "@orpc/server/fetch";
import { renderToString } from "react-dom/server";
import { readFileSync } from "fs";
import { join } from "path";
import { router } from "./router";
import { ensureShortLinkSchemaCompatibility, prisma } from "./db";
import { getRedirectUrl } from "./utils";
import { RedirectPage } from "./RedirectPage";
import { cleanupShortLink } from "./linkCleanup";

await ensureShortLinkSchemaCompatibility();

const app = new Hono();

const distPath = join(import.meta.dir, "../../dist/client");

let cachedIndexHtml: string | null = null;

const serveSPAFallback = () => {
    if (cachedIndexHtml) return cachedIndexHtml;
    
    try {
        const indexPath = join(distPath, "index.html");
        cachedIndexHtml = readFileSync(indexPath, "utf-8");
        return cachedIndexHtml;
    } catch (e) {
        throw new Error(`index.html not found at ${join(distPath, "index.html")}. Did you run 'bun run build'?`);
    }
};

const orpcHandler = new RPCHandler(router);
app.all("/api/rpc/*", async (c) => {
    try {
        const { matched, response } = await orpcHandler.handle(c.req.raw, {
            prefix: "/api/rpc",
        });
        if (matched) return response;
        return c.notFound();
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const stack = err instanceof Error ? err.stack : undefined;
        console.error(`[oRPC] ${c.req.method} ${c.req.path} failed:`, err);
        return c.json({ error: message, stack }, 500);
    }
});

app.get("/assets/*", async (c) => {
    const filePath = join(distPath, c.req.path);
    const file = Bun.file(filePath);

    if (!(await file.exists())) {
        return c.notFound();
    }

    return new Response(file);
});

app.use("/", serveStatic({ root: distPath }));

app.get("/:slug", async (c) => {
    const slug = c.req.param("slug");

    const link = await prisma.shortLink.findUnique({
        where: { slug },
    });

    if (link) {
        const cleanedLink = await cleanupShortLink(link);

        if (!cleanedLink) {
            return c.html(serveSPAFallback());
        }

        const userAgent = c.req.header("user-agent") || "";
        const isMobile = /Android|iPhone|iPad|iPod/i.test(userAgent);
        const redirectUrl = isMobile ? getRedirectUrl(userAgent, cleanedLink) : null;

        const appName = cleanedLink.iosName || cleanedLink.androidName || "App";
        const appIcon = cleanedLink.iosIcon || cleanedLink.androidIcon || "";

        const html = renderToString(
            <RedirectPage 
                appName={appName}
                appIcon={appIcon}
                iosId={cleanedLink.iosId}
                androidId={cleanedLink.androidId}
                redirectUrl={redirectUrl}
            />
        );

        return c.html(`<!DOCTYPE html>${html}`);
    }

    return c.html(serveSPAFallback());
});

app.get("*", (c) => {
    return c.html(serveSPAFallback());
});

export default {
    port: 3000,
    fetch: app.fetch,
};
