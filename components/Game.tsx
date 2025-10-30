
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Player, Enemy, Bullet, Pickup, Core, Upgrade, EnemyType, PickupType, Vector2D, FiringMode } from '../types';
import * as C from '../constants';
import HUD from './HUD';
import VirtualJoystick from './VirtualJoystick';

const HexagonBackground: React.FC = () => (
  <div className="absolute inset-0 z-0 bg-gray-900 opacity-30" style={{
    backgroundImage: `
      linear-gradient(rgba(100, 116, 139, 0.1) 1px, transparent 1px),
      linear-gradient(60deg, rgba(100, 116, 139, 0.1) 1px, transparent 1px),
      linear-gradient(120deg, rgba(100, 116, 139, 0.1) 1px, transparent 1px)
    `,
    backgroundSize: '30px 52px',
    backgroundPosition: '0 0, 0 0, 0 0',
  }}></div>
);

interface GameProps {
  onGameOver: (score: number, wave: number) => void;
  onEnterUpgradeScreen: (score: number, wave: number) => void;
  upgrades: Upgrade;
  initialWave: number;
}

const Game: React.FC<GameProps> = ({ onGameOver, onEnterUpgradeScreen, upgrades, initialWave }) => {
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number>();
  const scaleRef = useRef<number>(1);
  const lastLoopTimeRef = useRef(Date.now());

  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const moveVectorRef = useRef<Vector2D>({ x: 0, y: 0 });
  const aimVectorRef = useRef<Vector2D>({ x: 0, y: 0 });

  const playerRef = useRef<Player>({
    id: 'player',
    position: { x: C.GAME_WIDTH / 2, y: C.GAME_HEIGHT / 2 },
    velocity: { x: 0, y: 0 },
    radius: C.PLAYER_RADIUS,
    angle: 0,
    health: C.PLAYER_MAX_HEALTH,
    maxHealth: C.PLAYER_MAX_HEALTH,
    proofMeter: 0,
    maxProofMeter: C.PLAYER_MAX_PROOF_METER,
    firingMode: FiringMode.NORMAL,
    powerUpTimer: 0,
  });
  
  const coreRef = useRef<Core>({
    position: { x: C.GAME_WIDTH / 2, y: C.GAME_HEIGHT / 2 },
    radius: C.CORE_RADIUS,
    health: C.CORE_MAX_HEALTH,
    maxHealth: C.CORE_MAX_HEALTH,
  });

  const enemiesRef = useRef<Enemy[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const pickupsRef = useRef<Pickup[]>([]);
  const keysPressedRef = useRef<Set<string>>(new Set());
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const lastShotTimeRef = useRef(0);

  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(initialWave);
  const [waveStatus, setWaveStatus] = useState<'waiting' | 'spawning' | 'active'>('waiting');
  const [waveMessage, setWaveMessage] = useState('');
  const [_, setTick] = useState(0);

  const playerSpeed = C.BASE_PLAYER_SPEED + upgrades.replicationSpeed * C.UPGRADE_EFFECTS.replicationSpeed.speed;
  const fireRate = C.BASE_FIRE_RATE - upgrades.dataThroughput * C.UPGRADE_EFFECTS.dataThroughput.fireRateReduction;
  const bulletDamage = C.BASE_BULLET_DAMAGE + upgrades.proofPower * C.UPGRADE_EFFECTS.proofPower.damage;

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    const gameArea = gameAreaRef.current;
    if (!gameArea) return;

    const handleResize = () => {
      const parent = gameArea.parentElement;
      if (!parent) return;
      const { clientWidth, clientHeight } = parent;
      const scaleX = clientWidth / C.GAME_WIDTH;
      const scaleY = clientHeight / C.GAME_HEIGHT;
      const scale = Math.min(scaleX, scaleY);
      
      scaleRef.current = scale;
      gameArea.style.transform = `scale(${scale})`;
      gameArea.style.transformOrigin = 'center center';
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (gameArea.parentElement) {
        resizeObserver.observe(gameArea.parentElement);
    }
    handleResize();

    return () => {
        if (gameArea.parentElement) {
            resizeObserver.unobserve(gameArea.parentElement);
        }
    };
  }, []);

  const startNextWave = useCallback(() => {
    setWave(prev => prev + 1);
    setWaveStatus('spawning');
    setWaveMessage(`Wave ${wave + 1}`);
    setTimeout(() => setWaveMessage(''), 2000);
  }, [wave]);

  useEffect(() => {
    setTimeout(startNextWave, C.WAVE_START_DELAY);
  }, [startNextWave]);

  const gameLoop = useCallback(() => {
    if (!gameAreaRef.current) return;
    
    const now = Date.now();
    const deltaTime = now - lastLoopTimeRef.current;
    lastLoopTimeRef.current = now;

    if (playerRef.current.powerUpTimer > 0) {
        playerRef.current.powerUpTimer -= deltaTime;
        if (playerRef.current.powerUpTimer <= 0) {
            playerRef.current.powerUpTimer = 0;
            playerRef.current.firingMode = FiringMode.NORMAL;
        }
    }
    
    let vx = 0, vy = 0;
    if (moveVectorRef.current.x !== 0 || moveVectorRef.current.y !== 0) {
        vx = moveVectorRef.current.x * playerSpeed;
        vy = moveVectorRef.current.y * playerSpeed;
    } else {
        if (keysPressedRef.current.has('w')) vy -= 1;
        if (keysPressedRef.current.has('s')) vy += 1;
        if (keysPressedRef.current.has('a')) vx -= 1;
        if (keysPressedRef.current.has('d')) vx += 1;
        
        const mag = Math.sqrt(vx * vx + vy * vy);
        if (mag > 0) {
          vx = (vx / mag) * playerSpeed;
          vy = (vy / mag) * playerSpeed;
        }
    }
    playerRef.current.velocity = { x: vx, y: vy };
    
    playerRef.current.position.x += playerRef.current.velocity.x;
    playerRef.current.position.y += playerRef.current.velocity.y;
    playerRef.current.position.x = Math.max(C.PLAYER_RADIUS, Math.min(C.GAME_WIDTH - C.PLAYER_RADIUS, playerRef.current.position.x));
    playerRef.current.position.y = Math.max(C.PLAYER_RADIUS, Math.min(C.GAME_HEIGHT - C.PLAYER_RADIUS, playerRef.current.position.y));

    let aimAngleRad: number;
    let isAiming = false;
    if (aimVectorRef.current.x !== 0 || aimVectorRef.current.y !== 0) {
      aimAngleRad = Math.atan2(aimVectorRef.current.y, aimVectorRef.current.x);
      isAiming = true;
    } else {
      const dx = mousePositionRef.current.x - playerRef.current.position.x;
      const dy = mousePositionRef.current.y - playerRef.current.position.y;
      aimAngleRad = Math.atan2(dy, dx);
      isAiming = keysPressedRef.current.has('mousedown');
    }
    playerRef.current.angle = aimAngleRad * (180 / Math.PI);

    if (isAiming) {
        const currentFireRate = playerRef.current.firingMode === FiringMode.BEAM 
            ? fireRate * C.BEAM_FIRE_RATE_MULTIPLIER 
            : fireRate;

        if (now - lastShotTimeRef.current > currentFireRate) {
            lastShotTimeRef.current = now;
            
            const currentBulletDamage = playerRef.current.firingMode === FiringMode.BEAM
                ? bulletDamage * C.BEAM_DAMAGE_MULTIPLIER
                : bulletDamage;

            switch (playerRef.current.firingMode) {
                case FiringMode.SPREAD: {
                    const angleDiff = C.SPREAD_SHOT_ANGLE * (Math.PI / 180);
                    for (let i = 0; i < C.SPREAD_SHOT_BULLETS; i++) {
                        const offset = (i - Math.floor(C.SPREAD_SHOT_BULLETS / 2)) * angleDiff;
                        const newAngle = aimAngleRad + offset;
                        bulletsRef.current.push({
                            id: `bullet-${now}-${i}`,
                            position: { ...playerRef.current.position },
                            velocity: { x: Math.cos(newAngle) * C.BULLET_SPEED, y: Math.sin(newAngle) * C.BULLET_SPEED },
                            radius: C.BULLET_RADIUS,
                            damage: currentBulletDamage,
                            trail: [],
                        });
                    }
                    break;
                }
                case FiringMode.BEAM:
                case FiringMode.NORMAL:
                default: {
                    bulletsRef.current.push({
                        id: `bullet-${now}`,
                        position: { ...playerRef.current.position },
                        velocity: { x: Math.cos(aimAngleRad) * C.BULLET_SPEED, y: Math.sin(aimAngleRad) * C.BULLET_SPEED },
                        radius: playerRef.current.firingMode === FiringMode.BEAM ? C.BULLET_RADIUS * 0.8 : C.BULLET_RADIUS,
                        damage: currentBulletDamage,
                        trail: [],
                    });
                    break;
                }
            }
        }
    }

    bulletsRef.current = bulletsRef.current.filter(b => {
      b.trail.unshift({ ...b.position });
      if (b.trail.length > C.BULLET_TRAIL_LENGTH) b.trail.pop();
      b.position.x += b.velocity.x;
      b.position.y += b.velocity.y;
      return b.position.x > 0 && b.position.x < C.GAME_WIDTH && b.position.y > 0 && b.position.y < C.GAME_HEIGHT;
    });

    enemiesRef.current.forEach(e => {
        const target = (Math.random() > 0.3) ? playerRef.current.position : coreRef.current.position;
        const e_dx = target.x - e.position.x;
        const e_dy = target.y - e.position.y;
        const e_mag = Math.sqrt(e_dx * e_dx + e_dy * e_dy);
        const stats = C.ENEMY_STATS[e.type];
        const speed = stats.baseSpeed + ((wave - 1) * stats.speedGrowth);
        if (e_mag > 0) {
            e.velocity.x = (e_dx / e_mag) * speed;
            e.velocity.y = (e_dy / e_mag) * speed;
        }
        e.position.x += e.velocity.x;
        e.position.y += e.velocity.y;
    });

    const checkCollision = (o1: {position: {x:number, y:number}, radius:number}, o2: {position: {x:number, y:number}, radius:number}) => {
      const dist = Math.hypot(o1.position.x - o2.position.x, o1.position.y - o2.position.y);
      return dist < o1.radius + o2.radius;
    };

    for (let i = bulletsRef.current.length - 1; i >= 0; i--) {
      for (let j = enemiesRef.current.length - 1; j >= 0; j--) {
        const bullet = bulletsRef.current[i];
        const enemy = enemiesRef.current[j];
        if (bullet && enemy && checkCollision(bullet, enemy)) {
          enemy.health -= bullet.damage;
          bulletsRef.current.splice(i, 1);
          if (enemy.health <= 0) {
            setScore(s => s + C.ENEMY_STATS[enemy.type].score);
            if (Math.random() < C.PICKUP_CHANCE) {
                const type = Math.random() < 0.7 ? PickupType.VERIFIED_ORB : PickupType.POWER_UP_SHARD;
                pickupsRef.current.push({
                    id: `pickup-${Date.now()}`,
                    position: { ...enemy.position },
                    velocity: { x: 0, y: 0 },
                    radius: C.PICKUP_RADIUS,
                    type,
                });
            }
            enemiesRef.current.splice(j, 1);
          }
          break;
        }
      }
    }

    for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
        const enemy = enemiesRef.current[i];
        if (checkCollision(playerRef.current, enemy)) {
            playerRef.current.health -= 10;
            enemiesRef.current.splice(i, 1);
        }
    }
    
    for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
        const enemy = enemiesRef.current[i];
        if (checkCollision(coreRef.current, enemy)) {
            coreRef.current.health -= 20;
            enemiesRef.current.splice(i, 1);
        }
    }
    
    for (let i = pickupsRef.current.length - 1; i >= 0; i--) {
      const pickup = pickupsRef.current[i];
      if (checkCollision(playerRef.current, pickup)) {
        if (pickup.type === PickupType.VERIFIED_ORB) {
            const stats = C.PICKUP_STATS[pickup.type];
            playerRef.current.health = Math.min(playerRef.current.maxHealth, playerRef.current.health + stats.effect.health);
            playerRef.current.proofMeter = Math.min(playerRef.current.maxProofMeter, playerRef.current.proofMeter + stats.effect.proof);
        } else if (pickup.type === PickupType.POWER_UP_SHARD) {
            playerRef.current.powerUpTimer = C.POWER_UP_DURATION;
            playerRef.current.firingMode = Math.random() < 0.5 ? FiringMode.SPREAD : FiringMode.BEAM;
        }
        pickupsRef.current.splice(i, 1);
      }
    }
     
    if (waveStatus === 'spawning') {
        if (Math.random() < (wave * 0.01)) {
            const spawnCount = C.WAVE_BASE_ENEMIES + wave * C.WAVE_INCREMENT;
            if (enemiesRef.current.length < spawnCount) {
                let x, y;
                if (Math.random() > 0.5) {
                    x = Math.random() < 0.5 ? -C.ENEMY_SPAWN_PADDING : C.GAME_WIDTH + C.ENEMY_SPAWN_PADDING;
                    y = Math.random() * C.GAME_HEIGHT;
                } else {
                    x = Math.random() * C.GAME_WIDTH;
                    y = Math.random() < 0.5 ? -C.ENEMY_SPAWN_PADDING : C.GAME_HEIGHT + C.ENEMY_SPAWN_PADDING;
                }
                const type = EnemyType.BEE;
                const stats = C.ENEMY_STATS[type];
                enemiesRef.current.push({
                    id: `enemy-${Date.now()}-${Math.random()}`,
                    position: { x, y },
                    velocity: { x: 0, y: 0 },
                    radius: stats.radius,
                    health: stats.health,
                    maxHealth: stats.health,
                    type: type
                });
            } else {
                setWaveStatus('active');
            }
        }
    } else if (waveStatus === 'active' && enemiesRef.current.length === 0) {
        if (wave > 0 && wave % 3 === 0) {
          onEnterUpgradeScreen(score, wave);
        } else {
          setWaveStatus('waiting');
          setTimeout(startNextWave, C.WAVE_START_DELAY);
        }
    }

    if (playerRef.current.health <= 0 || coreRef.current.health <= 0) {
      onGameOver(score, wave);
      return;
    }

    setTick(t => t + 1);
    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [score, wave, waveStatus, onGameOver, startNextWave, onEnterUpgradeScreen, playerSpeed, fireRate, bulletDamage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keysPressedRef.current.add(e.key.toLowerCase());
    const handleKeyUp = (e: KeyboardEvent) => keysPressedRef.current.delete(e.key.toLowerCase());
    const handleMouseDown = () => keysPressedRef.current.add('mousedown');
    const handleMouseUp = () => keysPressedRef.current.delete('mousedown');
    
    const handleMouseMove = (e: MouseEvent) => {
      if(gameAreaRef.current) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        const scale = scaleRef.current;
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;
        mousePositionRef.current = { x, y };
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    lastLoopTimeRef.current = Date.now();
    animationFrameId.current = requestAnimationFrame(gameLoop);
    
    return () => {
      cancelAnimationFrame(animationFrameId.current!);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [gameLoop]);
  
  const getPlayerFilter = () => {
    if (playerRef.current.powerUpTimer > 0) {
        switch (playerRef.current.firingMode) {
            case FiringMode.SPREAD:
                return 'drop-shadow(0 0 8px #f472b6)'; // pink
            case FiringMode.BEAM:
                return 'drop-shadow(0 0 8px #f59e0b)'; // amber
        }
    }
    return 'drop-shadow(0 0 5px #0ff)'; // default cyan
  }

  return (
    <>
      <div
        ref={gameAreaRef}
        className="relative cursor-crosshair overflow-hidden shadow-2xl shadow-cyan-500/20 border-2 border-purple-800"
        style={{
          width: C.GAME_WIDTH,
          height: C.GAME_HEIGHT,
          backgroundColor: 'rgba(17, 24, 39, 0.85)',
        }}
      >
        <HexagonBackground />
        <HUD
          score={score}
          wave={wave}
          playerHealth={playerRef.current.health}
          playerMaxHealth={playerRef.current.maxHealth}
          coreHealth={coreRef.current.health}
          coreMaxHealth={coreRef.current.maxHealth}
          proofMeter={playerRef.current.proofMeter}
          maxProofMeter={playerRef.current.maxProofMeter}
          powerUpTimer={playerRef.current.powerUpTimer}
        />

        {waveMessage && (
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-5xl font-bold text-white tracking-widest animate-ping-once">
            {waveMessage}
          </div>
        )}

        {/* Core */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            width: coreRef.current.radius * 2,
            height: coreRef.current.radius * 2,
            left: coreRef.current.position.x - coreRef.current.radius,
            top: coreRef.current.position.y - coreRef.current.radius,
          }}
        >
          <div className="absolute w-full h-full rounded-full border-2 border-t-cyan-400 border-l-cyan-400 border-transparent animate-spin-slow"></div>
          <div className="absolute w-3/4 h-3/4 bg-purple-600 rounded-full opacity-70 animate-pulse"></div>
          <div className="absolute w-1/3 h-1/3 bg-cyan-300 rounded-full shadow-2xl shadow-cyan-400/80"></div>
        </div>


        {/* Player */}
        <div className="absolute flex items-center justify-center"
          style={{
            width: playerRef.current.radius * 2,
            height: playerRef.current.radius * 2,
            left: playerRef.current.position.x - playerRef.current.radius,
            top: playerRef.current.position.y - playerRef.current.radius,
            transform: `rotate(${playerRef.current.angle + 90}deg)`,
            fontSize: `${playerRef.current.radius * 1.8}px`,
            filter: getPlayerFilter(),
            userSelect: 'none',
          }}
        >
          <span>🐜</span>
        </div>
        
        {/* Enemies */}
        {enemiesRef.current.map(e => {
          const angle = Math.atan2(e.velocity.y, e.velocity.x) * (180 / Math.PI);
          const stats = C.ENEMY_STATS[e.type];
          return (
            <div key={e.id} className="absolute flex items-center justify-center"
              style={{
                width: e.radius * 2,
                height: e.radius * 2,
                left: e.position.x - e.radius,
                top: e.position.y - e.radius,
                transform: `rotate(${angle + 90}deg)`,
                fontSize: `${e.radius * 1.5}px`,
                filter: 'drop-shadow(0 0 3px #000)',
                userSelect: 'none',
              }}
            >
              <span>{stats.emoji}</span>
            </div>
          );
        })}
        
        {/* Bullets */}
        {bulletsRef.current.map(b => (
          <React.Fragment key={b.id}>
            <div className={`absolute rounded-full ${C.BULLET_COLOR} shadow-md shadow-blue-300/80`}
              style={{
                width: b.radius * 2,
                height: b.radius * 2,
                left: b.position.x - b.radius,
                top: b.position.y - b.radius,
              }}
            ></div>
            {b.trail.map((p, i) => (
              <div
                key={`${b.id}-trail-${i}`}
                className={`absolute rounded-full ${C.BULLET_COLOR}`}
                style={{
                  width: b.radius * (2 - i * 0.4),
                  height: b.radius * (2 - i * 0.4),
                  left: p.x - b.radius * (1 - i * 0.2),
                  top: p.y - b.radius * (1 - i * 0.2),
                  opacity: 0.5 - i * 0.1,
                }}
              />
            ))}
          </React.Fragment>
        ))}
        
        {/* Pickups */}
        {pickupsRef.current.map(p => (
          <div key={p.id} className={`absolute rounded-full ${C.PICKUP_STATS[p.type].color} animate-pulse`}
            style={{
              width: p.radius * 2,
              height: p.radius * 2,
              left: p.position.x - p.radius,
              top: p.position.y - p.radius,
            }}
          ></div>
        ))}
      </div>
      {isTouchDevice && (
        <div className="fixed bottom-0 left-0 right-0 w-full h-36 md:h-48 flex justify-between items-center p-2 md:p-4 z-20 pointer-events-none">
          <div className="pointer-events-auto">
            <VirtualJoystick
              size={100} 
              onMove={(v) => { moveVectorRef.current = v; }}
              onEnd={() => { moveVectorRef.current = { x: 0, y: 0 }; }}
            />
          </div>
          <div className="pointer-events-auto">
            <VirtualJoystick
              size={100}
              onMove={(v) => { aimVectorRef.current = v; }}
              onEnd={() => { aimVectorRef.current = { x: 0, y: 0 }; }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Game;