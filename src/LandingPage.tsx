import { lazy, Suspense, useState } from 'react';
import {
  ArrowRight, ArrowUpRight, Check, ChevronRight, Cloud, Map, MoveRight,
  ShieldCheck, Waves, Wind, UsersRound,
} from 'lucide-react';

const DomeGallery = lazy(() => import('./components/DomeGallery'));
const TargetCursor = lazy(() => import('./components/TargetCursor'));

// Images: Unsplash CDN — works on all hosts (localhost, Netlify, Manus)
// License: Unsplash free-to-use license (https://unsplash.com/license)
const heroImage = 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=1400&q=85';
const galleryImages = [
  { src: '/images/cyclone-satellite.jpg', alt: 'Satellite view of a cyclone over the ocean showing spiral cloud bands' },
  { src: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=900&q=80', alt: 'Engineers inspecting coastal electrical infrastructure and power lines before a storm' },
  { src: '/images/cyclone-tornado.jpg', alt: 'Dramatic cyclone forming over a coastal road with fierce winds and debris' },
  { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80', alt: 'Coastal road and infrastructure preparedness before monsoon weather arrives' },
];

const stories = [
  {
    id: 'people', title: 'Make room for people to move.', label: 'EVACUATION & COMMUNITY READINESS', icon: UsersRound,
    copy: 'Plan assisted evacuation and shelter access while there is still time to reach families, coordinate transport and keep local services open.',
    prompt: 'Start with the people who need the most time.',
  },
  {
    id: 'infrastructure', title: 'Keep essential services within reach.', label: 'INFRASTRUCTURE & ACCESS', icon: Wind,
    copy: 'Explore how hardening power assets, protecting road links and keeping clinics accessible can reduce the pressure on a coastal response.',
    prompt: 'Prepare the routes and systems communities depend on.',
  },
  {
    id: 'liquidity', title: 'Put recovery resources closer to hand.', label: 'LIVELIHOOD & LIQUIDITY', icon: ShieldCheck,
    copy: 'Consider how pre-arranged financial protection could help local responders and households move from impact toward recovery sooner.',
    prompt: 'Make room to recover before damage compounds.',
  },
];

const steps = [
  { title: 'See the coast differently', body: 'Bring environmental signals into one place, with their source and uncertainty made clear.', icon: Cloud },
  { title: 'Understand what is exposed', body: 'Connect a changing hazard to the places, people and services it could affect.', icon: Map },
  { title: 'Prepare before landfall', body: 'Turn useful lead time into locally informed choices, not another screen full of alerts.', icon: Waves },
];

export default function LandingPage({ onOpenDashboard }: { onOpenDashboard: () => void }) {
  const [activeStory, setActiveStory] = useState(stories[0]);
  const StoryIcon = activeStory.icon;

  const scrollToApproach = () => document.getElementById('approach')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="landing-page">
      <Suspense fallback={null}>
        <TargetCursor
          targetSelector=".landing-page button:not([disabled]), .landing-page a, .sphere-root .item__image"
          spinDuration={3}
          hideDefaultCursor={false}
          hoverDuration={0.18}
          cursorColor="#ffffff"
          cursorColorOnTarget="#777777"
          parallaxOn={true}
        />
      </Suspense>

      <header className="landing-header">
        <a className="landing-brand" href="/" aria-label="IRIS home" onClick={(event) => { event.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <img src="/favicon.png" alt="" />
          <span><b>IRIS</b><small aria-label="Intelligent Risk and Impact Simulator">Intelligent Risk<br/>and Impact Simulator</small></span>
        </a>
        <nav className="landing-nav" aria-label="Main navigation">
          <button className="landing-nav-link" onClick={scrollToApproach}>Our approach</button>
          <button className="landing-header-cta" onClick={onOpenDashboard}>Dashboard <ArrowUpRight size={17} /></button>
        </nav>
      </header>

      <main>
        <section className="landing-hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="hero-kicker"><span />INTELLIGENT RISK AND IMPACT SIMULATOR</p>
            <h1 id="hero-title">The hours before landfall <em>matter most.</em></h1>
            <p className="hero-lede">A clearer way to think ahead for the people, places and essential services along a changing coast.</p>
            <div className="hero-actions">
              <button className="landing-primary" onClick={onOpenDashboard}>Open the risk dashboard <ArrowRight size={20} /></button>
              <button className="landing-secondary" onClick={scrollToApproach}>See the approach <ChevronRight size={17} /></button>
            </div>
            <div className="hero-footnote"><span className="footnote-mark"><Check size={13} /></span><span>Concept prototype · Scenario figures are illustrative, not official warnings.</span></div>
          </div>
          <figure className="hero-visual">
            <img src={heroImage} alt="Conceptual monochrome satellite-style visualization of a cyclone eye and spiral cloud bands over the Bay of Bengal; not a live satellite image" fetchPriority="high" />
            <figcaption><span>CONCEPT FIELD VIEW</span><span>BAY OF BENGAL · ILLUSTRATIVE VISUAL</span></figcaption>
            <div className="image-corner-label">IRIS<br />Coastal readiness</div>
          </figure>
        </section>

        <section className="manifesto-row" aria-label="Purpose">
          <span className="manifesto-line" />
          <p>Prepare earlier. Protect what matters. Give recovery a better start.</p>
          <button onClick={onOpenDashboard} aria-label="Open the risk dashboard"><MoveRight size={22} /></button>
        </section>

        <section className="story-section" id="approach">
          <div className="editorial-heading">
            <p className="section-kicker">A DIFFERENT KIND OF RESPONSE</p>
            <h2>Move the conversation<br /><em>ahead of the storm.</em></h2>
            <p className="section-intro">Anticipatory action makes space for practical choices before the hardest decisions arrive.</p>
          </div>
          <div className="story-explorer">
            <div className="story-tabs" role="tablist" aria-label="Preparedness priorities">
              {stories.map((story) => {
                const Icon = story.icon;
                return <button key={story.id} className={`story-tab ${activeStory.id === story.id ? 'story-tab-active' : ''}`} role="tab" aria-selected={activeStory.id === story.id} onClick={() => setActiveStory(story)}>
                  <span className="story-tab-icon"><Icon size={23} strokeWidth={1.7} /></span>
                  <span><small>{story.label}</small><b>{story.title}</b></span>
                  <ChevronRight size={18} className="story-tab-arrow" />
                </button>;
              })}
            </div>
            <article className="story-detail" role="tabpanel">
              <div className="story-detail-mark"><StoryIcon size={33} strokeWidth={1.5} /></div>
              <p className="section-kicker">{activeStory.label}</p>
              <h3>{activeStory.prompt}</h3>
              <p>{activeStory.copy}</p>
              <button className="story-open" onClick={onOpenDashboard}>Explore the planning workspace <ArrowUpRight size={16} /></button>
            </article>
          </div>
        </section>

        <section className="approach-section" aria-labelledby="approach-title">
          <div className="approach-heading"><p className="section-kicker">FROM SIGNAL TO PREPARATION</p><h2 id="approach-title">A coast is more than a forecast.</h2><p>IRIS is designed around decisions that connect risk to the way people live and move.</p></div>
          <div className="approach-list">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return <article className="approach-item" key={step.title}><div className="approach-item-top"><span className="approach-index">{String.fromCharCode(65 + index)}</span><Icon size={26} strokeWidth={1.5} /></div><h3>{step.title}</h3><p>{step.body}</p></article>;
            })}
          </div>
        </section>

        <section className="gallery-section" aria-labelledby="gallery-title">
          <div className="gallery-intro">
            <div><p className="section-kicker">A COAST, SEEN THROUGH PEOPLE AND PLACE</p><h2 id="gallery-title">Every place changes<br/><em>the picture.</em></h2></div>
            <p>Move through a set of coastal-preparedness scenes. Drag or swipe to turn the gallery; choose any frame to bring it forward.</p>
          </div>
          <div className="gallery-stage">
            <Suspense fallback={<div className="gallery-loading">Preparing the coastal image gallery…</div>}>
              <DomeGallery
                images={galleryImages}
                fit={0.48}
                fitBasis="auto"
                minRadius={260}
                maxRadius={760}
                padFactor={0.12}
                overlayBlurColor="#f6f6f6"
                maxVerticalRotationDeg={7}
                dragSensitivity={18}
                enlargeTransitionMs={280}
                segments={18}
                dragDampening={0.72}
                openedImageWidth="min(76vw, 560px)"
                openedImageHeight="min(76vw, 560px)"
                imageBorderRadius="22px"
                openedImageBorderRadius="22px"
                grayscale={true}
              />
            </Suspense>
          </div>
          <div className="gallery-caption"><span>Drag / swipe to rotate · Select or press Enter to enlarge</span><span>Concept imagery only · Not live satellite data or event evidence</span></div>
        </section>

        <section className="closing-cta">
          <div><p className="section-kicker">EXPLORE THE CONCEPT</p><h2>See the whole picture.<br /><em>Choose what comes next.</em></h2></div>
          <button className="landing-primary closing-button" onClick={onOpenDashboard}>Open the risk dashboard <ArrowRight size={20} /></button>
        </section>
      </main>

      <footer className="landing-footer"><div className="landing-brand footer-brand"><img src="/favicon.png" alt="" /><span><b>IRIS</b><small>Intelligent Risk<br/>and Impact Simulator</small></span></div><span className="footer-disclaimer">Illustrative interface · not an official warning or operational forecast.</span><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top ↑</button></footer>
    </div>
  );
}
