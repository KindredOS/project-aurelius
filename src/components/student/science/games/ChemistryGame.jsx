import React, { useState } from 'react';
import styles from './ChemistryGame.module.css';

const ChemistryGame = () => {
  const [gameState, setGameState] = useState({
    score: 0,
    discoveries: 0,
    experiments: 0,
    selectedElements: [],
    discoveredCompounds: new Set()
  });

  const [isReacting, setIsReacting] = useState(false);
  const [results, setResults] = useState([]);

  // Elements data
  const elements = [
    { symbol: 'H', name: 'Hydrogen', color: '#ff6b6b' },
    { symbol: 'O', name: 'Oxygen', color: '#4ecdc4' },
    { symbol: 'C', name: 'Carbon', color: '#45b7d1' },
    { symbol: 'N', name: 'Nitrogen', color: '#96ceb4' },
    { symbol: 'Na', name: 'Sodium', color: '#feca57' },
    { symbol: 'Cl', name: 'Chlorine', color: '#ff9ff3' },
    { symbol: 'Ca', name: 'Calcium', color: '#54a0ff' },
    { symbol: 'Fe', name: 'Iron', color: '#5f27cd' },
    { symbol: 'S', name: 'Sulfur', color: '#00d2d3' },
    { symbol: 'Mg', name: 'Magnesium', color: '#ff6348' }
  ];

  // Chemical reactions database
  const reactions = {
    'H,H,O': { name: 'Water', formula: 'H₂O', description: 'The essential molecule of life!', points: 10 },
    'Na,Cl': { name: 'Salt', formula: 'NaCl', description: 'Common table salt - essential for life!', points: 8 },
    'C,O,O': { name: 'Carbon Dioxide', formula: 'CO₂', description: 'The gas we breathe out!', points: 12 },
    'Ca,C,O,O,O': { name: 'Calcium Carbonate', formula: 'CaCO₃', description: 'Found in seashells and limestone!', points: 15 },
    'H,Cl': { name: 'Hydrochloric Acid', formula: 'HCl', description: 'A strong acid found in your stomach!', points: 10 },
    'H,H,S': { name: 'Hydrogen Sulfide', formula: 'H₂S', description: 'Smells like rotten eggs!', points: 9 },
    'Fe,O,O,O': { name: 'Iron Oxide', formula: 'Fe₂O₃', description: 'Rust! Iron exposed to oxygen and water.', points: 13 },
    'Mg,O': { name: 'Magnesium Oxide', formula: 'MgO', description: 'Burns with brilliant white light!', points: 11 },
    'H,N,N,N': { name: 'Ammonia', formula: 'NH₃', description: 'Strong-smelling gas used in cleaning products!', points: 14 },
    'C,H,H,H,H': { name: 'Methane', formula: 'CH₄', description: 'Natural gas - a clean burning fuel!', points: 16 }
  };

  const selectElement = (element) => {
    if (gameState.selectedElements.length < 5 && !isReacting) {
      setGameState(prev => ({
        ...prev,
        selectedElements: [...prev.selectedElements, element]
      }));
    }
  };

  const mixElements = () => {
    if (gameState.selectedElements.length < 2 || isReacting) return;

    const symbols = gameState.selectedElements.map(el => el.symbol).sort();
    const key = symbols.join(',');
    
    setIsReacting(true);
    
    setGameState(prev => ({
      ...prev,
      experiments: prev.experiments + 1
    }));

    setTimeout(() => {
      let newResult;
      let newGameState = { ...gameState, experiments: gameState.experiments + 1 };

      if (reactions[key]) {
        const reaction = reactions[key];
        const isNew = !gameState.discoveredCompounds.has(key);
        
        if (isNew) {
          newGameState.discoveredCompounds = new Set([...gameState.discoveredCompounds, key]);
          newGameState.discoveries = gameState.discoveries + 1;
          newGameState.score = gameState.score + reaction.points;
          
          newResult = {
            id: Date.now(),
            type: 'discovery',
            title: `🎉 New Discovery! ${reaction.name}`,
            formula: reaction.formula,
            description: reaction.description,
            points: reaction.points
          };
        } else {
          const halfPoints = Math.floor(reaction.points / 2);
          newGameState.score = gameState.score + halfPoints;
          
          newResult = {
            id: Date.now(),
            type: 'known',
            title: `✅ Known Compound ${reaction.name}`,
            formula: reaction.formula,
            description: reaction.description,
            points: halfPoints
          };
        }
      } else {
        newGameState.score = gameState.score + 1;
        
        newResult = {
          id: Date.now(),
          type: 'failed',
          title: '❌ No Reaction',
          description: "These elements don't form a stable compound. Try a different combination!",
          points: 1
        };
      }

      setResults(prev => [newResult, ...prev.slice(0, 4)]);
      setGameState({ ...newGameState, selectedElements: [] });
      setIsReacting(false);
    }, 2000);
  };

  const clearSelection = () => {
    if (!isReacting) {
      setGameState(prev => ({
        ...prev,
        selectedElements: []
      }));
    }
  };

  const getBeakerStyle = () => {
    if (isReacting && gameState.selectedElements.length > 0) {
      const colors = gameState.selectedElements.map(el => el.color);
      return {
        background: `linear-gradient(45deg, ${colors.join(', ')})`,
        height: '60%'
      };
    }
    return { height: '0%' };
  };

  return (
    <div className={styles.gameContainer}>
      <div className={styles.header}>
        <h1>🧪 Chemistry Lab Adventure</h1>
        <p>Mix elements to create compounds and discover amazing reactions!</p>
      </div>

      <div className={styles.gameStats}>
        <div className={styles.statCard}>
          <h3>{gameState.score}</h3>
          <p>Score</p>
        </div>
        <div className={styles.statCard}>
          <h3>{gameState.discoveries}</h3>
          <p>Discoveries</p>
        </div>
        <div className={styles.statCard}>
          <h3>{gameState.experiments}</h3>
          <p>Experiments</p>
        </div>
      </div>

      <div className={styles.gameArea}>
        <div className={styles.elementsPanel}>
          <h3>🔬 Available Elements</h3>
          <div className={styles.elementGrid}>
            {elements.map((element, index) => (
              <button
                key={index}
                className={styles.element}
                style={{
                  background: `linear-gradient(135deg, ${element.color}88, ${element.color}cc)`
                }}
                onClick={() => selectElement(element)}
                disabled={isReacting}
              >
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                  {element.symbol}
                </div>
                <div style={{ fontSize: '10px' }}>
                  {element.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.mixingChamber}>
          <div className={styles.beaker}>
            <div 
              className={`${styles.beakerLiquid} ${isReacting ? styles.bubbling : ''}`}
              style={getBeakerStyle()}
            >
              {isReacting && '🧪 Mixing...'}
            </div>
          </div>
          
          <div className={styles.selectedElements}>
            {gameState.selectedElements.length === 0 ? (
              <p style={{ color: '#999' }}>Select elements to mix...</p>
            ) : (
              gameState.selectedElements.map((el, index) => (
                <div key={index} className={styles.selectedElement}>
                  {el.symbol}
                </div>
              ))
            )}
          </div>
          
          <button 
            className={styles.mixBtn} 
            onClick={mixElements}
            disabled={gameState.selectedElements.length < 2 || isReacting}
          >
            {isReacting ? 'Mixing...' : 'Mix Elements!'}
          </button>
          <button 
            className={styles.clearBtn} 
            onClick={clearSelection}
            disabled={isReacting}
          >
            Clear All
          </button>
        </div>

        <div className={styles.resultsPanel}>
          <h3>📋 Experiment Results</h3>
          <div className={styles.resultsArea}>
            {results.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center' }}>
                Results will appear here...
              </p>
            ) : (
              results.map((result) => (
                <div
                  key={result.id}
                  className={`${styles.reactionResult} ${
                    result.type === 'discovery' ? styles.discovery : ''
                  } ${result.type === 'failed' ? styles.failedReaction : ''}`}
                >
                  <h4>{result.title}</h4>
                  {result.formula && (
                    <p><strong>Formula:</strong> {result.formula}</p>
                  )}
                  <p>{result.description}</p>
                  <p><strong>Points:</strong> +{result.points}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChemistryGame;