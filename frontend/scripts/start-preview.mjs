import { spawn } from "node:child_process";

const port = String(process.env.PORT || 4173);
const previewCommand = `npx vite preview --host 0.0.0.0 --strictPort --port ${port}`;

const child = spawn(previewCommand, {
  stdio: "inherit",
  shell: true
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
