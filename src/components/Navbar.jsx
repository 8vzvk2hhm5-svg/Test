import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { to: '/home', label: 'Home' },
    { to: '/picks/group-stage', label: 'Group Stage' },
    { to: '/picks/knockout', label: 'Bracket' },
    { to: '/groups', label: 'My Groups' },
  ]

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/login')
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }

  function isActive(path) {
    return location.pathname === path
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/home" className="navbar-brand">
          ⚽ WC Picks 2026
        </Link>

        {/* Desktop nav */}
        <div className="navbar-links">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`navbar-link ${isActive(link.to) ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* User section */}
        <div className="navbar-user">
          {user && (
            <>
              <span className="navbar-username">{user.displayName}</span>
              <button className="btn btn-sm navbar-signout" onClick={handleSignOut}>
                Sign Out
              </button>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className={`navbar-hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="navbar-mobile-menu">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`navbar-mobile-link ${isActive(link.to) ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <>
              <div className="navbar-mobile-divider" />
              <span className="navbar-mobile-user">{user.displayName}</span>
              <button
                className="navbar-mobile-signout"
                onClick={() => { setMenuOpen(false); handleSignOut() }}
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      )}

      <style>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: var(--primary);
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }

        .navbar-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          height: 60px;
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .navbar-brand {
          color: var(--gold);
          font-weight: 800;
          font-size: 1.1rem;
          letter-spacing: 0.02em;
          text-decoration: none;
          flex-shrink: 0;
          transition: opacity 0.2s;
        }

        .navbar-brand:hover {
          opacity: 0.9;
          color: var(--gold);
        }

        .navbar-links {
          display: flex;
          gap: 4px;
          flex: 1;
        }

        .navbar-link {
          color: rgba(255,255,255,0.85);
          text-decoration: none;
          padding: 6px 14px;
          border-radius: var(--radius);
          font-weight: 500;
          font-size: 0.9rem;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .navbar-link:hover {
          color: white;
          background: rgba(255,255,255,0.1);
        }

        .navbar-link.active {
          color: var(--gold);
          background: rgba(255,215,0,0.15);
          font-weight: 600;
        }

        .navbar-user {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-left: auto;
        }

        .navbar-username {
          color: rgba(255,255,255,0.9);
          font-size: 0.85rem;
          font-weight: 500;
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .navbar-signout {
          background: rgba(255,255,255,0.15);
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
          padding: 5px 12px;
          font-size: 0.8rem;
          white-space: nowrap;
        }

        .navbar-signout:hover {
          background: rgba(255,255,255,0.25);
        }

        .navbar-hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 4px;
          margin-left: auto;
        }

        .navbar-hamburger span {
          display: block;
          width: 24px;
          height: 2px;
          background: white;
          border-radius: 2px;
          transition: all 0.3s;
        }

        .navbar-hamburger.open span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }

        .navbar-hamburger.open span:nth-child(2) {
          opacity: 0;
        }

        .navbar-hamburger.open span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }

        .navbar-mobile-menu {
          display: none;
          background: var(--primary-dark);
          padding: 12px 16px 16px;
          flex-direction: column;
          gap: 4px;
        }

        .navbar-mobile-link {
          color: rgba(255,255,255,0.85);
          text-decoration: none;
          padding: 10px 14px;
          border-radius: var(--radius);
          font-weight: 500;
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        .navbar-mobile-link:hover,
        .navbar-mobile-link.active {
          background: rgba(255,255,255,0.1);
          color: var(--gold);
        }

        .navbar-mobile-divider {
          height: 1px;
          background: rgba(255,255,255,0.15);
          margin: 8px 0;
        }

        .navbar-mobile-user {
          color: rgba(255,255,255,0.6);
          font-size: 0.8rem;
          padding: 4px 14px;
        }

        .navbar-mobile-signout {
          background: rgba(255,255,255,0.1);
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
          padding: 10px 14px;
          font-size: 0.9rem;
          border-radius: var(--radius);
          text-align: left;
          cursor: pointer;
          margin-top: 4px;
        }

        .navbar-mobile-signout:hover {
          background: rgba(255,255,255,0.2);
        }

        @media (max-width: 768px) {
          .navbar-links,
          .navbar-user {
            display: none;
          }

          .navbar-hamburger {
            display: flex;
          }

          .navbar-mobile-menu {
            display: flex;
          }
        }
      `}</style>
    </nav>
  )
}
