// Copyright 2022 Cognite AS
const { buildSync } = require("esbuild");
const { join } = require("path");

const { dependencies, peerDependencies } = require("../package.json");

const opts = {
    entryPoints: ["src/index.ts"],
    absWorkingDir: join(__dirname, ".."),
    bundle: true,
    sourcemap: true,
    external: Object.keys({ ...dependencies, ...peerDependencies }),
};

try {
    // esm
    buildSync({
        ...opts,
        platform: "neutral",
        outfile: "dist/esm/react-auth-wrapper.js",
    });
    // node
    buildSync({
        ...opts,
        platform: "node",
        outfile: "dist/umd/react-auth-wrapper.js",
    });
} catch (err) {
    // esbuild handles error reporting
    process.exitCode = 1;
}
