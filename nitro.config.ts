import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  rollupConfig: {
    output: {
      // rolldown specific option
      codeSplitting: false,
      inlineDynamicImports: true,
    },
  },
});
