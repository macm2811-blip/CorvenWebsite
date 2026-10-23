"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./learning-viewer.module.css";

const subscribe = () => () => {};

export function LearningViewer({ title, children, onClose, contentClassName }: { title: string; children: ReactNode; onClose?: () => void; contentClassName?: string }) {
  const [expanded, setExpanded] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  const [error, setError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const inline = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ready && expanded && !dialog.current?.open) dialog.current?.showModal();
  }, [ready, expanded]);
  useEffect(() => {
    const changed = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", changed);
    return () => { document.removeEventListener("fullscreenchange", changed); };
  }, []);
  async function toggleFullscreen() {
    setError("");
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else {
        const target = expanded ? document.documentElement : inline.current;
        if (!target?.requestFullscreen) throw new Error();
        await target.requestFullscreen();
      }
    } catch { setError("Full screen is unavailable in this browser. Use the expanded view instead."); }
  }
  async function resize() {
    if (document.fullscreenElement) await document.exitFullscreen();
    setError("");
    setExpanded(!expanded);
  }
  async function close() {
    if (document.fullscreenElement) await document.exitFullscreen();
    onClose?.();
  }
  const content = <>
    <header className={styles.toolbar}><strong>{title}</strong><div>
      <button type="button" onClick={() => void resize()}>{expanded ? "Restore view" : "Expand view"}</button>
      <button type="button" onClick={() => void toggleFullscreen()}>{fullscreen ? "Exit full screen" : "Full screen"}</button>
      {onClose && <button type="button" onClick={() => void close()} aria-label="Close viewer">Close ×</button>}
    </div></header>
    {error && <p role="status">{error}</p>}
    <div className={styles.content}><div className={contentClassName}>{children}</div></div>
  </>;
  if (!ready) return null;
  return expanded ? createPortal(<dialog lang="en" ref={dialog} className={`${styles.dialog} ${fullscreen ? styles.fullscreen : ""}`} aria-label={title} onCancel={(event) => { event.preventDefault(); if (onClose) void close(); else setExpanded(false); }}>{content}</dialog>, document.body) : <div lang="en" ref={inline} className={styles.inline}>{content}</div>;
}
