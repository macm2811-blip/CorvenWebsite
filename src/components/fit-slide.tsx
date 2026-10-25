"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./fit-slide.module.css";
export function FitSlide({ children }: { children: ReactNode }) {
  const frame=useRef<HTMLDivElement>(null),page=useRef<HTMLDivElement>(null);
  const [layout,setLayout]=useState({scale:1,height:undefined as number|undefined});
  useEffect(()=>{
    const box=frame.current,content=page.current;
    if(!box||!content)return;
    const viewport=box.closest<HTMLElement>("[data-learning-viewport]");
    const resize=()=>{
      let height=box.clientHeight;
      if(viewport){
        const viewportStyle=getComputedStyle(viewport);
        const top=box.getBoundingClientRect().top-viewport.getBoundingClientRect().top+viewport.scrollTop;
        const navigation=box.parentElement?.querySelector<HTMLElement>(":scope > nav");
        const navStyle=navigation?getComputedStyle(navigation):null;
        const reserved=navigation?navigation.offsetHeight+parseFloat(navStyle!.marginTop)+parseFloat(navStyle!.marginBottom):0;
        height=Math.max(120,Math.floor(viewport.clientHeight-top-reserved-parseFloat(viewportStyle.paddingBottom)-8));
      }
      const scale=Math.min(box.clientWidth/Math.max(960,content.scrollWidth),height/Math.max(540,content.scrollHeight,content.offsetHeight));
      setLayout(current=>current.height===height&&Math.abs(current.scale-scale)<0.0001?current:{height,scale});
    };
    const observer=new ResizeObserver(resize);
    observer.observe(box);observer.observe(content);if(viewport)observer.observe(viewport);
    content.addEventListener("load",resize,true);window.addEventListener("resize",resize);document.addEventListener("fullscreenchange",resize);
    resize();
    return()=>{observer.disconnect();content.removeEventListener("load",resize,true);window.removeEventListener("resize",resize);document.removeEventListener("fullscreenchange",resize);};
  },[]);
  return <div ref={frame} className={styles.frame} style={{height:layout.height}}><div ref={page} className={styles.page} style={{transform:`translate(-50%,-50%) scale(${layout.scale})`}}>{children}</div></div>;
}
