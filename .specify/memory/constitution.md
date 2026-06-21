<!--
SYNC IMPACT REPORT
- Version change: None -> 1.0.0
- List of modified principles:
  - [PRINCIPLE_1_NAME] -> I. Centralized State (Zustand)
  - [PRINCIPLE_2_NAME] -> II. Pure Logic Separation
  - [PRINCIPLE_3_NAME] -> III. Premium & Responsive UI/UX Aesthetics
  - [PRINCIPLE_4_NAME] -> IV. Fast Build & Modern Stack (Vite & React)
  - [PRINCIPLE_5_NAME] -> V. Code Quality & Performance-First
- Added sections: None
- Removed sections: None
- Templates requiring updates:
  - .specify/templates/plan-template.md (✅ aligned)
  - .specify/templates/spec-template.md (✅ aligned)
  - .specify/templates/tasks-template.md (✅ aligned)
- Follow-up TODOs: None
-->

# Vite React Zustand Game Constitution

## Core Principles

### I. Centralized State (Zustand)
All global game state (scores, levels, player stats, active views, game loop status) MUST be managed in a centralized Zustand store. Component local state (useState) MUST only be used for transient UI states (e.g., dropdown open/close, form input). Selector-based state retrieval MUST be used to minimize re-renders.

### II. Pure Logic Separation
Game mechanics (e.g., collision calculations, score increments, board generation) MUST be written as pure, framework-agnostic functions. These functions should reside in a separate `src/game/` or `src/utils/` directory and be fully unit-testable without React DOM.

### III. Premium & Responsive UI/UX Aesthetics
The application MUST use modern UI/UX design: a default sleek dark mode, consistent CSS variables for styling, glassmorphism elements, custom fonts, smooth micro-animations for user interaction, and layout designs that look gorgeous on both mobile and desktop screen sizes. Avoid plain default styles.

### IV. Fast Build & Modern Stack (Vite & React)
The project MUST use Vite for extremely fast Hot Module Replacement (HMR) and bundling. Components MUST follow React best practices: functional components with hooks, custom hooks for shared logic, and clean JSX structures.

### V. Code Quality & Performance-First
To ensure a smooth gaming experience, performance optimization is critical. Avoid heavy computations in the render cycle. Use proper React hooks (`useMemo`, `useCallback`) where appropriate. Implement proper cleanups in `useEffect` for game loops/event listeners to prevent memory leaks.

## Technology Stack & Boundaries

- **Core Framework**: React 18+ (functional components, hooks)
- **Build Tool**: Vite (fast HMR, optimized production build)
- **State Management**: Zustand (lightweight, decoupled from React context)
- **Styling**: Vanilla CSS with custom properties (CSS variables) for flexible customization and dark/light theme control. No TailwindCSS unless requested.
- **Testing**: Vitest + React Testing Library (for unit and component testing)

## Development Workflow & Code Quality

- **Component-Driven**: Build visual components and pure game logic in isolation before assembling pages.
- **TDD/Unit Testing**: Implement and test pure game utilities (e.g., logic files) before attaching them to React views.
- **Continuous Integration**: Ensure code formatting, lint checks, and test suites pass on every iteration.

## Governance

This constitution serves as the source of truth for design constraints, stack alignment, and development workflows. Any proposed modifications to this constitution must trigger a semantic version bump and a full review of templates and guidelines.

**Version**: 1.0.0 | **Ratified**: 2026-06-11 | **Last Amended**: 2026-06-11
