#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { diff } from "./diff.js";
import { apply, lockCurrent } from "./apply.js";
import { check } from "./check.js";
import { CONFIG_FILE } from "./config.js";
import type { TranslationPatch } from "./types.js";

const HELP = `locakit — deterministic i18n engine for AI agents

Usage:
  locakit init                 Create ${CONFIG_FILE} in the current directory
  locakit diff [--json]        List missing/stale keys per target locale
  locakit apply <patch.json>   Write translations (also reads JSON from stdin with "-")
  locakit check [--json]       Validate locales; exit 1 on errors (CI-friendly)
  locakit lock                 Mark existing translations as up to date

Options:
  --json      Machine-readable output (for agents/CI)
  --strict    check: treat warnings as errors
  --help      Show this help
`;

function main(): number {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      json: { type: "boolean", default: false },
      strict: { type: "boolean", default: false },
      help: { type: "boolean", default: false },
    },
  });

  const command = positionals[0];
  if (values.help || !command) {
    process.stdout.write(HELP);
    return command ? 0 : 1;
  }
  const cwd = process.cwd();

  switch (command) {
    case "init": {
      const path = resolve(cwd, CONFIG_FILE);
      if (existsSync(path)) {
        process.stderr.write(`${CONFIG_FILE} zaten var.\n`);
        return 1;
      }
      const template = {
        source: "en",
        targets: ["tr"],
        files: "locales/{locale}.json",
        context:
          "Describe your product, audience and tone here. The translating agent reads this.",
        glossary: [],
      };
      writeFileSync(path, JSON.stringify(template, null, 2) + "\n", "utf8");
      process.stdout.write(`${CONFIG_FILE} oluşturuldu.\n`);
      return 0;
    }

    case "diff": {
      const result = diff(cwd);
      if (values.json) {
        process.stdout.write(JSON.stringify(result, null, 2) + "\n");
        return 0;
      }
      let total = 0;
      for (const [target, entries] of Object.entries(result.targets)) {
        process.stdout.write(`\n[${target}] ${entries.length} bekleyen key\n`);
        for (const e of entries) {
          process.stdout.write(`  ${e.reason === "stale" ? "~" : "+"} ${e.key}: ${JSON.stringify(e.source)}\n`);
        }
        total += entries.length;
      }
      process.stdout.write(`\nToplam: ${total} key bekliyor.\n`);
      return 0;
    }

    case "apply": {
      const input = positionals[1];
      if (!input) {
        process.stderr.write("Kullanım: locakit apply <patch.json | ->\n");
        return 1;
      }
      const raw =
        input === "-" ? readFileSync(0, "utf8") : readFileSync(resolve(cwd, input), "utf8");
      const patch = JSON.parse(raw) as TranslationPatch;
      const result = apply(cwd, patch);
      for (const [target, count] of Object.entries(result.written)) {
        process.stdout.write(`[${target}] ${count} çeviri yazıldı.\n`);
      }
      for (const s of result.skipped) {
        process.stdout.write(`atlandı [${s.target}] ${s.key}: ${s.reason}\n`);
      }
      return 0;
    }

    case "check": {
      const issues = check(cwd);
      const errors = issues.filter((i) => i.level === "error");
      const warnings = issues.filter((i) => i.level === "warning");
      if (values.json) {
        process.stdout.write(JSON.stringify({ errors, warnings }, null, 2) + "\n");
      } else {
        for (const issue of issues) {
          process.stdout.write(
            `${issue.level === "error" ? "HATA " : "uyarı"} [${issue.target}] ${issue.key} (${issue.rule}): ${issue.message}\n`
          );
        }
        process.stdout.write(`\n${errors.length} hata, ${warnings.length} uyarı.\n`);
      }
      return errors.length > 0 || (values.strict && warnings.length > 0) ? 1 : 0;
    }

    case "lock": {
      const count = lockCurrent(cwd);
      process.stdout.write(`${count} çeviri güncel olarak kilitlendi.\n`);
      return 0;
    }

    default:
      process.stderr.write(`Bilinmeyen komut: ${command}\n\n${HELP}`);
      return 1;
  }
}

try {
  process.exitCode = main();
} catch (error) {
  process.stderr.write(`locakit: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
