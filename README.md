# Resort Map - Interactive Cabana Booking

An interactive web application that allows guests to explore a resort map and book poolside cabanas in real time. The system is fully driven by a REST API and provides a simple click-to-book experience directly on the resort map.

## Features

- Interactive resort map rendered from an ASCII layout
- Real-time cabana availability and booking
- Guest validation using room number and guest name
- Instant UI updates after booking
- Prevention of double booking
- User feedback via on-screen notifications

## Architecture Overview

The project is split into two parts:

**Backend (Node and Express)**

- Provides a REST API for:
- Fetching the resort map (GET /api/map)
- Booking a cabana (POST /api/book)
- Loads input data from:
  - ASCII map file (map.ascii)
  - Bookings file (bookings.json)
- Maintains booking state in memory

**Frontend (React and TypeScript)**

- Renders the resort map as a grid
- Maps ASCII symbols to visual elements:
  - **W** - cabana
  - **X** - booked cabana
  - **p** - pool
  - **c** - chalet
  - **\#** - path
  - **.** - empty space
- Handles cabana booking through a modal form
- Updates the map immediately after successful booking

## Tech Stack

#### Frontend

- React with TypeScript
- Axios for API communication
- Vitest for testing

#### Backend

- Node.js with Express
- TypeScript
- Jest for testing

## How to run

#### 1. Install dependencies

```
npm install
```

OR

```
npm install -D
```

#### 2. Start the application

```
npm run dev
```

You can optionally provide environment variables for custom data paths:

```
npm run dev -- --map <map_path> --bookings <bookings_path>
```

## API Endpoints

### GET /api/map

Returns the current resort map with booked cabanas marked.

#### Response:

```
{
  "map": [[".", "W", "#"], ["p", "c", "#"]]
}
```

### POST /api/book

Books a cabana if credentials are valid.

#### Request:

```
{
  "room": "101",
  "name": "John Doe",
  "x": 2,
  "y": 5
}
```

#### Response:

```
200 OK - booking successful (returns updated map)
400 Bad Request - missing fields
401 Unauthorized - invalid credentials
409 Conflict - cabana already booked
```

## Testing

The project includes automated tests covering both server and client behavior.

**Server tests (Jest):**

- Booking validation (missing fields, invalid credentials)
- Conflict handling (already booked cabana scenarios)
- Successful booking flows
- State transitions (changing booked cabana)
- API responses for /api/map and /api/book

**Client tests (Vitest + Testing Library):**

- Rendering of the resort map from API data
- Cabana interaction (open modal, prevent booking when unavailable)
- Booking flow (form submission → API call → UI update)
- Popup behavior and auto-dismiss timing
- Modal close behavior (click outside handling)

Run all tests with:

```
npm run test
```

## Core Design Decisions & Trade-offs

The main design choice was to keep the backend as the single source of truth for booking state, while making the frontend fully reactive and API-driven. This simplifies consistency, but adds extra network dependency for every update.

On the frontend, the ASCII map is rendered directly into a grid with minimal transformation. Tile logic (like path direction detection) is handled in the UI for convenience, which keeps the backend simple but introduces some presentation logic into the view layer.

Cabana interactions are encapsulated inside individual components to keep behavior localized and easy to follow. The trade-off is some duplicated coordination logic between components and parent state handlers.

On the backend, in-memory storage is used for bookings instead of persistence to keep the implementation lightweight. This avoids infrastructure complexity but makes state non-durable across restarts.

Overall, the focus was on simplicity and direct data flow from API to UI, even if it means some coupling between rendering logic and view concerns, and a lack of long-term persistence.

## AI-Assisted Workflow

I did not use any AI coding agents or IDE-integrated assistants during development. Instead, I used ChatGPT as an external support tool for understanding concepts and improving implementation decisions.

I primarily used it for:

- Clarifying concepts and comparing implementation approaches (e.g. pros/cons of different state handling and UI structures)
- Helping design and structure automated tests
- Writing and refining the README documentation
- General code cleanup suggestions and readability improvements

In one specific case, I used an AI-generated helper function (getNeighbors in the map rendering logic) as a reference and adapted it into the final implementation for tile adjacency detection in the map renderer.

All integration decisions, architecture choices, and final code structure were implemented and reviewed manually.
