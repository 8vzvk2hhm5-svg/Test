import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function AuthPage() {
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  function getErrorMessage(code) {
    switch (code) {
      case 'auth/user-not-found': return 'No account found with this email.'
      case 'auth/wrong-password': return 'Incorrect password.'
      case 'auth/email-already-in-use': return 'An account with this email already exists.'
      case 'auth/weak-password': return 'Password should be at least 6 characters.'
      case 'auth/invalid-email': return 'Please enter a valid email address.'
      case 'auth/too-many-requests': return 'Too many attempts. Please try again later.'
      case 'auth/invalid-credential': return 'Invalid email or password.'
      default: return 'Something went wrong. Please try again.'
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (tab === 'signup' && !displayName.trim()) {
      setError('Please enter your display name.')
      return
    }

    if (!email.trim() || !password) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)
    try {
      if (tab === 'login') {
        await signIn(email, password)
      } else {
        await signUp(email, password, displayName.trim())
      }
      navigate('/home')
    } catch (err) {
      setError(getErrorMessage(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-icon">⚽</div>
          <h1 className="auth-title">World Cup Picks 2026</h1>
          <p className="auth-subtitle">Predict. Compete. Win.</p>
        </div>

        {/* Card */}
        <div className="auth-card">
          {/* Tabs */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
              onClick={() => { setTab('login'); setError('') }}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
              onClick={() => { setTab('signup'); setError('') }}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="error-message">{error}</div>}

            {tab === 'signup' && (
              <div className="form-group">
                <label htmlFor="displayName">Display Name</label>
                <input
                  id="displayName"
                  type="text"
                  placeholder="Your name (shown on leaderboard)"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  maxLength={30}
                  autoComplete="name"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder={tab === 'signup' ? 'At least 6 characters' : 'Your password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full auth-submit-btn"
              disabled={loading}
            >
              {loading
                ? (tab === 'login' ? 'Signing in...' : 'Creating account...')
                : (tab === 'login' ? 'Sign In' : 'Create Account')
              }
            </button>
          </form>

          <div className="auth-switch">
            {tab === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button className="auth-switch-btn" onClick={() => { setTab('signup'); setError('') }}>
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button className="auth-switch-btn" onClick={() => { setTab('login'); setError('') }}>
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="auth-footer">
          🏆 Make your picks for the 2026 FIFA World Cup in USA, Canada & Mexico
        </p>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 50%, var(--primary-light) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
        }

        .auth-container {
          width: 100%;
          max-width: 420px;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .auth-icon {
          font-size: 3.5rem;
          line-height: 1;
          margin-bottom: 12px;
          display: block;
          animation: bounce 2s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .auth-title {
          color: white;
          font-size: 1.8rem;
          font-weight: 800;
          margin-bottom: 6px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .auth-subtitle {
          color: var(--gold);
          font-weight: 600;
          font-size: 1rem;
          letter-spacing: 0.05em;
        }

        .auth-card {
          background: white;
          border-radius: var(--radius-xl);
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          overflow: hidden;
        }

        .auth-tabs {
          display: flex;
          border-bottom: 2px solid var(--border);
        }

        .auth-tab {
          flex: 1;
          padding: 14px;
          font-size: 0.95rem;
          font-weight: 600;
          background: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          margin-bottom: -2px;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
          border-radius: 0;
        }

        .auth-tab:hover {
          color: var(--primary);
          background: #f8fdf8;
        }

        .auth-tab.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
          background: white;
        }

        .auth-form {
          padding: 28px;
        }

        .auth-submit-btn {
          padding: 13px;
          font-size: 1rem;
          margin-top: 4px;
        }

        .auth-switch {
          padding: 0 28px 24px;
          text-align: center;
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .auth-switch-btn {
          background: transparent;
          border: none;
          color: var(--primary);
          font-weight: 600;
          cursor: pointer;
          font-size: 0.875rem;
          padding: 0;
          text-decoration: underline;
        }

        .auth-switch-btn:hover {
          color: var(--primary-light);
        }

        .auth-footer {
          text-align: center;
          color: rgba(255,255,255,0.7);
          font-size: 0.82rem;
          margin-top: 24px;
          line-height: 1.5;
        }
      `}</style>
    </div>
  )
}
