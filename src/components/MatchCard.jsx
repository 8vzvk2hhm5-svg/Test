import React from 'react'
import { TEAMS } from '../data/worldCup2026.js'

export default function MatchCard({ match, pick, onPick, result }) {
  const homeTeam = TEAMS[match.home]
  const awayTeam = TEAMS[match.away]

  if (!homeTeam || !awayTeam) return null

  const isCompleted = match.status === 'completed'
  const isCorrect = result && pick && pick === result

  function formatDate(dateStr) {
    const date = new Date(dateStr + 'T12:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className={`match-card ${pick ? 'picked' : ''} ${isCompleted ? 'completed' : ''}`}>
      {/* Top meta */}
      <div className="match-card-meta">
        <span className="match-date-badge">{formatDate(match.date)}</span>
        <span className="match-time">{match.time} ET</span>
        {isCompleted && result && (
          <span className={`match-result-badge ${isCorrect ? 'correct' : 'incorrect'}`}>
            {isCorrect ? '✅ Correct' : '❌ Wrong'}
          </span>
        )}
        {pick && !isCompleted && (
          <span className="match-picked-badge">✓ Picked</span>
        )}
      </div>

      {/* Venue */}
      <div className="match-venue">{match.venue}</div>

      {/* Teams row */}
      <div className="match-teams">
        <div className="match-team home-team">
          <span className="team-flag">{homeTeam.flag}</span>
          <span className="team-name">{homeTeam.shortName}</span>
        </div>

        <div className="match-vs">
          <span>VS</span>
        </div>

        <div className="match-team away-team">
          <span className="team-flag">{awayTeam.flag}</span>
          <span className="team-name">{awayTeam.shortName}</span>
        </div>
      </div>

      {/* Pick buttons */}
      <div className="match-pick-buttons">
        <button
          className={`pick-btn ${pick === 'home' ? 'selected' : ''}`}
          onClick={() => onPick && onPick(match.id, 'home')}
          disabled={isCompleted}
        >
          🏠 Home
        </button>
        <button
          className={`pick-btn draw-btn ${pick === 'draw' ? 'selected' : ''}`}
          onClick={() => onPick && onPick(match.id, 'draw')}
          disabled={isCompleted}
        >
          〰 Draw
        </button>
        <button
          className={`pick-btn ${pick === 'away' ? 'selected' : ''}`}
          onClick={() => onPick && onPick(match.id, 'away')}
          disabled={isCompleted}
        >
          ✈ Away
        </button>
      </div>

      <style>{`
        .match-card {
          background: var(--card);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          padding: 16px;
          border: 1.5px solid var(--border-light);
          transition: box-shadow 0.2s, border-color 0.2s;
        }

        .match-card.picked {
          border-color: #a5d6a7;
          box-shadow: var(--shadow);
        }

        .match-card.completed {
          opacity: 0.85;
        }

        .match-card-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
          flex-wrap: wrap;
        }

        .match-date-badge {
          background: var(--primary);
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 100px;
          letter-spacing: 0.03em;
        }

        .match-time {
          color: var(--text-muted);
          font-size: 0.75rem;
        }

        .match-result-badge {
          font-size: 0.72rem;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 100px;
        }

        .match-result-badge.correct {
          background: #e8f5e9;
          color: var(--success);
        }

        .match-result-badge.incorrect {
          background: #ffebee;
          color: var(--error);
        }

        .match-picked-badge {
          font-size: 0.72rem;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 100px;
          background: #e8f5e9;
          color: var(--primary);
          margin-left: auto;
        }

        .match-venue {
          font-size: 0.7rem;
          color: var(--text-light);
          margin-bottom: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .match-teams {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          gap: 8px;
        }

        .match-team {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          flex: 1;
        }

        .team-flag {
          font-size: 2rem;
          line-height: 1;
        }

        .team-name {
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--text);
          text-align: center;
        }

        .match-vs {
          font-weight: 800;
          color: var(--text-muted);
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        .match-pick-buttons {
          display: flex;
          gap: 8px;
        }

        .pick-btn {
          flex: 1;
          padding: 8px 4px;
          font-size: 0.78rem;
          font-weight: 600;
          border-radius: var(--radius);
          border: 1.5px solid var(--border);
          background: white;
          color: var(--text-muted);
          transition: all 0.15s;
        }

        .pick-btn:hover:not(:disabled):not(.selected) {
          border-color: var(--primary);
          color: var(--primary);
          background: #f0f7f0;
        }

        .pick-btn.selected {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
          transform: scale(1.04);
          box-shadow: 0 2px 8px rgba(27,94,32,0.3);
        }

        .pick-btn:disabled {
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}
