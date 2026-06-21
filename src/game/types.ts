export interface Player {
  id: 'player1' | 'player2' | 'cpu';
  name: string;
  secretCode: string | null; // Null until set at configuration phase
  attempts: Attempt[];
  isReady: boolean; // Set to true when secret code is chosen
}

export interface Attempt {
  guess: string; // Exactly 4 digits (e.g. "1234")
  hits: number; // Calculated exact matches (0 to 4)
  timestamp: number; // Unix timestamp
}

export type GameMode = 'local' | 'cpu' | 'p2p';
export type GamePhase = 'menu' | 'setup' | 'playing' | 'ended';

export interface GameSession {
  mode: GameMode;
  phase: GamePhase;
  players: {
    player1: Player;
    player2: Player | null; // CPU or second player
  };
  currentRound: number;
  activeTurn: 'player1' | 'player2'; // Indicates whose turn it is to guess
  winner: 'player1' | 'player2' | 'draw' | null;
  p2pConnection: P2PConnectionState | null;
}

export interface P2PConnectionState {
  peerId: string; // Local PeerJS ID
  targetPeerId: string | null; // Connected peer ID
  status: 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';
  errorMessage: string | null;
}
