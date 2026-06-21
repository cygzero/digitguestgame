import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock PeerJS
const mockConn = {
  on: vi.fn(),
  send: vi.fn(),
  close: vi.fn(),
};

const mockPeerInstance = {
  on: vi.fn(),
  connect: vi.fn().mockReturnValue(mockConn),
  destroy: vi.fn(),
  disconnect: vi.fn(),
};

vi.mock('peerjs', () => {
  return {
    Peer: vi.fn().mockImplementation(function() {
      return mockPeerInstance;
    }),
  };
});

import { useGameStore } from './useGameStore';

describe('useGameStore Foundational', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGameStore.getState().resetGame();
  });

  it('should initialize with correct default state', () => {
    const state = useGameStore.getState();
    expect(state.mode).toBe('local');
    expect(state.phase).toBe('menu');
    expect(state.players.player1.id).toBe('player1');
    expect(state.players.player1.name).toBe('Jugador 1');
    expect(state.players.player1.secretCode).toBeNull();
    expect(state.players.player2).toBeNull();
    expect(state.currentRound).toBe(1);
    expect(state.activeTurn).toBe('player1');
    expect(state.winner).toBeNull();
    expect(state.p2pConnection).toBeNull();
  });

  it('should reset state back to default on resetGame', () => {
    // Manually mutate store state state directly to simulate changes
    useGameStore.setState({
      mode: 'cpu',
      phase: 'playing',
      currentRound: 5,
    });

    expect(useGameStore.getState().mode).toBe('cpu');
    expect(useGameStore.getState().phase).toBe('playing');
    expect(useGameStore.getState().currentRound).toBe(5);

    // Reset game
    useGameStore.getState().resetGame();

    const state = useGameStore.getState();
    expect(state.mode).toBe('local');
    expect(state.phase).toBe('menu');
    expect(state.currentRound).toBe(1);
  });

  describe('selectMode', () => {
    it('should configure "local" mode and transition phase to "setup"', () => {
      useGameStore.getState().selectMode('local');
      const state = useGameStore.getState();
      expect(state.mode).toBe('local');
      expect(state.phase).toBe('setup');
      expect(state.players.player2).toEqual({
        id: 'player2',
        name: 'Jugador 2',
        secretCode: null,
        attempts: [],
        isReady: false,
      });
    });

    it('should configure "cpu" mode and transition phase to "setup"', () => {
      useGameStore.getState().selectMode('cpu');
      const state = useGameStore.getState();
      expect(state.mode).toBe('cpu');
      expect(state.phase).toBe('setup');
      expect(state.players.player2).toEqual({
        id: 'cpu',
        name: 'CPU',
        secretCode: null,
        attempts: [],
        isReady: false,
      });
    });

    it('should configure "p2p" mode and transition phase to "setup"', () => {
      useGameStore.getState().selectMode('p2p');
      const state = useGameStore.getState();
      expect(state.mode).toBe('p2p');
      expect(state.phase).toBe('setup');
      expect(state.players.player2).toBeNull();
    });
  });

  describe('P2P signaling and initialization', () => {
    it('should initialize PeerJS on initP2P and transition status to connecting', () => {
      useGameStore.getState().initP2P();
      const state = useGameStore.getState();
      expect(state.p2pConnection).not.toBeNull();
      expect(state.p2pConnection?.status).toBe('connecting');
      expect(state.p2pConnection?.errorMessage).toBeNull();
    });

    it('should update peerState status when peer is open', () => {
      useGameStore.getState().initP2P();
      
      // Get the 'open' event callback registered on peer
      const openCallback = mockPeerInstance.on.mock.calls.find(call => call[0] === 'open')?.[1];
      expect(openCallback).toBeDefined();

      // Trigger the callback with a mock peer ID
      openCallback('mock-peer-id');

      const state = useGameStore.getState();
      expect(state.p2pConnection?.peerId).toBe('mock-peer-id');
      expect(state.p2pConnection?.status).toBe('idle');
    });

    it('should set error state when peer triggers error event', () => {
      useGameStore.getState().initP2P();

      const errorCallback = mockPeerInstance.on.mock.calls.find(call => call[0] === 'error')?.[1];
      expect(errorCallback).toBeDefined();

      errorCallback({ message: 'Could not connect to broker' });

      const state = useGameStore.getState();
      expect(state.p2pConnection?.status).toBe('error');
      expect(state.p2pConnection?.errorMessage).toBe('Could not connect to broker');
    });

    it('should change status to connecting on connectToPeer', () => {
      useGameStore.getState().initP2P();
      
      // Simulate peer open
      const openCallback = mockPeerInstance.on.mock.calls.find(call => call[0] === 'open')?.[1];
      openCallback('client-peer-id');

      useGameStore.getState().connectToPeer('host-peer-id');

      const state = useGameStore.getState();
      expect(state.p2pConnection?.targetPeerId).toBe('host-peer-id');
      expect(state.p2pConnection?.status).toBe('connecting');
    });
  });

  describe('setSecretCode', () => {
    it('should save code and set isReady to true for player1', () => {
      useGameStore.getState().selectMode('local');
      useGameStore.getState().setSecretCode('player1', '1234');
      const state = useGameStore.getState();
      expect(state.players.player1.secretCode).toBe('1234');
      expect(state.players.player1.isReady).toBe(true);
      expect(state.phase).toBe('setup'); // not playing yet, player2 not ready
    });

    it('should transition phase to "playing" in local mode when both players are ready', () => {
      useGameStore.getState().selectMode('local');
      useGameStore.getState().setSecretCode('player1', '1234');
      useGameStore.getState().setSecretCode('player2', '5678');
      const state = useGameStore.getState();
      expect(state.players.player2?.secretCode).toBe('5678');
      expect(state.players.player2?.isReady).toBe(true);
      expect(state.phase).toBe('playing');
    });

    it('should transition phase to "playing" in cpu mode and automatically generate CPU secret code', () => {
      useGameStore.getState().selectMode('cpu');
      useGameStore.getState().setSecretCode('player1', '1234');
      const state = useGameStore.getState();
      expect(state.players.player1.secretCode).toBe('1234');
      expect(state.players.player1.isReady).toBe(true);
      expect(state.players.player2?.id).toBe('cpu');
      expect(state.players.player2?.secretCode).not.toBeNull();
      expect(state.players.player2?.secretCode?.length).toBe(4);
      expect(state.players.player2?.isReady).toBe(true);
      expect(state.phase).toBe('playing');
    });

    it('should reject invalid codes', () => {
      useGameStore.getState().selectMode('local');
      useGameStore.getState().setSecretCode('player1', '12a4'); // invalid
      const state = useGameStore.getState();
      expect(state.players.player1.secretCode).toBeNull();
      expect(state.players.player1.isReady).toBe(false);
    });
  });

  describe('makeGuess', () => {
    beforeEach(() => {
      useGameStore.getState().selectMode('local');
      useGameStore.getState().setSecretCode('player1', '1234');
      useGameStore.getState().setSecretCode('player2', '5678');
    });

    it('should record player 1 guess, calculate hits, and switch turn to player 2', () => {
      useGameStore.getState().makeGuess('player1', '1538');
      
      const state = useGameStore.getState();
      expect(state.players.player1.attempts.length).toBe(1);
      expect(state.players.player1.attempts[0].guess).toBe('1538');
      expect(state.players.player1.attempts[0].hits).toBe(1);
      expect(state.activeTurn).toBe('player2');
    });

    it('should toggle turn back to player 1 after player 2 guesses and increment round number', () => {
      useGameStore.getState().makeGuess('player1', '1538');
      useGameStore.getState().makeGuess('player2', '1234');

      const state = useGameStore.getState();
      expect(state.players.player2?.attempts.length).toBe(1);
      expect(state.players.player2?.attempts[0].guess).toBe('1234');
      expect(state.players.player2?.attempts[0].hits).toBe(4); // matches player1 secretCode 1234 exactly
      expect(state.activeTurn).toBe('player1');
      expect(state.currentRound).toBe(2);
    });

    it('should automatically process CPU turn after player 1 guesses in cpu mode', () => {
      // Switch to CPU mode
      useGameStore.getState().selectMode('cpu');
      useGameStore.getState().setSecretCode('player1', '1234'); // auto-generates CPU secret and transitions to playing

      // Player 1 makes a guess
      useGameStore.getState().makeGuess('player1', '1245');

      const state = useGameStore.getState();
      // CPU should have immediately taken its turn
      expect(state.players.player1.attempts.length).toBe(1); // Player 1's guess is registered
      expect(state.players.player2?.attempts.length).toBe(1); // CPU's guess is automatically registered!
      expect(state.players.player2?.attempts[0].guess).toBe('0000'); // first candidate of the solver
      expect(state.players.player2?.attempts[0].hits).toBe(0);
      expect(state.activeTurn).toBe('player1'); // Turn is switched back to Player 1
      expect(state.currentRound).toBe(2); // Round is incremented
    });

    it('should send SEND_GUESS message in P2P mode when player 1 guesses', () => {
      useGameStore.getState().selectMode('p2p');
      useGameStore.getState().initP2P();
      
      // Simulate connection open
      const openCallback = mockPeerInstance.on.mock.calls.find(call => call[0] === 'open')?.[1];
      openCallback('host-peer-id');
      useGameStore.getState().connectToPeer('client-peer-id');
      
      const connOpenCallback = mockConn.on.mock.calls.find(call => call[0] === 'open')?.[1];
      connOpenCallback();

      useGameStore.getState().setSecretCode('player1', '1234');
      // Set phase to playing manually for test simplicity
      useGameStore.setState({ phase: 'playing' });

      // Player 1 makes a guess
      useGameStore.getState().makeGuess('player1', '1538');

      expect(mockConn.send).toHaveBeenCalledWith({
        type: 'SEND_GUESS',
        payload: { guess: '1538', round: 1 },
      });
    });
  });

  describe('Victory and Draw round evaluation logic', () => {
    beforeEach(() => {
      useGameStore.getState().selectMode('local');
      useGameStore.getState().setSecretCode('player1', '1234');
      useGameStore.getState().setSecretCode('player2', '5678');
    });

    it('should not end the game if player 1 guesses correctly but player 2 has not taken their turn in the round', () => {
      // Player 2 secret is 5678. Player 1 guesses 5678 (4 hits)
      useGameStore.getState().makeGuess('player1', '5678');

      const state = useGameStore.getState();
      expect(state.phase).toBe('playing'); // Still playing, player 2 gets their turn
      expect(state.players.player1.attempts[0].hits).toBe(4);
      expect(state.activeTurn).toBe('player2');
      expect(state.winner).toBeNull();
    });

    it('should declare player 1 winner if player 1 guessed correctly and player 2 fails on round completion', () => {
      // Player 1 guesses 5678 (4 hits)
      useGameStore.getState().makeGuess('player1', '5678');
      // Player 2 guesses 1111 (0 hits)
      useGameStore.getState().makeGuess('player2', '1111');

      const state = useGameStore.getState();
      expect(state.phase).toBe('ended');
      expect(state.winner).toBe('player1');
    });

    it('should declare a draw if both players guess correctly in the same round', () => {
      // Player 1 guesses 5678 (4 hits)
      useGameStore.getState().makeGuess('player1', '5678');
      // Player 2 guesses 1234 (4 hits)
      useGameStore.getState().makeGuess('player2', '1234');

      const state = useGameStore.getState();
      expect(state.phase).toBe('ended');
      expect(state.winner).toBe('draw');
    });

    it('should declare player 2 winner if player 1 fails and player 2 guesses correctly', () => {
      // Player 1 guesses 1111 (0 hits)
      useGameStore.getState().makeGuess('player1', '1111');
      // Player 2 guesses 1234 (4 hits)
      useGameStore.getState().makeGuess('player2', '1234');

      const state = useGameStore.getState();
      expect(state.phase).toBe('ended');
      expect(state.winner).toBe('player2');
    });
  });
});
