import React, { useState, useEffect } from 'react';
import { RotateCcw, Trophy, Clock, Zap } from 'lucide-react';

const SOUTHEAST_STATES = {
  'Delaware': 'Dover',
  'Maryland': 'Annapolis', 
  'Virginia': 'Richmond',
  'West Virginia': 'Charleston',
  'Kentucky': 'Frankfort',
  'Tennessee': 'Nashville',
  'North Carolina': 'Raleigh',
  'South Carolina': 'Columbia',
  'Georgia': 'Atlanta',
  'Florida': 'Tallahassee',
  'Alabama': 'Montgomery',
  'Mississippi': 'Jackson',
  'Arkansas': 'Little Rock',
  'Louisiana': 'Baton Rouge'
};

const SoutheastMemoryMatch = () => {
  const [gameState, setGameState] = useState('menu');
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [score, setScore] = useState(0);
  const [perfectMatches, setPerfectMatches] = useState(0);
  const [showCelebration, setShowCelebration] = useState('');

  // Timer effect
  useEffect(() => {
    let interval;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setTimeElapsed(time => time + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  const initializeGame = () => {
    const gameCards = [];
    let cardId = 0;

    Object.entries(SOUTHEAST_STATES).forEach(([state, capital]) => {
      gameCards.push({
        id: cardId++,
        type: 'state',
        text: state,
        matchValue: capital,
        isFlipped: false,
        isMatched: false
      });
      
      gameCards.push({
        id: cardId++,
        type: 'capital', 
        text: capital,
        matchValue: state,
        isFlipped: false,
        isMatched: false
      });
    });

    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs([]);
    setAttempts(0);
    setTimeElapsed(0);
    setScore(0);
    setPerfectMatches(0);
    setGameState('playing');
  };

  const flipCard = (cardId) => {
    if (flippedCards.length >= 2) return;
    if (flippedCards.includes(cardId)) return;
    if (matchedPairs.some(pair => pair.includes(cardId))) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    setCards(prevCards => 
      prevCards.map(card => 
        card.id === cardId ? { ...card, isFlipped: true } : card
      )
    );

    if (newFlippedCards.length === 2) {
      const card1 = cards.find(card => card.id === newFlippedCards[0]);
      const card2 = cards.find(card => card.id === newFlippedCards[1]);
      
      setAttempts(prev => prev + 1);

      setTimeout(() => {
        if (card1.matchValue === card2.text && card2.matchValue === card1.text) {
          setMatchedPairs(prev => [...prev, newFlippedCards]);
          setCards(prevCards => 
            prevCards.map(card => 
              newFlippedCards.includes(card.id) 
                ? { ...card, isMatched: true }
                : card
            )
          );
          
          const timeBonus = Math.max(0, 100 - timeElapsed);
          const attemptsBonus = Math.max(0, 50 - attempts * 2);
          const matchBonus = 100;
          const totalBonus = matchBonus + timeBonus + attemptsBonus;
          
          setScore(prev => prev + totalBonus);
          setPerfectMatches(prev => prev + 1);
          
          setShowCelebration(`Perfect Match! +${totalBonus} points! 🎉`);
          setTimeout(() => setShowCelebration(''), 2000);
          
          if (matchedPairs.length + 1 === Object.keys(SOUTHEAST_STATES).length) {
            setTimeout(() => setGameState('finished'), 1000);
          }
        } else {
          setCards(prevCards => 
            prevCards.map(card => 
              newFlippedCards.includes(card.id) 
                ? { ...card, isFlipped: false }
                : card
            )
          );
        }
        
        setFlippedCards([]);
      }, 1000);
    }
  };

  const resetGame = () => {
    setGameState('menu');
    setCards([]);
    setFlippedCards([]);
    setMatchedPairs([]);
    setAttempts(0);
    setTimeElapsed(0);
    setScore(0);
    setPerfectMatches(0);
    setShowCelebration('');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceRating = () => {
    const efficiency = matchedPairs.length / Math.max(attempts, 1);
    if (efficiency >= 0.8) return { rating: 'LEGENDARY', color: '#9333ea', emoji: '👑' };
    if (efficiency >= 0.6) return { rating: 'EXCELLENT', color: '#ca8a04', emoji: '⭐' };
    if (efficiency >= 0.4) return { rating: 'GOOD', color: '#16a34a', emoji: '🎯' };
    return { rating: 'KEEP PRACTICING', color: '#2563eb', emoji: '💪' };
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #4ade80 0%, #10b981 50%, #0d9488 100%)',
    padding: '24px'
  };

  const cardStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(12px)',
    borderRadius: '12px',
    padding: '32px',
    color: 'white'
  };

  // Menu Screen
  if (gameState === 'menu') {
    return (
      <div style={containerStyle}>
        <div style={{ maxWidth: '512px', margin: '0 auto', textAlign: 'center' }}>
          <div style={cardStyle}>
            <div style={{ fontSize: '60px', marginBottom: '16px' }}>🌴</div>
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>Southeast States</h1>
            <h2 style={{ fontSize: '30px', fontWeight: '600', marginBottom: '16px' }}>Memory Match Challenge</h2>
            <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '24px' }}>
              Match all 14 Southeast states with their capitals!
            </p>
            
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>States Included:</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
                fontSize: '14px'
              }}>
                {Object.keys(SOUTHEAST_STATES).map(state => (
                  <div key={state} style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                    padding: '8px 8px'
                  }}>
                    {state}
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              marginBottom: '24px',
              fontSize: '14px'
            }}>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '12px'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '4px' }}>🎯</div>
                <div>Perfect matches earn bonus points</div>
              </div>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '12px'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '4px' }}>⚡</div>
                <div>Speed bonuses for quick matches</div>
              </div>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '12px'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '4px' }}>🧠</div>
                <div>Memory challenge with 28 cards</div>
              </div>
            </div>

            <button
              onClick={initializeGame}
              style={{
                padding: '16px 32px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                borderRadius: '12px',
                fontSize: '20px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'scale(1)';
              }}
            >
              🎮 Start Memory Challenge
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game Screen
  if (gameState === 'playing') {
    return (
      <div style={containerStyle}>
        {/* Header with stats */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(12px)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          color: 'white'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <button
              onClick={resetGame}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            >
              <RotateCcw size={16} />
              Menu
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} />
                <span style={{ fontSize: '20px', fontFamily: 'monospace' }}>{formatTime(timeElapsed)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={20} />
                <span style={{ fontSize: '20px', fontFamily: 'monospace' }}>{score}</span>
              </div>
              <div style={{ fontSize: '14px' }}>
                Matches: {matchedPairs.length}/{Object.keys(SOUTHEAST_STATES).length}
              </div>
              <div style={{ fontSize: '14px' }}>
                Attempts: {attempts}
              </div>
            </div>
          </div>
        </div>

        {/* Game board */}
        <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px'
          }}>
            {cards.map(card => {
              const isFlipped = card.isFlipped || card.isMatched || flippedCards.includes(card.id);
              const isMatched = card.isMatched;
              
              let cardBg, borderColor;
              if (isMatched) {
                cardBg = 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)';
                borderColor = '#fbbf24';
              } else if (isFlipped) {
                if (card.type === 'state') {
                  cardBg = 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)';
                  borderColor = '#60a5fa';
                } else {
                  cardBg = 'linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%)';
                  borderColor = '#a855f7';
                }
              } else {
                cardBg = 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)';
                borderColor = 'rgba(255,255,255,0.3)';
              }
              
              return (
                <div
                  key={card.id}
                  onClick={() => flipCard(card.id)}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    background: cardBg,
                    border: `2px solid ${borderColor}`,
                    boxShadow: isMatched ? '0 10px 25px rgba(0,0,0,0.2)' : '0 4px 6px rgba(0,0,0,0.1)',
                    animation: isMatched ? 'pulse 1s infinite' : 'none'
                  }}
                  onMouseOver={(e) => {
                    if (!isFlipped) {
                      e.target.style.backgroundColor = 'rgba(255,255,255,0.3)';
                      e.target.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isFlipped) {
                      e.target.style.background = cardBg;
                      e.target.style.transform = 'scale(1)';
                    }
                  }}
                >
                  {isFlipped ? (
                    <>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        marginBottom: '4px',
                        color: card.type === 'state' ? '#1d4ed8' : '#7c3aed'
                      }}>
                        {card.type === 'state' ? '🏛️ STATE' : '⭐ CAPITAL'}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        lineHeight: '1.2',
                        color: isMatched ? '#9a3412' : 
                               card.type === 'state' ? '#1e40af' : '#6b21a8'
                      }}>
                        {card.text}
                      </div>
                    </>
                  ) : (
                    <div style={{ color: 'white', fontSize: '32px' }}>
                      🌴
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Celebration popup */}
        {showCelebration && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            pointerEvents: 'none'
          }}>
            <div style={{
              background: 'linear-gradient(90deg, #fbbf24 0%, #f97316 100%)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 'bold',
              animation: 'bounce 1s infinite',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
            }}>
              {showCelebration}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Results Screen
  if (gameState === 'finished') {
    const performance = getPerformanceRating();
    const finalScore = score + (perfectMatches * 50);
    
    return (
      <div style={containerStyle}>
        <div style={{ maxWidth: '512px', margin: '0 auto', textAlign: 'center' }}>
          <div style={cardStyle}>
            <div style={{ fontSize: '80px', marginBottom: '16px' }}>🏆</div>
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>Challenge Complete!</h1>
            <h2 style={{
              fontSize: '30px',
              fontWeight: 'bold',
              marginBottom: '24px',
              color: performance.color
            }}>
              {performance.emoji} {performance.rating}
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '24px',
              marginBottom: '32px'
            }}>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#fde047' }}>{finalScore}</div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Final Score</div>
              </div>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#93c5fd' }}>{formatTime(timeElapsed)}</div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Time</div>
              </div>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#86efac' }}>{attempts}</div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Attempts</div>
              </div>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#c4b5fd' }}>
                  {Math.round((perfectMatches / attempts) * 100)}%
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Accuracy</div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '18px', marginBottom: '8px' }}>🌟 Achievement Unlocked!</div>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '12px'
              }}>
                <div style={{ fontWeight: '600' }}>Southeast States Expert</div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Matched all 14 Southeast state capitals!</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button
                onClick={initializeGame}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              >
                <Zap size={20} />
                Play Again
              </button>
              <button
                onClick={resetGame}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              >
                Main Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SoutheastMemoryMatch;