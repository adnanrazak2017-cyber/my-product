
import { useState } from 'react'
import './index.css'

const sampleLocations = {
  nearby: {
    name: 'Nearby location',
    latitude: 40.7592,
    longitude: -74.0060,
  },
  far: {
    name: 'Far away location',
    latitude: 40.8287,
    longitude: -74.0060,
  },
}

function calculateDistance(pointA, pointB) {
  const earthRadiusMiles = 3958.8
  const toRadians = (degrees) => (degrees * Math.PI) / 180

  const lat1 = toRadians(pointA.latitude)
  const lat2 = toRadians(pointB.latitude)
  const latDifference = toRadians(pointB.latitude - pointA.latitude)
  const lonDifference = toRadians(pointB.longitude - pointA.longitude)

  const a =
    Math.sin(latDifference / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(lonDifference / 2) ** 2

  const safeA = Math.min(1, Math.max(0, a))
  const centralAngle = 2 * Math.atan2(
    Math.sqrt(safeA),
    Math.sqrt(1 - safeA),
  )

  return earthRadiusMiles * centralAngle
}

function App() {
  const [familyMember, setFamilyMember] = useState('Little Brother')
  const [distanceLimit, setDistanceLimit] = useState(5)
  const [locationChoice, setLocationChoice] = useState('nearby')

  const yourLocation = {
    latitude: 40.7128,
    longitude: -74.0060,
  }

  const familyLocation = sampleLocations[locationChoice]
  const distance = calculateDistance(yourLocation, familyLocation)
  const isTooFar = distance > distanceLimit

  return (
    <div className="app">
      <header className="topbar">
        <div className="logo">F</div>
        <div>
          <h2>Family Alert</h2>
          <p>Stay connected to your family</p>
        </div>
      </header>

      <main className="container">
        <section className="welcome">
          <p className="eyebrow">FAMILY LOCATION</p>
          <h1>Peace of mind, wherever they go.</h1>
          <p>
            See how distance calculations can help you know when a family
            member moves beyond your chosen limit.
          </p>
        </section>

        <section className="card">
          <div className="section-heading">
            <h2>Family member</h2>
            <span className="sample-tag">DEMO</span>
          </div>

          <label htmlFor="familyMember">Choose a family member</label>
          <select
            id="familyMember"
            value={familyMember}
            onChange={(event) => setFamilyMember(event.target.value)}
          >
            <option>Little Brother</option>
            <option>Son</option>
            <option>Other Family Member</option>
          </select>

          <div className="distance-heading">
            <h2>Distance status</h2>
            <span className={isTooFar ? 'status danger' : 'status safe'}>
              {isTooFar ? 'Outside limit' : 'Within limit'}
            </span>
          </div>

          <div className="distance-number">
            <span>{distance.toFixed(2)}</span>
            <span className="miles">miles away</span>
          </div>

          <p className="muted">
            Calculated from the two sample GPS coordinates.
          </p>

          <div className="distance-control">
            <label htmlFor="distanceLimit">Distance limit</label>
            <div className="limit-value">{distanceLimit} miles</div>
          </div>

          <input
            id="distanceLimit"
            type="range"
            min="1"
            max="20"
            value={distanceLimit}
            onChange={(event) => setDistanceLimit(Number(event.target.value))}
          />

          <div className="range-labels">
            <span>1 mile</span>
            <span>20 miles</span>
          </div>

          {isTooFar ? (
            <div className="alert" role="alert">
              <span className="alert-icon">!</span>
              <div>
                <h3>Distance alert</h3>
                <p>
                  {familyMember} is {distance.toFixed(2)} miles away,
                  beyond your {distanceLimit}-mile limit.
                </p>
              </div>
            </div>
          ) : (
            <div className="safe-message" role="status">
              <span>✓</span>
              {familyMember} is within your distance limit.
            </div>
          )}
        </section>

        <section className="card demo-card">
          <h2>Test different locations</h2>
          <p className="muted">
            Choose a sample location to see the distance calculation and
            alert update.
          </p>

          <label htmlFor="sampleLocation">Family member's sample location</label>
          <select
            id="sampleLocation"
            value={locationChoice}
            onChange={(event) => setLocationChoice(event.target.value)}
          >
            <option value="nearby">Nearby — about 3.2 miles</option>
            <option value="far">Far away — about 8 miles</option>
          </select>

          <h3>Sample coordinates</h3>
          <p className="muted">
            Your location: {yourLocation.latitude}, {yourLocation.longitude}
          </p>
          <p className="muted">
            Family member: {familyLocation.latitude},{' '}
            {familyLocation.longitude}
          </p>
          <p className="muted">
            These coordinates are examples, not anyone's actual location.
          </p>
        </section>

        <footer>
          Family Alert · Student Project · Sample data only
        </footer>
      </main>
    </div>
  )
}

export default App
