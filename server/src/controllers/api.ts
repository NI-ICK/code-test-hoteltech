import { Request, Response } from "express"
import fs from "fs"

interface Booking {
  room: string
  guestName: string
}

let cabanaToGuest = new Map<string, string>() // x:y, guestName
let guestToCabana = new Map<string, string>() // guestName, x:y

function loadMap(mapPath: string) {
  const map = fs.readFileSync(mapPath, "utf-8")
  const mapArray = map.split("\n").map((row: string) => row.split(""))

  for (const booking of cabanaToGuest) {
    const [x, y] = booking[0].split(":").map(Number)

    if (mapArray[y] && mapArray[y][x] !== undefined && mapArray[y][x] === "W") {
      mapArray[y][x] = "X"
    }
  }

  return mapArray
}

export function getMap(req: Request, res: Response, mapPath: string) {
  res.status(200).json({ map: loadMap(mapPath) })
}

export function bookCabana(
  req: Request,
  res: Response,
  mapPath: string,
  bookingsPath: string
) {
  const { room, name, x, y } = req.body
  const key = `${x}:${y}`

  if (!room || !name || x === undefined || y === undefined) {
    return res.status(400).json({
      message: "Missing required fields",
    })
  }

  const bookings: Booking[] = JSON.parse(fs.readFileSync(bookingsPath, "utf-8"))

  const valid = bookings.find((b) => b.room === room && b.guestName === name)
  if (!valid) return res.status(401).json({ message: "Invalid Credentials" })

  const existingGuest = cabanaToGuest.get(key)
  if (existingGuest === name) {
    return res.status(200).json({ message: "You already booked this cabana" })
  }

  if (existingGuest && existingGuest !== name) {
    return res.status(409).json({ message: "Cabana is already booked" })
  }

  const previousCabana = guestToCabana.get(name)
  if (previousCabana) cabanaToGuest.delete(previousCabana)

  cabanaToGuest.set(key, name)
  guestToCabana.set(name, key)

  const map = loadMap(mapPath)

  return res.status(200).json({
    message: previousCabana ? "Changed booked cabana" : "Booked successfully",
    map,
  })
}

export function resetBookings() {
  cabanaToGuest = new Map()
  guestToCabana = new Map()
}
