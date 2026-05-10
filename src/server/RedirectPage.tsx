import React from "react";
import { Footer } from "../client/components/Footer";
import { REDIRECT_PAGE_STYLES } from "./redirectPageStyles";

interface RedirectPageProps {
  appName: string;
  appIcon: string;
  iosId?: string | null;
  androidId?: string | null;
  redirectUrl?: string | null;
}

export function RedirectPage({ appName, appIcon, iosId, androidId, redirectUrl }: RedirectPageProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{appName} - AppLink</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap" rel="stylesheet" />
        <style>{REDIRECT_PAGE_STYLES}</style>
        {redirectUrl && <meta httpEquiv="refresh" content={`2;url=${redirectUrl}`} />}
      </head>
      <body>
        <div className="background" />
        <div className="card">
          <span className="badge">{redirectUrl ? "Redirecting..." : "Choose Store"}</span>

          <div className="icon-wrapper">
            <div className="icon-glow" />
            {appIcon && <img src={appIcon} className="icon" alt={appName} />}
          </div>

          <h1>{appName}</h1>
          <p>
            {redirectUrl
              ? "You are being redirected to the official store."
              : "Select your preferred store to download the app."}
          </p>

          <div className="btn-group">
            {iosId && (
              <a href={`https://apps.apple.com/app/id${iosId}`} className="btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05 1.79-3.48 1.79-1.42 0-1.85-.87-3.51-.87-1.66 0-2.14.85-3.51.87-1.39.02-2.33-.78-3.32-1.77-2.02-2.03-3.57-5.74-3.57-8.91 0-3.15 1.62-4.83 3.19-4.83 1.57 0 2.45.92 3.42.92.97 0 2.11-.92 3.66-.92 1.3 0 2.5.58 3.2 1.45-2.61 1.58-2.19 5.34.42 6.51-.89 2.15-2.43 4.54-3.5 5.76zM13.62 3.32c.7-1.12.35-2.68-.45-3.32-1.16-.92-2.66-.35-3.36.77-.71 1.13-.36 2.7.44 3.33 1.16.92 2.67.35 3.37-.78z" /></svg>
                App Store
              </a>
            )}

            {androidId && (
              <a href={`https://play.google.com/store/apps/details?id=${androidId}`} className="btn btn-secondary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.61 3 21.09 3 20.5ZM14.4 12.71L18.71 17.02L4.69 22.15L14.4 12.71ZM15.11 12L5.15 2.04L18.71 6.98L15.11 12ZM15.82 11.29L19.5 9.94C20.31 9.64 20.88 8.87 20.88 7.97V16.03C20.88 16.93 20.31 17.7 19.5 18L15.82 12.71L15.82 11.29Z" /></svg>
                Google Play
              </a>
            )}
          </div>
        </div>
        <Footer />
      </body>
    </html>
  );
}
