import axios from "axios"
import { useEffect, useState } from "react"
import { Cabana } from "../Cabana/Cabana"
import "./DisplayMap.css"
import { Popup } from "../Popup/Popup"

export function DisplayMap() {
  const [resortMap, setResortMap] = useState<string[][]>([])
  const [message, setMessage] = useState("")
  const [popupActive, setPopupActive] = useState(false)

  useEffect(() => {
    const loadMap = async () => {
      try {
        const result = await axios.get("/api/map")
        setResortMap(result.data.map)
      } catch (error) {
        console.log("Failed to load map", error)
      }
    }

    loadMap()
  }, [])

  const getNeighbors = (map: string[][], x: number, y: number) => {
    return {
      up: map[y - 1]?.[x] === "#" ? true : false,
      down: map[y + 1]?.[x] === "#" ? true : false,
      left: map[y]?.[x - 1] === "#" ? true : false,
      right: map[y]?.[x + 1] === "#" ? true : false,
    }
  }

  const getTile = (map: string[][], x: number, y: number) => {
    const n = getNeighbors(map, x, y)

    if (n.up && n.down && n.right && n.left) return { type: "cross", rot: 0 }

    if (n.up && n.down && n.right && !n.left) return { type: "split", rot: 0 }
    if (!n.up && n.down && n.right && n.left) return { type: "split", rot: 90 }
    if (n.up && n.down && !n.right && n.left) return { type: "split", rot: 180 }
    if (n.up && !n.down && n.right && n.left) return { type: "split", rot: 270 }

    if (n.up && !n.down && n.right && !n.left) return { type: "corner", rot: 0 }
    if (!n.up && n.down && n.right && !n.left)
      return { type: "corner", rot: 90 }
    if (!n.up && n.down && !n.right && n.left)
      return { type: "corner", rot: 180 }
    if (n.up && !n.down && !n.right && n.left)
      return { type: "corner", rot: 270 }

    if (n.up && n.down && !n.right && !n.left)
      return { type: "straight", rot: 0 }
    if (!n.up && !n.down && n.right && n.left)
      return { type: "straight", rot: 90 }

    if (n.up && !n.down && !n.right && !n.left) return { type: "end", rot: 0 }
    if (!n.up && !n.down && !n.right && n.left) return { type: "end", rot: 90 }
    if (!n.up && n.down && !n.right && !n.left) return { type: "end", rot: 180 }
    if (!n.up && !n.down && n.right && !n.left) return { type: "end", rot: 270 }

    console.log(`Invalid tile: x-${x} y-${y}`)
    return { type: "invalid", rot: 0 }
  }

  const updateMap = (map: string[][]) => {
    setResortMap(map)
  }

  const updateMessage = (message: string) => {
    setMessage(message)
    setPopupActive(true)

    setTimeout(() => setPopupActive(false), 3000)
  }

  return (
    <>
      <div
        className="map"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${resortMap[0]?.length || 0}, 4em)`,
        }}
      >
        {resortMap.map((row: string[], y: number) =>
          row.map((cell: string, x: number) => {
            switch (cell) {
              case "W":
                return (
                  <Cabana
                    key={`${x}:${y}`}
                    x={x}
                    y={y}
                    available
                    updateMap={updateMap}
                    updateMessage={updateMessage}
                  />
                )
              case "X":
                return (
                  <Cabana
                    key={`${x}:${y}`}
                    available={false}
                    x={x}
                    y={y}
                    updateMap={updateMap}
                    updateMessage={updateMessage}
                  />
                )
              case "p":
                return <img src="./assets/pool.png" key={`${x}:${y}`} />
              case "c":
                return <img src="./assets/houseChimney.png" key={`${x}:${y}`} />
              case ".":
                return <div key={`${x}:${y}`}></div>
            }

            const tile = getTile(resortMap, x, y)

            switch (tile.type) {
              case "cross":
                return (
                  <img
                    src="./assets/arrowCrossing.png"
                    key={`${x}:${y}`}
                    style={{ transform: `rotate(${tile.rot}deg)` }}
                  />
                )
              case "split":
                return (
                  <img
                    src="./assets/arrowSplit.png"
                    key={`${x}:${y}`}
                    style={{ transform: `rotate(${tile.rot}deg)` }}
                  />
                )
              case "corner":
                return (
                  <img
                    src="./assets/arrowCornerSquare.png"
                    key={`${x}:${y}`}
                    style={{ transform: `rotate(${tile.rot}deg)` }}
                  />
                )
              case "straight":
                return (
                  <img
                    src="./assets/arrowStraight.png"
                    key={`${x}:${y}`}
                    style={{ transform: `rotate(${tile.rot}deg)` }}
                  />
                )
              case "end":
                return (
                  <img
                    src="./assets/arrowEnd.png"
                    key={`${x}:${y}`}
                    style={{ transform: `rotate(${tile.rot}deg)` }}
                  />
                )
            }
          })
        )}
      </div>
      <Popup message={message} active={popupActive} />
    </>
  )
}

export default DisplayMap
