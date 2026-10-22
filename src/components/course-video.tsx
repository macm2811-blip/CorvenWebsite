"use client";

import { useState } from "react";
import { videoSource } from "@/lib/lms/video";

export function CourseVideo({ url, title }: { url: string; title: string }) {
  const [failed, setFailed] = useState(false);
  const source = videoSource(url);
  if (!source)
    return (
      <p>
        Agrega un enlace válido de YouTube, OneDrive o un archivo MP4/WebM por
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
          Este enlace se reproduce en {source.provider}. Si Microsoft solicita
          iniciar sesión, usa la cuenta autorizada por el administrador.
        </p>
      )}
      <a href={url} target="_blank" rel="noopener noreferrer">
        Abrir video en {source.provider} ↗
      </a>
    </div>
  );
}
