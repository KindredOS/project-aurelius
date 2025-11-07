import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Play, Zap, Shield, Target, Heart, Coins, RotateCcw } from 'lucide-react';

const AlgebraDefenseGame = () => {
  const [gameState, setGameState] = useState('paused'); // paused, playing, building, gameOver
  const [wave, setWave] = useState(1);
  const [health, setHealth] = useState(20);
  const [money, setMoney] = useState(100);
  const [score, setScore] = useState(0);
  const [enemies, setEnemies] = useState([]);
  const [towers, setTowers] = useState([]);
  const [projectiles, setProjectiles] = useState([]);
  const [selectedTowerType, setSelectedTowerType] = useState(null);
  const [selectedTower, setSelectedTower] = useState(null);
  const [waveProgress, setWaveProgress] = useState(0);
  const gameLoopRef = useRef(null);
  const lastTimeRef = useRef(0);

  // Game constants
  const GRID_SIZE = 40;
  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 600;
  
  const PATH = useMemo(() => [
    {x: 0, y: 300}, {x: 200, y: 300}, {x: 200, y: 150}, {x: 400, y: 150},
    {x: 400, y: 450}, {x: 600, y: 450}, {x: 600, y: 300}, {x: 800, y: 300}
  ], []);

  // Tower types with algebraic formulas
  const towerTypes = useMemo(() => ({
    linear: {
      name: 'Linear Laser',
      cost: 50,
      baseFormula: 'x + 10',
      description: 'Damage = x + 10 (where x = level)',
      color: '#3B82F6',
      range: 100,
      fireRate: 1000,
      upgradeCost: (level) => 25 * level
    },
    quadratic: {
      name: 'Quadratic Cannon',
      cost: 100,
      baseFormula: 'x² + 5',
      description: 'Damage = x² + 5 (explosive growth!)',
      color: '#EF4444',
      range: 120,
      fireRate: 1500,
      upgradeCost: (level) => 50 * level
    },
    exponential: {
      name: 'Expo Beam',
      cost: 150,
      baseFormula: '2^x + 3',
      description: 'Damage = 2^x + 3 (ultimate power!)',
      color: '#10B981',
      range: 80,
      fireRate: 2000,
      upgradeCost: (level) => 75 * level
    },
    factorial: {
      name: 'Factorial Blaster',
      cost: 200,
      baseFormula: 'x! / 2',
      description: 'Damage = x! / 2 (grows incredibly fast!)',
      color: '#8B5CF6',
      range: 90,
      fireRate: 2500,
      upgradeCost: (level) => 100 * level
    }
  }), []);

  // Calculate damage based on tower type and level
  const calculateDamage = (towerType, level) => {
    switch(towerType) {
      case 'linear':
        return level + 10;
      case 'quadratic':
        return level * level + 5;
      case 'exponential':
        return Math.pow(2, level) + 3;
      case 'factorial':
        let factorial = 1;
        for(let i = 1; i <= level; i++) {
          factorial *= i;
        }
        return Math.floor(factorial / 2);
      default:
        return 10;
    }
  };

  // Enemy types that get stronger each wave
  const spawnEnemy = useCallback(() => {
    const enemyTypes = ['basic', 'armored', 'fast', 'boss'];
    const type = enemyTypes[Math.min(Math.floor(wave / 3), 3)];
    
    const baseHealth = 20 + wave * 10;
    const baseSpeed = 1;
    const baseReward = 10 + wave * 2;

    let enemy;
    switch(type) {
      case 'armored':
        enemy = {
          id: Date.now() + Math.random(),
          type: 'armored',
          health: baseHealth * 2,
          maxHealth: baseHealth * 2,
          speed: baseSpeed * 0.7,
          reward: baseReward * 1.5,
          color: '#6B7280',
          x: PATH[0].x,
          y: PATH[0].y,
          pathIndex: 0,
          size: 25
        };
        break;
      case 'fast':
        enemy = {
          id: Date.now() + Math.random(),
          type: 'fast',
          health: baseHealth * 0.5,
          maxHealth: baseHealth * 0.5,
          speed: baseSpeed * 2,
          reward: baseReward * 1.2,
          color: '#F59E0B',
          x: PATH[0].x,
          y: PATH[0].y,
          pathIndex: 0,
          size: 15
        };
        break;
      case 'boss':
        enemy = {
          id: Date.now() + Math.random(),
          type: 'boss',
          health: baseHealth * 5,
          maxHealth: baseHealth * 5,
          speed: baseSpeed * 0.5,
          reward: baseReward * 3,
          color: '#DC2626',
          x: PATH[0].x,
          y: PATH[0].y,
          pathIndex: 0,
          size: 35
        };
        break;
      default:
        enemy = {
          id: Date.now() + Math.random(),
          type: 'basic',
          health: baseHealth,
          maxHealth: baseHealth,
          speed: baseSpeed,
          reward: baseReward,
          color: '#059669',
          x: PATH[0].x,
          y: PATH[0].y,
          pathIndex: 0,
          size: 20
        };
    }
    
    setEnemies(prev => [...prev, enemy]);
  }, [wave, PATH]);

  // Start wave
  const startWave = useCallback(() => {
    setGameState('playing');
    const enemyCount = 5 + wave * 2;
    
    let spawnCount = 0;
    const spawnInterval = setInterval(() => {
      if (spawnCount < enemyCount) {
        spawnEnemy();
        spawnCount++;
        setWaveProgress(spawnCount / enemyCount);
      } else {
        clearInterval(spawnInterval);
      }
    }, 1000);
  }, [wave, spawnEnemy]);

  // Game loop
  const gameLoop = useCallback((currentTime) => {
    if (gameState !== 'playing') return;
    
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    // Move enemies
    setEnemies(prevEnemies => {
      return prevEnemies.map(enemy => {
        const currentPoint = PATH[enemy.pathIndex];
        const nextPoint = PATH[enemy.pathIndex + 1];
        
        if (!nextPoint) {
          // Enemy reached the end
          setHealth(prev => Math.max(0, prev - 1));
          return null;
        }
        
        const dx = nextPoint.x - currentPoint.x;
        const dy = nextPoint.y - currentPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const moveDistance = enemy.speed * deltaTime * 0.1;
        
        if (moveDistance >= distance) {
          return {
            ...enemy,
            x: nextPoint.x,
            y: nextPoint.y,
            pathIndex: enemy.pathIndex + 1
          };
        } else {
          const moveX = (dx / distance) * moveDistance;
          const moveY = (dy / distance) * moveDistance;
          return {
            ...enemy,
            x: enemy.x + moveX,
            y: enemy.y + moveY
          };
        }
      }).filter(Boolean);
    });

    // Tower shooting
    setTowers(prevTowers => {
      return prevTowers.map(tower => {
        if (currentTime - tower.lastShot < towerTypes[tower.type].fireRate) {
          return tower;
        }

        // Find enemies in range
        const enemiesInRange = enemies.filter(enemy => {
          const dx = enemy.x - tower.x;
          const dy = enemy.y - tower.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance <= towerTypes[tower.type].range;
        });

        if (enemiesInRange.length > 0) {
          const target = enemiesInRange[0];
          const damage = calculateDamage(tower.type, tower.level);
          
          // Create projectile
          setProjectiles(prev => [...prev, {
            id: Date.now() + Math.random(),
            x: tower.x,
            y: tower.y,
            targetX: target.x,
            targetY: target.y,
            targetId: target.id,
            damage: damage,
            color: towerTypes[tower.type].color,
            speed: 5
          }]);

          return {
            ...tower,
            lastShot: currentTime
          };
        }
        
        return tower;
      });
    });

    // Move projectiles and handle collisions
    setProjectiles(prevProjectiles => {
      return prevProjectiles.map(projectile => {
        const dx = projectile.targetX - projectile.x;
        const dy = projectile.targetY - projectile.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 10) {
          // Hit target
          setEnemies(prevEnemies => {
            return prevEnemies.map(enemy => {
              if (enemy.id === projectile.targetId) {
                const newHealth = enemy.health - projectile.damage;
                if (newHealth <= 0) {
                  setMoney(prev => prev + enemy.reward);
                  setScore(prev => prev + enemy.reward * 10);
                  return null;
                }
                return { ...enemy, health: newHealth };
              }
              return enemy;
            }).filter(Boolean);
          });
          return null;
        }
        
        const moveX = (dx / distance) * projectile.speed;
        const moveY = (dy / distance) * projectile.speed;
        
        return {
          ...projectile,
          x: projectile.x + moveX,
          y: projectile.y + moveY
        };
      }).filter(Boolean);
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, enemies, PATH, towerTypes]);

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, gameLoop]);

  // Check win condition
  useEffect(() => {
    if (gameState === 'playing' && enemies.length === 0 && waveProgress >= 1) {
      setWave(prev => prev + 1);
      setMoney(prev => prev + 50);
      setGameState('paused');
      setWaveProgress(0);
    }
  }, [enemies.length, gameState, waveProgress]);

  // Check lose condition
  useEffect(() => {
    if (health <= 0) {
      setGameState('gameOver');
    }
  }, [health]);

  // Handle tower placement
  const handleGridClick = (gridX, gridY) => {
    if (gameState !== 'building' || !selectedTowerType) return;

    const x = gridX * GRID_SIZE + GRID_SIZE / 2;
    const y = gridY * GRID_SIZE + GRID_SIZE / 2;

    // Check if position is valid (not on path)
    const onPath = PATH.some(point => 
      Math.abs(point.x - x) < GRID_SIZE && Math.abs(point.y - y) < GRID_SIZE
    );

    if (onPath) return;

    // Check if can afford
    if (money < towerTypes[selectedTowerType].cost) return;

    // Check if spot is empty
    const occupied = towers.some(tower => 
      Math.abs(tower.x - x) < GRID_SIZE && Math.abs(tower.y - y) < GRID_SIZE
    );

    if (occupied) return;

    // Place tower
    const newTower = {
      id: Date.now(),
      type: selectedTowerType,
      x: x,
      y: y,
      level: 1,
      lastShot: 0
    };

    setTowers(prev => [...prev, newTower]);
    setMoney(prev => prev - towerTypes[selectedTowerType].cost);
    setSelectedTowerType(null);
    setGameState('paused');
  };

  // Upgrade tower
  const upgradeTower = (towerId) => {
    setTowers(prev => prev.map(tower => {
      if (tower.id === towerId) {
        const upgradeCost = towerTypes[tower.type].upgradeCost(tower.level);
        if (money >= upgradeCost) {
          setMoney(prev => prev - upgradeCost);
          return { ...tower, level: tower.level + 1 };
        }
      }
      return tower;
    }));
  };

  const resetGame = () => {
    setGameState('paused');
    setWave(1);
    setHealth(20);
    setMoney(100);
    setScore(0);
    setEnemies([]);
    setTowers([]);
    setProjectiles([]);
    setSelectedTowerType(null);
    setSelectedTower(null);
    setWaveProgress(0);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen text-white">
      <div className="bg-slate-800 rounded-xl shadow-2xl p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
            Algebra Defense Force
          </h1>
          <p className="text-slate-300">Build towers with mathematical formulas to defend against enemy waves!</p>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-3 rounded-lg text-center">
            <Heart className="mx-auto mb-1" size={20} />
            <div className="font-bold">{health}</div>
            <div className="text-xs opacity-90">Health</div>
          </div>
          <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 p-3 rounded-lg text-center">
            <Coins className="mx-auto mb-1" size={20} />
            <div className="font-bold">{money}</div>
            <div className="text-xs opacity-90">Gold</div>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-lg text-center">
            <Target className="mx-auto mb-1" size={20} />
            <div className="font-bold">{wave}</div>
            <div className="text-xs opacity-90">Wave</div>
          </div>
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-3 rounded-lg text-center">
            <Zap className="mx-auto mb-1" size={20} />
            <div className="font-bold">{score}</div>
            <div className="text-xs opacity-90">Score</div>
          </div>
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-3 rounded-lg text-center">
            <Shield className="mx-auto mb-1" size={20} />
            <div className="font-bold">{Math.round(waveProgress * 100)}%</div>
            <div className="text-xs opacity-90">Wave</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-3">
            <div 
              className="relative bg-slate-700 rounded-lg overflow-hidden border-2 border-slate-600"
              style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
            >
              {/* Grid */}
              <svg className="absolute inset-0 pointer-events-none">
                <defs>
                  <pattern id="grid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
                    <path d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`} fill="none" stroke="#475569" strokeWidth="1" opacity="0.3"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              {/* Path */}
              <svg className="absolute inset-0 pointer-events-none">
                <path
                  d={`M ${PATH.map(p => `${p.x},${p.y}`).join(' L ')}`}
                  stroke="#64748B"
                  strokeWidth="30"
                  fill="none"
                  opacity="0.5"
                />
              </svg>

              {/* Towers */}
              {towers.map(tower => (
                <div key={tower.id}>
                  {/* Tower */}
                  <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    style={{
                      left: tower.x,
                      top: tower.y,
                      width: 30,
                      height: 30,
                      backgroundColor: towerTypes[tower.type].color,
                      borderRadius: '50%',
                      border: selectedTower?.id === tower.id ? '3px solid #FFF' : '2px solid #000'
                    }}
                    onClick={() => setSelectedTower(tower)}
                  >
                    <div className="text-xs text-center text-white font-bold mt-1">
                      {tower.level}
                    </div>
                  </div>
                  
                  {/* Range indicator */}
                  {selectedTower?.id === tower.id && (
                    <div
                      className="absolute border-2 border-white opacity-30 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                      style={{
                        left: tower.x,
                        top: tower.y,
                        width: towerTypes[tower.type].range * 2,
                        height: towerTypes[tower.type].range * 2
                      }}
                    />
                  )}
                </div>
              ))}

              {/* Enemies */}
              {enemies.map(enemy => (
                <div key={enemy.id}>
                  <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      left: enemy.x,
                      top: enemy.y,
                      width: enemy.size,
                      height: enemy.size,
                      backgroundColor: enemy.color
                    }}
                  />
                  {/* Health bar */}
                  <div
                    className="absolute transform -translate-x-1/2"
                    style={{
                      left: enemy.x,
                      top: enemy.y - enemy.size/2 - 8,
                      width: enemy.size,
                      height: 4
                    }}
                  >
                    <div className="w-full bg-red-600 rounded">
                      <div
                        className="bg-green-500 h-full rounded"
                        style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Projectiles */}
              {projectiles.map(projectile => (
                <div
                  key={projectile.id}
                  className="absolute w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: projectile.x,
                    top: projectile.y,
                    backgroundColor: projectile.color
                  }}
                />
              ))}

              {/* Click handler for tower placement */}
              <div
                className="absolute inset-0"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const gridX = Math.floor(x / GRID_SIZE);
                  const gridY = Math.floor(y / GRID_SIZE);
                  handleGridClick(gridX, gridY);
                }}
              />
            </div>

            {/* Game Controls */}
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={startWave}
                disabled={gameState === 'playing' || gameState === 'gameOver'}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <Play size={20} />
                Start Wave {wave}
              </button>
              <button
                onClick={() => setGameState(gameState === 'building' ? 'paused' : 'building')}
                disabled={gameState === 'playing' || gameState === 'gameOver'}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <Shield size={20} />
                {gameState === 'building' ? 'Cancel' : 'Build Mode'}
              </button>
              <button
                onClick={resetGame}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <RotateCcw size={20} />
                Reset
              </button>
            </div>
          </div>

          {/* Tower Shop & Info */}
          <div className="space-y-4">
            {/* Tower Shop */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-bold mb-4">Tower Shop</h3>
              {Object.entries(towerTypes).map(([key, tower]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedTowerType(key);
                    setGameState('building');
                  }}
                  disabled={money < tower.cost}
                  className={`w-full p-3 mb-2 rounded-lg text-left border-2 transition-all ${
                    selectedTowerType === key 
                      ? 'border-white bg-slate-600' 
                      : 'border-slate-600 hover:border-slate-500'
                  } ${money < tower.cost ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold" style={{ color: tower.color }}>
                        {tower.name}
                      </div>
                      <div className="text-xs text-slate-300 mb-1">
                        {tower.description}
                      </div>
                      <div className="text-sm font-mono text-cyan-300">
                        {tower.baseFormula}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-400 font-bold">{tower.cost}g</div>
                      <div className="text-xs text-slate-400">Range: {tower.range}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Tower Info */}
            {selectedTower && (
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-bold mb-2">Tower Details</h3>
                <div className="space-y-2">
                  <div className="font-semibold" style={{ color: towerTypes[selectedTower.type].color }}>
                    {towerTypes[selectedTower.type].name}
                  </div>
                  <div className="text-sm">
                    <div>Level: {selectedTower.level}</div>
                    <div>Damage: {calculateDamage(selectedTower.type, selectedTower.level)}</div>
                    <div className="font-mono text-cyan-300">
                      Formula: {towerTypes[selectedTower.type].baseFormula.replace('x', selectedTower.level)}
                    </div>
                  </div>
                  <button
                    onClick={() => upgradeTower(selectedTower.id)}
                    disabled={money < towerTypes[selectedTower.type].upgradeCost(selectedTower.level)}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold mt-2 transition-colors"
                  >
                    Upgrade ({towerTypes[selectedTower.type].upgradeCost(selectedTower.level)}g)
                  </button>
                </div>
              </div>
            )}

            {/* Game Over Screen */}
            {gameState === 'gameOver' && (
              <div className="bg-red-900 border-2 border-red-600 rounded-lg p-4 text-center">
                <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
                <p className="mb-4">Final Score: {score}</p>
                <button
                  onClick={resetGame}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Play Again
                </button>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-bold mb-2">📚 How to Play</h3>
              <div className="text-sm space-y-2 text-slate-300">
                <p>• Buy towers with different algebraic formulas</p>
                <p>• Place them off the path to defend</p>
                <p>• Upgrade towers to increase their level (x)</p>
                <p>• Higher levels = more damage via math!</p>
                <p>• Survive waves to unlock stronger enemies</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlgebraDefenseGame;