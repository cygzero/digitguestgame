import { create } from 'zustand';
import type { GameMode, GamePhase, Player, P2PConnectionState } from '../game/types';
import { Peer, type DataConnection } from 'peerjs';
import { isValidCode, calculateHits } from '../game/engine';
import { generateAllCandidates, filterCandidates, getNextGuess } from '../game/solver';

export interface GameState {
  mode: GameMode;
  phase: GamePhase;
  players: {
    player1: Player;
    player2: Player | null;
  };
  currentRound: number;
  activeTurn: 'player1' | 'player2';
  winner: 'player1' | 'player2' | 'draw' | null;
  p2pConnection: P2PConnectionState | null;
  cpuCandidates: string[];

  // Actions
  selectMode: (mode: GameMode) => void;
  setSecretCode: (playerId: 'player1' | 'player2', code: string) => void;
  makeGuess: (playerId: 'player1' | 'player2', guess: string) => void;
  resetGame: () => void;
  initP2P: () => void;
  connectToPeer: (targetPeerId: string) => void;
}

export let peerInstance: Peer | null = null;
export let activeConnection: DataConnection | null = null;
export let pendingGuess: string | null = null;

const initialPlayer = (id: 'player1' | 'player2' | 'cpu', name: string): Player => ({
  id,
  name,
  secretCode: null,
  attempts: [],
  isReady: false,
});

const getInitialState = () => ({
  mode: 'local' as GameMode,
  phase: 'menu' as GamePhase,
  players: {
    player1: initialPlayer('player1', 'Jugador 1'),
    player2: null,
  },
  currentRound: 1,
  activeTurn: 'player1' as 'player1' | 'player2',
  winner: null as 'player1' | 'player2' | 'draw' | null,
  p2pConnection: null as P2PConnectionState | null,
  cpuCandidates: [] as string[],
});

const evaluateEndGame = (
  player1: Player,
  player2: Player | null,
  currentPhase: GamePhase,
  currentWinner: 'player1' | 'player2' | 'draw' | null
) => {
  if (!player2) return { phase: currentPhase, winner: currentWinner };
  const p1Attempts = player1.attempts;
  const p2Attempts = player2.attempts;

  if (p1Attempts.length === p2Attempts.length && p1Attempts.length > 0) {
    const p1LastHits = p1Attempts[p1Attempts.length - 1].hits;
    const p2LastHits = p2Attempts[p2Attempts.length - 1].hits;

    const p1Win = p1LastHits === 4;
    const p2Win = p2LastHits === 4;

    if (p1Win && p2Win) {
      return { phase: 'ended' as GamePhase, winner: 'draw' as const };
    } else if (p1Win) {
      return { phase: 'ended' as GamePhase, winner: 'player1' as const };
    } else if (p2Win) {
      return { phase: 'ended' as GamePhase, winner: 'player2' as const };
    }
  }
  return { phase: currentPhase, winner: currentWinner };
};

