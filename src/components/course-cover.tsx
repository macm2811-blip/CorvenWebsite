"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./course-cover.module.css";

/** Decorative artwork: the course title and action are provided by the card. */
export function CourseCover({ url, color = "#2C55A2", level }: { url?: string; color?: string; level: string }) {
  const [failedUrl, setFailedUrl] = useState<string>();
  return <div className={styles.cover} style={{ backgroundColor: color }}>
    {url && url !== failedUrl ? <Image src={url} alt="" fill unoptimized sizes="(max-width: 700px) 100vw, 33vw" className={styles.photo} onError={() => setFailedUrl(url)} /> :
      <div className={styles.fallback}><Image src="/brand/level-up/logo-horizontal-transparent.png" width={220} height={80} alt="" /></div>}
    <span className={styles.level}>{level}</span>
  </div>;
}
