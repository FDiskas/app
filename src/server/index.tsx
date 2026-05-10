import { Hono } from "hono";
import { RPCHandler } from "@orpc/server/fetch";
import { renderToString } from "react-dom/server";
import { router } from "./router";
import { prisma } from "./db";
import { getRedirectUrl } from "./utils";
import { RedirectPage } from "./RedirectPage";

const app = new Hono();

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
    const reserved = ["api", "static", "edit", "favicon.ico", "manifest.json", "robots.txt"];
    if (reserved.includes(slug)) return;

    const link = await prisma.shortLink.findUnique({
        where: { slug },
    });

    if (!link) return c.notFound();

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
});

export default {
    port: 3000,
    fetch: app.fetch,
};
