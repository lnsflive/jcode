import * as NodeFSP from "node:fs/promises";
import * as NodePath from "node:path";
import sharp from "sharp";

import { encodePngIco, WINDOWS_ICON_SIZES } from "./lib/icon-export.ts";

const root = NodePath.resolve(import.meta.dirname, "..");
const mark = await NodeFSP.readFile(NodePath.resolve(root, "assets/prod/logo.svg"));
const render = (size) => sharp(mark, { density: 300 }).resize(size, size).png().toBuffer();
const images = await Promise.all(
  WINDOWS_ICON_SIZES.map(async (size) => ({ size, contents: await render(size) })),
);
const png16 = images.find((image) => image.size === 16).contents;
const png32 = images.find((image) => image.size === 32).contents;
const touch = await render(180);
const ico = encodePngIco(images);

const targets = [
  ["assets/prod/jcode-black-web-favicon.ico", ico],
  ["assets/prod/jcode-black-web-favicon-16x16.png", png16],
  ["assets/prod/jcode-black-web-favicon-32x32.png", png32],
  ["assets/prod/jcode-black-web-apple-touch-180.png", touch],
  ["assets/dev/blueprint-web-favicon.ico", ico],
  ["assets/dev/blueprint-web-favicon-16x16.png", png16],
  ["assets/dev/blueprint-web-favicon-32x32.png", png32],
  ["assets/dev/blueprint-web-apple-touch-180.png", touch],
  ["assets/nightly/nightly-web-favicon.ico", ico],
  ["assets/nightly/nightly-web-favicon-16x16.png", png16],
  ["assets/nightly/nightly-web-favicon-32x32.png", png32],
  ["assets/nightly/nightly-web-apple-touch-180.png", touch],
  ...["apps/web/public", "apps/marketing/public"].flatMap((directory) => [
    [`${directory}/favicon.ico`, ico],
    [`${directory}/favicon-16x16.png`, png16],
    [`${directory}/favicon-32x32.png`, png32],
    [`${directory}/apple-touch-icon.png`, touch],
  ]),
];

await Promise.all(
  targets.map(([path, contents]) => NodeFSP.writeFile(NodePath.resolve(root, path), contents)),
);
