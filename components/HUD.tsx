
import React from 'react';
import * as C from '../constants';

interface HUDProps {
  score: number;
  wave: number;
  playerHealth: number;
  playerMaxHealth: number;
  coreHealth: number;
  coreMaxHealth: number;
  proofMeter: number;
  maxProofMeter: number;
  powerUpTimer: number;
}

const HealthBar: React.FC<{ value: number; maxValue: number; label: string; color: string }> = ({ value, maxValue, label, color }) => {
  const percentage = (value / maxValue) * 100;
  return (
    <div className="w-28 sm:w-48 md:w-64">
      <span className="text-xs md:text-sm font-bold text-gray-300">{label}</span>
      <div className="w-full bg-gray-700 rounded-full h-3 md:h-4 border-2 border-gray-600">
        <div
          className={`${color} h-full rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const HUD: React.FC<HUDProps> = ({ score, wave, playerHealth, playerMaxHealth, coreHealth, coreMaxHealth, proofMeter, maxProofMeter, powerUpTimer }) => {
  return (
    <div className="absolute top-0 left-0 right-0 p-2 md:p-4 text-white z-10 flex flex-col items-center pointer-events-none">
      <div className="w-full flex justify-between items-start">
        {/* Health Bars (Left) */}
        <div className="flex flex-col space-y-1 md:space-y-2">
          <HealthBar value={playerHealth} maxValue={playerMaxHealth} label="Trust (You)" color="bg-cyan-400" />
          <HealthBar value={coreHealth} maxValue={coreMaxHealth} label="Trust (Core)" color="bg-purple-500" />
        </div>
        {/* Score & Wave (Right) */}
        <div className="text-right flex-shrink-0 ml-2">
          <h2 className="text-lg sm:text-2xl md:text-3xl font-bold tracking-widest">{score.toString().padStart(8, '0')}</h2>
          <p className="text-[10px] sm:text-base md:text-lg text-gray-400">Verified Bytes</p>
          <p className="text-base sm:text-xl md:text-2xl font-semibold mt-1">Wave: {wave}</p>
        </div>
      </div>

      {/* Proof Meter (Bottom/Centered) */}
      <div className="w-1/2 sm:w-1/3 mt-2">
        <span className="text-xs text-center block md:text-sm font-bold text-gray-300">Proof Meter</span>
        <div className="w-full bg-gray-700 rounded-full h-3 md:h-4 border-2 border-gray-600">
          <div
            className="bg-green-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${(proofMeter / maxProofMeter) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Power-up Timer */}
      {powerUpTimer > 0 && (
        <div className="w-1/2 sm:w-1/3 mt-2">
          <span className="text-xs text-center block md:text-sm font-bold text-pink-400 animate-pulse">POWER-UP ACTIVE</span>
          <div className="w-full bg-gray-700 rounded-full h-2 border-2 border-gray-600">
            <div
              className="bg-pink-500 h-full rounded-full"
              style={{ width: `${(powerUpTimer / C.POWER_UP_DURATION) * 100}%`, transition: 'width 0.1s linear' }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HUD;