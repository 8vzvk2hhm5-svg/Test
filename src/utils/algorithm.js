import { GROUPS, GROUP_MATCHES, TEAMS, KNOCKOUT_TEMPLATE, SCORING } from '../data/worldCup2026.js'

/**
 * Calculate group standings from picks
 * picks = { 'A1': 'home'|'draw'|'away', ... }
 * Returns sorted array of standings for the group
 */
export function calculateGroupStandings(groupId, picks) {
  const group = GROUPS[groupId]
  if (!group) return []

  const groupMatches = GROUP_MATCHES.filter(m => m.group === groupId)

  // Initialize standings
  const standings = {}
  group.teams.forEach(teamId => {
    standings[teamId] = {
      teamId,
      played: 0,
      w: 0,
      d: 0,
      l: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      points: 0,
    }
  })

  // Process each match
  groupMatches.forEach(match => {
    const pick = picks[match.id]
    if (!pick) return

    const home = standings[match.home]
    const away = standings[match.away]
    if (!home || !away) return

    home.played++
    away.played++

    if (pick === 'home') {
      // Home wins 2-0
      home.w++
      home.gf += 2
      home.ga += 0
      home.points += 3
      away.l++
      away.gf += 0
      away.ga += 2
    } else if (pick === 'away') {
      // Away wins 0-2
      away.w++
      away.gf += 2
      away.ga += 0
      away.points += 3
      home.l++
      home.gf += 0
      home.ga += 2
    } else if (pick === 'draw') {
      // Draw 1-1
      home.d++
      home.gf += 1
      home.ga += 1
      home.points += 1
      away.d++
      away.gf += 1
      away.ga += 1
      away.points += 1
    }
  })

  // Compute GD
  Object.values(standings).forEach(s => {
    s.gd = s.gf - s.ga
  })

  // Sort by points DESC, GD DESC, GF DESC, name ASC
  return Object.values(standings).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.gd !== a.gd) return b.gd - a.gd
    if (b.gf !== a.gf) return b.gf - a.gf
    return TEAMS[a.teamId].name.localeCompare(TEAMS[b.teamId].name)
  })
}

/**
 * Determine all group stage advancers
 * allGroupPicks = { 'A1': 'home', 'A2': 'draw', ... }
 * Returns { firstPlace, secondPlace, thirdPlaceTeams }
 */
export function determineAdvancers(allGroupPicks) {
  const firstPlace = {}
  const secondPlace = {}
  const thirdPlaceTeams = []

  Object.keys(GROUPS).forEach(groupId => {
    const standings = calculateGroupStandings(groupId, allGroupPicks)
    if (standings.length >= 1 && standings[0]) {
      firstPlace[groupId] = standings[0].teamId
    }
    if (standings.length >= 2 && standings[1]) {
      secondPlace[groupId] = standings[1].teamId
    }
    if (standings.length >= 3 && standings[2]) {
      thirdPlaceTeams.push({
        ...standings[2],
        group: groupId,
      })
    }
  })

  // Sort third-place teams by points DESC, GD DESC, GF DESC
  thirdPlaceTeams.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.gd !== a.gd) return b.gd - a.gd
    if (b.gf !== a.gf) return b.gf - a.gf
    return a.group.localeCompare(b.group)
  })

  // Take top 8 wildcards
  const wildcards = thirdPlaceTeams.slice(0, 8)

  return { firstPlace, secondPlace, thirdPlaceTeams: wildcards }
}

/**
 * Build the R32 knockout bracket based on group stage results
 * Returns an array of R32 match objects with home/away filled in
 */
