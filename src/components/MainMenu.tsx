import React from 'react';
import { useGameStore } from '../store/useGameStore';

export const MainMenu: React.FC = () => {
  const selectMode = useGameStore((state) => state.selectMode);

  return (
    <div className="glass-panel fade-in" style={{ textAlign: 'center' }}>
      <h1 className="pulse-glow">Digit Guess</h1>
      <p style={{ marginBottom: '32px', fontSize: '1.1rem' }}>
        Desafía a tu rival en un duelo de deducción. Adivina su código secreto de 4 dígitos antes de que adivine el tuyo.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <button
          className="btn btn-cyan"
          onClick={() => selectMode('local')}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', height: 'auto' }}
        >
          <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>Local (Mismo Dispositivo)</span>
          <span style={{ fontSize: '0.85rem', opacity: 0.8, textTransform: 'none', letterSpacing: 'normal', marginTop: '4px' }}>
            Pásense el dispositivo en cada turno
          </span>
        </button>

        <button
          className="btn btn-purple"
          onClick={() => selectMode('cpu')}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', height: 'auto' }}
        >
          <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>Contra la Computadora (CPU)</span>
          <span style={{ fontSize: '0.85rem', opacity: 0.8, textTransform: 'none', letterSpacing: 'normal', marginTop: '4px' }}>
            Enfréntate a la Inteligencia Artificial
          </span>
        </button>

        <button
          className="btn btn-green"
          onClick={() => selectMode('p2p')}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', height: 'auto' }}
        >
          <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>Multijugador P2P</span>
          <span style={{ fontSize: '0.85rem', opacity: 0.8, textTransform: 'none', letterSpacing: 'normal', marginTop: '4px' }}>
            Juego en línea directa vía WebRTC
          </span>
        </button>
      </div>
    </div>
  );
};
