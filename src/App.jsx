import './App.css'

const BTG_LOGO_URL = 'https://cdn.builder.io/api/v1/image/assets%2F88f22d4a63384a518eca58d52971254b%2F97dde7416bf849bdb2cc62cb20225262?format=webp&width=800'

function App() {
  const goals = [
    {
      icon: '🔹',
      title: 'DNS Seed Infrastructure (Beta v21.3)',
      description: 'Implementing DNS seed servers for improved peer discovery and network connectivity for nodes across mainnet, testnet, and signet networks.'
    },
    {
      icon: '🔹',
      title: 'Network Monitoring & Reliability Tools',
      description: 'Developing systems that track uptime, performance, connectivity, and consensus behavior across BTG nodes to identify issues early.'
    },
    {
      icon: '🔹',
      title: 'Supporting the Official Dev Team',
      description: 'Actively contributing to Bitcoin Gold development, monitoring feedback loops, and supporting CCBN implementation for enhanced security.'
    },
    {
      icon: '🔹',
      title: 'Beta Version Final Release',
      description: 'Participating in comprehensive beta testing cycles to ensure DNS seeds, monitoring, and CCBN integrations are stable before deployment.'
    },
    {
      icon: '🔹',
      title: 'Block Explorer Development',
      description: 'Building a modern explorer with real-time data, searchable chain history, and node status visualization for ecosystem transparency.'
    },
    {
      icon: '🔹',
      title: 'BTG User Dashboard',
      description: 'Developing a custom dashboard featuring node/pool metrics, wallet analytics, network health graphs, and custom alerts.'
    }
  ]

  const initiatives = [
    'Further network security enhancements',
    'Community tooling libraries',
    'Cross-chain services support',
    'Educational resources and documentation'
  ]

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <img src={BTG_LOGO_URL} alt="Bitcoin Gold" className="nav-logo" />
          <div className="nav-brand">BitcoinGold.Services</div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <img src={btgLogo} alt="Bitcoin Gold Logo" className="hero-logo" />
          <h1 className="hero-title">Welcome to BitcoinGold.Services</h1>
          <p className="hero-subtitle">
            An unofficial, community-driven support site for the Bitcoin Gold project (BTG)
          </p>
          <p className="hero-description">
            Supporting the resilience, security, and growth of the Bitcoin Gold ecosystem by building critical infrastructure, testing new releases, and assisting both node operators and the official development team.
          </p>
          <a href="#goals" className="cta-button">Explore Our Roadmap</a>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission">
        <div className="mission-content">
          <h2>Our Mission</h2>
          <p>
            BitcoinGold.Services is built by the community, for the community — with the purpose of strengthening Bitcoin Gold's infrastructure, security, and developer ecosystem. We welcome participation, feedback, and collaboration from anyone who wants to contribute to Bitcoin Gold's success.
          </p>
        </div>
      </section>

      {/* Goals & Roadmap */}
      <section id="goals" className="goals">
        <div className="goals-container">
          <h2 className="section-title">Our Goals & Roadmap</h2>
          <div className="goals-grid">
            {goals.map((goal, index) => (
              <div key={index} className="goal-card">
                <div className="goal-icon">{goal.icon}</div>
                <h3 className="goal-title">{goal.title}</h3>
                <p className="goal-description">{goal.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CCBN Section */}
      <section className="ccbn-section">
        <div className="ccbn-content">
          <h2>What is CCBN?</h2>
          <p>
            <strong>CCBN</strong> stands for <strong>Cross-Chain Block Notarization</strong>, a decentralized strategy where BTG block headers are notarized on other well-established public blockchains (called Notarychains). These notarizations include complete block headers with solution hashes that cannot be faked and accrue Weight based on their depth in the Notarychain.
          </p>
          <p>
            When competing forks occur, nodes using CCBN assess both chain length and notarization Weight before accepting a fork — providing a robust defense against deep reorgs and secret mining attacks while maintaining standard Nakamoto Consensus (Proof-of-Work) as the baseline.
          </p>
          <a href="https://btgofficial.org" target="_blank" rel="noreferrer" className="link-btn">
            Learn more at btgofficial.org →
          </a>
        </div>
      </section>

      {/* Future Initiatives */}
      <section className="initiatives">
        <div className="initiatives-container">
          <h2 className="section-title">Ongoing & Future Initiatives</h2>
          <p className="initiatives-intro">Beyond the initial infrastructure, our long-term goals include:</p>
          <div className="initiatives-list">
            {initiatives.map((initiative, index) => (
              <div key={index} className="initiative-item">
                <span className="initiative-check">✓</span>
                <span>{initiative}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2>Ready to Contribute?</h2>
          <p>Join the Bitcoin Gold community and help us strengthen the ecosystem</p>
          <div className="cta-buttons">
            <a href="https://btgofficial.org" target="_blank" rel="noreferrer" className="cta-primary">
              Visit Official Site
            </a>
            <a href="#" className="cta-secondary">Get Involved</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>More tools, guides, and initiatives are coming soon.</p>
          <p className="footer-credit">BitcoinGold.Services — Built by the community, for the community</p>
        </div>
      </footer>
    </div>
  )
}

export default App
