import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { computeLeaderboard } from '../utils/algorithm.js'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase.js'

export default function GroupDetailPage() {
  const { groupId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [group, setGroup] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!groupId || !user) return
    loadGroupData()
  }, [groupId, user])

  async function loadGroupData() {
    setLoading(true)
    setError('')

    try {
      const groupRef = doc(db, 'groups', groupId)
      const groupSnap = await getDoc(groupRef)

      if (!groupSnap.exists()) {
        setError('Group not found.')
        setLoading(false)
        return
      }

      const groupData = { id: groupSnap.id, ...groupSnap.data() }
      setGroup(groupData)

      const members = groupData.members || []
      const actualResults = groupData.actualResults || { groupResults: {}, knockoutResults: {} }

      // Load all member picks
      const allPicks = {}
      await Promise.all(
        members.map(async member => {
          try {
            const groupPickRef = doc(db, 'users', member.userId, 'picks', 'group')
            const koPickRef = doc(db, 'users', member.userId, 'picks', 'knockout')
            const [gSnap, koSnap] = await Promise.all([
              getDoc(groupPickRef),
              getDoc(koPickRef),
            ])
            allPicks[member.userId] = {
              groupPicks: gSnap.exists() ? gSnap.data().picks || {} : {},
              knockoutPicks: koSnap.exists() ? koSnap.data().picks || {} : {},
            }
          } catch {
            allPicks[member.userId] = { groupPicks: {}, knockoutPicks: {} }
          }
        })
      )

      const board = computeLeaderboard(members, allPicks, actualResults)
      setLeaderboard(board)
    } catch (err) {
      console.error('Error loading group:', err)
      setError('Failed to load group data.')
    }

    setLoading(false)
  }

  async function handleCopy() {
    const code = group?.code || groupId
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const ta = document.createElement('textarea')
      ta.value = code
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function getRankIcon(rank) {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  if (loading) {
    return (
      <div className="group-detail-page">
        <Navbar />
        <div className="flex-center" style={{ minHeight: '60vh' }}>
          <div className="loading-spinner" />
        </div>
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className="group-detail-page">
        <Navbar />
        <div className="page-content">
          <div className="error-message">{error || 'Group not found.'}</div>
          <button className="btn btn-outline" onClick={() => navigate('/groups')}>
            ← Back to Groups
          </button>
        </div>
      </div>
    )
  }

  const inviteCode = group.code || groupId
  const userRankEntry = leaderboard.find(e => e.userId === user.uid)
  const userRank = userRankEntry ? leaderboard.indexOf(userRankEntry) + 1 : null

  return (
    <div className="group-detail-page">
      <Navbar />

      <div className="page-content">
        {/* Back */}
        <button className="back-btn" onClick={() => navigate('/groups')}>
          ← Back to Groups
        </button>

        {/* Group header */}
        <div className="group-detail-header">
          <div className="group-detail-title-row">
            <h1 className="group-detail-name">{group.name}</h1>
            {userRank && (
              <div className="user-rank-badge">
                {getRankIcon(userRank)} Your rank
              </div>
            )}
          </div>

          <div className="invite-section">
            <div className="invite-code-card">
              <span className="invite-label">Invite Code</span>
              <span className="invite-code">{inviteCode}</span>
              <button
                className={`copy-btn ${copied ? 'copied' : ''}`}
                onClick={handleCopy}
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
            <p className="invite-hint">
              Share this code with friends so they can join your group
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="detail-stats-row">
          <div className="detail-stat">
            <div className="detail-stat-val">{leaderboard.length}</div>
            <div className="detail-stat-lbl">Members</div>
          </div>
          {userRankEntry && (
            <>
              <div className="detail-stat">
                <div className="detail-stat-val">{userRankEntry.total}</div>
                <div className="detail-stat-lbl">Your Points</div>
              </div>
              <div className="detail-stat">
                <div className="detail-stat-val">{userRankEntry.correct}</div>
                <div className="detail-stat-lbl">Correct Picks</div>
              </div>
            </>
          )}
        </div>

        {/* Leaderboard */}
        <div className="leaderboard-section">
          <h2>Leaderboard</h2>
          {leaderboard.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">📊</span>
              <p>No picks yet. Start making your picks!</p>
            </div>
          ) : (
            <div className="leaderboard-table-wrapper">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>Points</th>
                    <th>Correct</th>
                    <th>Picks Made</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, idx) => {
                    const rank = idx + 1
                    const isCurrentUser = entry.userId === user.uid
                    return (
                      <tr
                        key={entry.userId}
                        className={`lb-row ${isCurrentUser ? 'current-user' : ''} ${rank <= 3 ? 'top-three' : ''}`}
                      >
                        <td className="rank-cell">
                          <span className="rank-display">
                            {rank <= 3 ? getRankIcon(rank) : `#${rank}`}
                          </span>
                        </td>
                        <td className="player-cell">
                          <span className="player-name">
                            {entry.displayName}
                            {isCurrentUser && <span className="you-badge">You</span>}
                          </span>
                        </td>
                        <td className="points-cell">
                          <strong>{entry.total}</strong>
                        </td>
                        <td>{entry.correct}</td>
                        <td className="text-muted">{entry.total_picks}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Scoring note */}
        <div className="scoring-note">
          <p>
            <strong>Note:</strong> Points are calculated when the admin enters actual match results.
            Until then, all players show 0 points.
          </p>
        </div>
      </div>

      <style>{`
        .group-detail-page {
          min-height: 100vh;
          background: var(--bg);
        }

        .back-btn {
          background: transparent;
          border: none;
          color: var(--primary);
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          padding: 0;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .back-btn:hover {
          color: var(--primary-light);
        }

        .group-detail-header {
          margin-bottom: 24px;
        }

        .group-detail-title-row {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }

        .group-detail-name {
          color: var(--primary);
          font-size: 1.8rem;
        }

        .user-rank-badge {
          background: var(--gold);
          color: var(--primary-dark);
          font-weight: 700;
          font-size: 0.85rem;
          padding: 5px 14px;
          border-radius: 100px;
        }

        .invite-section {}

        .invite-code-card {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: white;
          border: 2px solid var(--primary);
          border-radius: var(--radius-lg);
          padding: 12px 20px;
          margin-bottom: 8px;
        }

        .invite-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .invite-code {
          font-family: monospace;
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--primary);
          letter-spacing: 0.15em;
        }

        .copy-btn {
          background: var(--primary);
          color: white;
          border: none;
          padding: 7px 14px;
          border-radius: var(--radius);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .copy-btn:hover {
          background: var(--primary-light);
        }

        .copy-btn.copied {
          background: var(--success);
        }

        .invite-hint {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        /* Stats row */
        .detail-stats-row {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }

        .detail-stat {
          background: white;
          border-radius: var(--radius-lg);
          padding: 16px 24px;
          box-shadow: var(--shadow-sm);
          text-align: center;
          min-width: 100px;
        }

        .detail-stat-val {
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--primary);
          line-height: 1;
          margin-bottom: 4px;
        }

        .detail-stat-lbl {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        /* Leaderboard */
        .leaderboard-section h2 {
          margin-bottom: 16px;
          color: var(--text);
        }

        .leaderboard-table-wrapper {
          background: white;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
        }

        .leaderboard-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }

        .leaderboard-table thead th {
          background: var(--primary);
          color: white;
          padding: 12px 16px;
          text-align: left;
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .leaderboard-table tbody tr {
          border-bottom: 1px solid var(--border-light);
          transition: background 0.15s;
        }

        .leaderboard-table tbody tr:last-child {
          border-bottom: none;
        }

        .leaderboard-table tbody td {
          padding: 12px 16px;
        }

        .lb-row:hover {
          background: #f8fdf8;
        }

        .lb-row.current-user {
          background: #f0f8f0;
          border-left: 3px solid var(--primary);
        }

        .lb-row.current-user:hover {
          background: #e8f5e8;
        }

        .rank-cell {
          width: 60px;
        }

        .rank-display {
          font-size: 1.1rem;
          font-weight: 700;
        }

        .player-cell {
          font-weight: 600;
        }

        .player-name {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .you-badge {
          font-size: 0.68rem;
          font-weight: 700;
          background: var(--primary);
          color: white;
          padding: 1px 6px;
          border-radius: 100px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .points-cell {
          font-size: 1.05rem;
          color: var(--primary);
        }

        .scoring-note {
          background: #fff9e6;
          border: 1px solid #ffe082;
          border-radius: var(--radius);
          padding: 12px 16px;
          margin-top: 20px;
          font-size: 0.82rem;
          color: #7c6000;
        }
      `}</style>
    </div>
  )
}
