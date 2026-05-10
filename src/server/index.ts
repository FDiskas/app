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
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap" rel="stylesheet">
                <style>
                    :root {
                        --primary: #8b5cf6;
                        --primary-hover: #7c3aed;
                        --bg: #020617;
                        --card-bg: #0f172a;
                        --text: #f8fafc;
                        --text-muted: #94a3b8;
                    }
                    * { box-sizing: border-box; }
                    body { 
                        background: var(--bg); 
                        color: var(--text); 
                        font-family: 'Outfit', sans-serif; 
                        display: flex; 
                        flex-direction: column; 
                        align-items: center; 
                        justify-content: center; 
                        min-height: 100vh; 
                        margin: 0;
                        padding: 24px;
                        overflow: hidden;
                    }
                    .background {
                        position: fixed;
                        top: 0; left: 0; right: 0; bottom: 0;
                        background: radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
                        z-index: -1;
                    }
                    .card {
                        background: rgba(15, 23, 42, 0.8);
                        padding: 3.5rem 2.5rem;
                        border-radius: 2.5rem;
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
                        max-width: 420px;
                        width: 100%;
                        border: 1px solid rgba(255, 255, 255, 0.08);
                        backdrop-filter: blur(20px);
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                        animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                    }
                    @keyframes slideUp {
                        from { opacity: 0; transform: translateY(40px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .badge {
                        display: inline-flex;
                        align-items: center;
                        padding: 0.5rem 1rem;
                        border-radius: 9999px;
                        font-size: 0.75rem;
                        font-weight: 600;
                        background: rgba(139, 92, 246, 0.1);
                        color: var(--primary);
                        margin-bottom: 2rem;
                        border: 1px solid rgba(139, 92, 246, 0.2);
                        letter-spacing: 0.05em;
                        text-transform: uppercase;
                    }
                    .icon-wrapper {
                        position: relative;
                        margin-bottom: 1.5rem;
                    }
                    .icon {
                        width: 112px;
                        height: 112px;
                        border-radius: 24%;
                        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4);
                        object-fit: cover;
                        position: relative;
                        z-index: 1;
                    }
                    .icon-glow {
                        position: absolute;
                        top: 50%; left: 50%;
                        transform: translate(-50%, -50%);
                        width: 140%; height: 140%;
                        background: radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%);
                        z-index: 0;
                    }
                    h1 {
                        font-size: 1.75rem;
                        font-weight: 800;
                        margin: 0 0 0.75rem 0;
                        color: #fff;
                        letter-spacing: -0.02em;
                    }
                    p {
                        color: var(--text-muted);
                        margin: 0 0 2.5rem 0;
                        font-size: 1rem;
                        line-height: 1.5;
                    }
                    .btn-group {
                        width: 100%;
                        display: flex;
                        flex-direction: column;
                        gap: 0.75rem;
                    }
                    .btn { 
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        background: var(--primary); 
                        color: white; 
                        padding: 1rem 1.5rem; 
                        border-radius: 1rem; 
                        text-decoration: none; 
                        font-weight: 600;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        width: 100%;
                        gap: 0.75rem;
                        border: none;
                        font-size: 1rem;
                    }
                    .btn:hover {
                        background: var(--primary-hover);
                        transform: translateY(-2px);
                        box-shadow: 0 10px 20px -5px rgba(124, 58, 237, 0.4);
                    }
                    .btn-secondary {
                        background: rgba(255, 255, 255, 0.03);
                        border: 1px solid rgba(255, 255, 255, 0.08);
                    }
                    .btn-secondary:hover {
                        background: rgba(255, 255, 255, 0.08);
                        border-color: rgba(255, 255, 255, 0.15);
                    }
                    .footer {
                        margin-top: 2.5rem;
                        color: var(--text-muted);
                        font-size: 0.75rem;
                        font-weight: 500;
                        letter-spacing: 0.05em;
                        opacity: 0.6;
                    }
                </style>
                ${redirectUrl ? `<meta http-equiv="refresh" content="2;url=${redirectUrl}">` : ""}
            </head>
            <body>
                <div class="background"></div>
                <div class="card">
                    <span class="badge">Redirecting...</span>
                    
                    <div class="icon-wrapper">
                        <div class="icon-glow"></div>
                        ${appIcon ? `<img src="${appIcon}" class="icon" alt="${appName}">` : ""}
                    </div>

                    <h1>${appName}</h1>
                    <p>You are being redirected to the official store.</p>
                    
                    <div class="btn-group">
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
                </div>
                <div class="footer">
                    POWERED BY APPLINK
                </div>
            </body>
        </html>
    `);
});

export default {
    port: 3000,
    fetch: app.fetch,
};
