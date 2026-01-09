import { build as viteBuild } from "vite";
import { rm } from "fs/promises";
import { execSync } from "child_process";

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server...");
  // Use tsc to compile TypeScript to JavaScript (no bundling)
  try {
    execSync("tsc --project tsconfig.server.json --outDir dist/backend", {
      stdio: "inherit",
    });
    console.log("? Server compiled successfully");
  } catch (err) {
    console.error("? Server build failed");
    throw err;
  }
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
