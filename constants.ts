

import { Upgrade } from './types';

export const GAME_WIDTH = 1000;
export const GAME_HEIGHT = 800;

// Player
export const PLAYER_RADIUS = 20;
export const PLAYER_MAX_HEALTH = 100;
export const PLAYER_MAX_PROOF_METER = 100;

// Upgrades
export const BASE_PLAYER_SPEED = 3;
export const BASE_FIRE_RATE = 250; // ms
export const BASE_BULLET_DAMAGE = 20;
export const INITIAL_UPGRADES: Upgrade = {
  proofPower: 0,
  dataThroughput: 0,
  replicationSpeed: 0,
};
export const UPGRADE_EFFECTS = {
  proofPower: { damage: 5 },
  dataThroughput: { fireRateReduction: 25 }, // less is faster
  replicationSpeed: { speed: 0.5 },
};


// Core
export const CORE_RADIUS = 40;
export const CORE_MAX_HEALTH = 200;

// Bullet
export const BULLET_RADIUS = 5;
export const BULLET_SPEED = 8;
export const BULLET_TRAIL_LENGTH = 5;

// Enemies
export const ENEMY_SPAWN_PADDING = 100;
export const ENEMY_STATS = {
  BEE: { radius: 15, health: 20, baseSpeed: 1.0, speedGrowth: 0.05, color: 'bg-yellow-400', score: 10, emoji: '🐝' },
};

// Pickups
export const PICKUP_RADIUS = 8;
export const PICKUP_CHANCE = 0.2;
export const PICKUP_STATS = {
  VERIFIED_ORB: { color: 'bg-green-500', effect: { health: 5, proof: 10 } },
  POWER_UP_SHARD: { color: 'bg-pink-500', effect: { text: 'Temp Powerup' } },
};

// Power-ups
export const POWER_UP_DURATION = 10000; // 10 seconds in ms
export const SPREAD_SHOT_BULLETS = 3;
export const SPREAD_SHOT_ANGLE = 15; // degrees offset for side bullets
export const BEAM_FIRE_RATE_MULTIPLIER = 0.25; // 4x faster fire rate
export const BEAM_DAMAGE_MULTIPLIER = 0.5; // half damage per shot, but fires faster


// Waves
export const WAVE_START_DELAY = 3000; // 3s
export const WAVE_BASE_ENEMIES = 5;
export const WAVE_INCREMENT = 2;
export const WAVE_SPAWN_INTERVAL = 500; // ms

// Colors
export const PLAYER_COLOR = 'bg-cyan-400';
export const CORE_COLOR = 'bg-purple-600';
export const BULLET_COLOR = 'bg-blue-300';