import React, { useState, useEffect } from "react";
import { Gamepad2 } from "lucide-react";
import { getThemeColors } from "../../utils/stylesBranding";
import styles from "./GameMenu.module.css";

// Helper to resolve thumbnail path based on subject
const resolveThumb = async (thumbPath, subject) => {
  if (!thumbPath) return null;

  // Allow full URLs to work
  if (thumbPath.startsWith("http")) return thumbPath;

  // If it starts with /, treat as absolute path from public root
  if (thumbPath.startsWith("/")) return thumbPath;

  try {
    // For relative paths, dynamically import from src folder
    const imageModule = await import(
      `../../components/student/${subject}/games/thumbnails/${thumbPath}`
    );
    return imageModule.default;
  } catch (error) {
    console.warn(`Failed to load thumbnail: ${thumbPath}`, error);
    return null;
  }
};

export default function GameMenu({
  subject = "arts",
  isPremium = false,
  onLaunch = () => {},
}) {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [thumbnails, setThumbnails] = useState({});
  const [failedThumbs, setFailedThumbs] = useState(new Set());

  const subjectLabel = subject.charAt(0).toUpperCase() + subject.slice(1);
  const themeColors = getThemeColors(subject);

  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoading(true);
        const gamesModule = await import(
          `../../components/student/${subject}/${subjectLabel}Games.json`
        );
        const gamesList = gamesModule.default;
        setGames(gamesList);

        // Pre-load all thumbnails
        const thumbPromises = gamesList.map(async (game) => {
          if (game.thumbnail) {
            const src = await resolveThumb(game.thumbnail, subject);
            return { id: game.id, src };
          }
          return { id: game.id, src: null };
        });

        const results = await Promise.all(thumbPromises);
        const map = {};
        results.forEach(({ id, src }) => (map[id] = src));
        setThumbnails(map);
        setFailedThumbs(new Set());
      } catch (error) {
        console.error(`Failed to load games for subject: ${subject}`, error);
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, [subject, subjectLabel]);

  const handlePlayGame = async (game) => {
    if (game.premium && !isPremium) return;

    try {
      const componentPath = game.component || `${game.id}.jsx`;
      const gameModule = await import(
        `../../components/student/${subject}/games/${componentPath}`
      );
      const GameComponent = gameModule.default;

      setSelectedGame({ ...game, GameComponent });
      onLaunch(game);
    } catch (error) {
      console.error(
        `Failed to load game component: ${game.component || game.id}`,
        error
      );
    }
  };

  const handleBackToMenu = () => {
    setSelectedGame(null);
  };

  // Inline handler to track failed images (so we can show placeholder via conditional render)
  const markThumbFailed = (gameId) => {
    setFailedThumbs((prev) => {
      const next = new Set(prev);
      next.add(gameId);
      return next;
    });
  };

  // Brand variables applied at wrapper level
  const brandVars = {
    "--brand-gradient": themeColors?.gradient,
    "--brand-primary": themeColors?.primary,
  };

  if (loading) {
    return (
      <div className={`${styles.centered} ${styles.page}`} style={brandVars}>
        <div className={styles.headerCard}>
          <Gamepad2 size={28} />
          <h1 className={styles.headerTitle}>{themeColors.name} Games</h1>
        </div>
        <div className={styles.stateWrapper}>
          <p>Loading {subject} games...</p>
        </div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className={`${styles.centered} ${styles.page}`} style={brandVars}>
        <div className={styles.headerCard}>
          <Gamepad2 size={28} />
          <h1 className={styles.headerTitle}>{themeColors.name} Games</h1>
        </div>
        <div className={styles.stateWrapper}>
          <p>No games found for {subject}.</p>
        </div>
      </div>
    );
  }

  if (selectedGame) {
    return (
      <div className={`${styles.centered} ${styles.selectedWrapper}`} style={brandVars}>
        {/* Branded Header */}
        <div className={styles.selectedHeader}>
          <button onClick={handleBackToMenu} className={styles.backButton}>
            ← Back to Games
          </button>
          <Gamepad2 size={28} />
          <h1 className={styles.headerTitle}>{selectedGame.title}</h1>
        </div>

        <div className={styles.contentPad}>
          {selectedGame.GameComponent ? (
            <selectedGame.GameComponent />
          ) : (
            <p className={styles.cardDesc}>Loading game...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.centered} ${styles.page}`} style={brandVars}>
      {/* Subject-branded header band */}
      <div className={styles.headerBand}>
        <Gamepad2 size={28} />
        <h1 className={styles.headerTitle}>{themeColors.name} Games</h1>
      </div>

      <div className={styles.bodyPad}>
        <div className={styles.cardsGrid}>
          {games.map((game) => {
            const thumbSrc = thumbnails[game.id];
            const locked = game.premium && !isPremium;

            return (
              <div
                key={game.id}
                className={`${styles.gameCard} ${locked ? styles.disabled : ""}`}
                onClick={() => {
                  if (!locked) handlePlayGame(game);
                }}
              >
                {/* Thumbnail */}
                <div className={styles.thumb}>
                  {thumbSrc && !failedThumbs.has(game.id) ? (
                    <img
                      src={thumbSrc}
                      alt={game.title}
                      className={styles.thumbImg}
                      onError={() => markThumbFailed(game.id)}
                    />
                  ) : (
                    <span className={styles.thumbPlaceholder}>
                      {game.title?.[0] ?? "?"}
                    </span>
                  )}
                </div>

                {/* Title + Badges */}
                <div className={styles.cardHeaderRow}>
                  <h3 className={styles.cardTitle}>{game.title}</h3>
                  <div className={styles.badges}>
                    {game.premium && <span className={styles.premiumBadge}>Premium</span>}
                    {game.difficulty && (
                      <span className={styles.difficultyBadge}>{game.difficulty}</span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className={styles.cardDesc}>{game.shortDescription}</p>

                {/* Play Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayGame(game);
                  }}
                  disabled={locked}
                  className={styles.playButton}
                >
                  {locked ? "🔒 Requires Premium" : "▶ Start"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
