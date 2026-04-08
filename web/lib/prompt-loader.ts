import { access, readFile } from "node:fs/promises";
import path from "node:path";

import yaml from "js-yaml";

type LoadTextOptions = {
  optional?: boolean;
};

export type PromptBundle = {
  autoPipeline: string;
  oferta: string;
  cv: string;
  profileYaml: string | null;
  profile: Record<string, unknown> | null;
};

const REPO_ROOT = path.resolve(process.cwd(), "..");
const MODES_DIR = path.join(REPO_ROOT, "modes");
const CV_PATH = path.join(REPO_ROOT, "cv.md");
const PROFILE_PATH = path.join(REPO_ROOT, "config", "profile.yml");

async function readTextFile(filePath: string, options: LoadTextOptions = {}) {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    if (
      options.optional &&
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return null;
    }

    throw error;
  }
}

export async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function loadModePrompt(modeName: string): Promise<string> {
  const content = await readTextFile(path.join(MODES_DIR, `${modeName}.md`));
  if (!content) throw new Error(`Mode prompt not found: ${modeName}.md`);
  return content;
}

export async function loadCvMarkdown(): Promise<string> {
  const content = await readTextFile(CV_PATH);
  if (!content) throw new Error(`cv.md not found at ${CV_PATH}`);
  return content;
}

export async function loadProfileYaml() {
  return readTextFile(PROFILE_PATH, { optional: true });
}

export async function loadProfile() {
  const profileYaml = await loadProfileYaml();

  if (!profileYaml) {
    return null;
  }

  const parsed = yaml.load(profileYaml);

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }

  return parsed as Record<string, unknown>;
}

export async function loadPromptBundle(): Promise<PromptBundle> {
  const [autoPipeline, oferta, cv, profileYaml, profile] = await Promise.all([
    loadModePrompt("auto-pipeline"),
    loadModePrompt("oferta"),
    loadCvMarkdown(),
    loadProfileYaml(),
    loadProfile(),
  ]);

  return {
    autoPipeline,
    oferta,
    cv,
    profileYaml,
    profile,
  };
}

export async function loadPromptInputs() {
  const bundle = await loadPromptBundle();

  return {
    ...bundle,
    combinedPromptSections: [
      "# auto-pipeline",
      bundle.autoPipeline,
      "# oferta",
      bundle.oferta,
      "# cv.md",
      bundle.cv,
      bundle.profileYaml ? "# profile.yml" : null,
      bundle.profileYaml,
    ]
      .filter(Boolean)
      .join("\n\n"),
  };
}
