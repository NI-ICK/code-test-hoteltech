import express from "express"
import { getMap } from "./controllers/api.ts"

let mapPath = "../assets/map.ascii"
let bookingsPath = "../assets/bookings.json"

const args = process.argv.slice(2)
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--map" && args[i + 1]) mapPath = args[i + 1]
  if (args[i] === "--bookings" && args[i + 1]) bookingsPath = args[i + 1]
}

export const app = express()

app.use(express.json())

app.get("/api/map", (req, res) => getMap(req, res, mapPath))
