import { Hono } from "hono";
import { RPCHandler } from "@orpc/server/fetch";
import { router } from "./router";
import { prisma } from "./db";
import { getRedirectUrl } from "./utils";

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
    if (slug === "api" || slug === "static" || slug === "edit" || slug === "favicon.ico") return; 

    const link = await prisma.shortLink.findUnique({
        where: { slug },
    });

    if (!link) return c.notFound();

    const userAgent = c.req.header("user-agent") || "";
    const redirectUrl = getRedirectUrl(userAgent, link);

    // If it's a mobile device and we have a direct store link, redirect immediately
    // but the user wants to "see Meta data", so maybe we should ALWAYS show the page 
    // or only show it if it's not a direct redirect?
    // "on redirect page - i would like to see Meta data about the app we going to be redirected to"
    // This sounds like they want an intermediate page.
    
    const appName = link.iosName || link.androidName || "App";
    const appIcon = link.iosIcon || link.androidIcon || "";

    return c.html(`
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${appName} - AppLink</title>
                <style>
                    :root {
                        --primary: #8b5cf6;
                        --primary-hover: #7c3aed;
                        --bg: #020617;
                        --card-bg: #0f172a;
                        --text: #f8fafc;
                        --text-muted: #94a3b8;
                    }
                    body { 
                        background: var(--bg); 
                        color: var(--text); 
                        font-family: 'Inter', -apple-system, system-ui, sans-serif; 
                        display: flex; 
                        flex-direction: column; 
                        align-items: center; 
                        justify-content: center; 
                        min-height: 100vh; 
                        margin: 0;
                        padding: 20px;
                        text-align: center;
                    }
                    .card {
                        background: var(--card-bg);
                        padding: 3rem;
                        border-radius: 1.5rem;
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                        max-width: 400px;
                        width: 100%;
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(10px);
                        animation: fadeIn 0.5s ease-out;
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .icon {
                        width: 96px;
                        height: 96px;
                        border-radius: 22%;
                        margin-bottom: 1.5rem;
                        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
                        object-fit: cover;
                    }
                    h1 {
                        font-size: 1.5rem;
                        font-weight: 700;
                        margin: 0 0 0.5rem 0;
                        background: linear-gradient(to right, #fff, #94a3b8);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                    }
                    p {
                        color: var(--text-muted);
                        margin-bottom: 2rem;
                        font-size: 0.95rem;
                    }
                    .btn { 
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        background: var(--primary); 
                        color: white; 
                        padding: 0.875rem 1.5rem; 
                        border-radius: 0.75rem; 
                        text-decoration: none; 
                        font-weight: 600;
                        transition: all 0.2s;
                        width: 100%;
                        margin-bottom: 0.75rem;
                        gap: 0.5rem;
                    }
                    .btn:hover {
                        background: var(--primary-hover);
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
                    }
                    .btn-secondary {
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                    }
                    .btn-secondary:hover {
                        background: rgba(255, 255, 255, 0.1);
                    }
                    .badge {
                        display: inline-block;
                        padding: 0.25rem 0.75rem;
                        border-radius: 9999px;
                        font-size: 0.75rem;
                        font-weight: 600;
                        background: rgba(139, 92, 246, 0.1);
                        color: var(--primary);
                        margin-bottom: 1rem;
                    }
                </style>
                ${redirectUrl ? `<meta http-equiv="refresh" content="2;url=${redirectUrl}">` : ""}
            </head>
            <body>
                <div class="card">
                    <span class="badge">Redirecting...</span>
                    ${appIcon ? `<img src="${appIcon}" class="icon" alt="${appName}">` : ""}
                    <h1>${appName}</h1>
                    <p>You are being redirected to the official store.</p>
                    
                    ${link.iosId ? `
                        <a href="https://apps.apple.com/app/id${link.iosId}" class="btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05 1.79-3.48 1.79-1.42 0-1.85-.87-3.51-.87-1.66 0-2.14.85-3.51.87-1.39.02-2.33-.78-3.32-1.77-2.02-2.03-3.57-5.74-3.57-8.91 0-3.15 1.62-4.83 3.19-4.83 1.57 0 2.45.92 3.42.92.97 0 2.11-.92 3.66-.92 1.3 0 2.5.58 3.2 1.45-2.61 1.58-2.19 5.34.42 6.51-.89 2.15-2.43 4.54-3.5 5.76zM13.62 3.32c.7-1.12.35-2.68-.45-3.32-1.16-.92-2.66-.35-3.36.77-.71 1.13-.36 2.7.44 3.33 1.16.92 2.67.35 3.37-.78z"/></svg>
                            App Store
                        </a>
                    ` : ""}
                    
                    ${link.androidId ? `
                        <a href="https://play.google.com/store/apps/details?id=${link.androidId}" class="btn btn-secondary">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.61 3 21.09 3 20.5ZM14.4 12.71L18.71 17.02L4.69 22.15L14.4 12.71ZM15.11 12L5.15 2.04L18.71 6.98L15.11 12ZM15.82 11.29L19.5 9.94C20.31 9.64 20.88 8.87 20.88 7.97V16.03C20.88 16.93 20.31 17.7 19.5 18L15.82 12.71L15.82 11.29Z"/></svg>
                            Google Play
                        </a>
                    ` : ""}
                </div>
                <div style="margin-top: 2rem; color: var(--text-muted); font-size: 0.75rem;">
                    Powered by AppLink
                </div>
            </body>
        </html>
    `);
});

export default {
    port: 3000,
    fetch: app.fetch,
};
