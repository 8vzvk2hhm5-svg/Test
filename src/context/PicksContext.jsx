import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '../firebase.js'
import { useAuth } from './AuthContext.jsx'
import {
  calculateGroupStandings,
  determineAdvancers,
  buildKnockoutBracket,
  propagateKnockoutBracket,
} from '../utils/algorithm.js'
import { GROUPS } from '../data/worldCup2026.js'

const PicksContext = createContext(null)

const LS_KEY = 'wcp2026_picks'
const LS_KO_KEY = 'wcp2026_ko_picks'

export function usePicks() {
  const ctx = useContext(PicksContext)
  if (!ctx) throw new Error('usePicks must be used inside PicksProvider')
  return ctx
}

export function PicksProvider({ children }) {
  const { user } = useAuth()
  const [userPicks, setUserPicks] = useState({})
  const [knockoutPicks, setKnockoutPicks] = useState({})
  const [loadingPicks, setLoadingPicks] = useState(true)
  const saveTimerRef = useRef(null)
  const saveKoTimerRef = useRef(null)

  // Load picks from Firestore or localStorage
  useEffect(() => {
    if (!user) {
      // Load from localStorage for unauthenticated state
      try {
        const stored = localStorage.getItem(LS_KEY)
        if (stored) setUserPicks(JSON.parse(stored))
        const storedKo = localStorage.getItem(LS_KO_KEY)
        if (storedKo) setKnockoutPicks(JSON.parse(storedKo))
      } catch {
        // ignore parse errors
      }
      setLoadingPicks(false)
      return
    }

    async function loadPicks() {
      setLoadingPicks(true)
      try {
        const picksRef = doc(db, 'users', user.uid, 'picks', 'group')
        const snap = await getDoc(picksRef)
        if (snap.exists()) {
          const data = snap.data()
          setUserPicks(data.picks || {})
          // Also sync to localStorage
          localStorage.setItem(LS_KEY, JSON.stringify(data.picks || {}))
        } else {
          // Fall back to localStorage
          const stored = localStorage.getItem(LS_KEY)
          if (stored) {
            const parsed = JSON.parse(stored)
            setUserPicks(parsed)
          }
        }

        const koRef = doc(db, 'users', user.uid, 'picks', 'knockout')
        const koSnap = await getDoc(koRef)
        if (koSnap.exists()) {
          const data = koSnap.data()
          setKnockoutPicks(data.picks || {})
          localStorage.setItem(LS_KO_KEY, JSON.stringify(data.picks || {}))
        } else {
          const storedKo = localStorage.getItem(LS_KO_KEY)
          if (storedKo) {
            setKnockoutPicks(JSON.parse(storedKo))
          }
        }
      } catch (err) {
        console.error('Error loading picks:', err)
        // Fall back to localStorage
        try {
          const stored = localStorage.getItem(LS_KEY)
          if (stored) setUserPicks(JSON.parse(stored))
          const storedKo = localStorage.getItem(LS_KO_KEY)
          if (storedKo) setKnockoutPicks(JSON.parse(storedKo))
        } catch {
          // ignore
        }
      }
      setLoadingPicks(false)
    }

    loadPicks()
  }, [user])

  // Debounced save to Firestore
  const saveToFirestore = useCallback((picks, type) => {
    if (!user) return
    const timerRef = type === 'group' ? saveTimerRef : saveKoTimerRef
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      try {
        const ref = doc(db, 'users', user.uid, 'picks', type)
        await setDoc(ref, { picks, updatedAt: new Date().toISOString() }, { merge: true })
      } catch (err) {
        console.error('Error saving picks:', err)
      }
    }, 500)
  }, [user])

  function setPick(matchId, value) {
    setUserPicks(prev => {
      const next = { ...prev, [matchId]: value }
      localStorage.setItem(LS_KEY, JSON.stringify(next))
      saveToFirestore(next, 'group')
      return next
    })
  }

  function setKnockoutPick(matchId, teamId) {
    setKnockoutPicks(prev => {
      const next = { ...prev, [matchId]: teamId }
      localStorage.setItem(LS_KO_KEY, JSON.stringify(next))
      saveToFirestore(next, 'knockout')
      return next
    })
  }

  // Compute group standings
  const groupStandings = {}
  Object.keys(GROUPS).forEach(groupId => {
    groupStandings[groupId] = calculateGroupStandings(groupId, userPicks)
  })

  // Compute advancers
  const advancers = determineAdvancers(userPicks)

  // Build knockout bracket
  const baseBracket = buildKnockoutBracket(
    advancers.firstPlace,
    advancers.secondPlace,
    advancers.thirdPlaceTeams
  )

  // Propagate knockout picks
  const knockoutBracket = propagateKnockoutBracket(baseBracket, knockoutPicks)

  // Count picks
  const pickedCount = Object.keys(userPicks).length

  const value = {
    userPicks,
    knockoutPicks,
    setPick,
    setKnockoutPick,
    loadingPicks,
    groupStandings,
    knockoutBracket,
    advancers,
    pickedCount,
  }

  return (
    <PicksContext.Provider value={value}>
      {children}
    </PicksContext.Provider>
  )
}
