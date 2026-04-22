import { spawnSync } from "node:child_process";
import path from "node:path";

type CommandResult = ReturnType<typeof spawnSync>;

function runSupabase(args: string[], cwd: string): CommandResult {
  return spawnSync("npx", ["supabase", ...args], {
    cwd,
    shell: process.platform === "win32",
    encoding: "utf-8",
    stdio: "pipe",
    env: process.env,
  });
}

function formatFailure(message: string, command: string, result: CommandResult) {
  const stderr = result.stderr?.trim() ?? "";
  const stdout = result.stdout?.trim() ?? "";

  return [
    message,
    `Command: ${command}`,
    stdout ? `stdout: ${stdout}` : "",
    stderr ? `stderr: ${stderr}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export default async function globalSetup() {
  const rootDir = path.resolve(__dirname, "..");
  const isCI = process.env.CI === "true";
  const projectRef = process.env.SUPABASE_PROJECT_REF;

  let result = runSupabase(["db", "push", "--linked"], rootDir);

  if (result.status === 0) {
    return;
  }

  const stderr = result.stderr?.toLowerCase() ?? "";
  const isNotLinked = stderr.includes("cannot find project ref") || stderr.includes("have you run supabase link");

  if (isNotLinked && projectRef) {
    const linkResult = runSupabase(["link", "--project-ref", projectRef], rootDir);

    if (linkResult.status !== 0) {
      throw new Error(
        formatFailure(
          "Global setup failed while linking Supabase project for tests.",
          `npx supabase link --project-ref ${projectRef}`,
          linkResult,
        ),
      );
    }

    result = runSupabase(["db", "push", "--linked"], rootDir);

    if (result.status === 0) {
      return;
    }
  }

  if (isNotLinked && !isCI) {
    console.warn(
      "[vitest globalSetup] Supabase project is not linked, skipping migration sync for local run. Set SUPABASE_PROJECT_REF or run 'supabase link --project-ref <ref>' to enable db push.",
    );
    return;
  }

  throw new Error(
    formatFailure(
      "Global setup failed while syncing migrations with linked Supabase test project.",
      "npx supabase db push --linked",
      result,
    ),
  );
}
