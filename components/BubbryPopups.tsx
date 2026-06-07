"use client";

import { useEffect, useState, useRef, useCallback } from "react";

/**
 * BubbryPopups — replaces the browser's native alert() with a centered,
 * branded modal. Mount once inside <body>. No other code changes needed:
 * every existing alert(...) across the app automatically renders as a
 * styled centered popup that auto-detects success vs error and auto-dismisses.
 *
 * Also exposes window.bubbryConfirm(msg): Promise<boolean> — a branded
 * Yes/No modal for code that can `await` it. Native confirm() is left as-is
 * (it is synchronous and cannot be replaced by an async modal without
 * editing each call site).
 */

type Kind = "success" | "error" | "info";
interface Toast { id: number; kind: Kind; message: string; }
interface ConfirmState { message: string; resolve: (v: boolean) => void; }

function classify(message: string): Kind {
  const m = (message || "").toLowerCase();
  if (/(fail|error|wrong|invalid|cannot|can't|couldn't|unable|denied|expired|missing|required|please enter|please select|not registered|already)/.test(m)) return "error";
  if (/(success|confirmed|placed|saved|updated|added|sent|done|✓|✅|complete|approved|now live|welcome|paid)/.test(m)) return "success";
  return "info";
}

export default function BubbryPopups() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const idRef = useRef(1);

  const pushToast = useCallback((message: string) => {
    if (!message) return;
    const id = idRef.current++;
    const kind = classify(message);
    setToasts((t) => [...t, { id, kind, message }]);
    const ms = kind === "error" ? 4000 : 2600;
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ms);
  }, []);

  useEffect(() => {
    const nativeAlert = window.alert.bind(window);
    (window as any).alert = (msg?: any) => {
      try { pushToast(String(msg ?? "")); } catch { nativeAlert(msg); }
    };
    (window as any).bubbryConfirm = (msg?: any): Promise<boolean> =>
      new Promise((resolve) => setConfirmState({ message: String(msg ?? ""), resolve }));
    return () => { (window as any).alert = nativeAlert; };
  }, [pushToast]);

  const icon = (k: Kind) => k === "success" ? "✓" : k === "error" ? "!" : "i";
  const color = (k: Kind) => k === "success" ? "#00875A" : k === "error" ? "#E53E3E" : "#1A6BFF";
  const bg = (k: Kind) => k === "success" ? "#E6FAF4" : k === "error" ? "#FFF0F0" : "#EBF1FF";

  return (
    <>
      <style>{`
        @keyframes bubbry-pop-in { from { opacity:0; transform:translate(-50%,-46%) scale(0.94); } to { opacity:1; transform:translate(-50%,-50%) scale(1); } }
        @keyframes bubbry-fade { from{opacity:0;} to{opacity:1;} }
        .bubbry-pop-overlay { position:fixed; inset:0; z-index:99999; display:flex; align-items:center; justify-content:center; pointer-events:none; font-family:'Plus Jakarta Sans','Segoe UI',sans-serif; }
        .bubbry-pop-card { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background:#fff; border-radius:20px; padding:28px 26px; box-shadow:0 20px 60px rgba(13,27,62,0.25); max-width:300px; width:84%; text-align:center; pointer-events:auto; cursor:pointer; animation:bubbry-pop-in 0.22s cubic-bezier(.2,.9,.3,1.2); }
        .bubbry-pop-icon { width:56px; height:56px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:900; margin:0 auto 14px; }
        .bubbry-pop-msg { font-size:15px; font-weight:600; color:#0D1B3E; line-height:1.5; white-space:pre-line; }
        .bubbry-cfm-backdrop { position:fixed; inset:0; z-index:100000; background:rgba(13,27,62,0.45); display:flex; align-items:center; justify-content:center; animation:bubbry-fade 0.15s ease; font-family:'Plus Jakarta Sans','Segoe UI',sans-serif; }
        .bubbry-cfm-card { background:#fff; border-radius:20px; padding:26px 24px; box-shadow:0 20px 60px rgba(13,27,62,0.3); max-width:320px; width:86%; text-align:center; animation:bubbry-pop-in 0.22s cubic-bezier(.2,.9,.3,1.2); }
        .bubbry-cfm-msg { font-size:15px; font-weight:600; color:#0D1B3E; line-height:1.55; margin-bottom:22px; white-space:pre-line; }
        .bubbry-cfm-row { display:flex; gap:10px; }
        .bubbry-cfm-btn { flex:1; padding:13px; border-radius:12px; font-size:14px; font-weight:800; cursor:pointer; font-family:inherit; border:none; }
        .bubbry-cfm-no { background:#F4F6FB; color:#4A5880; }
        .bubbry-cfm-yes { background:#1A6BFF; color:#fff; }
      `}</style>

      {toasts.length > 0 && (
        <div className="bubbry-pop-overlay">
          {(() => {
            const t = toasts[toasts.length - 1];
            return (
              <div key={t.id} className="bubbry-pop-card" onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}>
                <div className="bubbry-pop-icon" style={{ background: bg(t.kind), color: color(t.kind) }}>{icon(t.kind)}</div>
                <div className="bubbry-pop-msg">{t.message}</div>
              </div>
            );
          })()}
        </div>
      )}

      {confirmState && (
        <div className="bubbry-cfm-backdrop" onClick={(e) => { if (e.target === e.currentTarget) { confirmState.resolve(false); setConfirmState(null); } }}>
          <div className="bubbry-cfm-card">
            <div className="bubbry-cfm-msg">{confirmState.message}</div>
            <div className="bubbry-cfm-row">
              <button className="bubbry-cfm-btn bubbry-cfm-no" onClick={() => { confirmState.resolve(false); setConfirmState(null); }}>Cancel</button>
              <button className="bubbry-cfm-btn bubbry-cfm-yes" onClick={() => { confirmState.resolve(true); setConfirmState(null); }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
