import React from 'react';
import { Upgrade, UpgradeType } from '../types';

interface UpgradeScreenProps {
  onUpgrade: (upgrade: keyof Upgrade) => void;
  currentUpgrades: Upgrade;
}

const upgradeInfo = {
  [UpgradeType.PROOF_POWER]: { name: "Proof Power", description: "Increases proof pulse (bullet) damage." },
  // FIX: Corrected typo from DATA_THROUGHPUT to DATA_THROUGPUT to match the enum definition in types.ts.
  [UpgradeType.DATA_THROUGPUT]: { name: "Data Throughput", description: "Increases fire rate." },
  [UpgradeType.REPLICATION_SPEED]: { name: "Replication Speed", description: "Increases movement speed." },
};

const UpgradeButton: React.FC<{
  type: UpgradeType;
  level: number;
  onClick: (type: UpgradeType) => void;
}> = ({ type, level, onClick }) => {
  const info = upgradeInfo[type];
  return (
    <button
      onClick={() => onClick(type)}
      className="p-4 md:p-6 bg-gray-800 border-2 border-purple-600 rounded-lg text-left hover:bg-gray-700 hover:border-cyan-400 transition-all w-full max-w-xs md:w-80"
    >
      <h3 className="text-xl md:text-2xl font-bold text-cyan-400">{info.name}</h3>
      <p className="text-sm md:text-base text-gray-400 mt-1">{info.description}</p>
      <p className="text-base md:text-lg font-semibold text-white mt-3 md:mt-4">Current Level: {level}</p>
    </button>
  );
};

const UpgradeScreen: React.FC<UpgradeScreenProps> = ({ onUpgrade, currentUpgrades }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-4 md:p-8 bg-black bg-opacity-70 rounded-lg border-2 border-cyan-700 shadow-2xl shadow-cyan-500/30">
      <h1 className="text-3xl md:text-5xl font-bold text-white tracking-wider mb-2">Verification Ritual</h1>
      <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8">Strengthen your connection to the hive.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <UpgradeButton type={UpgradeType.PROOF_POWER} level={currentUpgrades.proofPower} onClick={onUpgrade} />
        {/* FIX: Corrected typo from DATA_THROUGHPUT to DATA_THROUGPUT to match the enum definition in types.ts. */}
        <UpgradeButton type={UpgradeType.DATA_THROUGPUT} level={currentUpgrades.dataThroughput} onClick={onUpgrade} />
        <UpgradeButton type={UpgradeType.REPLICATION_SPEED} level={currentUpgrades.replicationSpeed} onClick={onUpgrade} />
      </div>
    </div>
  );
};

export default UpgradeScreen;