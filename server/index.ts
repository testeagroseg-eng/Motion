import express from "express";
import multer from "multer";
import { randomUUID } from "node:crypto";
import {
  mkdir,
  readFile,
  writeFile,
  rename,
  unlink,
  copyFile,
} from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { defaults, validateConfig, ProjectConfig } from "../src/config/project";
import { parseCaptions } from "../src/utils/captions";
import { root, publicDir, renderProject, run, clearBundle } from "./render";
const app = express();
const runtime = join(root, ".runtime");
const outputs = join(root, "renders");
await mkdir(join(publicDir, "uploads"), { recursive: true });
await mkdir(runtime, { recursive: true });
await mkdir(outputs, { recursive: true });
app.use(express.json({ limit: "2mb" }));
app.use("/audio", express.static(join(publicDir, "audio")));
app.use("/assets", express.static(join(publicDir, "assets")));
app.use("/uploads", express.static(join(publicDir, "uploads")));
app.use("/official", express.static(join(publicDir, "official")));
const configPath = join(runtime, "project.json");
app.get("/api/project", async (_req, res) => {
  res.json(
    existsSync(configPath)
      ? validateConfig(JSON.parse(await readFile(configPath, "utf8")))
      : defaults,
  );
});
app.put("/api/project", async (req, res, next) => {
  try {
    const c = validateConfig(req.body);
    await writeFile(configPath + ".tmp", JSON.stringify(c, null, 2));
    await rename(configPath + ".tmp", configPath);
    res.json({ saved: true });
  } catch (e) {
    next(e);
  }
});
app.get("/api/health", (_req, res) =>
  res.json({
    ok: true,
    renderer: "Remotion + FFmpeg",
    chromium: existsSync("/usr/bin/chromium"),
  }),
);
app.get("/api/site-audit", async (_req, res) => {
  try {
    res.json(
      JSON.parse(await readFile(join(root, "docs/site-audit.json"), "utf8")),
    );
  } catch {
    res.json({ status: "not-run" });
  }
});
const uploader = multer({
  dest: runtime,
  limits: { fileSize: 100 * 1024 * 1024 },
});
app.post("/api/upload", uploader.single("file"), async (req, res, next) => {
  const f = req.file;
  try {
    if (!f) throw new Error("Selecione um arquivo.");
    const kind = req.body.kind;
    let name = "";
    if (kind === "captions") {
      const captions = parseCaptions(await readFile(f.path, "utf8"));
      res.json({ captions });
      return;
    }
    if (kind === "audio") {
      name = `uploads/${randomUUID()}.wav`;
      await run("ffmpeg", [
        "-y",
        "-v",
        "error",
        "-i",
        f.path,
        "-vn",
        "-af",
        "loudnorm=I=-16:TP=-1.5:LRA=9",
        "-ar",
        "48000",
        join(publicDir, name),
      ]);
    } else if (["logo", "platform", "course"].includes(kind)) {
      if (!["image/png", "image/jpeg", "image/webp"].includes(f.mimetype))
        throw new Error("Use PNG, JPEG ou WebP.");
      const ext =
        f.mimetype === "image/png"
          ? "png"
          : f.mimetype === "image/webp"
            ? "webp"
            : "jpg";
      name = `uploads/${randomUUID()}.${ext}`;
      await copyFile(f.path, join(publicDir, name));
    } else throw new Error("Tipo de importação inválido.");
    clearBundle();
    res.json({ path: name });
  } catch (e) {
    next(e);
  } finally {
    if (f) await unlink(f.path).catch(() => {});
  }
});
interface Job {
  id: string;
  progress: number;
  stage: string;
  status: "running" | "complete" | "error";
  filename?: string;
  error?: string;
}
const jobs = new Map<string, Job>();
let busy = false;
app.post("/api/render", async (req, res, next) => {
  try {
    if (busy) {
      res
        .status(409)
        .json({
          error: "Já há uma renderização em andamento. Aguarde a conclusão.",
        });
      return;
    }
    const config = validateConfig(req.body);
    const id = randomUUID();
    const filename = `AgroSegPlay-${config.format}-${id.slice(0, 8)}.mp4`;
    const job: Job = { id, progress: 0, stage: "Na fila", status: "running" };
    jobs.set(id, job);
    busy = true;
    res.status(202).json(job);
    renderProject(config, join(outputs, filename), (p, stage) => {
      job.progress = p;
      job.stage = stage;
    })
      .then(() => {
        Object.assign(job, { status: "complete", filename });
      })
      .catch((e) => {
        Object.assign(job, {
          status: "error",
          error: e.message,
          stage: "Falha na renderização",
        });
      })
      .finally(() => {
        busy = false;
      });
  } catch (e) {
    next(e);
  }
});
app.get("/api/render/:id", (req, res) => {
  const job = jobs.get(String(req.params.id));
  if (!job) {
    res.status(404).json({ error: "Renderização não encontrada." });
    return;
  }
  res.json({
    ...job,
    download: job.filename ? `/api/download/${job.filename}` : undefined,
  });
});
app.get("/api/download/:filename", (req, res) => {
  const f = String(req.params.filename);
  if (!/^AgroSegPlay-(vertical|horizontal|short)-[\da-f-]+\.mp4$/.test(f)) {
    res.status(400).end();
    return;
  }
  res.download(join(outputs, f), f);
});
if (process.env.NODE_ENV === "production") {
  app.use(express.static(join(root, "dist")));
  app.get("/{*path}", (_req, res) =>
    res.sendFile(join(root, "dist/index.html")),
  );
} else {
  const { createServer } = await import("vite");
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
}
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err.message);
    res
      .status(400)
      .json({ error: err.message || "Não foi possível concluir a operação." });
  },
);
const port = Number(process.env.PORT || 3000);
app.listen(port, "0.0.0.0", () =>
  console.log(`AgroSegPlay Studio ouvindo na porta ${port}`),
);
