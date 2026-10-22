export function videoSource(
  value: string,
): { type: "embed" | "file" | "link"; url: string; provider: string } | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    const host = url.hostname.toLowerCase();
    if (
      [
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
        "youtu.be",
        "www.youtube-nocookie.com",
      ].includes(host)
    ) {
      const id =
        host === "youtu.be"
          ? url.pathname.slice(1)
          : url.searchParams.get("v") ||
            url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1];
      return id && /^[\w-]{11}$/.test(id)
        ? {
            type: "embed",
            url: `https://www.youtube-nocookie.com/embed/${id}`,
            provider: "YouTube",
          }
        : null;
    }
    const microsoft =
      host === "1drv.ms" ||
      host === "onedrive.live.com" ||
      host.endsWith(".sharepoint.com") ||
      host.endsWith(".1drv.com");
    if (microsoft) {
      if (
        url.pathname.toLowerCase().includes("download") ||
        /\.(mp4|webm|m4v)$/i.test(url.pathname)
      )
        return { type: "file", url: url.href, provider: "OneDrive" };
      if (host === "onedrive.live.com" && url.searchParams.has("resid"))
        url.pathname = "/embed";
      const embed =
        url.pathname.toLowerCase().includes("embed") ||
        url.pathname.toLowerCase().includes("stream.aspx");
      return {
        type: embed ? "embed" : "link",
        url: url.href,
        provider: "OneDrive",
      };
    }
    if (/\.(mp4|webm|m4v)$/i.test(url.pathname))
      return { type: "file", url: url.href, provider: "Video" };
    return null;
  } catch {
    return null;
  }
}
