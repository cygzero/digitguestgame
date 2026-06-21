# Research Notes: Digit Guess Game

This document details the research, technology decisions, and patterns selected to implement the 4-digit guess game.

## State Management: Zustand Store

### Decision
Use a single, cohesive Zustand store (`src/store/useGameStore.ts`) to manage game state, turn flow, and peer connections.

### Rationale
- Zustand is lightweight, does not require a React Context provider, and avoids unnecessary re-renders when components select specific slices of state.
- Game state transitions (e.g., turn switching, scoring, and lobby state) are clean to write as pure state actions in the store.

### Alternatives Considered
- **React Context + useReducer**: Rejected because of potential re-render performance issues with frequent state changes and connection updates.
- **Redux Toolkit**: Rejected as it is over-engineered for a simple single-page game.

---

## P2P Networking: WebRTC with PeerJS

### Decision
Use `peerjs` to establish direct Peer-to-Peer data connections between players.

### Rationale
- PeerJS wraps WebRTC API into a simple ID-based connection model.
- Provides a free, public cloud signaling server (broker) so players can connect by sharing a 6-character text code (Peer ID) without us having to build or host a signaling server.
- Once connected, data is transferred directly between browsers (P2P), ensuring low latency (<50ms).

### Protocol Specification
Messages exchanged over the `DataConnection` will be JSON objects with a `type` and `payload`:
- `CONNECT_SUCCESS`: Sent when connection is established to sync player profiles.
- `SET_SECRET`: Informing the peer that the player has configured their secret code (without sending the code itself, to prevent cheating).
- `SEND_GUESS`: Send a 4-digit guess (e.g., `{ guess: "1234", round: 3 }`).
- `SEND_FEEDBACK`: Send the number of hits for a guess (e.g., `{ hits: 2 }`).
- `DISCONNECTED`: Sent when a player explicitly leaves or disconnects.

---

## CPU Opponent Logic: Mastermind Solver Algorithm

### Decision
Implement an intelligent CPU player that uses a candidate elimination algorithm (similar to Knuth's Mastermind algorithm).

### Rationale
- A purely random guesser is boring and takes too long.
- Candidate elimination works by:
  1. Initializing a set of all possible 10,000 codes ("0000" to "9999").
  2. Making a random or standard initial guess (e.g., "1234").
  3. When feedback (hits) is received, filtering the remaining candidate list: keeping only the codes that would yield that exact same number of hits if the guess was compared to them.
  4. Selecting the next guess from the remaining candidates.
- This ensures the CPU is highly competent and behaves like an active solver.

---

## UI/UX Design: Sleek Dark Glassmorphism

### Decision
Build a premium, responsive dark-themed UI using vanilla CSS variables, backdrop filters, and CSS grids/flexbox.

### Rationale
- CSS Custom Properties (variables) allow simple color palette management (neon blues/purples for game states).
- Glassmorphism (`backdrop-filter: blur()`, semi-transparent borders, and deep gradients) gives a premium, futuristic look.
- Zero external CSS dependencies ensures maximum build speed and clean codebase.
