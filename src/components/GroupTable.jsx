import React from 'react'
import { TEAMS } from '../data/worldCup2026.js'

export default function GroupTable({ standings }) {
  if (!standings || standings.length === 0) {
    return (
      <div className="group-table-empty">
        <p>No standings yet. Make your picks!</p>
      </div>
    )
  }

  return (
    <div className="group-table-container">
      <table className="group-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Team</th>
            <th title="Matches Played">MP</th>
            <th title="Wins">W</th>
            <th title="Draws">D</th>
            <th title="Losses">L</th>
            <th title="Goal Difference">GD</th>
            <th title="Points">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row, idx) => {
            const team = TEAMS[row.teamId]
            if (!team) return null

            let rowClass = 'standings-row'
            let qualifier = null
            if (idx === 0 || idx === 1) {
              rowClass += ' advance'
              qualifier = 'advance'
            } else if (idx === 2) {
              rowClass += ' wildcard'
              qualifier = 'wildcard'
            } else {
              rowClass += ' eliminated'
            }

            return (
              <tr key={row.teamId} className={rowClass}>
                <td className="pos-cell">
                  <div className="pos-wrapper">
                    {qualifier === 'advance' && <div className="qualifier-bar green" />}
                    {qualifier === 'wildcard' && <div className="qualifier-bar gold" />}
                    {!qualifier && <div className="qualifier-bar gray" />}
                    <span>{idx + 1}</span>
                  </div>
                </td>
                <td className="team-cell">
                  <span className="team-flag-sm">{team.flag}</span>
                  <span className="team-name-sm">{team.name}</span>
                </td>
                <td>{row.played}</td>
                <td>{row.w}</td>
                <td>{row.d}</td>
                <td>{row.l}</td>
                <td className={row.gd > 0 ? 'positive' : row.gd < 0 ? 'negative' : ''}>
                  {row.gd > 0 ? `+${row.gd}` : row.gd}
                </td>
                <td className="pts-cell">{row.points}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="standings-legend">
        <span className="legend-item"><span className="legend-dot green" /> Advance</span>
        <span className="legend-item"><span className="legend-dot gold" /> Wildcard spot</span>
      </div>

      <style>{`
        .group-table-empty {
          text-align: center;
          padding: 20px;
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        .group-table-container {
          border-radius: var(--radius);
          overflow: hidden;
          border: 1px solid var(--border);
        }

        .group-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.82rem;
        }

        .group-table thead th {
          background: var(--primary);
          color: white;
          padding: 8px 10px;
          text-align: center;
          font-weight: 700;
          font-size: 0.75rem;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .group-table thead th:first-child,
        .group-table thead th:nth-child(2) {
          text-align: left;
        }

        .group-table tbody tr {
          border-bottom: 1px solid var(--border-light);
          transition: background 0.15s;
        }

        .group-table tbody tr:last-child {
          border-bottom: none;
        }

        .group-table tbody td {
          padding: 8px 10px;
          text-align: center;
        }

        .group-table tbody td:first-child,
        .group-table tbody td:nth-child(2) {
          text-align: left;
        }

        .standings-row.advance {
          background: #f1f8f1;
        }

        .standings-row.advance:hover {
          background: #e8f5e9;
        }

        .standings-row.wildcard {
          background: #fffde7;
        }

        .standings-row.wildcard:hover {
          background: #fff9c4;
        }

        .standings-row.eliminated:hover {
          background: #fafafa;
        }

        .pos-cell {
          width: 36px;
        }

        .pos-wrapper {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .qualifier-bar {
          width: 3px;
          height: 20px;
          border-radius: 2px;
          flex-shrink: 0;
        }

        .qualifier-bar.green { background: var(--primary); }
        .qualifier-bar.gold { background: var(--gold); }
        .qualifier-bar.gray { background: var(--border); }

        .team-cell {
          display: flex !important;
          align-items: center;
          gap: 8px;
          min-width: 140px;
        }

        .team-flag-sm {
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .team-name-sm {
          font-weight: 600;
          color: var(--text);
          font-size: 0.82rem;
        }

        .pts-cell {
          font-weight: 700;
          color: var(--primary);
        }

        .positive { color: var(--success); font-weight: 600; }
        .negative { color: var(--error); font-weight: 600; }

        .standings-legend {
          display: flex;
          gap: 16px;
          padding: 8px 12px;
          background: #fafafa;
          border-top: 1px solid var(--border-light);
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 2px;
          flex-shrink: 0;
        }

        .legend-dot.green { background: var(--primary); }
        .legend-dot.gold { background: var(--gold); }
      `}</style>
    </div>
  )
}
