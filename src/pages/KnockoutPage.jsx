import React, { useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import { usePicks } from '../context/PicksContext.jsx'
import { TEAMS } from '../data/worldCup2026.js'

const ROUND_CONFIG = [
  { key: 'r32', label: 'Round of 32', shortLabel: 'R32' },
  { key: 'r16', label: 'Round of 16', shortLabel: 'R16' },
  { key: 'qf', label: 'Quarterfinals', shortLabel: 'QF' },
  { key: 'sf', label: 'Semifinals', shortLabel: 'SF' },
  { key: 'final', label: 'Final', shortLabel: 'F' },
]

export default function KnockoutPage() {
  const { knockoutBracket, knockoutPicks, setKnockoutPick } = usePicks()
  const [activeRound, setActiveRound] = useState('r32')

  const matchesByRound = {}
  ROUND_CONFIG.forEach(r => {
    matchesByRound[r.key] = knockoutBracket.filter(m => m.round === r.key)
  })

  const champion = knockoutPicks['FINAL'] || null
  const championTeam = champion ? TEAMS[champion] : null

  function handlePick(matchId, teamId) {
    setKnockoutPick(matchId, teamId)
  }

  function countKOPicked() {
    return knockoutBracket.filter(m => knockoutPicks[m.id]).length
  }

  return (
    <div className="knockout-page">
      <Navbar />

      <div className="page-content">
        <div className="ko-header">
          <h1>Knockout Bracket</h1>
          <p className="text-muted">
            Based on your group stage picks · {countKOPicked()} / {knockoutBracket.length} picks made
          </p>
        </div>

        {champion && championTeam && (
          <div className="champion-banner">
            <span className="trophy-icon">🏆</span>
            <div>
              <div className="champion-label">Your Predicted Champion</div>
              <div className="champion-name">
                {championTeam.flag} {championTeam.name}
              </div>
            </div>
          </div>
        )}

        {/* Round tabs */}
        <div className="round-tabs">
          {ROUND_CONFIG.map(round => {
            const matches = matchesByRound[round.key] || []
            const picked = matches.filter(m => knockoutPicks[m.id]).length
            return (
              <button
                key={round.key}
                className={`round-tab ${activeRound === round.key ? 'active' : ''}`}
                onClick={() => setActiveRound(round.key)}
              >
                <span className="round-tab-label">{round.label}</span>
                <span className="round-tab-sub">{picked}/{matches.length}</span>
              </button>
            )
          })}
        </div>

        {/* Matches */}
        <div className="ko-matches">
          {(matchesByRound[activeRound] || []).map(match => (
            <KnockoutMatchCard
              key={match.id}
              match={match}
              picked={knockoutPicks[match.id]}
              onPick={handlePick}
            />
          ))}
          {(!matchesByRound[activeRound] || matchesByRound[activeRound].length === 0) && (
            <div className="empty-state">
              <span className="empty-state-icon">🔍</span>
              <p>No matches in this round yet.</p>
            </div>
          )}
        </div>

        {/* Bracket overview */}
        <div className="bracket-scroll-wrapper">
          <h2 className="section-title-ko">Full Bracket View</h2>
          <div className="bracket-scroll">
            <div className="bracket-columns">
              {ROUND_CONFIG.map(round => (
                <BracketColumn
                  key={round.key}
                  roundConfig={round}
                  matches={matchesByRound[round.key] || []}
                  picks={knockoutPicks}
                  onPick={handlePick}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .knockout-page {
          min-height: 100vh;
          background: var(--bg);
        }

        .ko-header {
          margin-bottom: 20px;
        }

        .ko-header h1 {
          color: var(--primary);
          margin-bottom: 4px;
        }

        .champion-banner {
          background: linear-gradient(135deg, #856404, #a07600);
          color: white;
          border-radius: var(--radius-lg);
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
          box-shadow: var(--shadow);
        }

        .trophy-icon {
          font-size: 2.5rem;
          flex-shrink: 0;
        }

        .champion-label {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          opacity: 0.85;
          margin-bottom: 4px;
        }

        .champion-name {
          font-size: 1.3rem;
          font-weight: 800;
        }

        .round-tabs {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
          margin-bottom: 20px;
          scrollbar-width: none;
        }

        .round-tabs::-webkit-scrollbar { display: none; }

        .round-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 10px 18px;
          border-radius: var(--radius);
          font-weight: 600;
          font-size: 0.85rem;
          white-space: nowrap;
          border: 1.5px solid transparent;
          background: white;
          color: var(--text-muted);
          box-shadow: var(--shadow-sm);
          transition: all 0.2s;
          flex-shrink: 0;
          cursor: pointer;
        }

        .round-tab:hover {
          color: var(--primary);
          border-color: var(--primary);
        }

        .round-tab.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .round-tab-label {
          font-size: 0.82rem;
          font-weight: 700;
        }

        .round-tab-sub {
          font-size: 0.68rem;
          font-weight: 500;
          opacity: 0.75;
        }

        .ko-matches {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .section-title-ko {
          font-size: 1.1rem;
          color: var(--text);
          margin-bottom: 12px;
        }

        .bracket-scroll-wrapper {
          background: white;
          border-radius: var(--radius-lg);
          padding: 20px;
          box-shadow: var(--shadow-sm);
        }

        .bracket-scroll {
          overflow-x: auto;
          padding-bottom: 8px;
        }

        .bracket-columns {
          display: flex;
          gap: 16px;
          min-width: fit-content;
          align-items: flex-start;
        }
      `}</style>
    </div>
  )
}

function KnockoutMatchCard({ match, picked, onPick }) {
  const homeTeam = match.home ? TEAMS[match.home] : null
  const awayTeam = match.away ? TEAMS[match.away] : null

  const canPick = homeTeam && awayTeam

  function formatDate(dateStr) {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className={`ko-match-card ${picked ? 'picked' : ''} ${!canPick ? 'tbd' : ''}`}>
      <div className="ko-match-meta">
        <span className="ko-match-id">{match.id.replace('_', ' ')}</span>
        <span className="ko-match-date">{formatDate(match.date)}</span>
      </div>
      <div className="ko-match-venue">{match.venue}</div>

      <div className="ko-teams">
        <button
          className={`ko-team-btn ${picked === match.home ? 'selected' : ''} ${!canPick ? 'disabled' : ''}`}
          onClick={() => canPick && onPick(match.id, match.home)}
          disabled={!canPick}
        >
          {homeTeam ? (
            <>
              <span className="ko-team-flag">{homeTeam.flag}</span>
              <span className="ko-team-name">{homeTeam.shortName}</span>
            </>
          ) : (
            <span className="ko-tbd">TBD</span>
          )}
        </button>

        <div className="ko-vs">VS</div>

        <button
          className={`ko-team-btn ${picked === match.away ? 'selected' : ''} ${!canPick ? 'disabled' : ''}`}
          onClick={() => canPick && onPick(match.id, match.away)}
          disabled={!canPick}
        >
          {awayTeam ? (
            <>
              <span className="ko-team-flag">{awayTeam.flag}</span>
              <span className="ko-team-name">{awayTeam.shortName}</span>
            </>
          ) : (
            <span className="ko-tbd">TBD</span>
          )}
        </button>
      </div>

      {!canPick && (
        <p className="ko-pending-note">Complete group stage picks to unlock</p>
      )}

      {canPick && !picked && (
        <p className="ko-pending-note">Click a team to pick the winner</p>
      )}

      {picked && (
        <div className="ko-picked-banner">
          ✓ {TEAMS[picked]?.name || picked} to advance
        </div>
      )}

      <style>{`
        .ko-match-card {
          background: white;
          border-radius: var(--radius-lg);
          padding: 16px;
          box-shadow: var(--shadow-sm);
          border: 1.5px solid var(--border-light);
          transition: all 0.2s;
        }

        .ko-match-card.picked {
          border-color: #a5d6a7;
        }

        .ko-match-card.tbd {
          opacity: 0.7;
          background: #fafafa;
        }

        .ko-match-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .ko-match-id {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--primary);
          background: #e8f5e9;
          padding: 2px 8px;
          border-radius: 100px;
          text-transform: uppercase;
        }

        .ko-match-date {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .ko-match-venue {
          font-size: 0.68rem;
          color: var(--text-light);
          margin-bottom: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ko-teams {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 12px;
        }

        .ko-team-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 12px 8px;
          border-radius: var(--radius);
          border: 1.5px solid var(--border);
          background: white;
          cursor: pointer;
          transition: all 0.15s;
        }

        .ko-team-btn:hover:not(:disabled):not(.selected) {
          border-color: var(--primary);
          background: #f0f7f0;
        }

        .ko-team-btn.selected {
          background: var(--primary);
          border-color: var(--primary);
          transform: scale(1.04);
          box-shadow: 0 3px 10px rgba(27,94,32,0.3);
        }

        .ko-team-btn.selected .ko-team-name {
          color: white;
        }

        .ko-team-btn.disabled {
          cursor: default;
          opacity: 0.5;
        }

        .ko-team-flag {
          font-size: 1.6rem;
        }

        .ko-team-name {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--text);
        }

        .ko-tbd {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-style: italic;
        }

        .ko-vs {
          font-weight: 800;
          color: var(--text-muted);
          font-size: 0.75rem;
          flex-shrink: 0;
        }

        .ko-pending-note {
          text-align: center;
          font-size: 0.72rem;
          color: var(--text-light);
          font-style: italic;
        }

        .ko-picked-banner {
          text-align: center;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--success);
          background: #e8f5e9;
          padding: 4px 10px;
          border-radius: var(--radius);
        }
      `}</style>
    </div>
  )
}

function BracketColumn({ roundConfig, matches, picks, onPick }) {
  return (
    <div className="bracket-col">
      <div className="bracket-col-header">
        {roundConfig.label}
        <span className="bracket-col-count">
          {matches.filter(m => picks[m.id]).length}/{matches.length}
        </span>
      </div>
      <div className="bracket-col-matches">
        {matches.map(match => (
          <BracketSlot key={match.id} match={match} pick={picks[match.id]} onPick={onPick} />
        ))}
        {matches.length === 0 && (
          <div className="bracket-empty-col">TBD</div>
        )}
      </div>

      <style>{`
        .bracket-col {
          min-width: 180px;
          max-width: 200px;
          flex-shrink: 0;
        }

        .bracket-col-header {
          background: var(--primary);
          color: white;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 6px 10px;
          border-radius: var(--radius) var(--radius) 0 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .bracket-col-count {
          background: rgba(255,255,255,0.2);
          padding: 1px 6px;
          border-radius: 100px;
          font-size: 0.68rem;
        }

        .bracket-col-matches {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 8px 0;
        }

        .bracket-empty-col {
          text-align: center;
          color: var(--text-muted);
          font-size: 0.8rem;
          padding: 20px;
        }
      `}</style>
    </div>
  )
}

function BracketSlot({ match, pick, onPick }) {
  const homeTeam = match.home ? TEAMS[match.home] : null
  const awayTeam = match.away ? TEAMS[match.away] : null
  const canPick = homeTeam && awayTeam

  return (
    <div className={`bracket-slot ${pick ? 'picked' : ''} ${!canPick ? 'tbd' : ''}`}>
      <div className="bracket-slot-id">{match.id.replace('_', ' ')}</div>
      <div
        className={`bracket-team ${pick === match.home ? 'winner' : ''}`}
        onClick={() => canPick && onPick(match.id, match.home)}
        style={{ cursor: canPick ? 'pointer' : 'default' }}
      >
        {homeTeam ? `${homeTeam.flag} ${homeTeam.shortName}` : '—'}
      </div>
      <div className="bracket-divider" />
      <div
        className={`bracket-team ${pick === match.away ? 'winner' : ''}`}
        onClick={() => canPick && onPick(match.id, match.away)}
        style={{ cursor: canPick ? 'pointer' : 'default' }}
      >
        {awayTeam ? `${awayTeam.flag} ${awayTeam.shortName}` : '—'}
      </div>

      <style>{`
        .bracket-slot {
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
          font-size: 0.75rem;
          transition: box-shadow 0.15s;
        }

        .bracket-slot.picked {
          border-color: #a5d6a7;
        }

        .bracket-slot.tbd {
          opacity: 0.6;
        }

        .bracket-slot-id {
          background: #f5f5f5;
          padding: 2px 6px;
          font-size: 0.62rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
        }

        .bracket-team {
          padding: 5px 8px;
          font-weight: 500;
          color: var(--text);
          transition: background 0.15s;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .bracket-team:hover {
          background: #f0f7f0;
        }

        .bracket-team.winner {
          background: var(--primary);
          color: white;
          font-weight: 700;
        }

        .bracket-divider {
          height: 1px;
          background: var(--border-light);
        }
      `}</style>
    </div>
  )
}
