import React, { useState, useEffect } from "react";
import { Gamepad2 } from "lucide-react";
import { getThemeColors } from "../../utils/stylesBranding";
import styles from "./GameMenu.module.css";

// Preload thumbnails for all subjects
const thumbnailModules = import.meta.glob(
  "../../components/student/*/games/thumbnails/*.{png,jpg,jpeg,svg,webp}",
  { eager: true }
);

// Lazy-load game components
const gameModules = import.meta.glob(
  "../../components/student/*/games/*.jsx"
);

// Resolve thumbnail path
const resolveThumb = (thumbPath, subject) => {
  if (!thumbPath) return null;
  if (thumbPath.startsWith("http")) return thumbPath;
  if (thumbPath.startsWith("/")) return thumbPath;

  const key = `../../components/student/${subject}/games/thumbnails/${thumbPath}`;
  return thumbnailModules[key]?.default ?? null;
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

        const map = {};
        for (const game of gamesList) {
          map[game.id] = resolveThumb(game.thumbnail, subject);
        }
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

    const componentPath = game.component || `${game.id}.jsx`;
    const key = `../../components/student/${subject}/games/${componentPath}`;

    if (!gameModules[key]) {
      console.error("Game component not found:", key);
      return;
    }

    try {
      const module = await gameModules[key]();
      const GameComponent = module.default;
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

  const markThumbFailed = (gameId) => {
    setFailedThumbs((prev) => new Set(prev).add(gameId));
  };

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
                onClick={() => !locked && handlePlayGame(game)}
              >
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

                <div className={styles.cardHeaderRow}>
                  <h3 className={styles.cardTitle}>{game.title}</h3>
                  <div className={styles.badges}>
                    {game.premium && <span className={styles.premiumBadge}>Premium</span>}
                    {game.difficulty && (
                      <span className={styles.difficultyBadge}>{game.difficulty}</span>
                    )}
                  </div>
                </div>

                <p className={styles.cardDesc}>{game.shortDescription}</p>

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
