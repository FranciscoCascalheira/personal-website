import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // fig. 4's Postgres. These three are stored gzipped under their
        // original names (scripts/copy-pglite.mjs) because Next serves public/
        // verbatim and the CDN in front does not compress binary types — left
        // raw, the engine costs 17.2 MB on the wire instead of ~5 MB. The
        // browser inflates them transparently, so PGlite's own fetch path is
        // unchanged. If the copy script stops gzipping, this must go with it.
        source: "/pg/:file(pglite\\.wasm|pglite\\.data|initdb\\.wasm)",
        headers: [
          { key: "Content-Encoding", value: "gzip" },
          { key: "Vary", value: "Accept-Encoding" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/pg/:file*.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
