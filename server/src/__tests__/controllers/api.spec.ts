import request from "supertest"
import fs from "fs"
import { app } from "../../app.ts"
import { resetBookings } from "../../controllers/api.ts"

jest.mock("fs")
const mockedFs = fs as jest.Mocked<typeof fs>

describe("API", () => {
  beforeEach(() => {
    jest.resetModules()
    mockedFs.readFileSync.mockReset()
    resetBookings()
  })

  describe("getMap", () => {
    it("should return map from file", async () => {
      mockedFs.readFileSync.mockReturnValue(".W##")
      const res = await request(app).get("/api/map")

      expect(res.status).toEqual(200)
      expect(res.body).toEqual({ map: [[".", "W", "#", "#"]] })
    })
  })

  describe("bookCabana", () => {
    const bookinsMock = JSON.stringify([
      { room: "1", guestName: "John" },
      { room: "2", guestName: "Bob" },
    ])

    beforeEach(() => {
      mockedFs.readFileSync.mockReturnValue(bookinsMock)
    })

    it("should return 400 when fields are missing", async () => {
      const res = await request(app).post("/api/book").send({})

      expect(res.status).toEqual(400)
      expect(res.body).toEqual({ message: "Missing required fields" })
    })

    it("should return 401 when credentials are invalid", async () => {
      const res = await request(app)
        .post("/api/book")
        .send({ room: "5", name: "Joe", x: 1, y: 1 })

      expect(res.status).toEqual(401)
      expect(res.body).toEqual({ message: "Invalid Credentials" })
    })

    it("should return 200 when booking same cabana again", async () => {
      await request(app)
        .post("/api/book")
        .send({ room: "1", name: "John", x: 1, y: 1 })
      const res = await request(app)
        .post("/api/book")
        .send({ room: "1", name: "John", x: 1, y: 1 })

      expect(res.status).toEqual(200)
      expect(res.body).toEqual({ message: "You already booked this cabana" })
    })

    it("should return 409 when cabana is already booked by another guest", async () => {
      await request(app)
        .post("/api/book")
        .send({ room: "2", name: "Bob", x: 1, y: 1 })
      const res = await request(app)
        .post("/api/book")
        .send({ room: "1", name: "John", x: 1, y: 1 })

      expect(res.status).toEqual(409)
      expect(res.body).toEqual({ message: "Cabana is already booked" })
    })

    it("should return 200 when booking is successfully", async () => {
      ;(mockedFs.readFileSync as jest.Mock).mockImplementation(
        (path: string) => {
          if (path.includes("map")) return ".W##\nWW.."
          if (path.includes("bookings")) return bookinsMock

          throw new Error("Unexpected path: " + path)
        }
      )

      const res = await request(app)
        .post("/api/book")
        .send({ room: "1", name: "John", x: 1, y: 0 })

      expect(res.status).toEqual(200)
      expect(res.body).toEqual({
        message: "Booked successfully",
        map: [
          [".", "X", "#", "#"],
          ["W", "W", ".", "."],
        ],
      })
    })

    it("should return 200 when changing booked cabana", async () => {
      ;(mockedFs.readFileSync as jest.Mock).mockImplementation(
        (path: string) => {
          if (path.includes("map")) return ".W##\nWW.."
          if (path.includes("bookings")) return bookinsMock

          throw new Error("Unexpected path: " + path)
        }
      )

      await request(app)
        .post("/api/book")
        .send({ room: "1", name: "John", x: 1, y: 0 })
      const res = await request(app)
        .post("/api/book")
        .send({ room: "1", name: "John", x: 1, y: 1 })

      expect(res.status).toEqual(200)
      expect(res.body).toEqual({
        message: "Changed booked cabana",
        map: [
          [".", "W", "#", "#"],
          ["W", "X", ".", "."],
        ],
      })
    })
  })
})
