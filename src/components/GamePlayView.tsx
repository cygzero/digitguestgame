import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';

export const GamePlayView: React.FC = () => {
  const mode = useGameStore((state) => state.mode);
  const players = useGameStore((state) => state.players);
  const currentRound = useGameStore((state) => state.currentRound);
  const activeTurn = useGameStore((state) => state.activeTurn);
  const makeGuess = useGameStore((state) => state.makeGuess);
  const resetGame = useGameStore((state) => state.resetGame);

  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [deviceHandoff, setDeviceHandoff] = useState<boolean>(false);
  const [nextTurnPlayer, setNextTurnPlayer] = useState<'player1' | 'player2'>('player1');

  const handleDigitPress = (digit: string) => {
    if (currentGuess.length < 4) {
      setCurrentGuess((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setCurrentGuess((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setCurrentGuess('');
  };

  const handleSubmit = () => {
    if (currentGuess.length === 4) {
      makeGuess(activeTurn, currentGuess);
      setCurrentGuess('');

      // In Local mode, trigger handoff screen between player1 and player2 turns
      if (mode === 'local') {
        const next = activeTurn === 'player1' ? 'player2' : 'player1';
        setNextTurnPlayer(next);
        setDeviceHandoff(true);
      }
    }
  };

  const handleHandoffComplete = () => {
    setDeviceHandoff(false);
  };

  // Local Mode Handoff screen
  if (deviceHandoff) {
    const nextPlayerName = nextTurnPlayer === 'player1' ? players.player1.name : players.player2?.name || 'Jugador 2';
    return (
      <div className="glass-panel fade-in" style={{ textAlign: 'center', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ color: 'var(--neon-purple)', marginBottom: '16px' }}>Turno Completado</h2>
        <p style={{ marginBottom: '32px', color: 'var(--text-secondary)' }}>
          Tu intento ha sido registrado. Por favor, entrega el dispositivo a <strong>{nextPlayerName}</strong>.
        </p>
        <button
          className="btn btn-purple"
          onClick={handleHandoffComplete}
          style={{ width: '100%', padding: '16px' }}
        >
          Soy {nextPlayerName}: Ver Tablero
        </button>
      </div>
    );
  }

  // P2P waiting screen (when it is the opponent's turn)
  const isP2PWaiting = mode === 'p2p' && activeTurn === 'player2';

  const activePlayerName = activeTurn === 'player1' ? players.player1.name : players.player2?.name || 'CPU';
  const playerColor = activeTurn === 'player1' ? 'var(--neon-cyan)' : 'var(--neon-purple)';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', width: '100%', maxWidth: '900px', margin: '0 auto' }}>

      {/* Top Header Card */}
      <div className="glass-panel fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Partida {mode.toUpperCase()}
          </span>
          <h2 style={{ margin: 0, fontSize: '1.75rem' }}>Ronda {currentRound}</h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>Turno de</span>
          <strong style={{ color: playerColor, fontSize: '1.2rem', textTransform: 'uppercase' }}>
            {isP2PWaiting ? 'Rival' : activePlayerName}
          </strong>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>

        {/* Left Column: Input and Controls */}
        <div className="glass-panel fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '420px' }}>
          {isP2PWaiting ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <h3 style={{ color: 'var(--neon-purple)', marginBottom: '16px' }}>Esperando al Rival...</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                Tu oponente está pensando su siguiente intento de 4 dígitos.
              </p>
              <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid rgba(189, 0, 255, 0.1)', borderTopColor: 'var(--neon-purple)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : (
            <div style={{ width: '100%', maxWidth: '300px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', textAlign: 'center' }}>
                Ingresa tu Intento
              </h3>

              {/* Guess Preview Box */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
                {[0, 1, 2, 3].map((idx) => {
                  const digit = currentGuess[idx] || '';
                  const isFilled = digit !== '';
                  return (
                    <div
                      key={idx}
                      className={`digit-box ${isFilled ? 'filled' : ''}`}
                      style={{
                        width: '48px',
                        height: '56px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: `2px solid ${isFilled ? playerColor : 'rgba(255, 255, 255, 0.1)'}`,
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: playerColor,
                        boxShadow: isFilled ? `0 0 10px ${playerColor}33` : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {digit}
                    </div>
                  );
                })}
              </div>

              {/* Dedicated Guess Numpad */}
              <div className="numpad" style={{ width: '100%', gap: '8px' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button"
                    className="numpad-btn"
                    onClick={() => handleDigitPress(num.toString())}
                    disabled={currentGuess.length >= 4}
                    style={{ padding: '12px', fontSize: '1.15rem' }}
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  className="numpad-btn"
                  onClick={handleClear}
                  disabled={currentGuess.length === 0}
                  style={{ padding: '12px', fontSize: '0.85rem', textTransform: 'uppercase', borderColor: 'rgba(255,255,255,0.05)' }}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="numpad-btn"
                  onClick={() => handleDigitPress('0')}
                  disabled={currentGuess.length >= 4}
                  style={{ padding: '12px', fontSize: '1.15rem' }}
                >
                  0
                </button>
                <button
                  type="button"
                  className="numpad-btn"
                  onClick={handleBackspace}
                  disabled={currentGuess.length === 0}
                  style={{ padding: '12px', fontSize: '1.15rem' }}
                >
                  ⌫
                </button>
              </div>

              {/* Submit Guess Button */}
              <button
                type="button"
                className="btn"
                onClick={handleSubmit}
                disabled={currentGuess.length !== 4}
                style={{
                  width: '100%',
                  marginTop: '20px',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  borderColor: currentGuess.length === 4 ? playerColor : 'rgba(255, 255, 255, 0.1)',
                  boxShadow: currentGuess.length === 4 ? `0 0 15px ${playerColor}55` : 'none',
                  background: currentGuess.length === 4 ? playerColor : 'rgba(255, 255, 255, 0.02)',
                  color: currentGuess.length === 4 ? 'var(--bg-primary)' : 'var(--text-primary)',
                }}
              >
                Enviar Intento
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Game History */}
        <div className="glass-panel fade-in" style={{ display: 'flex', flexDirection: 'column', minHeight: '420px', padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '10px' }}>
            Historial de Intentos
          </h3>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '340px', paddingRight: '4px' }}>
            {players.player1.attempts.length === 0 && (!players.player2 || players.player2.attempts.length === 0) ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontStyle: 'italic', textAlign: 'center', marginTop: '40px' }}>
                No se han realizado intentos en esta partida.
              </p>
            ) : (
              // Map rounds in history
              Array.from({ length: Math.max(players.player1.attempts.length, players.player2?.attempts.length || 0) }).map((_, idx, array) => {
                const p1Attempt = players.player1.attempts[array.length - (idx + 1)];
                const p2Attempt = players.player2?.attempts[array.length - (idx + 1)];
                const roundNum = array.length - (idx + 1);

                return (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.01)',
                      border: '1px solid rgba(255, 255, 255, 0.03)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px dashed rgba(255, 255, 255, 0.03)', paddingBottom: '4px' }}>
                      Ronda {roundNum}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                      {/* Player 1 Attempt column */}
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--neon-cyan)', fontWeight: 600 }}>{players.player1.name}</span>
                        {p1Attempt ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 600 }}>{p1Attempt.guess}</span>
                            <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'rgba(0, 240, 255, 0.1)', color: 'var(--neon-cyan)', borderRadius: '4px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                              {p1Attempt.hits} aciertos
                            </span>
                          </div>
                        ) : (
                          <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>Pensando...</span>
                        )}
                      </div>

                      {/* Player 2 / CPU Attempt column */}
                      {players.player2 && (
                        <div style={{ flex: 1, textAlign: 'right', borderLeft: '1px solid rgba(255, 255, 255, 0.03)', paddingLeft: '12px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--neon-purple)', fontWeight: 600 }}>{players.player2.name}</span>
                          {p2Attempt ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginTop: '2px' }}>
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 600 }}>{p2Attempt.guess}</span>
                              <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'rgba(189, 0, 255, 0.1)', color: 'var(--neon-purple)', borderRadius: '4px', border: '1px solid rgba(189, 0, 255, 0.2)' }}>
                                {p2Attempt.hits} aciertos
                              </span>
                            </div>
                          ) : (
                            <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>Pensando...</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Footer controls */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button className="btn" onClick={resetGame} style={{ width: '100%', maxWidth: '240px', borderColor: 'rgba(255,255,255,0.05)' }}>
          Salir de la Partida
        </button>
      </div>
    </div>
  );
};