export const useGameStore = create<GameState>((set) => ({
  ...getInitialState(),

  selectMode: (mode) => {
    set((state) => {
      let player2 = null;
      let cpuCandidates: string[] = [];
      if (mode === 'local') {
        player2 = initialPlayer('player2', 'Jugador 2');
      } else if (mode === 'cpu') {
        player2 = initialPlayer('cpu', 'CPU');
        cpuCandidates = generateAllCandidates();
      }
      return {
        mode,
        phase: 'setup',
        players: {
          ...state.players,
          player2,
        },
        cpuCandidates,
      };
    });
  },

  setSecretCode: (playerId, code) => {
    if (!isValidCode(code)) return;

    set((state) => {
      const updatedPlayer1 = playerId === 'player1'
        ? { ...state.players.player1, secretCode: code, isReady: true }
        : state.players.player1;

      let updatedPlayer2 = null;
      if (state.players.player2) {
        updatedPlayer2 = playerId === 'player2'
          ? { ...state.players.player2, secretCode: code, isReady: true }
          : state.players.player2;
      }

      const nextPlayers = {
        player1: updatedPlayer1,
        player2: updatedPlayer2,
      };

      let nextPhase = state.phase;

      if (state.mode === 'local') {
        if (nextPlayers.player1.isReady && nextPlayers.player2 && nextPlayers.player2.isReady) {
          nextPhase = 'playing';
        }
      } else if (state.mode === 'cpu') {
        if (playerId === 'player1') {
          const cpuCode = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join('');
          nextPlayers.player2 = {
            id: 'cpu',
            name: 'CPU',
            secretCode: cpuCode,
            attempts: [],
            isReady: true,
          };
          nextPhase = 'playing';
        }
      } else if (state.mode === 'p2p') {
        if (playerId === 'player1' && activeConnection) {
          activeConnection.send({
            type: 'SET_SECRET',
            payload: {},
          });
        }
        
        if (nextPlayers.player1.isReady && nextPlayers.player2 && nextPlayers.player2.isReady) {
          nextPhase = 'playing';
        }
      }

      return {
        players: nextPlayers,
        phase: nextPhase,
      };
    });
  },

  makeGuess: (playerId, guess) => {
    if (!isValidCode(guess)) return;

    set((state) => {
      if (state.phase !== 'playing' || state.activeTurn !== playerId) return {};

      if (state.mode === 'p2p') {
        if (playerId === 'player1') {
          pendingGuess = guess;
          if (activeConnection) {
            activeConnection.send({
              type: 'SEND_GUESS',
              payload: { guess, round: state.currentRound },
            });
          }
        }
        return {};
      }

      let opponentCode = '';
      if (playerId === 'player1') {
        opponentCode = state.players.player2?.secretCode || '';
      } else {
        opponentCode = state.players.player1.secretCode || '';
      }

      const hits = calculateHits(opponentCode, guess);
      const attempt = {
        guess,
        hits,
        timestamp: Date.now(),
      };

      let updatedPlayer1 = playerId === 'player1'
        ? { ...state.players.player1, attempts: [...state.players.player1.attempts, attempt] }
        : state.players.player1;

      let updatedPlayer2 = state.players.player2 && playerId === 'player2'
        ? { ...state.players.player2, attempts: [...state.players.player2.attempts, attempt] }
        : state.players.player2;

      let nextTurn = state.activeTurn;
      let nextRound = state.currentRound;

      if (state.activeTurn === 'player1') {
        nextTurn = 'player2';
      } else {
        nextTurn = 'player1';
        nextRound = state.currentRound + 1;
      }

      let nextCpuCandidates = state.cpuCandidates;

      if (state.mode === 'cpu' && nextTurn === 'player2' && updatedPlayer2) {
        const cpuGuess = getNextGuess(nextCpuCandidates);
        const cpuHits = calculateHits(updatedPlayer1.secretCode || '', cpuGuess);
        const cpuAttempt = {
          guess: cpuGuess,
          hits: cpuHits,
          timestamp: Date.now(),
        };

        updatedPlayer2 = {
          ...updatedPlayer2,
          attempts: [...updatedPlayer2.attempts, cpuAttempt],
        };

        nextCpuCandidates = filterCandidates(nextCpuCandidates, cpuGuess, cpuHits);
        nextTurn = 'player1';
        nextRound = nextRound + 1;
      }

      const { phase: nextPhase, winner: nextWinner } = evaluateEndGame(
        updatedPlayer1,
        updatedPlayer2,
        state.phase,
        state.winner
      );

      return {
        players: {
          player1: updatedPlayer1,
          player2: updatedPlayer2,
        },
        activeTurn: nextTurn,
        currentRound: nextRound,
        cpuCandidates: nextCpuCandidates,
        phase: nextPhase,
        winner: nextWinner,
      };
    });
  },

  resetGame: () => {
    if (peerInstance) {
      peerInstance.destroy();
      peerInstance = null;
    }
    activeConnection = null;
    pendingGuess = null;
    set(getInitialState());
  },

  initP2P: () => {
    if (peerInstance) {
      peerInstance.destroy();
    }
    
    set({
      p2pConnection: {
        peerId: '',
        targetPeerId: null,
        status: 'connecting',
        errorMessage: null,
      }
    });

    try {
      peerInstance = new Peer();

      peerInstance.on('open', (id) => {
        set((state) => ({
          p2pConnection: state.p2pConnection ? {
            ...state.p2pConnection,
            peerId: id,
            status: 'idle',
          } : null
        }));
      });

      peerInstance.on('connection', (conn) => {
        activeConnection = conn;
        
        set((state) => ({
          p2pConnection: state.p2pConnection ? {
            ...state.p2pConnection,
            targetPeerId: conn.peer,
            status: 'connected',
          } : null,
          players: {
            ...state.players,
            player2: {
              id: 'player2',
              name: 'Jugador 2',
              secretCode: null,
              attempts: [],
              isReady: false,
            }
          }
        }));

        conn.on('open', () => {
          conn.send({
            type: 'CONNECT_SUCCESS',
            payload: { hostName: 'Jugador 1' },
          });
        });

        conn.on('data', (data: any) => {
          if (!data) return;

          if (data.type === 'SET_SECRET') {
            set((state) => {
              if (!state.players.player2) return {};
              const player2Ready = { ...state.players.player2, isReady: true };
              const player1Ready = state.players.player1;
              return {
                players: {
                  player1: player1Ready,
                  player2: player2Ready,
                },
                phase: player1Ready.isReady && player2Ready.isReady ? 'playing' : state.phase,
              };
            });
          } else if (data.type === 'SEND_GUESS') {
            const guess = data.payload.guess;
            set((state) => {
              const hits = calculateHits(state.players.player1.secretCode || '', guess);
              const attempt = { guess, hits, timestamp: Date.now() };
              const updatedPlayer2 = state.players.player2
                ? { ...state.players.player2, attempts: [...state.players.player2.attempts, attempt] }
                : null;
              
              if (activeConnection) {
                activeConnection.send({
                  type: 'SEND_FEEDBACK',
                  payload: { hits },
                });
              }

              const { phase: nextPhase, winner: nextWinner } = evaluateEndGame(
                state.players.player1,
                updatedPlayer2,
                state.phase,
                state.winner
              );

              return {
                players: {
                  player1: state.players.player1,
                  player2: updatedPlayer2,
                },
                activeTurn: 'player1' as const,
                currentRound: state.currentRound + 1,
                phase: nextPhase,
                winner: nextWinner,
              };
            });
          } else if (data.type === 'SEND_FEEDBACK') {
            const hits = data.payload.hits;
            set((state) => {
              if (!pendingGuess) return {};
              const attempt = { guess: pendingGuess, hits, timestamp: Date.now() };
              const updatedPlayer1 = {
                ...state.players.player1,
                attempts: [...state.players.player1.attempts, attempt],
              };
              pendingGuess = null;

              const { phase: nextPhase, winner: nextWinner } = evaluateEndGame(
                updatedPlayer1,
                state.players.player2,
                state.phase,
                state.winner
              );

              return {
                players: {
                  player1: updatedPlayer1,
                  player2: state.players.player2,
                },
                activeTurn: 'player2' as const,
                phase: nextPhase,
                winner: nextWinner,
              };
            });
          }
        });

        conn.on('close', () => {
          set((state) => ({
            p2pConnection: state.p2pConnection ? {
              ...state.p2pConnection,
              status: 'disconnected',
            } : null,
            players: {
              ...state.players,
              player2: null,
            }
          }));
        });

        conn.on('error', (err) => {
          set((state) => ({
            p2pConnection: state.p2pConnection ? {
              ...state.p2pConnection,
              status: 'error',
              errorMessage: err.message,
            } : null
          }));
        });
      });

      peerInstance.on('error', (err) => {
        set((state) => ({
          p2pConnection: state.p2pConnection ? {
            ...state.p2pConnection,
            status: 'error',
            errorMessage: err.message,
          } : null
        }));
      });
    } catch (e: any) {
      set((state) => ({
        p2pConnection: state.p2pConnection ? {
          ...state.p2pConnection,
          status: 'error',
          errorMessage: e.message || 'Error al iniciar PeerJS',
        } : null
      }));
    }
  },

  connectToPeer: (targetPeerId) => {
    if (!peerInstance) return;

    set((state) => ({
      p2pConnection: state.p2pConnection ? {
        ...state.p2pConnection,
        targetPeerId,
        status: 'connecting',
      } : null
    }));

    const conn = peerInstance.connect(targetPeerId);
    activeConnection = conn;

    conn.on('open', () => {
      set((state) => ({
        p2pConnection: state.p2pConnection ? {
          ...state.p2pConnection,
          status: 'connected',
        } : null,
        players: {
          ...state.players,
          player2: {
            id: 'player2',
            name: 'Jugador 2',
            secretCode: null,
            attempts: [],
            isReady: false,
          }
        }
      }));
    });

    conn.on('data', (data: any) => {
      if (!data) return;

      if (data.type === 'SET_SECRET') {
        set((state) => {
          if (!state.players.player2) return {};
          const player2Ready = { ...state.players.player2, isReady: true };
          const player1Ready = state.players.player1;
          return {
            players: {
              player1: player1Ready,
              player2: player2Ready,
            },
            phase: player1Ready.isReady && player2Ready.isReady ? 'playing' : state.phase,
          };
        });
      } else if (data.type === 'SEND_GUESS') {
        const guess = data.payload.guess;
        set((state) => {
          const hits = calculateHits(state.players.player1.secretCode || '', guess);
          const attempt = { guess, hits, timestamp: Date.now() };
          const updatedPlayer2 = state.players.player2
            ? { ...state.players.player2, attempts: [...state.players.player2.attempts, attempt] }
            : null;
          
          if (activeConnection) {
            activeConnection.send({
              type: 'SEND_FEEDBACK',
              payload: { hits },
            });
          }

          const { phase: nextPhase, winner: nextWinner } = evaluateEndGame(
            state.players.player1,
            updatedPlayer2,
            state.phase,
            state.winner
          );

          return {
            players: {
              player1: state.players.player1,
              player2: updatedPlayer2,
            },
            activeTurn: 'player1' as const,
            currentRound: state.currentRound + 1,
            phase: nextPhase,
            winner: nextWinner,
          };
        });
      } else if (data.type === 'SEND_FEEDBACK') {
        const hits = data.payload.hits;
        set((state) => {
          if (!pendingGuess) return {};
          const attempt = { guess: pendingGuess, hits, timestamp: Date.now() };
          const updatedPlayer1 = {
            ...state.players.player1,
            attempts: [...state.players.player1.attempts, attempt],
          };
          pendingGuess = null;

          const { phase: nextPhase, winner: nextWinner } = evaluateEndGame(
            updatedPlayer1,
            state.players.player2,
            state.phase,
            state.winner
          );

          return {
            players: {
              player1: updatedPlayer1,
              player2: state.players.player2,
            },
            activeTurn: 'player2' as const,
            phase: nextPhase,
            winner: nextWinner,
          };
        });
      }
    });

    conn.on('close', () => {
      set((state) => ({
        p2pConnection: state.p2pConnection ? {
          ...state.p2pConnection,
          status: 'disconnected',
          targetPeerId: null,
        } : null,
        players: {
          ...state.players,
          player2: null,
        }
      }));
    });

    conn.on('error', (err) => {
      set((state) => ({
        p2pConnection: state.p2pConnection ? {
          ...state.p2pConnection,
          status: 'error',
          errorMessage: err.message,
        } : null
      }));
    });
  },
}));
