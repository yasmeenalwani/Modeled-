import React from 'react';

/**
 * Cherry Desk Mockup Comparison Component
 * Visual side-by-side comparison of three design mockups
 * Similar to color palette evaluation
 */

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '100%',
    background: '#FFFEF9',
    fontFamily: '"Alike", "Georgia", serif',
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#8B1E3F',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Three column comparison grid
  comparisonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '2rem',
    marginBottom: '3rem',
  },
  
  // Mockup container
  mockupContainer: {
    background: '#FFFEF9',
    border: '2px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '16px',
    padding: '1.5rem',
    minHeight: '800px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
  },
  mockupTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#8B1E3F',
    marginBottom: '1rem',
    textAlign: 'center',
    borderBottom: '2px solid rgba(139, 30, 63, 0.2)',
    paddingBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  mockupSubtitle: {
    fontSize: '0.85rem',
    color: '#5A3A2A',
    textAlign: 'center',
    marginBottom: '1.5rem',
    fontStyle: 'italic',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Mockup 1 Styles (Magazine Cover)
  heroRow1: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
    padding: '1.5rem',
    background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.05), rgba(168, 90, 90, 0.03))',
    borderRadius: '12px',
  },
  heroLeft1: {
    flex: '1',
  },
  heroTitle1: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#8B1E3F',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  heroTagline1: {
    fontSize: '0.9rem',
    color: '#5A3A2A',
    fontStyle: 'italic',
    marginBottom: '0.75rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  pillsRow1: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  pill1: {
    padding: '0.4rem 0.8rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    color: '#FFFEF9',
    fontFamily: '"Alike", "Georgia", serif',
  },
  statChips1: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  statChip1: {
    padding: '0.75rem',
    borderRadius: '8px',
    background: 'rgba(139, 30, 63, 0.1)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    minWidth: '100px',
  },
  statValue1: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#8B1E3F',
    marginBottom: '0.25rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  statSub1: {
    fontSize: '0.7rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  grid2Col1: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  card1: {
    padding: '1rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '12px',
    border: '1px solid rgba(139, 30, 63, 0.15)',
  },
  cardTitle1: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#4A2A1A',
    marginBottom: '0.75rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  avatar1: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    margin: '0 auto 0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    color: '#FFFEF9',
  },
  tagline1: {
    fontSize: '0.85rem',
    fontStyle: 'italic',
    color: '#4A2A1A',
    textAlign: 'center',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  link1: {
    fontSize: '0.75rem',
    color: '#8B1E3F',
    textAlign: 'center',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontFamily: '"Alike", "Georgia", serif',
  },
  sessionItem1: {
    padding: '0.5rem',
    marginBottom: '0.5rem',
    fontSize: '0.75rem',
    color: '#4A2A1A',
    borderBottom: '1px solid rgba(139, 30, 63, 0.1)',
    fontFamily: '"Alike", "Georgia", serif',
  },
  quizPills1: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  quizPill1: {
    padding: '0.35rem 0.65rem',
    borderRadius: '16px',
    fontSize: '0.7rem',
    background: 'rgba(139, 30, 63, 0.1)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  banner1: {
    padding: '0.75rem',
    background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.1), rgba(168, 90, 90, 0.08))',
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '0.8rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Mockup 2 Styles (Tiles Hub)
  statsBar2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  statCard2: {
    padding: '1rem',
    background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.08), rgba(168, 90, 90, 0.05))',
    borderRadius: '12px',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    textAlign: 'center',
  },
  statValue2: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#8B1E3F',
    marginBottom: '0.25rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  statLabel2: {
    fontSize: '0.7rem',
    color: '#5A3A2A',
    marginBottom: '0.25rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  statTag2: {
    fontSize: '0.65rem',
    color: '#8B1E3F',
    fontFamily: '"Alike", "Georgia", serif',
  },
  tilesGrid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  tile2: {
    padding: '1rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '12px',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    minHeight: '120px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  tileTitle2: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#4A2A1A',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  tileContent2: {
    fontSize: '0.7rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  supportStrip2: {
    padding: '0.75rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '8px',
    fontSize: '0.75rem',
    color: '#5A3A2A',
    textAlign: 'center',
    borderTop: '1px solid rgba(139, 30, 63, 0.1)',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Mockup 3 Styles (Storyline)
  heroRow3: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
    gap: '1rem',
  },
  heroLeft3: {
    flex: '1.5',
  },
  heroTitle3: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#8B1E3F',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  heroSub3: {
    fontSize: '0.8rem',
    color: '#5A3A2A',
    marginBottom: '0.75rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  heroButton3: {
    padding: '0.5rem 1rem',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    color: '#FFFEF9',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
  },
  coverCard3: {
    flex: '1',
    padding: '1rem',
    background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.1), rgba(168, 90, 90, 0.08))',
    borderRadius: '12px',
    border: '2px solid #8B1E3F',
    textAlign: 'center',
    minHeight: '150px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  coverText3: {
    fontSize: '0.8rem',
    fontStyle: 'italic',
    color: '#8B1E3F',
    fontFamily: '"Alike", "Georgia", serif',
  },
  timelineSection3: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  timeline3: {
    padding: '1rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '12px',
  },
  timelineItem3: {
    padding: '0.5rem',
    marginBottom: '0.5rem',
    fontSize: '0.7rem',
    color: '#4A2A1A',
    borderLeft: '3px solid #8B1E3F',
    paddingLeft: '0.75rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  suggestionCard3: {
    padding: '1rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '12px',
    marginBottom: '0.75rem',
    border: '1px solid rgba(139, 30, 63, 0.15)',
  },
  suggestionTitle3: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#4A2A1A',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  suggestionSub3: {
    fontSize: '0.7rem',
    color: '#5A3A2A',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  suggestionButton3: {
    padding: '0.4rem 0.8rem',
    background: 'transparent',
    border: '1px solid #8B1E3F',
    borderRadius: '8px',
    fontSize: '0.7rem',
    color: '#8B1E3F',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
  },
  bottomChips3: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    padding: '0.75rem',
  },
  chip3: {
    fontSize: '0.75rem',
    color: '#8B1E3F',
    cursor: 'pointer',
    borderBottom: '1px dashed rgba(139, 30, 63, 0.3)',
    paddingBottom: '0.25rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
};

