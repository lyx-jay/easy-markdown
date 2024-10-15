import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/extension.ts"],
  outDir: "out",
  clean: true,
  format: ['cjs'],
  shims: false,
  dts: false,
  minify: true,
  minifyIdentifiers: true,
  minifySyntax: true,
  minifyWhitespace: true,
  sourcemap: false,
  treeshake: true,
  external: [
    'vscode',
  ],
});