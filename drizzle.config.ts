import { defineConfig } from "drizzle-kit";
import "dotenv/config";

// Reads DATABASE_URL from .env so the same config targets local OR live
// depending on what's in .env. (Previously this was a hardcoded local URL.)
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
