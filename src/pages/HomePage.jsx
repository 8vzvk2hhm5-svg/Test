import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { usePicks } from '../context/PicksContext.jsx'
import Navbar from '../components/Navbar.jsx'
import { SCORING } from '../data/worldCup2026.js'

const OPENING_MATCH = new Date('2026-06-11T19:00:00-05:00') // ET time

function useCountdown(target) {
  const [timeLeft, setTimeLeft] = useState(null)

  useEffect(() => {
    function calc() {
      const diff = target - Date.now()
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      const minutes = Math.floor((diff % 3600000) / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setTimeLeft({ days, hours, minutes, seconds })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [target])

  return timeLeft
}

export default function HomePage() {
  const { user } = useAuth()
  const { pickedCount, userPicks, groupStandings } = usePicks()
  const countdown = useCountdown(OPENING_MATCH)

  const totalGroupMatches = 72
  const progress = Math.round((pickedCount / totalGroupMatches) * 100)

  // Estimate projected points (all picked correctly = max score)
  const projectedGroupPoints = pickedCount * SCORING.group
  const maxGroupPoints = totalGroupMatches * SCORING.group

  // Count how many groups are fully picked (6 matches each)
  const groupsCompleted = Object.keys(groupStandings).filter(groupId => {
    const groupMatchIds = Object.keys(userPicks).filter(id => id.startsWith(groupId))
    return groupMatchIds.length === 6
  }).length

  return (
    <div className="home-page">
      <Navbar />

      <div className="page-content">
        {/* Welcome header */}
        <div className="home-header">
          <h1 className="home-title">
            World Cup Picks 2026 ⚽
          </h1>
          <p className="home-welcome">
            Welcome back, <strong>{user?.displayName || 'Player'}</strong>! Make your picks for the greatest tournament on Earth.
          </p>
        </div>

        {/* Countdown card */}
        <div className="countdown-card">
          <div className="countdown-label">
            ⚡ Tournament Begins
          </div>
          <div className="countdown-teams">
            🇲🇽 Mexico vs South Africa 🇿🇦
          </div>
          <div className="countdown-subtitle">June 11, 2026 · Estadio Azteca, Mexico City</div>
          {countdown ? (
            <div className="countdown-timer">
              <div className="countdown-unit">
                <div className="countdown-num">{String(countdown.days).padStart(2, '0')}</div>
                <div className="countdown-lbl">Days</div>
              </div>
              <div className="countdown-sep">:</div>
              <div className="countdown-unit">
                <div className="countdown-num">{String(countdown.hours).padStart(2, '0')}</div>
                <div className="countdown-lbl">Hours</div>
              </div>
              <div className="countdown-sep">:</div>
              <div className="countdown-unit">
                <div className="countdown-num">{String(countdown.minutes).padStart(2, '0')}</div>
                <div className="countdown-lbl">Mins</div>
              </div>
              <div className="countdown-sep">:</div>
              <div className="countdown-unit">
                <div className="countdown-num">{String(countdown.seconds).padStart(2, '0')}</div>
                <div className="countdown-lbl">Secs</div>
              </div>
            </div>
          ) : (
            <div className="countdown-timer">
              <span className="countdown-started">🎉 Tournament is underway!</span>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{pickedCount}</div>
            <div className="stat-label">Matches Picked</div>
            <div className="stat-sub">of {totalGroupMatches} group matches</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{groupsCompleted}</div>
            <div className="stat-label">Groups Complete</div>
            <div className="stat-sub">of 12 groups</div>
          </div>
          <div className="stat-card">
            <div className="stat-value gold">{projectedGroupPoints}</div>
            <div className="stat-label">Potential Points</div>
            <div className="stat-sub">of {maxGroupPoints} possible</div>
          </div>
        </div>

        {/* Progress card */}
        <div className="card">
          <div className="progress-header">
            <h3>Group Stage Progress</h3>
            <span className="progress-count">{pickedCount} / {totalGroupMatches}</span>
          </div>
          <div className="progress-bar-container" style={{ marginTop: 12 }}>
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="progress-hint">
            {pickedCount === 0
              ? 'Start making your picks below!'
              : pickedCount === totalGroupMatches
              ? '✅ All group stage picks complete! Now fill out the knockout bracket.'
              : `${totalGroupMatches - pickedCount} matches remaining`
            }
          </p>
        </div>

        {/* Quick actions */}
        <h2 className="section-title">Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/picks/group-stage" className="action-card">
            <div className="action-icon">📋</div>
            <div className="action-content">
              <h3>Group Stage Picks</h3>
              <p>Pick results for all 72 group stage matches across 12 groups</p>
              <span className="action-arrow">Make Picks →</span>
            </div>
          </Link>

          <Link to="/picks/knockout" className="action-card">
            <div className="action-icon">🏆</div>
            <div className="action-content">
              <h3>Knockout Bracket</h3>
              <p>Pick the winners through R32, R16, Quarterfinals, Semis & Final</p>
              <span className="action-arrow">Fill Bracket →</span>
            </div>
          </Link>

          <Link to="/groups" className="action-card">
            <div className="action-icon">👥</div>
            <div className="action-content">
              <h3>My Groups</h3>
              <p>Create or join a friend group to compete on the leaderboard</p>
              <span className="action-arrow">View Groups →</span>
            </div>
          </Link>
        </div>

        {/* Scoring guide */}
        <div className="scoring-guide">
          <h3>Scoring System</h3>
          <div className="scoring-grid">
            {[
              { round: 'Group Stage', pts: SCORING.group },
              { round: 'Round of 32', pts: SCORING.r32 },
              { round: 'Round of 16', pts: SCORING.r16 },
              { round: 'Quarterfinals', pts: SCORING.qf },
              { round: 'Semifinals', pts: SCORING.sf },
              { round: 'Final', pts: SCORING.final },
            ].map(item => (
              <div key={item.round} className="scoring-item">
                <span className="scoring-round">{item.round}</span>
                <span className="scoring-pts">{item.pts} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .home-page {
          min-height: 100vh;
          background: var(--bg);
        }

        .home-header {
          margin-bottom: 24px;
        }

        .home-title {
          font-size: 2rem;
          font-weight: 800;
          color: var(--primary);
          margin-bottom: 8px;
        }

        .home-welcome {
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        /* Countdown */
        .countdown-card {
          background: linear-gradient(135deg, var(--primary-dark), var(--primary-light));
          border-radius: var(--radius-xl);
          padding: 28px 24px;
          text-align: center;
          margin-bottom: 20px;
          box-shadow: var(--shadow-lg);
          color: white;
        }

        .countdown-label {
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 8px;
        }

        .countdown-teams {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .countdown-subtitle {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.7);
          margin-bottom: 20px;
        }

        .countdown-timer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .countdown-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .countdown-num {
          background: rgba(255,255,255,0.15);
          border-radius: var(--radius);
          padding: 8px 16px;
          font-size: 2rem;
          font-weight: 800;
          min-width: 72px;
          text-align: center;
          font-variant-numeric: tabular-nums;
          color: var(--gold);
          border: 1px solid rgba(255,215,0,0.3);
        }

        .countdown-lbl {
          font-size: 0.68rem;
          color: rgba(255,255,255,0.6);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 6px;
          font-weight: 600;
        }

        .countdown-sep {
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--gold);
          margin-bottom: 18px;
        }

        .countdown-started {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--gold);
        }

        /* Stats */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }

        .stat-card {
          background: white;
          border-radius: var(--radius-lg);
          padding: 20px;
          text-align: center;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-light);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: var(--primary);
          line-height: 1;
          margin-bottom: 4px;
        }

        .stat-value.gold {
          color: #9a7a00;
        }

        .stat-label {
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--text);
          margin-bottom: 2px;
        }

        .stat-sub {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        /* Progress */
        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .progress-count {
          font-weight: 700;
          color: var(--primary);
          font-size: 1rem;
        }

        .progress-hint {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-top: 8px;
        }

        /* Actions */
        .section-title {
          margin: 24px 0 16px;
          color: var(--text);
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .action-card {
          background: white;
          border-radius: var(--radius-lg);
          padding: 20px;
          box-shadow: var(--shadow-sm);
          border: 2px solid transparent;
          text-decoration: none;
          transition: all 0.2s;
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }

        .action-card:hover {
          border-color: var(--primary);
          box-shadow: var(--shadow);
          transform: translateY(-2px);
        }

        .action-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .action-content h3 {
          color: var(--text);
          margin-bottom: 4px;
          font-size: 0.95rem;
        }

        .action-content p {
          color: var(--text-muted);
          font-size: 0.8rem;
          line-height: 1.4;
          margin-bottom: 10px;
        }

        .action-arrow {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--primary);
        }

        /* Scoring */
        .scoring-guide {
          background: white;
          border-radius: var(--radius-lg);
          padding: 20px;
          box-shadow: var(--shadow-sm);
          margin-bottom: 24px;
        }

        .scoring-guide h3 {
          margin-bottom: 16px;
          color: var(--text);
        }

        .scoring-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .scoring-item {
          background: #f8fdf8;
          border: 1px solid #c8e6c9;
          border-radius: var(--radius);
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .scoring-round {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .scoring-pts {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--primary);
        }

        @media (max-width: 768px) {
          .home-title { font-size: 1.5rem; }

          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
          }

          .stat-card {
            padding: 14px 10px;
          }

          .stat-value { font-size: 1.6rem; }

          .actions-grid {
            grid-template-columns: 1fr;
          }

          .action-card {
            flex-direction: row;
          }

          .scoring-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .countdown-num {
            font-size: 1.5rem;
            min-width: 56px;
            padding: 6px 10px;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .countdown-num {
            font-size: 1.2rem;
            min-width: 44px;
            padding: 5px 8px;
          }
        }
      `}</style>
    </div>
  )
}
