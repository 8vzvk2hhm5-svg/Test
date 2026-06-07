import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase.js'

const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Try to get display name from Firestore if not in auth
        const userRef = doc(db, 'users', firebaseUser.uid)
        const snap = await getDoc(userRef).catch(() => null)
        const userData = snap?.data() || {}
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || userData.displayName || 'Player',
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function signIn(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result.user
  }

  async function signUp(email, password, displayName) {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = result.user

    // Update auth profile
    await updateProfile(firebaseUser, { displayName })

    // Create Firestore user doc
    await setDoc(doc(db, 'users', firebaseUser.uid), {
      uid: firebaseUser.uid,
      email,
      displayName,
      createdAt: serverTimestamp(),
      groups: [],
    })

    return firebaseUser
  }

  async function signOut() {
    await firebaseSignOut(auth)
    setUser(null)
  }

  const value = { user, loading, signIn, signUp, signOut }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
