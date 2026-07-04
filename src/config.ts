import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import type { LocakitConfig } from "./types.js";

export const CONFIG_FILE = "locakit.config.json";
export const LOCK_FILE = "locakit.lock";

export function loadConfig(cwd: string): LocakitConfig {
  const path = resolve(cwd, CONFIG_FILE);
  if (!existsSync(path)) {
    throw new Error(`${CONFIG_FILE} bulunamadı. Önce 'locakit init' çalıştırın.`);
  }
  const config = JSON.parse(readFileSync(path, "utf8")) as LocakitConfig;

  if (!config.source) throw new Error("config: 'source' zorunlu.");
  if (!Array.isArray(config.targets) || config.targets.length === 0) {
    throw new Error("config: 'targets' en az bir dil içermeli.");
  }
  if (!config.files?.includes("{locale}")) {
    throw new Error("config: 'files' şablonu {locale} yer tutucusu içermeli.");
  }
  if (config.targets.includes(config.source)) {
    throw new Error("config: source dili targets içinde olamaz.");
  }
  return config;
}

export function localePath(cwd: string, config: LocakitConfig, locale: string): string {
  return resolve(cwd, config.files.replaceAll("{locale}", locale));
}
