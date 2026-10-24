"use client";
import type {LmsCourse} from "@/lib/lms/types";
import styles from "./level-folders.module.css";
export function LevelFolders({levels,courses,onOpen}:{levels:string[];courses:LmsCourse[];onOpen:(level:string)=>void}) {
  return <div className={styles.grid}>{levels.map(level=>{const count=courses.filter(c=>c.level.split(" · ")[0]===level).length;return <button className={styles.folder} key={level} onClick={()=>onOpen(level)} type="button" aria-label={`Open ${level} folder · ${count} courses`}><svg aria-hidden="true" width="36" height="32" viewBox="0 0 36 32" fill="none"><path d="M3 8a3 3 0 0 1 3-3h8l4 4h12a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3Z" fill="#F2B885"/><path d="M3 13a3 3 0 0 1 3-3h24a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3Z" fill="#E97704"/></svg><span><strong>{level}</strong><small>{count} {count===1?"course":"courses"}</small></span><span className={styles.arrow} aria-hidden="true">→</span></button>})}</div>;
}
