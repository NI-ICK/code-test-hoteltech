import request from "supertest"
import fs from "fs"
import { app } from "../../app.ts"

jest.mock("fs")
const mockedFs = fs as jest.Mocked<typeof fs>

describe("API", () => {
  it("should return map from file", async () => {
    const mockMap = ".W###W."

    mockedFs.readFileSync.mockReturnValue(mockMap)

    const res = await request(app).get("/api/map")

    expect(res.status).toEqual(200)
    expect(res.body).toEqual({ map: mockMap })
  })
})
