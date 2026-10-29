
import { useState } from 'react'
import './index.css'

function App() {
  const [familyMember, setFamilyMember] = useState('Little Brother')
  const [distanceLimit, setDistanceLimit] = useState(5)
  const [distance, setDistance] = useState(3.2)

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
          <p>Keep an eye on your loved ones and know when they move beyond your chosen distance.</p>
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
            <span>{distance.toFixed(1)}</span>
            <span className="miles">miles away</span>
          </div>

          <p className="muted">Your distance limit is {distanceLimit} miles.</p>

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

          {isTooFar && (
            <div className="alert">
              <span className="alert-icon">!</span>
              <div>
                <h3>Distance alert</h3>
                <p>{familyMember} is {distance.toFixed(1)} miles away, beyond your {distanceLimit}-mile limit.</p>
              </div>
            </div>
          )}

          {!isTooFar && (
            <div className="safe-message">
              <span>✓</span>
              {familyMember} is within your distance limit.
            </div>
          )}
        </section>

        <section className="card demo-card">
          <h2>Try the distance alert</h2>
          <p className="muted">Change the sample distance to see how the alert works.</p>

          <label htmlFor="sampleDistance">
            Sample distance: {distance.toFixed(1)} miles
          </label>
          <input
            id="sampleDistance"
            type="range"
            min="0"
            max="20"
            step="0.1"
            value={distance}
            onChange={(event) => setDistance(Number(event.target.value))}
          />
          <div className="range-labels">
            <span>0 miles</span>
            <span>20 miles</span>
          </div>
        </section>

        <footer>
          Family Alert · Student Project · Sample data only
        </footer>
      </main>
    </div>
  )
}

export default App
