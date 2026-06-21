# Quickstart Validation Guide: Digit Guess Game

This document outlines the setup, build, running, and validation steps to verify the Digit Guess Game implementation.

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

---

## Setup & Run Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Start Dev Server**:
   ```bash
   npm run dev
   ```
3. **Open browser**: Navigate to `http://localhost:5173`.

---

## Validation Scenarios

### Scenario 1: Local Pass-and-Play Match
1. Open the application.
2. Select **Local (Mismo Dispositivo)** on the menu.
3. Player 1 enters secret code `1234` (input is masked). Click **Confirmar**.
4. Player 2 enters secret code `5678` (input is masked). Click **Confirmar**.
5. Round 1 begins (Player 1's turn).
6. Player 1 guesses `1234`. This is correct, but since it is a round-based game, Player 2 is allowed to play.
7. Player 2 guesses `5678`.
8. The round completes. Both players guessed correctly. The game displays **Empate** (Draw).
9. Click **Jugar de nuevo** to return to the menu.

### Scenario 2: Single Player vs CPU (AI Solver)
1. Select **Contra la Computadora (CPU)** on the menu.
2. Enter your secret code `9876` and click **Confirmar**.
3. The game starts immediately (the CPU has automatically chosen its secret code).
4. Guess `1234`. See the feedback (e.g., "1 acierto").
5. The CPU will automatically make its guess against your code `9876`.
6. Continue playing turns until either you or the CPU guesses the other's code at the end of a round.
7. Verify the CPU's guesses are intelligent (narrowing down candidates rather than guessing completely random numbers).

### Scenario 3: P2P Match (Multiplayer)
1. Open two browser windows (or use an incognito window) at `http://localhost:5173`.
2. In Window A, select **Multijugador P2P**, then click **Crear Sala**.
   - Copy the generated Room Code (e.g., `ABCD-12`).
3. In Window B, select **Multijugador P2P**, paste the Room Code into the input, and click **Unirse**.
4. Verify both players show a "Conectado" status indicator.
5. Setup and play turns. Ensure messages are transmitted quickly and turns update synchronously on both screens.
