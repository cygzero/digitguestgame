import React from 'react';
import { useGameStore } from '../store/useGameStore';

export const GameEndedView: React.FC = () => {
  const winner = useGameStore((state) => state.winner);
  const players = useGameStore((state) => state.players);
  const resetGame = useGameStore((state) => state.resetGame);

  const p1 = players.player1;
  const p2 = players.player2;

  let resultTitle = 'Fin de la Partida';
  let resultSubtitle = '';
  let themeClass = '';

  if (winner === 'draw') {
    resultTitle = '¡Empate!';
    resultSubtitle = '¡Ambos jugadores adivinaron el código en la misma ronda!';
    themeClass = 'cyan';
  } else if (winner === 'player1') {
    resultTitle = `¡Victoria de ${p1.name}!`;
    resultSubtitle = `Adivinó el código secreto en ${p1.attempts.length} rondas.`;
    themeClass = 'purple';
  } else if (winner === 'player2') {
    resultTitle = `¡Victoria de ${p2?.name || 'Jugador 2'}!`;
    resultSubtitle = `Adivinó el código secreto en ${p2?.attempts.length || 0} rondas.`;
    themeClass = 'green';
  }

  return (
    <div className="glass-panel fade-in" style={{ textAlign: 'center', maxWidth: '500px', width: '100%' }}>
      <h1 className={`pulse-glow-${themeClass || 'purple'}`} style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
        {resultTitle}
      </h1>
      <p style={{ opacity: 0.9, marginBottom: '32px', fontSize: '1.1rem' }}>
        {resultSubtitle}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
        {/* Player 1 Info */}
        <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>
            {p1.name}
          </h3>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '4px', margin: '12px 0', color: '#ff007f' }}>
            {p1.secretCode}
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8 }}>
            Código Secreto
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', fontWeight: 'bold' }}>
            {p1.attempts.length} intentos
          </p>
        </div>

        {/* Player 2 Info */}
        <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>
            {p2?.name || 'Rival'}
          </h3>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '4px', margin: '12px 0', color: '#00ffff' }}>
            {p2?.secretCode || '----'}
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8 }}>
            Código Secreto
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', fontWeight: 'bold' }}>
            {p2?.attempts.length || 0} intentos
          </p>
        </div>
      </div>

      <button className="btn btn-purple" onClick={resetGame} style={{ padding: '14px 28px', fontSize: '1.1rem' }}>
        Volver a Jugar
      </button>
    </div>
  );
};
