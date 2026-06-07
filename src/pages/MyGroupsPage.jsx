import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase.js'

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export default function MyGroupsPage() {
  const { user } = useAuth()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)

  // Create group
  const [createName, setCreateName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')
  const [newGroupCode, setNewGroupCode] = useState('')

  // Join group
  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState('')
  const [joinSuccess, setJoinSuccess] = useState('')

  useEffect(() => {
    if (!user) return
    loadUserGroups()
  }, [user])

  async function loadUserGroups() {
    setLoading(true)
    try {
      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)
      const userData = userSnap.data() || {}
      const groupIds = userData.groups || []

      if (groupIds.length === 0) {
        setGroups([])
        setLoading(false)
        return
      }

      const groupDocs = await Promise.all(
        groupIds.map(id => getDoc(doc(db, 'groups', id)))
      )

      const loadedGroups = groupDocs
        .filter(d => d.exists())
        .map(d => ({ id: d.id, ...d.data() }))

      setGroups(loadedGroups)
    } catch (err) {
      console.error('Error loading groups:', err)
    }
    setLoading(false)
  }

  async function handleCreateGroup(e) {
    e.preventDefault()
    if (!createName.trim()) {
      setCreateError('Please enter a group name.')
      return
    }

    setCreating(true)
    setCreateError('')
    setCreateSuccess('')
    setNewGroupCode('')

    try {
      // Generate unique code
      let code = generateCode()
      let attempts = 0
      while (attempts < 5) {
        const existing = await getDoc(doc(db, 'groups', code))
        if (!existing.exists()) break
        code = generateCode()
        attempts++
      }

      // Create the group doc
      const groupData = {
        name: createName.trim(),
        code,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        members: [{ userId: user.uid, displayName: user.displayName || 'Player' }],
        memberIds: [user.uid],
        actualResults: { groupResults: {}, knockoutResults: {} },
      }

      await setDoc(doc(db, 'groups', code), groupData)

      // Add group to user's groups list
      await updateDoc(doc(db, 'users', user.uid), {
        groups: arrayUnion(code),
      })

      setNewGroupCode(code)
      setCreateSuccess(`Group "${createName.trim()}" created!`)
      setCreateName('')
      await loadUserGroups()
    } catch (err) {
      console.error('Error creating group:', err)
      setCreateError('Failed to create group. Please try again.')
    }

    setCreating(false)
  }

  async function handleJoinGroup(e) {
    e.preventDefault()
    const code = joinCode.trim().toUpperCase()
    if (!code) {
      setJoinError('Please enter a group code.')
      return
    }
    if (code.length !== 6) {
      setJoinError('Group codes are 6 characters long.')
      return
    }

    setJoining(true)
    setJoinError('')
    setJoinSuccess('')

    try {
      const groupRef = doc(db, 'groups', code)
      const groupSnap = await getDoc(groupRef)

      if (!groupSnap.exists()) {
        setJoinError('No group found with that code. Check and try again.')
        setJoining(false)
        return
      }

      const groupData = groupSnap.data()
      const memberIds = groupData.memberIds || []

      if (memberIds.includes(user.uid)) {
        setJoinError('You are already in this group!')
        setJoining(false)
        return
      }

      // Add user to group
      await updateDoc(groupRef, {
        members: arrayUnion({ userId: user.uid, displayName: user.displayName || 'Player' }),
        memberIds: arrayUnion(user.uid),
      })

      // Add group to user's list
      await updateDoc(doc(db, 'users', user.uid), {
        groups: arrayUnion(code),
      })

      setJoinSuccess(`Joined "${groupData.name}" successfully!`)
      setJoinCode('')
      await loadUserGroups()
    } catch (err) {
      console.error('Error joining group:', err)
      setJoinError('Failed to join group. Please try again.')
    }

    setJoining(false)
  }

  function getUserRank(group) {
    if (!group.members) return null
    const idx = group.members.findIndex(m => m.userId === user.uid)
    return idx >= 0 ? idx + 1 : null
  }

  return (
    <div className="groups-page">
      <Navbar />

      <div className="page-content">
        <div className="groups-header">
          <h1>My Groups</h1>
          <p className="text-muted">Create or join a friend group to compete on the leaderboard</p>
        </div>

        <div className="groups-actions-grid">
          {/* Create group */}
          <div className="card">
            <h2 className="card-title">
              <span>➕</span> Create a Group
            </h2>
            <p className="card-desc">Start a new group and share the code with friends</p>

            {createError && <div className="error-message">{createError}</div>}
            {createSuccess && (
              <div className="success-message">
                {createSuccess}
                {newGroupCode && (
                  <div className="new-code-display">
                    Invite code: <strong className="code-highlight">{newGroupCode}</strong>
                    <button
                      className="copy-btn-inline"
                      onClick={() => navigator.clipboard.writeText(newGroupCode)}
                    >
                      📋 Copy
                    </button>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleCreateGroup}>
              <div className="form-group">
                <label htmlFor="groupName">Group Name</label>
                <input
                  id="groupName"
                  type="text"
                  placeholder="e.g. Office Champions, Friend League..."
                  value={createName}
                  onChange={e => setCreateName(e.target.value)}
                  maxLength={40}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create Group'}
              </button>
            </form>
          </div>

          {/* Join group */}
          <div className="card">
            <h2 className="card-title">
              <span>🔗</span> Join a Group
            </h2>
            <p className="card-desc">Enter a 6-character code to join a friend's group</p>

            {joinError && <div className="error-message">{joinError}</div>}
            {joinSuccess && <div className="success-message">{joinSuccess}</div>}

            <form onSubmit={handleJoinGroup}>
              <div className="form-group">
                <label htmlFor="joinCode">Group Code</label>
                <input
                  id="joinCode"
                  type="text"
                  placeholder="e.g. AB3XYZ"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="code-input"
                />
              </div>
              <button
                type="submit"
                className="btn btn-outline w-full"
                disabled={joining}
              >
                {joining ? 'Joining...' : 'Join Group'}
              </button>
            </form>
          </div>
        </div>

        {/* User's groups list */}
        <div className="my-groups-section">
          <h2>Your Groups</h2>

          {loading ? (
            <div className="flex-center" style={{ padding: 40 }}>
              <div className="loading-spinner" />
            </div>
          ) : groups.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">👥</span>
              <h3>No groups yet</h3>
              <p>Create one or join a friend's group to get started!</p>
            </div>
          ) : (
            <div className="groups-list">
              {groups.map(group => {
                const memberCount = group.members?.length || 0
                const rank = getUserRank(group)
                return (
                  <Link
                    key={group.id}
                    to={`/groups/${group.id}`}
                    className="group-card"
                  >
                    <div className="group-card-main">
                      <div className="group-card-header">
                        <h3 className="group-card-name">{group.name}</h3>
                        <span className="group-code-badge">{group.code || group.id}</span>
                      </div>
                      <div className="group-card-meta">
                        <span className="group-meta-item">
                          👥 {memberCount} member{memberCount !== 1 ? 's' : ''}
                        </span>
                        {rank && (
                          <span className="group-meta-item group-rank">
                            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`} Your rank
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="group-card-arrow">→</div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .groups-page {
          min-height: 100vh;
          background: var(--bg);
        }

        .groups-header {
          margin-bottom: 24px;
        }

        .groups-header h1 {
          color: var(--primary);
          margin-bottom: 4px;
        }

        .groups-actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 32px;
        }

        .card-title {
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }

        .card-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 16px;
        }

        .new-code-display {
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          font-size: 0.85rem;
        }

        .code-highlight {
          font-size: 1.3rem;
          letter-spacing: 0.1em;
          color: var(--primary-dark);
          font-family: monospace;
        }

        .copy-btn-inline {
          background: var(--primary);
          color: white;
          border: none;
          padding: 4px 10px;
          border-radius: var(--radius);
          font-size: 0.75rem;
          cursor: pointer;
        }

        .copy-btn-inline:hover {
          background: var(--primary-light);
        }

        .code-input {
          font-family: monospace;
          font-size: 1.1rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .my-groups-section h2 {
          margin-bottom: 16px;
          color: var(--text);
        }

        .groups-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .group-card {
          background: white;
          border-radius: var(--radius-lg);
          padding: 18px 20px;
          box-shadow: var(--shadow-sm);
          border: 1.5px solid transparent;
          text-decoration: none;
          color: inherit;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.2s;
        }

        .group-card:hover {
          border-color: var(--primary);
          box-shadow: var(--shadow);
          transform: translateX(2px);
        }

        .group-card-main {
          flex: 1;
        }

        .group-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 6px;
        }

        .group-card-name {
          font-size: 1.05rem;
          color: var(--text);
        }

        .group-code-badge {
          background: #e8f5e9;
          color: var(--primary);
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 100px;
          font-family: monospace;
          letter-spacing: 0.05em;
        }

        .group-card-meta {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .group-meta-item {
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .group-rank {
          color: var(--primary);
          font-weight: 600;
        }

        .group-card-arrow {
          font-size: 1.2rem;
          color: var(--text-muted);
          transition: transform 0.2s;
        }

        .group-card:hover .group-card-arrow {
          transform: translateX(4px);
          color: var(--primary);
        }

        @media (max-width: 768px) {
          .groups-actions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
