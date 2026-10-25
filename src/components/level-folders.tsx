"use client";
import type {LmsCourse} from "@/lib/lms/types";
import styles from "./level-folders.module.css";
export function LevelFolders({levels,courses,onOpen}:{levels:string[];courses:LmsCourse[];onOpen:(level:string)=>void}) {
  return <div className={styles.grid}>{levels.map(level=>{const count=courses.filter(c=>c.level.split(" · ")[0]===level).length;return <button className={styles.folder} key={level} onClick={()=>onOpen(level)} type="button" aria-label={`Explore ${level} · ${count} courses`}><span><strong>{level}</strong><small>{count} {count===1?"course":"courses"}</small></span></button>})}</div>;
}
