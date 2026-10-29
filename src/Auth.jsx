
import { useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { auth } from './firebase'
import './index.css'

function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSigningUp) {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email already has an account. Please sign in.')
      } else if (err.code === 'auth/invalid-credential') {
        setError('Incorrect email or password.')
      } else if (err.code === 'auth/weak-password') {
        setError('Please use a stronger password with at least 6 characters.')
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-container">
      <section className="auth-card">
        <div className="auth-logo">F</div>

        <h1>Family Alert</h1>
        <p className="auth-description">
          Stay connected and keep your family close.
        </p>

        <h2>{isSigningUp ? 'Create your account' : 'Welcome back'}</h2>
        <p className="auth-description">
          {isSigningUp
            ? 'Create an account to get started.'
            : 'Sign in to continue to Family Alert.'}
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
            autoComplete={isSigningUp ? 'new-password' : 'current-password'}
            minLength={6}
            required
          />

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading
              ? 'Please wait...'
              : isSigningUp
                ? 'Create account'
                : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch">
          {isSigningUp ? 'Already have an account?' : 'New to Family Alert?'}
          {' '}
          <button
            type="button"
            onClick={() => {
              setIsSigningUp(!isSigningUp)
              setError('')
            }}
          >
            {isSigningUp ? 'Sign in' : 'Create account'}
          </button>
        </p>
      </section>
    </main>
  )
}

export default Auth
