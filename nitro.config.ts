import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  rollupConfig: {
    output: {
      // @ts-expect-error rolldown specific option
      codeSplitting: false,
      inlineDynamicImports: true,
    },
  },
});
