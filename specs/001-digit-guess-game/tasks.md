# Tasks: Digit Guess Game

**Input**: Design documents from `/specs/001-digit-guess-game/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Unit tests using Vitest and React Testing Library are included for each component/story as defined in the plan.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below assume single project under the repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize React project with TypeScript using Vite in repository root
- [x] T002 Install project dependencies: `react`, `react-dom`, `zustand`, `peerjs` and devDependencies `vitest`, `@testing-library/react`
- [x] T003 [P] Configure Vitest and linting/formatting tools in vite.config.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Define TypeScript interface/types for Player, Attempt, GameSession, and P2PConnectionState in src/game/types.ts
- [x] T005 [P] Configure global CSS variables, neon dark-mode styles, and glassmorphic classes in src/styles/index.css
- [x] T006 Initialize the centralized Zustand store with initial state structure and resetGame action in src/store/useGameStore.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Selección del Modo de Juego (Priority: P1) 🎯 MVP

**Goal**: Allow players to select Local, CPU, or P2P game modes from the main menu.

**Independent Test**: Launch the application, click on each game mode button, and verify the game state transitions correctly to the Setup phase with the chosen mode.

### Tests for User Story 1

- [x] T007 [P] [US1] Write unit tests for the selectMode action in src/store/useGameStore.test.ts

### Implementation for User Story 1

- [x] T008 [US1] Implement the selectMode action in src/store/useGameStore.ts to set game mode and transition phase to setup
- [x] T009 [P] [US1] Create a glassmorphic MainMenu component in src/components/MainMenu.tsx displaying the three game mode options
- [x] T010 [US1] Integrate the MainMenu component into src/App.tsx views router
- [x] T011 [P] [US1] Implement PeerJS signaling and initialization (initP2P action) in src/store/useGameStore.ts
- [x] T012 [US1] Implement peer connection handling, disconnects, and synchronization in src/store/useGameStore.ts
- [x] T013 [P] [US1] Create the P2PLobby component in src/components/P2PLobby.tsx to display local peer ID, room code input, and status messages

**Checkpoint**: At this point, User Story 1 and P2P room connectivity are functional and testable.

---

## Phase 4: User Story 2 - Configuración de Números Secretos (Priority: P1)

**Goal**: Securely enter and confirm a 4-digit secret code (0-9, duplicate digits allowed) masked from view.

**Independent Test**: In Local mode, Player 1 inputs "1234" (masked) and confirms. Player 2 inputs "5678" (masked) and confirms. Verify both are stored and phase transitions to "playing".

### Tests for User Story 2

- [x] T014 [P] [US2] Write unit tests for digit code validations in src/game/engine.test.ts and setSecretCode in src/store/useGameStore.test.ts

### Implementation for User Story 2

- [x] T015 [US2] Implement the digit code validation function in src/game/engine.ts
- [x] T016 [US2] Implement the setSecretCode action in src/store/useGameStore.ts. For CPU mode, automatically generate a random 4-digit code. For P2P mode, send the SET_SECRET message to the connected peer.
- [x] T017 [P] [US2] Create a masked custom input/keypad component in src/components/SecretCodeInput.tsx
- [x] T018 [US2] Create the SetupView component in src/components/SetupView.tsx to handle the entry and masking flow for both players
- [x] T019 [US2] Integrate the SetupView component into src/App.tsx views router

**Checkpoint**: Secret codes can be safely set and validated for all modes, transitioning the game to the playing state.

---

## Phase 5: User Story 3 - Juego por Turnos y Feedback de Coincidencias (Priority: P1)

**Goal**: Enter guesses in turn and calculate exact index and value matches (hits).

**Independent Test**: Start a match with codes "1234" and "5678". On Player 1's turn, guess "1538" and verify the feedback reports exactly "2 aciertos".

### Tests for User Story 3

- [x] T020 [P] [US3] Write unit tests for calculateHits in src/game/engine.test.ts and makeGuess in src/store/useGameStore.test.ts

### Implementation for User Story 3

- [x] T021 [US3] Implement the pure function calculateHits(secretCode: string, guess: string): number in src/game/engine.ts
- [x] T022 [US3] Implement the makeGuess action in src/store/useGameStore.ts that calculates hits, records the attempt, and toggles the active turn
- [x] T023 [P] [US3] Implement the candidate elimination Mastermind solver algorithm in src/game/solver.ts and test it in src/game/solver.test.ts
- [x] T024 [US3] Integrate the CPU solver into the Zustand store so CPU auto-submits its guess when it is its turn
- [x] T025 [US3] Implement SEND_GUESS and SEND_FEEDBACK messaging contract handlers for P2P mode in src/store/useGameStore.ts
- [x] T026 [P] [US3] Create the GamePlayView component in src/components/GamePlayView.tsx displaying turn status, custom input keypad, and previous attempts history
- [x] T027 [US3] Integrate the GamePlayView component into src/App.tsx views router

**Checkpoint**: The main game loop works with fully functional turn progression and exact matching feedback for all three modes.

---

## Phase 6: User Story 4 - Fin de Partida con Ronda Completa (Priority: P2)

**Goal**: Evaluate game end only after both players have completed their attempts in the round, allowing for wins and draws.

**Independent Test**: Player 1 and Player 2 both guess correctly in round 5. Verify the final result is declared a Draw (Empate). If only Player 1 guesses correctly, verify Player 1 wins.

### Tests for User Story 4

- [x] T028 [P] [US4] Write unit tests for round completion and victory/draw logic in src/store/useGameStore.test.ts

### Implementation for User Story 4

- [x] T029 [US4] Update the makeGuess action in src/store/useGameStore.ts to delay victory checks until the second player's turn in a round is complete
- [x] T030 [P] [US4] Create the GameEndedView component in src/components/GameEndedView.tsx showing the match result (winner/draw) and a "Play Again" button
- [x] T031 [US4] Integrate the GameEndedView component into src/App.tsx views router

**Checkpoint**: Game round completion correctly handles wins, draws, and transitions to the end game screen.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T032 [P] Update API documentation in research.md or README.md if there are any changes
- [ ] T033 Add fluid neon transitions and glassmorphic micro-animations in src/styles/index.css
- [ ] T034 Implement React Error Boundaries and error logs in src/components/ErrorBoundary.tsx
- [ ] T035 [P] Run all unit and integration tests to verify correctness
- [ ] T036 Build the production bundle using npm run build and verify it completes without errors
- [ ] T037 Perform manual validation using scenarios in quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3 to 6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel or sequentially in priority order (US1 → US2 → US3 → US4)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Requires setup states from US1
- **User Story 3 (P3)**: Can start after US2 is complete (needs secret codes initialized)
- **User Story 4 (P4)**: Can start after US3 is complete (needs turn and guess loop initialized)

### Parallel Opportunities

- Setup tasks T001-T003 can run in parallel where independent
- Foundational tasks T004-T006 can run in parallel
- Test tasks for each story (marked [P]) can be written in parallel
- View layout components (MainMenu, SetupView, GamePlayView, GameEndedView) can be styled in parallel once the CSS foundation is established

---

## Parallel Example: User Story 1

```bash
# Implement the main menu layout
Task: "Create a glassmorphic MainMenu component in src/components/MainMenu.tsx"

# Simultaneously setup P2P network connections
Task: "Implement PeerJS signaling and initialization (initP2P action) in src/store/useGameStore.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 & Local Mode)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Selection)
4. Complete Phase 4: User Story 2 (Secret Code entry for Local mode)
5. Complete Phase 5: User Story 3 (Turn-based matching for Local mode)
6. Complete Phase 6: User Story 4 (Win/Draw checks for Local mode)
7. **VALIDATE**: Ensure a complete local pass-and-play game runs end-to-end.

### Incremental Delivery

1. Deliver Local Mode Game (MVP)
2. Add CPU opponent generation and solver logic (US2/US3 CPU integration)
3. Add P2P multiplayer lobbies and peer communication messages (US1/US2/US3 P2P integration)
4. Apply polish, transitions, and error handling.
