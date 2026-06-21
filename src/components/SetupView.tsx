import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { SecretCodeInput } from './SecretCodeInput';

export const SetupView: React.FC = () => {
  const mode = useGameStore((state) => state.mode);
  const players = useGameStore((state) => state.players);
  const setSecretCode = useGameStore((state) => state.setSecretCode);
  const resetGame = useGameStore((state) => state.resetGame);

  const [activeInputPlayer, setActiveInputPlayer] = useState<'player1' | 'player2'>('player1');
  const [deviceHandoff, setDeviceHandoff] = useState<boolean>(false);

  const handleSecretCodeSubmit = (code: string) => {
    if (mode === 'local') {
      if (activeInputPlayer === 'player1') {
        setSecretCode('player1', code);
        setDeviceHandoff(true);
      } else {
        setSecretCode('player2', code);
      }
    } else {
      // For CPU and P2P, we are always setting player1's code locally
      setSecretCode('player1', code);
    }
  };

  const handleHandoffComplete = () => {
    setActiveInputPlayer('player2');
    setDeviceHandoff(false);
  };

  // Local Mode Handoff screen
  if (deviceHandoff) {
    return (
      <div className="glass-panel fade-in" style={{ textAlign: 'center', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ color: 'var(--neon-cyan)', marginBottom: '16px' }}>Código Registrado</h2>
        <p style={{ marginBottom: '32px', color: 'var(--text-secondary)' }}>
          El código del Jugador 1 ha sido configurado con éxito. Por favor, entrega el dispositivo al <strong>Jugador 2</strong>.
        </p>
        <button
          className="btn btn-cyan"
          onClick={handleHandoffComplete}
          style={{ width: '100%', padding: '16px' }}
        >
          Soy Jugador 2: Configurar Código
        </button>
      </div>
    );
  }

  // P2P Wait Screen
  if (mode === 'p2p' && players.player1.isReady) {
    return (
      <div className="glass-panel fade-in" style={{ textAlign: 'center', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ color: 'var(--neon-cyan)', marginBottom: '16px' }}>Código Configurado</h2>
        <p style={{ marginBottom: '32px', color: 'var(--text-secondary)' }}>
          Esperando a que tu rival termine de configurar su número secreto...
        </p>
        <div style={{ display: 'inline-block', width: '30px', height: '30px', border: '3px solid rgba(0, 240, 255, 0.1)', borderTopColor: 'var(--neon-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '24px' }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <button className="btn" onClick={resetGame} style={{ width: '100%' }}>
          Salir de la partida
        </button>
      </div>
    );
  }

  // Define titles and subtitles based on active player and mode
  let title = 'Ingresar Código Secreto';
  let subtitle = 'Define tu número de 4 dígitos para que el rival intente adivinarlo.';

  if (mode === 'local') {
    if (activeInputPlayer === 'player1') {
      title = 'Jugador 1: Define tu Código';
      subtitle = 'El Jugador 2 no debe ver la pantalla.';
    } else {
      title = 'Jugador 2: Define tu Código';
      subtitle = 'El Jugador 1 no debe ver la pantalla.';
    }
  } else if (mode === 'cpu') {
    title = 'Configura tu Código Secreto';
    subtitle = 'La CPU generará su código de forma aleatoria.';
  } else if (mode === 'p2p') {
    title = 'Configura tu Código';
    subtitle = 'Se enviará una alerta a tu rival indicando que estás listo.';
  }

  return (
    <div className="glass-panel fade-in" style={{ width: '100%', maxWidth: '400px' }}>
      <SecretCodeInput
        title={title}
        subtitle={subtitle}
        onSubmit={handleSecretCodeSubmit}
      />
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
        <button className="btn" onClick={resetGame} style={{ width: '100%', borderColor: 'rgba(255,255,255,0.05)' }}>
          Volver al Menú Principal
        </button>
      </div>
    </div>
  );
};
