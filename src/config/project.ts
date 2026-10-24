import { z } from "zod";
export const ids = [
  "opening",
  "challenge",
  "brand",
  "courses",
  "platform",
  "offer",
  "closing",
] as const;
export const cueSchema = z
  .object({
    start: z.number().min(0),
    end: z.number().positive(),
    text: z.string().max(400),
  })
  .refine(
    (c) => c.end > c.start,
    "O fim da legenda deve ser posterior ao início.",
  );
export const configSchema = z.object({
  format: z.enum(["vertical", "horizontal", "short"]),
  scenes: z
    .array(
      z.object({
        id: z.enum(ids),
        duration: z.number().min(1).max(20),
        title: z.string().max(140),
        subtitle: z.string().max(180),
      }),
    )
    .length(7),
  theme: z.object({
    green: z.string().regex(/^#[\da-fA-F]{6}$/),
    accent: z.string().regex(/^#[\da-fA-F]{6}$/),
    ink: z.string().regex(/^#[\da-fA-F]{6}$/),
  }),
  assets: z.object({
    logo: z.string(),
    platform: z.string(),
    courses: z.array(z.object({ label: z.string(), src: z.string() })).max(10),
  }),
  offer: z.object({
    enabled: z.boolean(),
    verified: z.boolean(),
    previous: z.string().max(20),
    current: z.string().max(20),
    source: z.string().max(250),
  }),
  audio: z.object({
    narration: z.string(),
    shortNarration: z.string(),
    music: z.boolean(),
    voiceVolume: z.number().min(0).max(1.5),
    musicVolume: z.number().min(0).max(1),
    offset: z.number().min(0).max(5),
  }),
  captionsEnabled: z.boolean(),
  captions: z.array(cueSchema).max(1000),
});
export type ProjectConfig = z.infer<typeof configSchema>;
export const defaults: ProjectConfig = {
  format: "vertical",
  scenes: [
    {
      id: "opening",
      duration: 4,
      title: "O agro evolui\ntodos os dias.",
      subtitle: "Inteligência que move o campo.",
    },
    {
      id: "challenge",
      duration: 4,
      title: "E o seu\nconhecimento?",
      subtitle: "Novos desafios. Novas perspectivas.",
    },
    {
      id: "brand",
      duration: 5,
      title: "AgroSegPlay",
      subtitle: "O conhecimento que impulsiona o agro.",
    },
    {
      id: "courses",
      duration: 7,
      title: "Conhecimento\nque vai além.",
      subtitle: "Explore novas possibilidades no agro.",
    },
    {
      id: "platform",
      duration: 6,
      title: "Seu próximo\nnível começa aqui.",
      subtitle: "Conheça a AgroSegPlay.",
    },
    {
      id: "offer",
      duration: 5,
      title: "Invista no seu\npróximo passo.",
      subtitle: "Consulte as condições no site oficial.",
    },
    {
      id: "closing",
      duration: 4,
      title: "Seu próximo nível\nno agro começa aqui.",
      subtitle: "CONHEÇA A PLATAFORMA",
    },
  ],
  theme: { green: "#15533e", accent: "#c7ef75", ink: "#07120e" },
  assets: { logo: "", platform: "", courses: [] },
  offer: {
    enabled: false,
    verified: false,
    previous: "497,90",
    current: "197,90",
    source: "https://play.agroseg.net.br/",
  },
  audio: {
    narration: "audio/narration-35.wav",
    shortNarration: "audio/narration-15.wav",
    music: true,
    voiceVolume: 1,
    musicVolume: 0.55,
    offset: 0,
  },
  captionsEnabled: false,
  captions: [],
};
export const shortDurations = [2, 1.5, 2, 3, 2, 1.5, 3];
export function timeline(c: ProjectConfig) {
  let f = 0;
  return c.scenes.map((s, i) => {
    const length = Math.round(
      (c.format === "short" ? shortDurations[i] : s.duration) * 30,
    );
    const a = { ...s, from: f, length, index: i };
    f += length;
    return a;
  });
}
export function frames(c: ProjectConfig) {
  return timeline(c).reduce((n, s) => n + s.length, 0);
}
export function size(c: ProjectConfig) {
  return c.format === "horizontal"
    ? { width: 1920, height: 1080 }
    : { width: 1080, height: 1920 };
}
export function hasOffer(c: ProjectConfig) {
  try {
    return (
      c.offer.enabled &&
      c.offer.verified &&
      new URL(c.offer.source).origin === "https://play.agroseg.net.br"
    );
  } catch {
    return false;
  }
}
export function validateConfig(input: unknown) {
  const c = configSchema.parse(input);
  if (new Set(c.scenes.map((s) => s.id)).size !== 7)
    throw new Error("Cada cena deve aparecer exatamente uma vez.");
  if (c.offer.enabled && !hasOffer(c))
    throw new Error("Confirme a oferta no site oficial antes de ativá-la.");
  if (c.captionsEnabled && !c.captions.length)
    throw new Error("Importe uma legenda revisada antes de ativá-la.");
  return c;
}