export function buildKnockoutBracket(firstPlace, secondPlace, wildcards) {
  // wildcards is sorted array of third-place teams, top 8 qualify
  // Simple indexing for wildcard slots
  const wc = wildcards.map(t => t.teamId)

  const r32Matches = [
    // Match 1: 1A vs best 3rd (from groups E/F/G/H)
    { id: 'R32_1', home: firstPlace['A'] || null, away: wc[0] || null },
    // Match 2: 2D vs 2E
    { id: 'R32_2', home: secondPlace['D'] || null, away: secondPlace['E'] || null },
    // Match 3: 1B vs 3rd (from groups A/C/D)
    { id: 'R32_3', home: firstPlace['B'] || null, away: wc[1] || null },
    // Match 4: 2F vs 2G
    { id: 'R32_4', home: secondPlace['F'] || null, away: secondPlace['G'] || null },
    // Match 5: 1C vs 3rd (from groups A/B/D)
    { id: 'R32_5', home: firstPlace['C'] || null, away: wc[2] || null },
    // Match 6: 2H vs 2I
    { id: 'R32_6', home: secondPlace['H'] || null, away: secondPlace['I'] || null },
    // Match 7: 1D vs 3rd (from groups B/C/E)
    { id: 'R32_7', home: firstPlace['D'] || null, away: wc[3] || null },
    // Match 8: 2J vs 2K
    { id: 'R32_8', home: secondPlace['J'] || null, away: secondPlace['K'] || null },
    // Match 9: 1E vs 3rd (from groups G/H/I)
    { id: 'R32_9', home: firstPlace['E'] || null, away: wc[4] || null },
    // Match 10: 2L vs 2A
    { id: 'R32_10', home: secondPlace['L'] || null, away: secondPlace['A'] || null },
    // Match 11: 1F vs 3rd (from groups J/K/L)
    { id: 'R32_11', home: firstPlace['F'] || null, away: wc[5] || null },
    // Match 12: 2B vs 2C
    { id: 'R32_12', home: secondPlace['B'] || null, away: secondPlace['C'] || null },
    // Match 13: 1G vs 3rd (from groups A/B/F)
    { id: 'R32_13', home: firstPlace['G'] || null, away: wc[6] || null },
    // Match 14: 1J vs 1K
    { id: 'R32_14', home: firstPlace['J'] || null, away: firstPlace['K'] || null },
    // Match 15: 1H vs 2I
    { id: 'R32_15', home: firstPlace['H'] || null, away: secondPlace['I'] || null },
    // Match 16: 1I vs 1L
    { id: 'R32_16', home: firstPlace['I'] || null, away: firstPlace['L'] || null },
  ]

  // Merge with template for date/venue/etc info
  return KNOCKOUT_TEMPLATE.map(template => {
    const r32Match = r32Matches.find(m => m.id === template.id)
    if (r32Match) {
      return { ...template, home: r32Match.home, away: r32Match.away }
    }
    return template
  })
}

/**
 * Propagate knockout picks forward through the bracket
 * userPicks = { 'R32_1': 'MEX', 'R32_2': 'USA', ... }
 * knockoutBracket = current bracket with home/away filled from group stage
 * Returns updated bracket with R16, QF, SF, Final teams filled
 */
export function propagateKnockoutBracket(initialBracket, userKnockoutPicks) {
  const bracket = initialBracket.map(m => ({ ...m }))

  // R16 depends on R32 picks
  const r32ById = {}
  bracket.filter(m => m.round === 'r32').forEach(m => {
    r32ById[m.id] = m
  })

  // Map R32 winners to R16 slots
  const r32ToR16 = {
    R32_1: { matchId: 'R16_1', slot: 'home' },
    R32_2: { matchId: 'R16_1', slot: 'away' },
    R32_3: { matchId: 'R16_2', slot: 'home' },
    R32_4: { matchId: 'R16_2', slot: 'away' },
    R32_5: { matchId: 'R16_3', slot: 'home' },
    R32_6: { matchId: 'R16_3', slot: 'away' },
    R32_7: { matchId: 'R16_4', slot: 'home' },
    R32_8: { matchId: 'R16_4', slot: 'away' },
    R32_9: { matchId: 'R16_5', slot: 'home' },
    R32_10: { matchId: 'R16_5', slot: 'away' },
    R32_11: { matchId: 'R16_6', slot: 'home' },
    R32_12: { matchId: 'R16_6', slot: 'away' },
    R32_13: { matchId: 'R16_7', slot: 'home' },
    R32_14: { matchId: 'R16_7', slot: 'away' },
    R32_15: { matchId: 'R16_8', slot: 'home' },
    R32_16: { matchId: 'R16_8', slot: 'away' },
  }

  const r16ToQF = {
    R16_1: { matchId: 'QF_1', slot: 'home' },
    R16_2: { matchId: 'QF_1', slot: 'away' },
    R16_3: { matchId: 'QF_2', slot: 'home' },
    R16_4: { matchId: 'QF_2', slot: 'away' },
    R16_5: { matchId: 'QF_3', slot: 'home' },
    R16_6: { matchId: 'QF_3', slot: 'away' },
    R16_7: { matchId: 'QF_4', slot: 'home' },
    R16_8: { matchId: 'QF_4', slot: 'away' },
  }

  const qfToSF = {
    QF_1: { matchId: 'SF_1', slot: 'home' },
    QF_2: { matchId: 'SF_1', slot: 'away' },
    QF_3: { matchId: 'SF_2', slot: 'home' },
    QF_4: { matchId: 'SF_2', slot: 'away' },
  }

  const sfToFinal = {
    SF_1: { matchId: 'FINAL', slot: 'home' },
    SF_2: { matchId: 'FINAL', slot: 'away' },
  }

  function getWinner(match, picks) {
    const pick = picks[match.id]
    if (!pick) return null
    if (pick === match.home) return match.home
    if (pick === match.away) return match.away
    return null
  }

  function fillSlot(fromMatchId, mapping, bracket, picks) {
    const target = mapping[fromMatchId]
    if (!target) return
    const fromMatch = bracket.find(m => m.id === fromMatchId)
    if (!fromMatch) return
    const winner = getWinner(fromMatch, picks)
    const targetMatch = bracket.find(m => m.id === target.matchId)
    if (targetMatch && winner) {
      targetMatch[target.slot] = winner
    }
  }

  // Fill R16
  Object.keys(r32ToR16).forEach(r32Id => {
    fillSlot(r32Id, r32ToR16, bracket, userKnockoutPicks)
  })

  // Fill QF
  Object.keys(r16ToQF).forEach(r16Id => {
    fillSlot(r16Id, r16ToQF, bracket, userKnockoutPicks)
  })

  // Fill SF
  Object.keys(qfToSF).forEach(qfId => {
    fillSlot(qfId, qfToSF, bracket, userKnockoutPicks)
  })

  // Fill Final
  Object.keys(sfToFinal).forEach(sfId => {
    fillSlot(sfId, sfToFinal, bracket, userKnockoutPicks)
  })

  return bracket
}

