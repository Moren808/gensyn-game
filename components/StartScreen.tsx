import React from 'react';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-4 md:p-8 bg-black bg-opacity-50 rounded-lg border-2 border-purple-700 shadow-2xl shadow-purple-500/30 max-w-sm md:max-w-2xl">
      <h1 className="text-4xl md:text-6xl font-bold text-cyan-400 tracking-wider">ANT BLASTER</h1>
      <h2 className="text-xl md:text-2xl font-semibold text-yellow-400 mt-2 mb-6 md:mb-8">Verify or Die</h2>
      <div className="max-w-xl text-sm md:text-lg text-gray-300 space-y-3 md:space-y-4 mb-8 md:mb-10">
        <p>You are an Ant Soldier in the Gensyn Data Hive.</p>
        <p>Defend the Verification Core from corrupted packets (Bees).</p>
        <p><span className="font-bold text-white">WASD/TOUCH</span> to Move. <span className="font-bold text-white">MOUSE/TOUCH</span> to Aim & Shoot.</p>
        <p>Collect <span className="text-green-400">Verified Data Orbs</span> to restore Trust and charge your Proof Meter.</p>
      </div>
      <button
        onClick={onStart}
        className="px-8 py-3 text-xl md:px-10 md:py-4 md:text-2xl bg-cyan-500 text-gray-900 font-bold rounded-md border-b-4 border-cyan-700 hover:bg-cyan-400 hover:border-cyan-600 transition-all transform hover:scale-105"
      >
        Initialize Verification
      </button>
    </div>
  );
};

export default StartScreen;