"use client";
import type { LmsCourseBlockConfig } from "@/lib/lms/types";
export function BlockDesignOptions({
  config,
  onChange,
  onUpload,
}: {
  onUpload: (
    file?: File,
    target?: "backgroundImage" | "imageUrl" | "logoUrl",
  ) => void | Promise<void>;
  config: LmsCourseBlockConfig;
  onChange: (value: Partial<LmsCourseBlockConfig>) => void;
}) {
  return (
    <section aria-label="Page artwork">
      <h3>Page artwork</h3>
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
            onChange={(e) => void onUpload(e.target.files?.[0], target)}
          />
        </label>
      ))}
      <label>
        Background image URL
        <input
          type="url"
          value={config.backgroundImage ?? ""}
          onChange={(e) => onChange({ backgroundImage: e.target.value })}
          placeholder="https://..."
        />
      </label>
      <label>
        Gradient
        <select
          value={config.gradient ?? ""}
          onChange={(e) => onChange({ gradient: e.target.value })}
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
            onChange({
              imagePosition: e.target
                .value as LmsCourseBlockConfig["imagePosition"],
            })
          }
        >
          <option value="before">Above the text</option>
          <option value="after">Below the text</option>
          <option value="behind">Behind the text</option>
        </select>
      </label>
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
