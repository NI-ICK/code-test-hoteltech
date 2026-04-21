import { render, screen } from "@testing-library/react"
import { Cabana } from "./Cabana"
import userEvent from "@testing-library/user-event"
import axios from "axios"

vi.mock("axios")
const mockedAxios = vi.mocked(axios)

describe("Cabana", () => {
  const updateMap = vi.fn()
  const updateMessage = vi.fn()

  beforeEach(() => {
    updateMap.mockClear()
    updateMessage.mockClear()
  })

  const renderCabana = (available: boolean) => {
    return render(
      <Cabana
        available={available}
        x={1}
        y={1}
        updateMap={updateMap}
        updateMessage={updateMessage}
      />
    )
  }

  it("should render cabana", () => {
    renderCabana(true)

    expect(screen.getByTestId("cabana-1-1")).toBeInTheDocument()
  })

  it("should show popup when cabana is unavailable", async () => {
    renderCabana(false)

    const cabana = screen.getByTestId("cabana-1-1")

    await userEvent.click(cabana)

    expect(updateMessage).toHaveBeenCalledWith("Cabana is already booked")
  })

  it("should open modal when when clicking available cabana", async () => {
    renderCabana(true)

    const cabana = screen.getByTestId("cabana-1-1")
    await userEvent.click(cabana)

    expect(screen.getByLabelText(/room/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/guest/i)).toBeInTheDocument()
  })

  it("should submit booking with form data", async () => {
    const mockMap = [
      ["X", "W"],
      ["W", "X"],
    ]
    mockedAxios.post.mockResolvedValue({
      data: {
        map: mockMap,
        message: "Booked successfully",
      },
    })

    renderCabana(true)

    const cabana = screen.getByTestId("cabana-1-1")
    await userEvent.click(cabana)

    await userEvent.type(screen.getByLabelText(/room/i), "101")
    await userEvent.type(screen.getByLabelText(/guest/i), "Alice Smith")

    await userEvent.click(screen.getByRole("button", { name: /book/i }))

    expect(updateMap).toHaveBeenCalledWith(mockMap)
    expect(updateMessage).toHaveBeenCalledWith("Booked successfully")
  })

  it("should close modal when clicking outside", async () => {
    render(
      <>
        <Cabana
          available={true}
          x={1}
          y={1}
          updateMap={updateMap}
          updateMessage={updateMessage}
        />
        <div data-testid="outside"></div>
      </>
    )

    const cabana = screen.getByTestId("cabana-1-1")
    await userEvent.click(cabana)

    expect(screen.getByLabelText(/room/i)).toBeInTheDocument()

    const outside = screen.getByTestId("outside")
    await userEvent.click(outside)

    expect(screen.queryByLabelText(/room/i)).not.toBeInTheDocument()
  })
})
