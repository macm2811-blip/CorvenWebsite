"use client";
import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { artworkBackground, artworkUrlValid } from "@/lib/lms/page-artwork";
import type { LmsCourseBlockConfig } from "@/lib/lms/types";
import { CourseVideo } from "@/components/course-video";
type LessonDisplay = { title: string; content_type: string; body?: string | null; description?: string | null; youtube_url?: string | null; resource_url?: string | null; content_config?: Record<string, unknown> | null };
export function LessonContent({lesson, showTitle = false, children}: {lesson: LessonDisplay; showTitle?: boolean; children?: ReactNode}) {
  const config = (lesson.content_config ?? {}) as Partial<LmsCourseBlockConfig>;
  const url = lesson.youtube_url || lesson.resource_url || "";
  const families: Record<string, string> = {
    inter: "Inter,Arial,sans-serif",
    arial: "Arial,sans-serif",
    helvetica: "Helvetica,Arial,sans-serif",
    verdana: "Verdana,sans-serif",
    tahoma: "Tahoma,sans-serif",
    trebuchet: "'Trebuchet MS',sans-serif",
    georgia: "Georgia,serif",
    times: "'Times New Roman',serif",
    garamond: "Garamond,serif",
    palatino: "Palatino,serif",
    bookman: "Bookman,serif",
    courier: "'Courier New',monospace",
    monaco: "Monaco,monospace",
    roboto: "Roboto,Arial,sans-serif",
    "open-sans": "'Open Sans',Arial,sans-serif",
    lato: "Lato,Arial,sans-serif",
    montserrat: "Montserrat,Arial,sans-serif",
    poppins: "Poppins,Arial,sans-serif",
    merriweather: "Merriweather,Georgia,serif",
    playfair: "'Playfair Display',Georgia,serif",
  };
  const size: Record<string, number> = {
    xs: 12,
    small: 14,
    normal: 16,
    large: 20,
    xl: 24,
    title: 32,
    display: 44,
  };
  const radius: Record<string, number> = {
    none: 0,
    small: 6,
    medium: 12,
    large: 20,
  };
  const padding: Record<string, number> = {
    none: 0,
    compact: 10,
    normal: 18,
    roomy: 28,
  };
  const height: Record<string, number> = {
    compact: 1.25,
    normal: 1.55,
    relaxed: 1.75,
    spacious: 2,
  };
  return (
    <div
      style={{
        whiteSpace: "pre-wrap",
        backgroundImage: artworkBackground(config),
        backgroundSize: "cover",
        backgroundPosition: "center",
        lineHeight: height[String(config?.lineHeight)] ?? 1.55,
        fontFamily: families[String(config?.fontFamily)],
        fontSize: size[String(config?.fontSize)] ?? 16,
        fontWeight: config?.bold || config.textStyle?.startsWith("heading") ? 700 : 400,
        letterSpacing: config.letterSpacing === "tight" ? "-.02em" : config.letterSpacing === "wide" ? ".08em" : undefined,
        fontStyle: config?.italic || config.textStyle === "quote" ? "italic" : "normal",
        boxShadow: config.textStyle === "callout" ? `inset 4px 0 ${config.borderColor ?? "#2C55A2"}` : undefined,
        textDecoration:
          [
            config?.underline ? "underline" : "",
            config?.strikethrough ? "line-through" : "",
          ]
            .filter(Boolean)
            .join(" ") || "none",
        textTransform: config?.uppercase ? "uppercase" : "none",
        textAlign: (["left", "center", "right", "justify"].includes(
          String(config?.align),
        )
          ? config?.align
          : "left") as CSSProperties["textAlign"],
        color:
          typeof config?.textColor === "string" ? config.textColor : undefined,
        backgroundColor:
          typeof config?.backgroundColor === "string"
            ? config.backgroundColor
            : undefined,
        padding: padding[String(config?.padding)] ?? 18,
        borderRadius: radius[String(config?.radius)] ?? 12,
        border:
          config?.borderStyle === "solid" || config?.borderStyle === "dashed"
            ? `1px ${config.borderStyle} ${String(config.borderColor ?? "#d0d5dd")}`
            : undefined,
      }}
    >
      {typeof config?.logoUrl === "string" && config.logoUrl && (
        <LessonImage
          src={config.logoUrl}
          alt="Academy logo"
          width={140}
          height={80}
          unoptimized
          style={{ width: 100, height: 60, objectFit: "contain" }}
        />
      )}
      {typeof config?.imageUrl === "string" &&
        config.imageUrl &&
        config.imagePosition !== "behind" &&
        config.imagePosition !== "after" && (
          <LessonImage
            src={config.imageUrl}
            alt=""
            width={900}
            height={500}
            unoptimized
            style={{ maxHeight: 300, width: "100%", objectFit: "contain" }}
          />
        )}
      {showTitle && <h2 style={{color:"inherit",fontSize:"1.6em",fontWeight:700,margin:"0 0 16px"}}>{lesson.title}</h2>}
      {lesson.content_type === "youtube" && (
        <CourseVideo url={url} title={lesson.title} />
      )}
      {lesson.content_type === "image" && url && (
        <LessonImage
          src={url}
          alt={lesson.body || lesson.title}
          width={1000}
          height={600}
          unoptimized
          style={{ width: "100%", height: "auto" }}
        />
      )}
      {lesson.content_type === "audio" && url && (
        <audio src={url} controls preload="metadata" />
      )}
      {lesson.content_type === "document" && /^https:\/\//i.test(url) && (
        <div>
          {/\.pdf(?:[?#]|$)/i.test(url) && <iframe src={url} title={`${lesson.title} · PDF document`} style={{ width: "100%", height: 400, border: 0 }} sandbox="allow-scripts allow-same-origin allow-downloads" />}
          <a href={url} target="_blank" rel="noopener noreferrer">Open document ↗</a>
        </div>
      )}
      {typeof config?.imageUrl === "string" &&
        config.imageUrl &&
        config.imagePosition === "after" && (
          <LessonImage
            src={config.imageUrl}
            alt=""
            width={900}
            height={500}
            unoptimized
            style={{ maxHeight: 300, width: "100%", objectFit: "contain" }}
          />
        )}
      <p style={{fontSize:"inherit",lineHeight:"inherit",color:"inherit",margin:"12px 0"}}>
        {(lesson.body || lesson.description || "")
          .split(/(\[[^\]]+\]\(https:\/\/[^\s)]+\))/g)
          .map((part: string, index: number) => {
            const match = part.match(/^\[([^\]]+)\]\((https:\/\/[^\s)]+)\)$/);
            return match ? (
              <a
                key={index}
                href={match[2]}
                target="_blank"
                rel="noopener noreferrer"
              >
                {match[1]}
              </a>
            ) : (
              part
            );
          })}
      </p>
      {children}
    </div>
  );
}

function LessonImage(props: ImageProps) {
  const [failedUrl,setFailedUrl] = useState("");
  const source = typeof props.src === "string" ? props.src : "";
  if (!source || (!source.startsWith("blob:") && !artworkUrlValid(source))) return null;
  if (source === failedUrl) return <p role="status">Image unavailable. Check the image link or upload the file again.</p>;
  return <Image {...props} onError={()=>setFailedUrl(source)}/>;
}
