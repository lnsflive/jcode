# JCode

JCode provides a browser interface for your coding agents.

```sh
npm install -g @lnsflive/jcode
jcode
```

To run without a global installation:

```sh
npx @lnsflive/jcode
```

Requires Node.js 20.11 or later. On first launch, the package downloads the matching
JCode executable from [GitHub Releases](https://github.com/lnsflive/jcode/releases),
verifies its SHA-256 checksum, and caches it under `~/.jcode/runtime/versions`.
Set `JCODE_HOME` to choose another data directory.

Supported platforms: macOS arm64, Linux x64 and arm64, Windows x64 and arm64.

[Source and documentation](https://github.com/lnsflive/jcode)
