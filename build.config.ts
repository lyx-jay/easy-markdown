import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["./src/extension.ts"],
  outDir: "out",
  clean: true,
  declaration: false,
  rollup: {
    emitCJS: false,
    esbuild: {
      minify: true,
      treeShaking: true,
      minifyWhitespace: true,
      minifyIdentifiers: true,
      minifySyntax: true,
      sourcemap: false,
      drop: ['console', 'debugger']
    }
  },
  dependencies: ['markdown-it-container', 'markdown-it-emoji'],
  externals: ['vscode'],
  failOnWarn: false
});