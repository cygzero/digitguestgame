import React from 'react';
import { useGameStore } from './store/useGameStore';
import { MainMenu } from './components/MainMenu';
import { P2PLobby } from './components/P2PLobby';
import { SetupView } from './components/SetupView';
import { GamePlayView } from './components/GamePlayView';
import { GameEndedView } from './components/GameEndedView';

const App: React.FC = () => {
  const phase = useGameStore((state) => state.phase);
  const mode = useGameStore((state) => state.mode);
  const p2pConnection = useGameStore((state) => state.p2pConnection);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      {phase === 'menu' && <MainMenu />}
      
      {phase === 'setup' && (
        mode === 'p2p' && p2pConnection?.status !== 'connected' ? (
          <P2PLobby />
        ) : (
          <SetupView />
        )
      )}

      {phase === 'playing' && <GamePlayView />}

      {phase === 'ended' && <GameEndedView />}
    </main>
  );
};

export default App;
