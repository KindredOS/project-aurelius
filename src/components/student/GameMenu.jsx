import React, { useState, useEffect } from "react";

export default function GameMenu({ 
  subject = "arts",
  isPremium = false, 
  onLaunch = () => {} 
}) {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoading(true);
        // Dynamically import based on subject
        const gamesModule = await import(`../../components/student/${subject}/${subject.charAt(0).toUpperCase() + subject.slice(1)}Games.json`);
        setGames(gamesModule.default);
      } catch (error) {
        console.error(`Failed to load games for subject: ${subject}`, error);
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, [subject]);

  const handlePlayGame = async (game) => {
    if (game.premium && !isPremium) return;
    
    try {
      // Dynamically import the game component
      const componentPath = game.component || `${game.id}.jsx`;
      const gameModule = await import(`../../components/student/${subject}/games/${componentPath}`);
      const GameComponent = gameModule.default;
      
      setSelectedGame({ 
        ...game, 
        GameComponent 
      });
      onLaunch(game);
    } catch (error) {
      console.error(`Failed to load game component: ${game.component || game.id}`, error);
    }
  };

  const handleBackToMenu = () => {
    setSelectedGame(null);
  };

  // Show loading state
  if (loading) {
    return (
      <div style={{ 
        padding: '2rem',
        textAlign: 'center',
        color: '#666'
      }}>
        <p>Loading {subject} games...</p>
      </div>
    );
  }

  // Show empty state if no games found
  if (games.length === 0) {
    return (
      <div style={{ 
        padding: '2rem',
        textAlign: 'center',
        color: '#666'
      }}>
        <p>No games found for {subject}.</p>
      </div>
    );
  }

  // If a game is selected, show the game view (placeholder)
  if (selectedGame) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <button 
          onClick={handleBackToMenu}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            padding: '0.5rem 1rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          ← Back to Games
        </button>
        
        <div style={{ marginTop: '4rem' }}>
          <h1 style={{ color: '#333', marginBottom: '1rem' }}>
            {selectedGame.title}
          </h1>
          
          {/* Render the actual game component */}
          {selectedGame.GameComponent ? (
            <selectedGame.GameComponent />
          ) : (
            <p style={{ color: '#666', fontSize: '1.1rem' }}>
              Loading game...
            </p>
          )}
        </div>
      </div>
    );
  }

  // Show the games grid
  return (
    <div style={{ 
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h2 style={{ 
        textAlign: 'center', 
        marginBottom: '2rem',
        color: '#333'
      }}>
        {subject.charAt(0).toUpperCase() + subject.slice(1)} Games
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        justifyItems: 'center'
      }}>
        {games.map((game) => (
          <div
            key={game.id}
            style={{
              width: '100%',
              maxWidth: '320px',
              border: '2px solid #e0e0e0',
              borderRadius: '12px',
              padding: '1.5rem',
              backgroundColor: 'white',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease',
              cursor: (game.premium && !isPremium) ? 'not-allowed' : 'pointer',
              opacity: (game.premium && !isPremium) ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!(game.premium && !isPremium)) {
                e.target.style.transform = 'translateY(-4px)';
                e.target.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }}
          >
            {/* Thumbnail */}
            <div style={{
              width: '100%',
              height: '120px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              border: '2px dashed #dee2e6'
            }}>
              {game.thumbnail ? (
                <img 
                  src={game.thumbnail} 
                  alt={game.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '6px'
                  }}
                />
              ) : (
                <span style={{
                  fontSize: '3rem',
                  fontWeight: 'bold',
                  color: '#adb5bd'
                }}>
                  {game.title[0]}
                </span>
              )}
            </div>

            {/* Title and badges */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '1.3rem',
                color: '#333'
              }}>
                {game.title}
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {game.premium && (
                  <span style={{
                    backgroundColor: '#ffd700',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    Premium
                  </span>
                )}
                {game.difficulty && (
                  <span style={{
                    backgroundColor: '#e9ecef',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    color: '#495057'
                  }}>
                    {game.difficulty}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p style={{
              color: '#666',
              fontSize: '0.9rem',
              lineHeight: '1.4',
              marginBottom: '1.5rem'
            }}>
              {game.shortDescription}
            </p>

            {/* Play button */}
            <button
              onClick={() => handlePlayGame(game)}
              disabled={game.premium && !isPremium}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: (game.premium && !isPremium) ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: (game.premium && !isPremium) ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!(game.premium && !isPremium)) {
                  e.target.style.backgroundColor = '#218838';
                }
              }}
              onMouseLeave={(e) => {
                if (!(game.premium && !isPremium)) {
                  e.target.style.backgroundColor = '#28a745';
                }
              }}
            >
              {(game.premium && !isPremium) ? '🔒 Requires Premium' : '▶ Play'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}