export default function CherryDeskMockupComparison() {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Cherry Desk - Design Mockup Comparison</h1>
        <p style={styles.subtitle}>Evaluate three design options side-by-side</p>
      </div>

      <div style={styles.comparisonGrid}>
        {/* MOCKUP 1: Magazine Cover */}
        <div style={styles.mockupContainer}>
          <h2 style={styles.mockupTitle}>Mockup 1: Magazine Cover</h2>
          <p style={styles.mockupSubtitle}>Editorial, bold, hero-focused</p>
          
          {/* Hero Row */}
          <div style={styles.heroRow1}>
            <div style={styles.heroLeft1}>
              <div style={styles.heroTitle1}>Cherry Desk</div>
              <div style={styles.heroTagline1}>Well red, well done, you're rare.</div>
              <div style={styles.pillsRow1}>
                <span style={styles.pill1}>ROLE Model</span>
                <span style={styles.pill1}>Gold+ in 550 XP</span>
              </div>
            </div>
            <div style={styles.statChips1}>
              <div style={styles.statChip1}>
                <div style={styles.statValue1}>12</div>
                <div style={styles.statSub1}>Sessions</div>
                <div style={styles.statSub1}>+2 this month</div>
              </div>
              <div style={styles.statChip1}>
                <div style={styles.statValue1}>$840</div>
                <div style={styles.statSub1}>Saved</div>
                <div style={styles.statSub1}>+$150 this month</div>
              </div>
              <div style={styles.statChip1}>
                <div style={styles.statValue1}>2450</div>
                <div style={styles.statSub1}>XP</div>
                <div style={styles.statSub1}>Impact $12.87</div>
              </div>
            </div>
          </div>

          {/* 2 Column Grid */}
          <div style={styles.grid2Col1}>
            <div>
              <div style={styles.card1}>
                <div style={styles.cardTitle1}>My Model Card</div>
                <div style={styles.avatar1}>👤</div>
                <div style={styles.tagline1}>Cherry Bold, Rare Energy</div>
                <div style={styles.link1}>View full card →</div>
              </div>
              <div style={styles.card1}>
                <div style={styles.cardTitle1}>My Sessions</div>
                <div style={styles.sessionItem1}>✂️ Balayage - Dec 2 • -$150</div>
                <div style={styles.sessionItem1}>💨 Blowout - Nov 28 • -$45</div>
                <div style={styles.sessionItem1}>✂️ Haircut - Nov 20 • -$65</div>
              </div>
            </div>
            <div>
              <div style={styles.card1}>
                <div style={styles.cardTitle1}>Play & Glow</div>
                <div style={styles.quizPills1}>
                  <span style={styles.quizPill1}>Hair Type</span>
                  <span style={styles.quizPill1}>Color Match</span>
                  <span style={{...styles.quizPill1, opacity: 0.5}}>Style Finder 🔒</span>
                </div>
                <div style={{...styles.sessionItem1, fontSize: '0.65rem'}}>Complete 3 more to unlock</div>
              </div>
              <div style={styles.card1}>
                <div style={styles.cardTitle1}>Getting Paid to Play</div>
                <div style={styles.statValue1}>$840 total saved</div>
                <div style={styles.statSub1}>$12.87 impact - Top 10%</div>
                <div style={{...styles.sessionItem1, marginTop: '0.5rem'}}>━━━━━━━━━━━━━━━</div>
              </div>
            </div>
          </div>

          {/* Bottom Banner */}
          <div style={styles.banner1}>
            You're 1 quiz away from sharper matches. [Take Color Match →]
          </div>
        </div>

        {/* MOCKUP 2: Tiles Hub */}
        <div style={styles.mockupContainer}>
          <h2 style={styles.mockupTitle}>Mockup 2: Tiles Hub</h2>
          <p style={styles.mockupSubtitle}>Clean, organized, grid-based</p>
          
          {/* Stats Bar */}
          <div style={styles.statsBar2}>
            <div style={styles.statCard2}>
              <div style={styles.statValue2}>12</div>
              <div style={styles.statLabel2}>Sessions</div>
              <div style={styles.statTag2}>Top 10%</div>
            </div>
            <div style={styles.statCard2}>
              <div style={styles.statValue2}>$840</div>
              <div style={styles.statLabel2}>Saved</div>
              <div style={styles.statTag2}>+$150</div>
            </div>
            <div style={styles.statCard2}>
              <div style={styles.statValue2}>4.9</div>
              <div style={styles.statLabel2}>Rating</div>
              <div style={styles.statTag2}>Top 10%</div>
            </div>
            <div style={styles.statCard2}>
              <div style={styles.statValue2}>2450</div>
              <div style={styles.statLabel2}>XP</div>
              <div style={styles.statTag2}>$12.87</div>
            </div>
          </div>

          {/* Tiles Grid */}
          <div style={styles.tilesGrid2}>
            <div style={styles.tile2}>
              <div style={styles.tileTitle2}>Model Card</div>
              <div style={{...styles.tileContent2, fontSize: '2rem', marginBottom: '0.5rem'}}>👤</div>
              <div style={styles.tileContent2}>Edit card</div>
            </div>
            <div style={styles.tile2}>
              <div style={styles.tileTitle2}>Sessions</div>
              <div style={styles.tileContent2}>12 Sessions</div>
              <div style={{...styles.tileContent2, fontSize: '0.65rem'}}>Balayage Dec 2</div>
            </div>
            <div style={styles.tile2}>
              <div style={styles.tileTitle2}>Portfolio</div>
              <div style={styles.tileContent2}>📷 📷 📷</div>
              <div style={styles.tileContent2}>Open →</div>
            </div>
            <div style={styles.tile2}>
              <div style={styles.tileTitle2}>Learning</div>
              <div style={styles.tileContent2}>⭕ 60%</div>
              <div style={{...styles.tileContent2, fontSize: '0.65rem'}}>Continue →</div>
            </div>
            <div style={styles.tile2}>
              <div style={styles.tileTitle2}>Play & Glow</div>
              <div style={styles.tileContent2}>🔥 3-week streak</div>
              <div style={{...styles.tileContent2, fontSize: '0.65rem'}}>You're glowing!</div>
            </div>
            <div style={styles.tile2}>
              <div style={styles.tileTitle2}>Money & Perks</div>
              <div style={styles.statValue2}>$840</div>
              <div style={{...styles.tileContent2, fontSize: '0.65rem'}}>Next: $1000</div>
            </div>
          </div>

          {/* Support Strip */}
          <div style={styles.supportStrip2}>
            Need anything? Read etiquette, safety, or get help → 🔔
          </div>
        </div>

        {/* MOCKUP 3: Storyline */}
        <div style={styles.mockupContainer}>
          <h2 style={styles.mockupTitle}>Mockup 3: Storyline</h2>
          <p style={styles.mockupSubtitle}>Narrative, timeline-driven</p>
          
          {/* Hero Row */}
          <div style={styles.heroRow3}>
            <div style={styles.heroLeft3}>
              <div style={styles.heroTitle3}>This month's storyline: Winter Blonde Lab</div>
              <div style={styles.heroSub3}>3 looks - $240 saved - 2 quizzes finished</div>
              <button style={styles.heroButton3}>Continue your story →</button>
            </div>
            <div style={styles.coverCard3}>
              <div style={{fontSize: '3rem', marginBottom: '0.5rem'}}>👤</div>
              <div style={styles.coverText3}>Cover girl of the week</div>
            </div>
          </div>

          {/* Timeline + Suggestions */}
          <div style={styles.timelineSection3}>
            <div style={styles.timeline3}>
              <div style={{...styles.tileTitle2, marginBottom: '0.75rem'}}>Your Cherry Timeline</div>
              <div style={styles.timelineItem3}>
                ⚫ Dec 2<br/>✂️ Balayage - Sarah M.<br/>-$150
              </div>
              <div style={styles.timelineItem3}>
                ⚫ Nov 28<br/>💨 Blowout - Jessica K.<br/>-$45
              </div>
              <div style={styles.timelineItem3}>
                ⚫ Nov 20<br/>✂️ Haircut - Amanda L.<br/>-$65
              </div>
            </div>
            <div>
              <div style={{...styles.tileTitle2, marginBottom: '0.75rem'}}>Because of your last look…</div>
              <div style={styles.suggestionCard3}>
                <div style={styles.suggestionTitle3}>Gloss / Toner in 4-6 weeks</div>
                <div style={styles.suggestionSub3}>Recommended based on Balayage</div>
                <button style={styles.suggestionButton3}>Preview matches</button>
              </div>
              <div style={styles.suggestionCard3}>
                <div style={styles.suggestionTitle3}>Style quiz: Red & Rare</div>
                <div style={styles.suggestionSub3}>Unlock new looks</div>
                <button style={{...styles.suggestionButton3, background: '#8B1E3F', color: '#FFFEF9', border: 'none'}}>Take now</button>
              </div>
            </div>
          </div>

          {/* Bottom Chips */}
          <div style={styles.bottomChips3}>
            <span style={styles.chip3}>Model Card</span>
            <span style={styles.chip3}>Portfolio</span>
            <span style={styles.chip3}>Play & Glow</span>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div style={{
        marginTop: '3rem',
        padding: '2rem',
        background: 'rgba(139, 30, 63, 0.05)',
        borderRadius: '12px',
      }}>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#8B1E3F',
          marginBottom: '1rem',
          textAlign: 'center',
          fontFamily: '"Alike", "Georgia", serif',
        }}>Quick Comparison</h3>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: '"Alike", "Georgia", serif',
        }}>
          <thead>
            <tr style={{borderBottom: '2px solid rgba(139, 30, 63, 0.2)'}}>
              <th style={{padding: '0.75rem', textAlign: 'left', color: '#4A2A1A', fontWeight: '600'}}>Feature</th>
              <th style={{padding: '0.75rem', textAlign: 'center', color: '#8B1E3F', fontWeight: '600'}}>Magazine Cover</th>
              <th style={{padding: '0.75rem', textAlign: 'center', color: '#8B1E3F', fontWeight: '600'}}>Tiles Hub</th>
              <th style={{padding: '0.75rem', textAlign: 'center', color: '#8B1E3F', fontWeight: '600'}}>Storyline</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{borderBottom: '1px solid rgba(139, 30, 63, 0.1)'}}>
              <td style={{padding: '0.75rem', color: '#4A2A1A'}}>Hero Style</td>
              <td style={{padding: '0.75rem', textAlign: 'center', color: '#5A3A2A'}}>Bold headline + tagline</td>
              <td style={{padding: '0.75rem', textAlign: 'center', color: '#5A3A2A'}}>Stats bar only</td>
              <td style={{padding: '0.75rem', textAlign: 'center', color: '#5A3A2A'}}>Story headline + cover</td>
            </tr>
            <tr style={{borderBottom: '1px solid rgba(139, 30, 63, 0.1)'}}>
              <td style={{padding: '0.75rem', color: '#4A2A1A'}}>Layout</td>
              <td style={{padding: '0.75rem', textAlign: 'center', color: '#5A3A2A'}}>2-column grid</td>
              <td style={{padding: '0.75rem', textAlign: 'center', color: '#5A3A2A'}}>3×2 tile grid</td>
              <td style={{padding: '0.75rem', textAlign: 'center', color: '#5A3A2A'}}>Timeline + suggestions</td>
            </tr>
            <tr style={{borderBottom: '1px solid rgba(139, 30, 63, 0.1)'}}>
              <td style={{padding: '0.75rem', color: '#4A2A1A'}}>Best For</td>
              <td style={{padding: '0.75rem', textAlign: 'center', color: '#5A3A2A'}}>Impact & inspiration</td>
              <td style={{padding: '0.75rem', textAlign: 'center', color: '#5A3A2A'}}>Quick info access</td>
              <td style={{padding: '0.75rem', textAlign: 'center', color: '#5A3A2A'}}>Engagement & journey</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

