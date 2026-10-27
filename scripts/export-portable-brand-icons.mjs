import * as NodeFSP from "node:fs/promises";
import * as NodePath from "node:path";
import sharp from "sharp";

import { encodePngIco, WINDOWS_ICON_SIZES } from "./lib/icon-export.ts";

const root = NodePath.resolve(import.meta.dirname, "..");
const source = async (path) => NodeFSP.readFile(NodePath.join(root, path));
const variants = [
  {
    name: "dev",
    ios: "assets/dev/blueprint-ios-1024.png",
    universal: "assets/dev/blueprint-universal-1024.png",
    mac: "assets/dev/blueprint-macos-1024.png",
    windows: "assets/dev/blueprint-windows.ico",
    background: "assets/dev/app-icon.icon/Assets/background.svg",
  },
  {
    name: "nightly",
    ios: "assets/nightly/nightly-ios-1024.png",
    universal: "assets/nightly/nightly-universal-1024.png",
    mac: "assets/nightly/nightly-macos-1024.png",
    windows: "assets/nightly/nightly-windows.ico",
    background: "assets/nightly/app-icon.icon/Assets/background.svg",
    marketing: "apps/marketing/src/assets/icon-nightly.webp",
  },
  {
    name: "prod",
    ios: "assets/prod/black-ios-1024.png",
    universal: "assets/prod/black-universal-1024.png",
    mac: "assets/prod/black-macos-1024.png",
    windows: "assets/prod/jcode-black-windows.ico",
    background: "assets/prod/logo.svg",
    marketing: "apps/marketing/src/assets/icon.webp",
  },
];

for (const variant of variants) {
  const background = await source(variant.background);
  const mark =
    variant.name === "prod" ? null : await source("assets/prod/app-icon.icon/Assets/text.svg");
  const render = async (size) => {
    const image = sharp(background, { density: 300 }).resize(size, size);
    if (!mark) return image.png().toBuffer();
    const foreground = await sharp(mark, { density: 300 }).resize(size, size).png().toBuffer();
    return image
      .composite([{ input: foreground }])
      .png()
      .toBuffer();
  };
  const full = await render(1024);
  const macBody = await render(824);
  const mac = await sharp({
    create: { width: 1024, height: 1024, channels: 4, background: "#00000000" },
  })
    .composite([{ input: macBody, left: 100, top: 100 }])
    .png()
    .toBuffer();
  const icoImages = await Promise.all(
    WINDOWS_ICON_SIZES.map(async (size) => ({ size, contents: await render(size) })),
  );
  const outputs = [
    [variant.ios, full],
    [variant.universal, full],
    [variant.mac, mac],
    [variant.windows, encodePngIco(icoImages)],
  ];
  if (variant.marketing)
    outputs.push([variant.marketing, await sharp(full).webp({ quality: 90 }).toBuffer()]);
  await Promise.all(
    outputs.map(([path, bytes]) => NodeFSP.writeFile(NodePath.join(root, path), bytes)),
  );
}
