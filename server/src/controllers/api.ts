import { Request, Response } from "express"
import fs from "fs"

export function getMap(req: Request, res: Response, mapPath: string) {
  const map = fs.readFileSync(mapPath, "utf-8")

  res.json({ map })
}
