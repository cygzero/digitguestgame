# Interface Contracts: Digit Guess Game

This document details the interface contract of the Zustand store and the Peer-to-Peer messaging protocol.

## 1. Zustand Store API

The store manages the state and exposes actions to components.

### State Getters
- `mode`: `'local' | 'cpu' | 'p2p'`
- `phase`: `'menu' | 'setup' | 'playing' | 'ended'`
- `player1`: `Player`
- `player2`: `Player`
- `currentRound`: `number`
- `activeTurn`: `'player1' | 'player2'`
- `winner`: `'player1' | 'player2' | 'draw' | null`
- `peerState`: `P2PConnectionState | null`

### Actions
- `selectMode(mode: GameMode): void`
  Transitions `phase` to `'setup'` and configures the `mode`.
- `setSecretCode(playerId: 'player1' | 'player2', code: string): void`
  Saves the player's secret code. If both players are ready (or if CPU/P2P ready conditions are met), transitions `phase` to `'playing'`.
- `makeGuess(playerId: 'player1' | 'player2', guess: string): void`
  Calculates the hits for `guess`, registers the attempt, and updates the turn. At the end of a round (after player2 guesses), evaluates if there is a winner or draw.
- `resetGame(): void`
  Resets all state to initial values, clearing history and secret codes, and returns `phase` to `'menu'`.
- `initP2P(): void`
  Initializes local PeerJS instance and retrieves a unique Peer ID (Room Code).
- `connectToPeer(targetPeerId: string): void`
  Attempts to connect to the host's Peer ID.

---

## 2. Peer-to-Peer Messaging Contract (JSON Schema)

When playing in `'p2p'` mode, the two browsers communicate via PeerJS `DataConnection`. All messages MUST conform to the following schema.

### Base Message Structure
```json
{
  "type": "string",
  "payload": {}
}
```

### Supported Messages

#### `CONNECT_SUCCESS`
Sent by the host when connection is established to sync names.
```json
{
  "type": "CONNECT_SUCCESS",
  "payload": {
    "hostName": "Player 1"
  }
}
```

#### `SET_SECRET`
Sent to inform the opponent that the secret code has been set (without revealing the code itself).
```json
{
  "type": "SET_SECRET",
  "payload": {}
}
```

#### `SEND_GUESS`
Sent when a player submits a guess.
```json
{
  "type": "SEND_GUESS",
  "payload": {
    "guess": "1234",
    "round": 3
  }
}
```

#### `SEND_FEEDBACK`
Sent in response to a guess, returning the calculated hits.
```json
{
  "type": "SEND_FEEDBACK",
  "payload": {
    "hits": 2
  }
}
```

#### `DISCONNECTED`
Sent to notify the peer that the player is leaving the game.
```json
{
  "type": "DISCONNECTED",
  "payload": {}
}
```
