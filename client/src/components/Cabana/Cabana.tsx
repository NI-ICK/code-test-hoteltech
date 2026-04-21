import { useEffect, useRef, useState } from "react"
import "./Cabana.css"
import axios, { isAxiosError } from "axios"

type CabanaProps = {
  available: boolean
  x: number
  y: number
  updateMap: (map: string[][]) => void
  updateMessage: (msg: string) => void
}

export function Cabana({
  available,
  x,
  y,
  updateMap,
  updateMessage,
}: CabanaProps) {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    room: "",
    name: "",
  })
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target

      if (!modalRef.current || !(target instanceof Node)) return

      if (modalRef.current && !modalRef.current.contains(target)) {
        setShowModal(false)
        setForm({ room: "", name: "" })
      }
    }

    if (showModal) document.addEventListener("mousedown", handleClickOutside)

    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showModal])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setForm((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!form.room || !form.name) return
    try {
      const reponse = await axios.post("/api/book", {
        room: form.room,
        name: form.name,
        x,
        y,
      })
      updateMap(reponse.data?.map)
      updateMessage(reponse.data.message)
      setShowModal(false)
    } catch (error) {
      if (isAxiosError(error)) {
        console.log("Failed to book cabana", error.response?.data.message)
        updateMessage(error.response?.data.message)
      }
    }

    setForm({ room: "", name: "" })
  }

  const handleCabanaClick = () => {
    if (!available) return updateMessage("Cabana is already booked")

    setShowModal(true)
  }

  return (
    <>
      <div className="cabana">
        <img
          data-testid={`cabana-${x}-${y}`}
          src="./assets/cabana.png"
          className={`cabana ${available ? "" : "unavailable"} ${
            showModal && available ? "selected" : ""
          }`}
          onClick={handleCabanaClick}
        />
        {showModal && available ? (
          <div className="modal" ref={modalRef}>
            <form action="post" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="room">Room number</label>
                <input
                  type="text"
                  id="room"
                  value={form.room}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label htmlFor="name">Guest name</label>
                <input
                  type="text"
                  id="name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
              <button>Book</button>
            </form>
          </div>
        ) : null}
      </div>
    </>
  )
}
