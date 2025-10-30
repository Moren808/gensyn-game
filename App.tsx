import React, { useState, useCallback } from 'react';
import Game from './components/Game';
import StartScreen from './components/StartScreen';
import GameOverScreen from './components/GameOverScreen';
import UpgradeScreen from './components/UpgradeScreen';
import { GameState, Upgrade } from './types';
import { INITIAL_UPGRADES } from './constants';

const Logo = () => (
  <svg
    width="65"
    height="65"
    viewBox="0 0 13 13"
    xmlns="http://www.w3.org/2000/svg"
    style={{ imageRendering: 'pixelated' }}
    role="img"
    className="flex-shrink-0"
  >
    <title>Gensyn Logo</title>
    <g fill="#fbe8e6">
      <rect x="4" y="0" width="5" height="1" />
      <rect x="2" y="1" width="9" height="1" />
      <rect x="1" y="2" width="11" height="1" />
      <rect x="0" y="3" width="13" height="1" />
      <rect x="0" y="4" width="13" height="1" />
      <rect x="0" y="5" width="3" height="3" />
      <rect x="10" y="5" width="3" height="3" />
      <rect x="0" y="8" width="13" height="1" />
      <rect x="0" y="9" width="13" height="1" />
      <rect x="1" y="10" width="11" height="1" />
      <rect x="2" y="11" width="9" height="1" />
      <rect x="4" y="12" width="5" height="1" />
    </g>
  </svg>
);


const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START_SCREEN);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(0);
  const [upgrades, setUpgrades] = useState<Upgrade>(INITIAL_UPGRADES);

  const handleStart = useCallback(() => {
    setScore(0);
    setWave(0);
    setUpgrades(INITIAL_UPGRADES);
    setGameState(GameState.PLAYING);
  }, []);

  const handleGameOver = useCallback((finalScore: number, finalWave: number) => {
    setScore(finalScore);
    setWave(finalWave);
    setGameState(GameState.GAME_OVER);
  }, []);
  
  const handleEnterUpgradeScreen = useCallback((currentScore: number, currentWave: number) => {
    setScore(currentScore);
    setWave(currentWave);
    setGameState(GameState.UPGRADE);
  }, []);

  const handleUpgrade = useCallback((upgrade: keyof Upgrade) => {
    setUpgrades(prev => ({ ...prev, [upgrade]: prev[upgrade] + 1 }));
    setGameState(GameState.PLAYING);
  }, []);

  const renderContent = () => {
    switch (gameState) {
      case GameState.START_SCREEN:
        return <StartScreen onStart={handleStart} />;
      case GameState.PLAYING:
        return <Game onGameOver={handleGameOver} onEnterUpgradeScreen={handleEnterUpgradeScreen} upgrades={upgrades} initialWave={wave} />;
      case GameState.UPGRADE:
        return <UpgradeScreen onUpgrade={handleUpgrade} currentUpgrades={upgrades} />;
      case GameState.GAME_OVER:
        return <GameOverScreen score={score} wave={wave} onRestart={handleStart} />;
      default:
        return <StartScreen onStart={handleStart} />;
    }
  };

  return (
    <div className="w-screen h-screen text-white font-mono flex flex-col items-center justify-center p-2 md:p-4 overflow-hidden">
      <Logo />
      <div className="mt-4 flex-grow flex items-center justify-center w-full relative">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;