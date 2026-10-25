"use client";
import { artworkChange, artworkUrlValid } from "@/lib/lms/page-artwork";
import type { LmsCourseBlockConfig } from "@/lib/lms/types";
export function BlockDesignOptions({
  config,
  busy = false,
  onChange,
  onUpload,
}: {
  onUpload: (
    file?: File,
    target?: "backgroundImage" | "imageUrl" | "logoUrl",
  ) => void | Promise<void>;
  busy?: boolean;
  config: LmsCourseBlockConfig;
  onChange: (value: Partial<LmsCourseBlockConfig>) => void;
}) {
  return (
    <section aria-label="Page artwork" className="page-artwork">
      <h3>Page artwork</h3><p>Changes appear in the canvas immediately. Save the block to keep them in the course. Use a direct HTTPS image URL or upload a JPG, PNG or WEBP file up to 2 MB.</p>
      {(["backgroundImage", "imageUrl", "logoUrl"] as const).map((target) => (
        <label key={target}>
          Upload{" "}
          {target === "backgroundImage"
            ? "background"
            : target === "logoUrl"
              ? "logo"
              : "image"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={busy}
            onChange={(e) => { void onUpload(e.target.files?.[0], target); e.target.value=""; }}
          />
          {config[target] && <button type="button" disabled={busy} onClick={()=>onChange(artworkChange(target,""))}>Remove {target === "backgroundImage" ? "background" : target === "logoUrl" ? "logo" : "image"}</button>}
        </label>
      ))}
      <label>
        Background image URL
        <input
          type="url"
          value={config.backgroundImage ?? ""}
          onChange={(e) => onChange(artworkChange("backgroundImage", e.target.value))}
          placeholder="https://..."
        />
      </label>
      <label>
        Gradient
        <select
          value={config.gradient ?? ""}
          onChange={(e) => onChange(artworkChange("gradient", e.target.value))}
        >
          <option value="">Solid color / background image</option>
          <option value="linear-gradient(135deg,#FBD741,#F2B885)">
            Golden yellow → peach
          </option>
          <option value="linear-gradient(135deg,#2C55A2,#0DBAC3)">
            Blue → turquoise
          </option>
          <option value="linear-gradient(135deg,#F2F2F2,#FFFFFF)">
            Light gray → white
          </option>
        </select>
      </label>
      <label>
        Small logo URL
        <input
          type="url"
          value={config.logoUrl ?? ""}
          onChange={(e) => onChange({ logoUrl: e.target.value })}
          placeholder="https://..."
        />
      </label>
      <label>
        Image in this text page
        <input
          type="url"
          value={config.imageUrl ?? ""}
          onChange={(e) => onChange({ imageUrl: e.target.value })}
          placeholder="https://..."
        />
      </label>
      <label>
        Image placement
        <select
          value={config.imagePosition ?? "before"}
          onChange={(e) =>
            onChange(artworkChange("imagePosition", e.target.value))
          }
        >
          <option value="before">Above the text</option>
          <option value="after">Below the text</option>
          <option value="behind">Behind the text</option>
        </select>
      </label>
      {[config.backgroundImage,config.imageUrl,config.logoUrl].some(value=>!artworkUrlValid(value)) && <p role="alert">Use a complete HTTPS image link without a username or password.</p>}
      <label>
        Page activity
        <select
          value={config.activityType ?? ""}
          onChange={(e) =>
            onChange({
              activityType:
                e.target.value === "assignment" ? "assignment" : undefined,
            })
          }
        >
          <option value="">Learning content</option>
          <option value="assignment">Homework assignment</option>
        </select>
      </label>
      {config.activityType === "assignment" && (
        <label>
          Due date (optional)
          <input
            type="datetime-local"
            value={config.dueAt ?? ""}
            onChange={(e) => onChange({ dueAt: e.target.value })}
          />
        </label>
      )}
    </section>
  );
}
