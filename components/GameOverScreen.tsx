import React from 'react';

interface GameOverScreenProps {
  score: number;
  wave: number;
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, wave, onRestart }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-4 md:p-8 bg-black bg-opacity-50 rounded-lg border-2 border-red-700 shadow-2xl shadow-red-500/30 max-w-sm md:max-w-2xl">
      <h1 className="text-4xl md:text-6xl font-bold text-red-500 tracking-wider">VERIFICATION FAILED</h1>
      <div className="my-6 md:my-8 text-xl md:text-2xl text-gray-300">
        <p>Final Verified Bytes: <span className="font-bold text-white">{score}</span></p>
        <p>Reached Wave: <span className="font-bold text-white">{wave}</span></p>
      </div>
      <button
        onClick={onRestart}
        className="px-8 py-3 text-xl md:px-10 md:py-4 md:text-2xl bg-yellow-500 text-gray-900 font-bold rounded-md border-b-4 border-yellow-700 hover:bg-yellow-400 hover:border-yellow-600 transition-all transform hover:scale-105"
      >
        Re-engage Protocol
      </button>
    </div>
  );
};

export default GameOverScreen;