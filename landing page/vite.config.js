import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory
  const env = loadEnv(mode, process.cwd(), "");

  return {
    root: "./",
    publicDir: "public",
    build: {
      outDir: "dist",
    },
    define: {
      "process.env.EMAIL_ACCESS_KEY": JSON.stringify(env.EMAIL_ACCESS_KEY),
      "process.env.EMAIL_SERVICE_ID": JSON.stringify(env.EMAIL_SERVICE_ID),
      "process.env.EMAIL_TEMPLATE_ID": JSON.stringify(env.EMAIL_TEMPLATE_ID),
      "process.env.ADMIN_EMAIL": JSON.stringify(env.ADMIN_EMAIL),
      "process.env.RAZORPAY_KEY_ID": JSON.stringify(env.RAZORPAY_KEY_ID),
    },
  };
});
