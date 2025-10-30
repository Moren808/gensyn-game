

export interface Vector2D {
  x: number;
  y: number;
}

export interface GameObject {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  radius: number;
}

export enum FiringMode {
  NORMAL,
  SPREAD,
  BEAM,
}

export interface Player extends GameObject {
  angle: number;
  health: number;
  maxHealth: number;
  proofMeter: number;
  maxProofMeter: number;
  firingMode: FiringMode;
  powerUpTimer: number;
}

export enum EnemyType {
  BEE = 'BEE',
}

export interface Enemy extends GameObject {
  type: EnemyType;
  health: number;
  maxHealth: number;
}

export interface Bullet extends GameObject {
  damage: number;
  trail: Vector2D[];
}

export enum PickupType {
  VERIFIED_ORB = 'VERIFIED_ORB',
  POWER_UP_SHARD = 'POWER_UP_SHARD',
}

export interface Pickup extends GameObject {
  type: PickupType;
}

export enum GameState {
  START_SCREEN,
  PLAYING,
  UPGRADE,
  GAME_OVER,
}

export interface Core {
  position: Vector2D;
  radius: number;
  health: number;
  maxHealth: number;
}

export interface Upgrade {
  proofPower: number; // bullet damage
  dataThroughput: number; // fire rate
  replicationSpeed: number; // move speed
}

export enum UpgradeType {
  PROOF_POWER = 'proofPower',
  DATA_THROUGPUT = 'dataThroughput',
  REPLICATION_SPEED = 'replicationSpeed'
}