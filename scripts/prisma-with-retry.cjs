/**
 * Runs `npx prisma <args>` with retries (Neon cold start / transient network during Vercel build).
 * Usage: node scripts/prisma-with-retry.cjs migrate deploy
 */
const { spawnSync } = require("child_process");

function sleep(ms) {
  if (process.platform === "win32") {
    spawnSync(
      "powershell",
      ["-NoProfile", "-Command", `Start-Sleep -Milliseconds ${ms}`],
      { stdio: "ignore" },
    );
  } else {
    const sec = Math.max(1, Math.ceil(ms / 1000));
    spawnSync("sleep", [`${sec}`], { stdio: "ignore" });
  }
}

const prismaArgs = process.argv.slice(2);
if (!prismaArgs.length) {
  console.error("usage: node scripts/prisma-with-retry.cjs <prisma subcommand> [args...]");
  process.exit(1);
}

const maxAttempts = 5;
for (let attempt = 1; attempt <= maxAttempts; attempt++) {
  const r = spawnSync("npx", ["prisma", ...prismaArgs], {
    stdio: "inherit",
    shell: true,
  });
  const code = r.status ?? 1;
  if (code === 0) process.exit(0);

  console.error(
    `\n[prisma-with-retry] "${prismaArgs.join(" ")}" failed (attempt ${attempt}/${maxAttempts}, exit ${code}).`,
  );
  if (attempt < maxAttempts) {
    const delay = 4000 * attempt;
    console.error(`Retrying in ${delay / 1000}s…\n`);
    sleep(delay);
  }
}

process.exit(1);
