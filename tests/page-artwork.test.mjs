import { test } from "node:test";
import assert from "node:assert/strict";
import { artworkBackground, artworkChange, artworkUrlValid } from "../src/lib/lms/page-artwork.ts";

test("choosing a gradient replaces a previous background or behind-text image", () => {
  const config = { backgroundImage: "https://example.com/old.png", imageUrl: "https://example.com/image.png", imagePosition: "behind", ...artworkChange("gradient", "linear-gradient(135deg,#2C55A2,#0DBAC3)") };
  assert.equal(artworkBackground(config), "linear-gradient(135deg,#2C55A2,#0DBAC3)");
  assert.equal(config.imagePosition, "before");
});
test("uploading a background replaces a gradient; moving an image behind clears conflicting backgrounds", () => {
  let config = { gradient: "old-gradient", ...artworkChange("backgroundImage", "https://example.com/bg.png") };
  assert.equal(artworkBackground(config), 'url("https://example.com/bg.png")');
  config = {...config, imageUrl:"https://example.com/art.png", ...artworkChange("imagePosition", "behind")};
  assert.equal(artworkBackground(config), 'url("https://example.com/art.png")');
});
test("removing artwork does not remove independent page assets", () => {
  const config = {imageUrl:"https://example.com/photo.png", logoUrl:"https://example.com/logo.png", ...artworkChange("backgroundImage", "")};
  assert.equal(config.imageUrl,"https://example.com/photo.png");
  assert.equal(artworkBackground(config),undefined);
});
test("artwork links require HTTPS without embedded credentials", () => {
  for (const value of ["", "https://example.com/a.png?version=1"]) assert.equal(artworkUrlValid(value),true);
  for (const value of ["http://example.com/a.png","javascript:alert(1)","https://name:secret@example.com/a.png","not a URL"]) assert.equal(artworkUrlValid(value),false);
});
