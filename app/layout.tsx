import type { Metadata } from "next";
import BubbryPopups from "../components/BubbryPopups";

export const metadata: Metadata = { title: "Bubbry Rider", description: "Delivery rider app" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var _origError = window.onerror;
                window.onerror = function(msg, src, line, col, err) {
                  if (err && err.name === 'ChunkLoadError') { handleChunkError(); return true; }
                  if (_origError) return _origError(msg, src, line, col, err);
                };
                window.addEventListener('unhandledrejection', function(e) {
                  var err = e.reason;
                  if (err && (err.name === 'ChunkLoadError' || (err.message && (err.message.indexOf('Loading chunk') !== -1 || err.message.indexOf('Failed to load chunk') !== -1)))) {
                    e.preventDefault();
                    handleChunkError();
                  }
                });
                function handleChunkError() {
                  var key = 'bubbry_chunk_reload_at';
                  var last = parseInt(sessionStorage.getItem(key) || '0', 10);
                  var now = Date.now();
                  if (now - last > 10000) {
                    sessionStorage.setItem(key, String(now));
                    window.location.reload();
                  }
                }
              })();
            `,
          }}
        />
      </head>
      <body>{children}<BubbryPopups /></body>
    </html>
  );
}
