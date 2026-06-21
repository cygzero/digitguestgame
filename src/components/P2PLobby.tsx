import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';

export const P2PLobby: React.FC = () => {
  const [targetId, setTargetId] = useState('');
  const p2pConnection = useGameStore((state) => state.p2pConnection);
  const initP2P = useGameStore((state) => state.initP2P);
  const connectToPeer = useGameStore((state) => state.connectToPeer);
  const resetGame = useGameStore((state) => state.resetGame);

  // Auto-initialize P2P when the lobby component mounts
  useEffect(() => {
    initP2P();
  }, [initP2P]);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetId.trim()) {
      connectToPeer(targetId.trim());
    }
  };

  const getStatusText = () => {
    if (!p2pConnection) return 'Iniciando servicio...';
    switch (p2pConnection.status) {
      case 'connecting':
        return 'Conectando con el servidor broker...';
      case 'idle':
        return 'Listo. Comparte tu código de sala o únete a una existente.';
      case 'connected':
        return '¡Conectado! Preparando el juego...';
      case 'disconnected':
        return 'Desconectado.';
      case 'error':
        return `Error: ${p2pConnection.errorMessage || 'Conexión fallida'}`;
      default:
        return 'Cargando...';
    }
  };

  const getStatusColor = () => {
    if (!p2pConnection) return 'var(--text-secondary)';
    switch (p2pConnection.status) {
      case 'connected':
        return 'var(--neon-green)';
      case 'error':
        return 'var(--neon-pink)';
      case 'connecting':
        return 'var(--neon-purple)';
      default:
        return 'var(--neon-cyan)';
    }
  };

  return (
    <div className="glass-panel fade-in" style={{ width: '100%' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Multijugador P2P</h2>
      <p style={{ textAlign: 'center', fontSize: '0.95rem', marginBottom: '24px', color: 'var(--text-secondary)' }}>
        Conéctate de forma directa con otro jugador compartiendo un código de sala.
      </p>

      {/* Connection Status Banner */}
      <div
        style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(255, 255, 255, 0.02)',
          borderLeft: `3px solid ${getStatusColor()}`,
          fontSize: '0.9rem',
          marginBottom: '24px',
          transition: 'var(--transition-normal)',
        }}
      >
        <span style={{ fontWeight: 600, display: 'block', marginBottom: '2px', color: getStatusColor() }}>
          Estado
        </span>
        {getStatusText()}
      </div>

      {p2pConnection && p2pConnection.status !== 'error' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Section 1: Host Room */}
          <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Opción A: Crear Sala (Ser Anfitrión)
            </h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '12px' }}>
              Comparte este código con tu rival para que se conecte a tu partida:
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                fontFamily: 'var(--font-mono)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--neon-cyan)',
                textShadow: '0 0 10px rgba(0, 240, 255, 0.2)',
              }}
            >
              <span>{p2pConnection.peerId || 'Obteniendo código...'}</span>
              {p2pConnection.peerId && (
                <button
                  onClick={() => navigator.clipboard.writeText(p2pConnection.peerId)}
                  className="btn"
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  Copiar
                </button>
              )}
            </div>
          </div>

          {/* Section 2: Join Room */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Opción B: Unirse a Sala
            </h3>
            <form onSubmit={handleConnect} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                placeholder="Ingresa el código del rival"
                disabled={p2pConnection.status === 'connecting' || p2pConnection.status === 'connected'}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                  transition: 'var(--transition-fast)',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--neon-purple)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
              />
              <button
                type="submit"
                className="btn btn-purple"
                disabled={!targetId.trim() || p2pConnection.status === 'connecting' || p2pConnection.status === 'connected'}
                style={{ padding: '12px 24px' }}
              >
                Conectar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reset/Back Button */}
      <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center' }}>
        <button className="btn" onClick={resetGame} style={{ width: '100%' }}>
          Volver al Menú Principal
        </button>
      </div>
    </div>
  );
};
