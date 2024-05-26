import terser from "@rollup/plugin-terser";

export default {
  input: "tsc_out/recorder.server.js",
  output: {
    file: "dist/main.js",
    format: "cjs",
  },
  plugins: [terser()],
};
