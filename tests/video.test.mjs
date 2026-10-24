import { test } from "node:test";
import assert from "node:assert/strict";
import { videoSource } from "../src/lib/lms/video.ts";

test("normalizes YouTube watch, short and embed links", () => {
  for (const url of [
    "https://www.youtube.com/watch?v=ysz5S6PUM-U",
    "https://youtu.be/ysz5S6PUM-U",
    "https://www.youtube.com/shorts/ysz5S6PUM-U",
  ]) {
    assert.equal(
      videoSource(url)?.url,
      "https://www.youtube-nocookie.com/embed/ysz5S6PUM-U",
    );
  }
});
test("preserves direct video query parameters", () => {
  assert.equal(
    videoSource("https://cdn.example.com/lesson.mp4?signature=example")?.type,
    "file",
  );
});
test("accepts OneDrive shared links without inventing download tokens", () => {
  const url = "https://1drv.ms/v/example";
  assert.deepEqual(videoSource(url), {
    type: "link",
    url,
    provider: "OneDrive",
  });
});
test("accepts OneDrive embed links and preserves permissions", () => {
  const source = videoSource(
    "https://onedrive.live.com/?resid=example&authkey=example",
  );
  assert.equal(source?.type, "embed");
  assert.ok(source?.url.includes("authkey=example"));
});

test("accepts Microsoft embed code without executing HTML",()=>{
  const source=videoSource('<iframe src="https://1drv.ms/v/c/example?embed=1&amp;authkey=example" width="900" onload="alert(1)"></iframe>');
  assert.equal(source?.type,"embed");
  assert.equal(source?.url,"https://1drv.ms/v/c/example?embed=1&authkey=example");
  assert.equal(videoSource('<iframe src="javascript:alert(1)"></iframe>'),null);
});
test("accepts SharePoint embed and direct downloads", () => {
  assert.equal(
    videoSource(
      "https://academy.sharepoint.com/sites/training/_layouts/15/embed.aspx?UniqueId=example",
    )?.type,
    "embed",
  );
  assert.equal(
    videoSource("https://onedrive.live.com/download?resid=example")?.type,
    "file",
  );
});
test("rejects insecure schemes, credentials, unrelated and lookalike hosts", () => {
  for (const url of [
    "javascript:alert(1)",
    "http://cdn.example.com/video.mp4",
    "https://user:password@example.com/video.mp4",
    "https://youtube.com.evil.example/watch?v=ysz5S6PUM-U",
    "https://example.com/onedrive",
    "https://www.youtube.com/watch?v=bad",
  ]) {
    assert.equal(videoSource(url), null);
  }
});
