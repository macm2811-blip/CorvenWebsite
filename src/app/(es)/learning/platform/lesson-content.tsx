"use client";
import Image from "next/image";
import type { CSSProperties } from "react";
import { CourseVideo } from "@/components/course-video";
import type { studentCourseAction } from "./student-actions";
type CourseData = Awaited<ReturnType<typeof studentCourseAction>>;
export function LessonContent({
  lesson,
}: {
  lesson: CourseData["lessons"][number];
}) {
  const config = lesson.content_config as Record<string, unknown> | null;
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
        backgroundImage:
          typeof config?.backgroundImage === "string" && config.backgroundImage
            ? `url(${JSON.stringify(config.backgroundImage)})`
            : config?.imagePosition === "behind" &&
                typeof config.imageUrl === "string"
              ? `url(${JSON.stringify(config.imageUrl)})`
              : typeof config?.gradient === "string"
                ? config.gradient
                : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        lineHeight: height[String(config?.lineHeight)] ?? 1.55,
        fontFamily: families[String(config?.fontFamily)],
        fontSize: size[String(config?.fontSize)] ?? 16,
        fontWeight: config?.bold ? 700 : 400,
        fontStyle: config?.italic ? "italic" : "normal",
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
        background:
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
        <Image
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
          <Image
            src={config.imageUrl}
            alt=""
            width={900}
            height={500}
            unoptimized
            style={{ maxHeight: 300, width: "100%", objectFit: "contain" }}
          />
        )}
      {lesson.content_type === "youtube" && (
        <CourseVideo url={url} title={lesson.title} />
      )}
      {lesson.content_type === "image" && url && (
        <Image
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
        <a href={url} target="_blank" rel="noopener noreferrer">
          Open document ↗
        </a>
      )}
      {typeof config?.imageUrl === "string" &&
        config.imageUrl &&
        config.imagePosition === "after" && (
          <Image
            src={config.imageUrl}
            alt=""
            width={900}
            height={500}
            unoptimized
            style={{ maxHeight: 300, width: "100%", objectFit: "contain" }}
          />
        )}
      <p>
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
    </div>
  );
}