/**
 * Calculate score for a user's picks vs actual results
 * userPicks = { groupPicks: {...}, knockoutPicks: {...} }
 * actualResults = { groupResults: {...}, knockoutResults: {...} }
 */
export function calculateScore(userPicks, actualResults) {
  if (!userPicks || !actualResults) return { total: 0, byRound: {} }

  const byRound = { group: 0, r32: 0, r16: 0, qf: 0, sf: 0, final: 0 }
  const { groupPicks = {}, knockoutPicks = {} } = userPicks
  const { groupResults = {}, knockoutResults = {} } = actualResults

  // Group stage scoring
  Object.keys(groupPicks).forEach(matchId => {
    if (groupResults[matchId] && groupPicks[matchId] === groupResults[matchId]) {
      byRound.group += SCORING.group
    }
  })

  // Knockout scoring
  Object.keys(knockoutPicks).forEach(matchId => {
    const result = knockoutResults[matchId]
    if (!result) return
    if (knockoutPicks[matchId] === result) {
      const roundKey = matchId.toLowerCase().startsWith('r32') ? 'r32'
        : matchId.toLowerCase().startsWith('r16') ? 'r16'
        : matchId.toLowerCase().startsWith('qf') ? 'qf'
        : matchId.toLowerCase().startsWith('sf') ? 'sf'
        : matchId.toLowerCase().startsWith('final') ? 'final'
        : null
      if (roundKey && SCORING[roundKey] !== undefined) {
        byRound[roundKey] += SCORING[roundKey]
      }
    }
  })

  const total = Object.values(byRound).reduce((sum, v) => sum + v, 0)
  return { total, byRound }
}

/**
 * Compute leaderboard for a group of members
 * members = [{ userId, displayName }]
 * allPicks = { userId: { groupPicks, knockoutPicks } }
 * actualResults = { groupResults, knockoutResults }
 */
export function computeLeaderboard(members, allPicks, actualResults) {
  return members
    .map(member => {
      const picks = allPicks[member.userId] || {}
      const scoreData = calculateScore(picks, actualResults)
      const groupPicks = picks.groupPicks || {}
      const knockoutPicks = picks.knockoutPicks || {}
      const totalPicks = Object.keys(groupPicks).length + Object.keys(knockoutPicks).length

      // Count correct picks
      const { groupResults = {}, knockoutResults = {} } = actualResults || {}
      let correct = 0
      Object.keys(groupPicks).forEach(id => {
        if (groupResults[id] && groupPicks[id] === groupResults[id]) correct++
      })
      Object.keys(knockoutPicks).forEach(id => {
        if (knockoutResults[id] && knockoutPicks[id] === knockoutResults[id]) correct++
      })

      return {
        userId: member.userId,
        displayName: member.displayName || 'Anonymous',
        total: scoreData.total,
        correct,
        total_picks: totalPicks,
      }
    })
    .sort((a, b) => b.total - a.total || b.correct - a.correct)
}
