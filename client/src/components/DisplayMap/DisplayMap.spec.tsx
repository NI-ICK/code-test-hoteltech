import { render, screen, waitFor } from "@testing-library/react"
import DisplayMap from "./DisplayMap"
import axios from "axios"

vi.mock("axios")

const mockedAxios = vi.mocked(axios, true)

describe("DisplayMap", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should fetch map and render tiles", async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({ data: { map: ".p#\nWc#" } })

    render(<DisplayMap />)

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith("/api/map")
    })

    const images = screen.getAllByRole("img")
    expect(images.length).toEqual(5)
  })

  it("should render empty divs for .", async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({ data: { map: "...." } })

    render(<DisplayMap />)

    await waitFor(() => {
      const divs = document.querySelectorAll(".map > div")
      expect(divs.length).toEqual(4)
    })
  })

  it("should handle API failure", async () => {
    const consoleSpy = vi.spyOn(console, "log")

    mockedAxios.get = vi.fn().mockResolvedValue(() => new Error("test error"))

    render(<DisplayMap />)

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled()
    })

    expect(consoleSpy).toHaveBeenCalled()
  })
})
