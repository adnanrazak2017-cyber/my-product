
import { useState, useEffect, useRef } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { ref, set, get, onValue } from 'firebase/database'
import { auth, database } from './firebase'
import Auth from './Auth'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './index.css'

function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRadians = (value) => (value * Math.PI) / 180
  const earthRadius = 3958.8
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2

  const safeA = Math.min(1, Math.max(0, a))

  return (
    earthRadius *
    2 *
    Math.atan2(Math.sqrt(safeA), Math.sqrt(1 - safeA))
  )
}

function createInviteCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

const demoLocations = {
  demoMe: {
    latitude: 40.7128,
    longitude: -74.006,
    email: 'You (Demo)',
    updatedAt: Date.now(),
  },
  demoFamily: {
    latitude: 40.8208,
    longitude: -74.006,
    email: 'Family member (Demo)',
    updatedAt: Date.now(),
  },
}

function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [familyId, setFamilyId] = useState('')
  const [familyRole, setFamilyRole] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [locations, setLocations] = useState({})
  const [myPosition, setMyPosition] = useState(null)
  const [sharing, setSharing] = useState(false)
  const [distanceLimit, setDistanceLimit] = useState(5)
  const [status, setStatus] = useState('')
  const [demoMode, setDemoMode] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  const previousBreaches = useRef(new Set())

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setAuthLoading(false)
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    if (!user) {
      setFamilyId('')
      setFamilyRole('')
      setInviteCode('')
      setLocations({})
      setMyPosition(null)
      setSharing(false)
      return
    }

    setFamilyId(localStorage.getItem('familyId_' + user.uid) || '')
    setFamilyRole(localStorage.getItem('familyRole_' + user.uid) || '')
    setInviteCode(localStorage.getItem('inviteCode_' + user.uid) || '')
  }, [user])

  useEffect(() => {
    if (!user || !familyId || demoMode) {
      if (demoMode) {
        setLocations(demoLocations)
      }
      return
    }

    const locationsRef = ref(
      database,
      'families/' + familyId + '/locations'
    )

    const unsubscribe = onValue(
      locationsRef,
      (snapshot) => {
        setLocations(snapshot.val() || {})
      },
      (error) => {
        setStatus('Unable to load locations: ' + error.message)
      }
    )

    return unsubscribe
  }, [user, familyId, demoMode])

  useEffect(() => {
    if (demoMode) {
      setSharing(false)

      setMyPosition({
        latitude: demoLocations.demoMe.latitude,
        longitude: demoLocations.demoMe.longitude,
      })

      setLocations(demoLocations)

      setStatus(
        'Demo mode is on. Sample locations are being used; no real location is shared.'
      )

      return
    }

    setMyPosition(null)
    setLocations({})
    setStatus('')
    previousBreaches.current = new Set()
  }, [demoMode])

  useEffect(() => {
    if (demoMode || !sharing || !user || !familyId) {
      return
    }

    if (!navigator.geolocation) {
      setStatus('Your browser does not support location sharing.')
      setSharing(false)
      return
    }

    setStatus('Waiting for location permission...')

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude

        setMyPosition({ latitude, longitude })

        try {
          await set(
            ref(
              database,
              'families/' + familyId + '/locations/' + user.uid
            ),
            {
              latitude,
              longitude,
              email: user.email || '',
              updatedAt: Date.now(),
            }
          )

          setStatus('Your location is being shared.')
        } catch (error) {
          setStatus('Location sharing error: ' + error.message)
        }
      },
      (error) => {
        setStatus('Location permission error: ' + error.message)
        setSharing(false)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 15000,
      }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [sharing, user, familyId, demoMode])

  async function enableNotifications() {
    if (!('Notification' in window)) {
      setStatus('This browser does not support notifications.')
      return
    }

    try {
      const permission = await Notification.requestPermission()

      if (permission === 'granted') {
        setNotificationsEnabled(true)

        setStatus(
          'Notifications enabled. You will be alerted when a family member is beyond the distance limit.'
        )
      } else {
        setNotificationsEnabled(false)

        setStatus(
          'Notifications were not allowed. Check your browser or system notification settings.'
        )
      }
    } catch (error) {
      setStatus('Could not enable notifications: ' + error.message)
    }
  }

  useEffect(() => {
    if (
      !notificationsEnabled ||
      !('Notification' in window) ||
      Notification.permission !== 'granted'
    ) {
      return
    }

    const activeLocations = demoMode ? demoLocations : locations

    const currentPosition = demoMode
      ? demoLocations.demoMe
      : myPosition

    if (!currentPosition) {
      return
    }

    const currentBreaches = new Set()

    Object.entries(activeLocations).forEach(([uid, location]) => {
      const ownId = demoMode ? 'demoMe' : user && user.uid

      if (uid === ownId) {
        return
      }

      if (
        typeof location.latitude !== 'number' ||
        typeof location.longitude !== 'number'
      ) {
        return
      }

      const distance = calculateDistance(
        currentPosition.latitude,
        currentPosition.longitude,
        location.latitude,
        location.longitude
      )

      if (distance > distanceLimit) {
        const breachKey = uid + '-' + distanceLimit

        currentBreaches.add(breachKey)

        if (!previousBreaches.current.has(breachKey)) {
          new Notification('Family Alert: Distance Limit Exceeded', {
            body:
              (location.email || 'A family member') +
              ' is ' +
              distance.toFixed(2) +
              ' miles away. Your limit is ' +
              distanceLimit +
              ' miles.',
          })
        }
      }
    })

    previousBreaches.current = currentBreaches
  }, [
    notificationsEnabled,
    demoMode,
    locations,
    myPosition,
    distanceLimit,
    user,
  ])

  async function createFamily() {
    if (!user) {
      return
    }

    try {
      const newFamilyId = user.uid

      await set(
        ref(
          database,
          'families/' + newFamilyId + '/members/' + user.uid
        ),
        {
          role: 'owner',
          email: user.email || '',
          joinedAt: Date.now(),
        }
      )

      localStorage.setItem('familyId_' + user.uid, newFamilyId)
      localStorage.setItem('familyRole_' + user.uid, 'owner')

      setFamilyId(newFamilyId)
      setFamilyRole('owner')

      setStatus(
        'Family group created. Generate an invitation code next.'
      )
    } catch (error) {
      setStatus('Could not create family: ' + error.message)
    }
  }

  async function generateInvitation() {
    if (!user || !familyId || familyRole !== 'owner') {
      setStatus('Only the family owner can generate an invitation.')
      return
    }

    try {
      const code = createInviteCode()

      await set(ref(database, 'invitations/' + code), {
        familyId,
        active: true,
        createdAt: Date.now(),
      })

      localStorage.setItem('inviteCode_' + user.uid, code)

      setInviteCode(code)
      setStatus('Invitation code created successfully.')
    } catch (error) {
      setStatus('Could not create invitation: ' + error.message)
    }
  }

  async function joinFamily() {
    if (!user || !joinCode.trim()) {
      setStatus('Please enter an invitation code.')
      return
    }

    const code = joinCode.trim().toUpperCase()

    try {
      const invitationSnapshot = await get(
        ref(database, 'invitations/' + code)
      )

      if (!invitationSnapshot.exists()) {
        setStatus('Invitation code not found.')
        return
      }

      const invitation = invitationSnapshot.val()

      if (invitation.active !== true) {
        setStatus('This invitation is no longer active.')
        return
      }

      const newFamilyId = invitation.familyId

      await set(
        ref(
          database,
          'families/' + newFamilyId + '/members/' + user.uid
        ),
        {
          role: 'member',
          email: user.email || '',
          inviteCode: code,
          joinedAt: Date.now(),
        }
      )

      localStorage.setItem('familyId_' + user.uid, newFamilyId)
      localStorage.setItem('familyRole_' + user.uid, 'member')

      setFamilyId(newFamilyId)
      setFamilyRole('member')

      setStatus('You have joined the family group!')
    } catch (error) {
      setStatus('Could not join family: ' + error.message)
    }
  }

  function stopSharing() {
    setSharing(false)
    setStatus('Location sharing stopped.')
  }

  async function handleSignOut() {
    setSharing(false)
    await signOut(auth)
  }

  if (authLoading) {
    return <p>Loading Family Alert...</p>
  }

  if (!user) {
    return <Auth />
  }

  const activeLocations = demoMode ? demoLocations : locations
  const familyLocations = Object.entries(activeLocations)

  const currentPosition = demoMode
    ? {
        latitude: demoLocations.demoMe.latitude,
        longitude: demoLocations.demoMe.longitude,
      }
    : myPosition

  return (
    <main
      style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '24px',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1>Family Alert</h1>
          <p>Stay connected and keep your family close.</p>
        </div>

        <button onClick={handleSignOut}>Sign out</button>
      </header>

      <section
        style={{
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '12px',
          marginTop: '20px',
        }}
      >
        <h2>Notifications</h2>

        <p>
          Allow browser notifications to receive an alert when a family
          member is beyond your distance limit.
        </p>

        <button onClick={enableNotifications}>
          {notificationsEnabled
            ? 'Notifications Enabled'
            : 'Enable Notifications'}
        </button>
      </section>

      <section
        style={{
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '12px',
          marginTop: '20px',
        }}
      >
        <h2>Demo Mode</h2>

        <p>
          Try the distance alert with sample locations without travelling
          or sharing your real location.
        </p>

        <button onClick={() => setDemoMode((current) => !current)}>
          {demoMode ? 'Turn Demo Mode Off' : 'Try Demo Mode'}
        </button>

        {demoMode && (
          <p style={{ marginTop: '12px' }}>
            Demo is active: the sample family member is about 7.5 miles
            away. These are sample locations only.
          </p>
        )}
      </section>

      {!demoMode && (
        <section
          style={{
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '12px',
            marginTop: '20px',
          }}
        >
          <h2>Family Group</h2>
          <p>Signed in as: {user.email}</p>

          {!familyId && (
            <>
              <button onClick={createFamily}>
                Create Family Group
              </button>

              <h3>Or join a family</h3>

              <input
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value)}
                placeholder="Enter invitation code"
              />

              <button onClick={joinFamily}>Join Family</button>
            </>
          )}

          {familyId && (
            <>
              <p>Family group connected.</p>
              <p>Your role: {familyRole}</p>

              {familyRole === 'owner' && (
                <>
                  <button onClick={generateInvitation}>
                    Generate Invitation Code
                  </button>

                  {inviteCode && (
                    <p>
                      Invitation code: <strong>{inviteCode}</strong>
                    </p>
                  )}
                </>
              )}
            </>
          )}
        </section>
      )}

      {!demoMode && familyId && (
        <section
          style={{
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '12px',
            marginTop: '20px',
          }}
        >
          <h2>Location Sharing</h2>

          <p>
            Enable sharing to let your family see your current location.
          </p>

          {!sharing ? (
            <button onClick={() => setSharing(true)}>
              Start Sharing My Location
            </button>
          ) : (
            <button onClick={stopSharing}>
              Stop Sharing My Location
            </button>
          )}

          <p>{status}</p>
        </section>
      )}

      <section
        style={{
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '12px',
          marginTop: '20px',
        }}
      >
        <h2>Distance Alert</h2>

        <label htmlFor="distanceLimit">
          Alert distance: {distanceLimit} miles
        </label>

        <br />

        <input
          id="distanceLimit"
          type="range"
          min="1"
          max="20"
          value={distanceLimit}
          onChange={(event) =>
            setDistanceLimit(Number(event.target.value))
          }
        />

        {familyLocations.map(([uid, location]) => {
          const distance =
            currentPosition &&
            uid !== (demoMode ? 'demoMe' : user.uid)
              ? calculateDistance(
                  currentPosition.latitude,
                  currentPosition.longitude,
                  location.latitude,
                  location.longitude
                )
              : null

          if (distance === null) {
            return null
          }

          return (
            <p key={uid} style={{ fontWeight: 'bold' }}>
              {location.email || 'Family member'}:{' '}
              {distance.toFixed(2)} miles away

              {distance > distanceLimit ? (
                <span
                  style={{
                    color: 'red',
                    display: 'block',
                    marginTop: '8px',
                  }}
                >
                  🚨 ALERT! Your family member is more than{' '}
                  {distanceLimit} miles away!
                </span>
              ) : (
                <span
                  style={{
                    color: 'green',
                    display: 'block',
                    marginTop: '8px',
                  }}
                >
                  Your family member is within your distance limit.
                </span>
              )}
            </p>
          )
        })}

        <p>{status}</p>
      </section>

      <section style={{ marginTop: '24px' }}>
        <h2>Family Map</h2>

        <div
          style={{
            height: '400px',
            width: '100%',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <MapContainer
            key={demoMode ? 'demo-map' : 'family-map'}
            center={
              currentPosition
                ? [
                    currentPosition.latitude,
                    currentPosition.longitude,
                  ]
                : [40.7128, -74.006]
            }
            zoom={demoMode ? 10 : 11}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {familyLocations.map(([uid, location]) => (
              <Marker
                key={uid}
                position={[location.latitude, location.longitude]}
              >
                <Popup>
                  <p>{location.email || 'Family member'}</p>
                  <p>
                    Last updated:{' '}
                    {new Date(location.updatedAt).toLocaleString()}
                  </p>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <h3>Family Members</h3>

        {familyLocations.length === 0 && (
          <p>No family members have shared a location yet.</p>
        )}

        {familyLocations.map(([uid, location]) => {
          const distance =
            currentPosition &&
            uid !== (demoMode ? 'demoMe' : user.uid)
              ? calculateDistance(
                  currentPosition.latitude,
                  currentPosition.longitude,
                  location.latitude,
                  location.longitude
                )
              : null

          return (
            <div
              key={uid}
              style={{
                padding: '12px',
                marginTop: '10px',
                border: '1px solid #ddd',
                borderRadius: '8px',
              }}
            >
              <p>{location.email || 'Family member'}</p>

              {distance !== null ? (
                <p>
                  Distance from you: {distance.toFixed(2)} miles
                  {distance > distanceLimit
                    ? ' — Alert: beyond your distance limit!'
                    : ' — Within your distance limit.'}
                </p>
              ) : (
                <p>
                  {uid === user.uid
                    ? 'This is your shared location.'
                    : 'Share your location to calculate distance.'}
                </p>
              )}

              <p>
                Last updated:{' '}
                {new Date(location.updatedAt).toLocaleString()}
              </p>
            </div>
          )
        })}
      </section>
    </main>
  )
}

export default App
