import { spawn } from "child_process"

const args = process.argv.slice(2)

spawn("npm", ["run", "dev:client"], {
  stdio: "inherit",
  shell: true,
})

spawn("npm", ["run", "dev", "-w", "server", "--", ...args], {
  stdio: "inherit",
  shell: true,
})
