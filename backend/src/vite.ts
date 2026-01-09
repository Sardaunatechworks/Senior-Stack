import { type Express } from "express";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../../vite.config";
import fs from "fs";
import path from "path";

const viteLogger = createLogger();

export async function setupVite(server: Server, app: Express) {
  if (process.env.NODE_ENV === "development") {
    // Development mode: Use Vite dev server
    setupViteDev(server, app);
  } else {
    // Production mode: Serve pre-built HTML
    setupViteProduction(app);
  }
}

async function setupViteDev(server: Server, app: Express) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server, path: "/vite-hmr" },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "..",
        "frontend",
        "index.html",
      );

      // Read index.html from frontend source directory
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      const error = e as Error;
      viteLogger.error(
        `Failed to read frontend/index.html: ${error.message}\n` +
        "Make sure the frontend directory exists with an index.html file.",
      );
      vite.ssrFixStacktrace(error);
      next(error);
    }
  });
}

function setupViteProduction(app: Express) {
  const productionHtmlPath = path.resolve(
    import.meta.dirname,
    "..",
    "..",
    "dist",
    "public",
    "index.html",
  );

  app.use("*", (req, res, next) => {
    try {
      // In production, serve the pre-built HTML
      const html = fs.readFileSync(productionHtmlPath, "utf-8");
      res.status(200).set({ "Content-Type": "text/html" }).send(html);
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === "ENOENT") {
        viteLogger.error(
          `Production build not found at ${productionHtmlPath}.\n` +
          "Run 'npm run build' to generate the production build.",
        );
        res.status(500).send(
          "Production build not found. Please run 'npm run build'.",
        );
      } else {
        viteLogger.error(`Failed to read HTML file: ${err.message}`);
        next(error);
      }
    }
  });
}
