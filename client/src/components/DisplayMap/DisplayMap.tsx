import axios from "axios"
import { useEffect, useState } from "react"

export function DisplayMap() {
  const [resortMap, setResortMap] = useState([])

  useEffect(() => {
    const loadMap = async () => {
      try {
        const result = await axios.get("/api/map")
        const data = result.data.map
        setResortMap(data.split("\n").map((row: string) => row.split("")))
      } catch (error) {
        console.log("Failed to load map", error.message)
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

  return (
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
              return <img src="./assets/cabana.png" key={`${x}${y}`} />
            case "p":
              return <img src="./assets/pool.png" key={`${x}${y}`} />
            case "c":
              return <img src="./assets/houseChimney.png" key={`${x}${y}`} />
            case ".":
              return <div key={`${x}${y}`}></div>
          }

          const tile = getTile(resortMap, x, y)

          switch (tile.type) {
            case "cross":
              return (
                <img
                  src="./assets/arrowCrossing.png"
                  key={`${x}${y}`}
                  style={{ transform: `rotate(${tile.rot}deg)` }}
                />
              )
            case "split":
              return (
                <img
                  src="./assets/arrowSplit.png"
                  key={`${x}${y}`}
                  style={{ transform: `rotate(${tile.rot}deg)` }}
                />
              )
            case "corner":
              return (
                <img
                  src="./assets/arrowCornerSquare.png"
                  key={`${x}${y}`}
                  style={{ transform: `rotate(${tile.rot}deg)` }}
                />
              )
            case "straight":
              return (
                <img
                  src="./assets/arrowStraight.png"
                  key={`${x}${y}`}
                  style={{ transform: `rotate(${tile.rot}deg)` }}
                />
              )
            case "end":
              return (
                <img
                  src="./assets/arrowEnd.png"
                  key={`${x}${y}`}
                  style={{ transform: `rotate(${tile.rot}deg)` }}
                />
              )
          }
        })
      )}
    </div>
  )
}

export default DisplayMap
