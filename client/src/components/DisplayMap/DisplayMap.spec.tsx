import { act, render, screen, waitFor } from "@testing-library/react"
import DisplayMap from "./DisplayMap"
import axios from "axios"
import userEvent from "@testing-library/user-event"

vi.mock("axios")

const mockedAxios = vi.mocked(axios)

describe("DisplayMap", () => {
  beforeAll(() => {
    const _jest = globalThis.jest

    globalThis.jest = {
      ...globalThis.jest,
      advanceTimersByTime: vi.advanceTimersByTime.bind(vi),
    }

    return () => void (globalThis.jest = _jest)
  })

  beforeEach(() => {
    vi.clearAllMocks()

    mockedAxios.get.mockResolvedValue({
      data: {
        map: [
          ["W", "p", "#"],
          [".", "c", "#"],
        ],
      },
    })
  })

  it("should fetch map and render tiles", async () => {
    render(<DisplayMap />)

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith("/api/map")
    })

    const images = screen.getAllByRole("img")
    expect(images.length).toEqual(5)
  })

  it("should render empty divs for .", async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        map: [
          [".", "."],
          [".", "."],
        ],
      },
    })

    render(<DisplayMap />)

    await waitFor(() => {
      const divs = document.querySelectorAll(".map > div")
      expect(divs.length).toEqual(4)
    })
  })

  it("should log errpr when API fails", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {})

    mockedAxios.get.mockRejectedValue(new Error("test error"))

    render(<DisplayMap />)

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled()
    })

    expect(consoleSpy).toHaveBeenCalled()
  })

  it("should render cabana component for W and X", async () => {
    mockedAxios.get.mockResolvedValue({ data: { map: [["W"], ["X"]] } })

    render(<DisplayMap />)

    await waitFor(() => {
      expect(screen.getByTestId("cabana-0-0")).toBeInTheDocument()
      expect(screen.getByTestId("cabana-0-1")).toBeInTheDocument()
    })
  })

  it("should show and hide popup after booking cabana", async () => {
    vi.useFakeTimers()
    const user = userEvent.setup({ delay: null })

    mockedAxios.post.mockResolvedValue({
      data: {
        map: [["W"]],
      },
    })

    render(<DisplayMap />)

    const cabana = await screen.findByTestId("cabana-0-0")

    await user.click(cabana)

    const roomInput = await screen.findByLabelText(/room/i)
    const nameInput = await screen.findByLabelText(/guest/i)
    const bookButton = await screen.findByRole("button", { name: /book/i })

    await user.type(roomInput, "101")
    await user.type(nameInput, "Alice Smith")

    await user.click(bookButton)

    await waitFor(() => {
      expect(screen.getByTestId("popup")).toHaveClass("active")
    })

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    await waitFor(() => {
      expect(screen.getByTestId("popup")).not.toHaveClass("active")
    })

    vi.useRealTimers()
  })
})
