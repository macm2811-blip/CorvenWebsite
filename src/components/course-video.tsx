"use client";

import { useState } from "react";
import { videoSource } from "@/lib/lms/video";

export function CourseVideo({ url, title }: { url: string; title: string }) {
  const [failed, setFailed] = useState(false);
  const source = videoSource(url);
  if (!source)
    return (
      <p>
        Add a valid YouTube, OneDrive or MP4/WebM link over
        HTTPS.
      </p>
    );
  return (
    <div>
      {source.type === "embed" && (
        <iframe
          src={source.url}
          title={title}
          allow="fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          style={{
            width: "100%",
            aspectRatio: "16 / 9",
            border: 0,
            borderRadius: 12,
          }}
        />
      )}
      {source.type === "file" && !failed && (
        <video
          src={source.url}
          controls
          preload="metadata"
          onError={() => setFailed(true)}
          style={{ width: "100%", borderRadius: 12 }}
        />
      )}
      {(source.type === "link" || failed) && (
        <p>
          This link plays on {source.provider}. If Microsoft asks you to
          sign in, use the account authorized by your administrator.
        </p>
      )}
      <a href={url} target="_blank" rel="noopener noreferrer">
        Open video on{source.provider} ↗
      </a>
    </div>
  );
}
