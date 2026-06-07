import React, { useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import MatchCard from '../components/MatchCard.jsx'
import GroupTable from '../components/GroupTable.jsx'
import { usePicks } from '../context/PicksContext.jsx'
import { GROUPS, GROUP_MATCHES } from '../data/worldCup2026.js'

export default function GroupStagePage() {
  const [activeGroup, setActiveGroup] = useState('A')
  const { userPicks, setPick, groupStandings } = usePicks()

  const groupIds = Object.keys(GROUPS)

  // Get matches for active group, grouped by matchday
  const activeMatches = GROUP_MATCHES.filter(m => m.group === activeGroup)
  const matchday1 = activeMatches.filter(m => m.matchday === 1)
  const matchday2 = activeMatches.filter(m => m.matchday === 2)
  const matchday3 = activeMatches.filter(m => m.matchday === 3)

  // Count picked per group
  function getGroupPickCount(groupId) {
    return GROUP_MATCHES
      .filter(m => m.group === groupId)
      .filter(m => userPicks[m.id])
      .length
  }

  return (
    <div className="group-stage-page">
      <Navbar />

      <div className="page-content">
        <div className="gs-header">
          <h1>Group Stage Picks</h1>
          <p className="text-muted">Pick Home Win, Draw, or Away Win for each match</p>
        </div>

        {/* Group tabs */}
        <div className="group-tabs-wrapper">
          <div className="tabs-container">
            {groupIds.map(groupId => {
              const count = getGroupPickCount(groupId)
              const isComplete = count === 6
              return (
                <button
                  key={groupId}
                  className={`tab-btn group-tab ${activeGroup === groupId ? 'active' : ''} ${isComplete ? 'complete' : ''}`}
                  onClick={() => setActiveGroup(groupId)}
                >
                  <span className="tab-group-label">Group {groupId}</span>
                  <span className={`tab-count ${isComplete ? 'done' : ''}`}>
                    {count}/6
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Active group content */}
        <div className="group-content">
          <div className="group-content-grid">
            {/* Standings */}
            <div className="standings-section">
              <h2 className="section-heading">
                {GROUPS[activeGroup].name} Standings
                <span className="standing-note">(projected from your picks)</span>
              </h2>
              <GroupTable standings={groupStandings[activeGroup]} />

              <div className="group-pick-summary">
                <div className={`pick-progress-bar ${getGroupPickCount(activeGroup) === 6 ? 'complete' : ''}`}>
                  <div
                    className="pick-progress-fill"
                    style={{ width: `${(getGroupPickCount(activeGroup) / 6) * 100}%` }}
                  />
                </div>
                <span className="pick-progress-label">
                  {getGroupPickCount(activeGroup)} / 6 matches picked
                  {getGroupPickCount(activeGroup) === 6 && ' ✅'}
                </span>
              </div>
            </div>

            {/* Matches */}
            <div className="matches-section">
              <Matchday
                label="Matchday 1"
                matches={matchday1}
                picks={userPicks}
                onPick={setPick}
              />
              <Matchday
                label="Matchday 2"
                matches={matchday2}
                picks={userPicks}
                onPick={setPick}
              />
              <Matchday
                label="Matchday 3"
                matches={matchday3}
                picks={userPicks}
                onPick={setPick}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .group-stage-page {
          min-height: 100vh;
          background: var(--bg);
        }

        .gs-header {
          margin-bottom: 20px;
        }

        .gs-header h1 {
          color: var(--primary);
          margin-bottom: 4px;
        }

        .group-tabs-wrapper {
          background: white;
          border-radius: var(--radius-lg);
          padding: 12px;
          box-shadow: var(--shadow-sm);
          margin-bottom: 20px;
        }

        .group-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 8px 14px;
          min-width: 80px;
        }

        .tab-group-label {
          font-size: 0.8rem;
          font-weight: 700;
        }

        .tab-count {
          font-size: 0.68rem;
          font-weight: 500;
          color: var(--text-muted);
        }

        .tab-btn.active .tab-count {
          color: rgba(255,255,255,0.8);
        }

        .tab-count.done {
          color: var(--success);
        }

        .tab-btn.active .tab-count.done {
          color: var(--gold);
        }

        .tab-btn.complete:not(.active) {
          border-color: #a5d6a7;
          background: #f1faf1;
        }

        .group-content {}

        .group-content-grid {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 20px;
          align-items: start;
        }

        .standings-section {
          position: sticky;
          top: 80px;
        }

        .section-heading {
          font-size: 1rem;
          color: var(--text);
          margin-bottom: 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .standing-note {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 400;
        }

        .group-pick-summary {
          margin-top: 12px;
        }

        .pick-progress-bar {
          height: 6px;
          background: var(--border);
          border-radius: 100px;
          overflow: hidden;
          margin-bottom: 6px;
        }

        .pick-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary), var(--primary-light));
          border-radius: 100px;
          transition: width 0.3s ease;
        }

        .pick-progress-bar.complete .pick-progress-fill {
          background: linear-gradient(90deg, var(--success), #66bb6a);
        }

        .pick-progress-label {
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .matches-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        @media (max-width: 900px) {
          .group-content-grid {
            grid-template-columns: 1fr;
          }

          .standings-section {
            position: static;
          }
        }
      `}</style>
    </div>
  )
}

function Matchday({ label, matches, picks, onPick }) {
  if (!matches.length) return null

  return (
    <div className="matchday-section">
      <div className="matchday-header">
        <span className="matchday-label">{label}</span>
        <span className="matchday-date">{formatDate(matches[0].date)}</span>
      </div>
      <div className="matchday-matches">
        {matches.map(match => (
          <MatchCard
            key={match.id}
            match={match}
            pick={picks[match.id]}
            onPick={onPick}
          />
        ))}
      </div>

      <style>{`
        .matchday-section {}

        .matchday-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .matchday-label {
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--primary);
          background: #e8f5e9;
          padding: 4px 12px;
          border-radius: 100px;
        }

        .matchday-date {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .matchday-matches {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
      `}</style>
    </div>
  )
}

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}
