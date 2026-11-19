import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, Bot, Check, ChevronDown,
  CircleHelp, Command, GitBranch, Headphones, Layers3, Mail, Menu, MessageSquareText,
  MousePointer2, ShieldCheck, Sparkles, Users, Workflow, X
} from "lucide-react";
import "./homepage.css";

const features = [
  { icon: Users, number: "01", title: "Customer 360", text: "Every profile, conversation and interaction in one clear view. Give your team the context to make every customer feel known." },
  { icon: Mail, number: "02", title: "Email intelligence", text: "Understand intent, sentiment and urgency at a glance. Turn a crowded inbox into clear priorities and thoughtful next steps." },
  { icon: Workflow, number: "03", title: "Workflow automation", text: "Connect the everyday steps that slow your team down. Build repeatable processes that keep work moving." },
  { icon: Bot, number: "04", title: "AI agent orchestration", text: "Coordinate focused AI agents across operational tasks, with recommendations grounded in your business context." },
  { icon: ShieldCheck, number: "05", title: "Team and roles", text: "Bring your operators together with role-based access and a shared, organized workspace." },
  { icon: BarChart3, number: "06", title: "Business analytics", text: "See activity and performance in one place. Make informed decisions with an up-to-date view of operations." }
];

const demoActivities = [
  { icon: Mail, label: "Email classified", detail: "Pricing inquiry · Northstar Labs", time: "2 min ago", color: "blue" },
  { icon: Workflow, label: "Workflow completed", detail: "New lead follow-up", time: "18 min ago", color: "violet" },
  { icon: Users, label: "Customer updated", detail: "Acme Studio · Health score 86", time: "41 min ago", color: "green" }
];

function Brand({ light = false }) {
  return <Link className={`elvora-brand${light ? " is-light" : ""}`} to="/" aria-label="Elvora home"><span className="brand-mark"><Command size={17} strokeWidth={2.5} /></span><span>elvora</span></Link>;
}

function DashboardPreview() {
  return (
    <div className="home-dashboard" aria-label="Elvora dashboard demonstration preview">
      <div className="demo-sidebar">
        <Brand light />
        <div className="demo-workspace"><span className="demo-workspace-avatar">N</span><span>Northstar workspace</span><ChevronDown size={13} /></div>
        <div className="demo-nav-label">WORKSPACE</div>
        <div className="demo-nav-item active"><BarChart3 size={15} /> Overview</div>
        <div className="demo-nav-item"><Users size={15} /> Customers <span className="demo-nav-count">128</span></div>
        <div className="demo-nav-item"><Mail size={15} /> Inbox <span className="demo-nav-count demo-count-blue">6</span></div>
        <div className="demo-nav-item"><Workflow size={15} /> Workflows</div>
        <div className="demo-nav-item"><Bot size={15} /> AI activity</div>
        <div className="demo-sidebar-bottom"><span className="demo-avatar">JD</span><span><b>Jordan Davis</b><small>Workspace admin</small></span><ChevronDown size={13} /></div>
      </div>
      <div className="demo-main">
        <div className="demo-topbar"><span>Wednesday, October 22, 2025</span><span className="demo-live"><i /> All systems operational</span></div>
        <div className="demo-heading"><div><div className="demo-eyebrow">YOUR OPERATIONS AT A GLANCE</div><h3>Good morning, Jordan <Sparkles size={11} /></h3><p>Here’s what’s happening across your workspace.</p></div><button className="demo-range">Last 30 days <ChevronDown size={13} /></button></div>
        <div className="demo-stats">
          <div className="demo-stat"><div className="demo-stat-top"><span>Total customers</span><span className="demo-stat-icon"><Users size={15} /></span></div><b>1,284</b><small><strong>↗ 12.8%</strong> vs. last month</small></div>
          <div className="demo-stat"><div className="demo-stat-top"><span>Emails processed</span><span className="demo-stat-icon lavender"><Mail size={15} /></span></div><b>3,642</b><small><strong>↗ 8.2%</strong> vs. last month</small></div>
          <div className="demo-stat"><div className="demo-stat-top"><span>Active workflows</span><span className="demo-stat-icon peach"><Workflow size={15} /></span></div><b>24</b><small><strong>↗ 3</strong> this month</small></div>
        </div>
        <div className="demo-content-grid">
          <div className="demo-panel demo-chart-panel"><div className="demo-panel-heading"><div><b>Operational activity</b><small>Customer and communication trends</small></div><button aria-label="More chart options">···</button></div><div className="demo-chart"><div className="chart-y-labels"><span>400</span><span>300</span><span>200</span><span>100</span></div><div className="chart-area"><div className="chart-lines"><i /><i /><i /><i /></div><svg viewBox="0 0 460 135" preserveAspectRatio="none" aria-label="Demonstration chart"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--color-primary)" stopOpacity=".25"/><stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0"/></linearGradient></defs><path d="M0 105 C35 97 42 85 75 93 S120 73 145 79 S190 94 220 63 S260 73 290 50 S330 59 360 35 S405 51 430 22 S450 30 460 15 V135 H0Z" fill="url(#chartFill)"/><path d="M0 105 C35 97 42 85 75 93 S120 73 145 79 S190 94 220 63 S260 73 290 50 S330 59 360 35 S405 51 430 22 S450 30 460 15" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" /></svg><div className="chart-x-labels"><span>Oct 01</span><span>Oct 06</span><span>Oct 11</span><span>Oct 16</span><span>Oct 22</span></div></div></div></div>
          <div className="demo-panel demo-insight"><div className="demo-panel-heading"><div><b><Sparkles size={14} /> AI insights</b><small>Based on demonstration activity</small></div><span className="demo-insight-tag">DEMO</span></div><p>Customer engagement is up <strong>18%</strong> this month. Faster follow-ups are associated with stronger customer health.</p><a href="#features">Explore the platform <ArrowRight size={13} /></a><div className="demo-insight-score"><span>Workspace health</span><b>86<span>/100</span></b><div><i /></div><small>Strong momentum</small></div></div>
        </div>
        <div className="demo-panel demo-activity"><div className="demo-panel-heading"><div><b>Recent activity</b><small>The latest across your workspace</small></div><a href="#preview">View all <ArrowRight size={13} /></a></div><div className="demo-activity-list">{demoActivities.map(({ icon: Icon, label, detail, time, color }) => <div className="demo-activity-row" key={label}><span className={`activity-icon ${color}`}><Icon size={14} /></span><span className="activity-copy"><b>{label}</b><small>{detail}</small></span><time>{time}</time></div>)}</div></div>
      </div>
      <div className="demo-caption"><span className="demo-caption-dot" /> Product preview · Demonstration data</div>
    </div>
  );
}

export function Homepage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  return (
    <main className="elvora-home">
      <header className="home-header"><div className="home-header-inner"><Brand /><nav className={menuOpen ? "home-nav open" : "home-nav"} aria-label="Main navigation"><a href="#home" onClick={closeMenu}>Home</a><a href="#features" onClick={closeMenu}>Features</a><a href="#how-it-works" onClick={closeMenu}>How it works</a><a href="#about" onClick={closeMenu}>About</a><a href="#contact" onClick={closeMenu}>Contact</a></nav><div className="home-header-actions"><Link className="home-login" to="/login">Log in</Link><Link className="home-button home-button-small" to="/register">Get started <ArrowUpRight size={15} /></Link></div><button className="home-menu-toggle" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X /> : <Menu />}</button></div></header>

      <section className="home-hero" id="home"
    >
      <div className="hero-glow"/>
      <div className="home-container hero-layout">
        <div className="hero-copy">
        <div className="hero-kicker">
        <span><Sparkles size={13} /></span> THE OPERATING LAYER FOR WHAT’S NEXT</div>
      <h1>Run your business smarter.<br/>
      <span>Let AI handle the operations.</span></h1><p className="hero-description">Elvora brings your customers, communications and workflows together in one intelligent platform. Automate the busywork, uncover what matters and give your team room to grow.</p><div className="hero-actions"><a className="home-button" href="#preview">Explore the platform <ArrowRight size={16} /></a><Link className="home-button home-button-outline" to="/register">Get started <ArrowUpRight size={15} /></Link></div><div className="hero-proof"><div className="hero-proof-avatars"><i>J</i><i>M</i><i>A</i><i>+</i></div><span>Designed for teams ready to move forward</span></div></div><DashboardPreview /></div><a className="hero-scroll" href="#about"><span>SCROLL TO EXPLORE</span><ArrowDownRight size={14}/></a></section>

      <section className="home-trust"><div className="home-container trust-inner"><span>ONE CONNECTED WORKSPACE FOR</span><div><b><Users size={16}/> CUSTOMER OPERATIONS</b><b><MessageSquareText size={16}/> BUSINESS COMMUNICATIONS</b><b><GitBranch size={16}/> REPEATABLE WORKFLOWS</b><b><BarChart3 size={16}/> OPERATIONAL INSIGHT</b></div></div></section>

      <section className="home-section home-problem" id="about">
      <div className="home-container">
      <div className="section-intro">
      <span className="section-kicker">A CLEARER WAY TO WORK</span>
      <h2>Your business operations,<br/><span>finally connected.</span></h2>
      <p>Good work gets harder when important details live in different places. Elvora brings the moving parts together so your team can spend less time coordinating and more time making progress.</p>
      </div>
      <div className="problem-grid"><article className="problem-card">
      <div className="problem-number">01 / THE CHALLENGE</div>
      <h3>Customer context is scattered.</h3>
      <p>Profiles in one place. Conversations in another. Your team spends time searching instead of building relationships.</p><div className="problem-resolution"><span><Layers3 size={16}/></span><div><b>One connected customer view</b><small>Profiles, history and interactions together</small></div><Check size={16}/></div></article><article className="problem-card"><div className="problem-number">02 / THE CHALLENGE</div><h3>The inbox sets the agenda.</h3><p>Manual sorting and follow-ups make it easy for important customer messages to get lost in the noise.</p><div className="problem-resolution"><span><Mail size={16}/></span><div><b>Clear email intelligence</b><small>Intent, sentiment and urgency in context</small></div><Check size={16}/></div></article><article className="problem-card"><div className="problem-number">03 / THE CHALLENGE</div><h3>Routine work keeps repeating.</h3><p>Small operational tasks add up when each one needs a person to remember, route and complete it.</p><div className="problem-resolution"><span><Workflow size={16}/></span><div><b>Workflows that keep moving</b><small>Consistent steps with less busywork</small></div><Check size={16}/></div></article></div></div></section>

      <section className="home-section home-features" id="features"><div className="home-container"><div className="section-heading-row"><div className="section-intro"><span className="section-kicker">ONE PLATFORM, MORE MOMENTUM</span><h2>Everything working<br/><span>better together.</span></h2></div><p>From the first customer interaction to the next business decision, Elvora keeps your operations connected and your team in the loop.</p></div><div className="feature-grid">{features.map(({ icon: Icon, number, title, text }) => <article className="feature-card" key={title}><div className="feature-top"><span className="feature-icon"><Icon size={20}/></span><span>{number}</span></div><h3>{title}</h3><p>{text}</p><a href="#preview" aria-label={`Explore ${title}`}>Explore <ArrowRight size={14}/></a></article>)}</div></div></section>

      <section className="home-section home-process" id="how-it-works"><div className="home-container"><div className="section-intro centered"><span className="section-kicker">FROM BUSYWORK TO BETTER WORK</span><h2>Four steps to <span>forward.</span></h2><p>Bring the work together, make sense of it and create a smoother way to get things done.</p></div><div className="process-steps"><article><div className="process-node"><span>01</span><Users size={21}/></div><h3>Connect</h3><p>Bring your customer data and business communications into one shared workspace.</p></article><article><div className="process-node"><span>02</span><Sparkles size={21}/></div><h3>Analyze</h3><p>AI helps identify what customers need and which operational details deserve attention.</p></article><article><div className="process-node"><span>03</span><Workflow size={21}/></div><h3>Automate</h3><p>Turn repeatable processes into workflows that help your team move with consistency.</p></article><article><div className="process-node"><span>04</span><BarChart3 size={21}/></div><h3>Optimize</h3><p>Review activity and insights, then make better informed decisions as you grow.</p></article></div></div></section>

      <section className="home-section home-preview-section" id="preview"><div className="home-container"><div className="section-heading-row preview-heading"><div className="section-intro"><span className="section-kicker">A LOOK INSIDE ELVORA</span><h2>See the whole picture.<br/><span>Move work forward.</span></h2></div><p>A single workspace for customer activity, email intelligence, workflows and AI-assisted recommendations.</p></div><div className="platform-window"><div className="platform-window-top"><div><i/><i/><i/></div><span>Elvora · Workspace overview</span><span className="platform-window-label">INTERACTIVE PRODUCT PREVIEW</span></div><div className="platform-body"><aside className="platform-sidebar"><div className="platform-brand-mini"><span className="brand-mark"><Command size={13}/></span> elvora</div><small>WORKSPACE</small><span className="platform-active"><BarChart3 size={14}/> Overview</span><span><Users size={14}/> Customers</span><span><Mail size={14}/> Email intelligence</span><span><Workflow size={14}/> Workflows</span><span><Bot size={14}/> AI agents</span><small>INSIGHTS</small><span><BarChart3 size={14}/> Reports</span><div className="platform-sidebar-cta"><Sparkles size={16}/><b>Less busywork,<br/>more momentum.</b><small>Thoughtful automation<br/>for your operations.</small></div></aside><div className="platform-workspace"><div className="platform-greeting"><div><small>TUESDAY, OCTOBER 22</small><h3>Good morning, Jordan</h3><p>Here’s a snapshot of your team’s operations.</p></div><span className="platform-demo-badge"><i/> DEMONSTRATION DATA</span></div><div className="platform-metrics"><div><small>TOTAL CUSTOMERS</small><b>1,284</b><span>↗ 12.8% this month</span></div><div><small>EMAILS PROCESSED</small><b>3,642</b><span>↗ 8.2% this month</span></div><div><small>ACTIVE WORKFLOWS</small><b>24</b><span>3 added this month</span></div><div><small>AVG. CUSTOMER HEALTH</small><b>86<span>/100</span></b><span>Strong momentum</span></div></div><div className="platform-lower"><div className="platform-card"><div className="platform-card-title"><b>Customer activity</b><a href="#features">View activity <ArrowRight size={12}/></a></div><div className="platform-activity">{demoActivities.map(({ icon: Icon, label, detail, time, color })=><div key={label}><span className={`activity-icon ${color}`}><Icon size={13}/></span><p><b>{label}</b><small>{detail}</small></p><time>{time}</time></div>)}</div></div><div className="platform-card platform-ai-card"><div className="platform-ai-label"><Sparkles size={14}/> ELVORA INTELLIGENCE</div><h4>A useful next step</h4><p>Three high-priority emails are waiting for a response. Review them to keep customer conversations moving.</p><a href="#contact">Explore email intelligence <ArrowRight size={13}/></a></div></div><div className="platform-footnote"><CircleHelp size={12}/> This visual preview uses sample data and is not connected to a live workspace.</div></div></div></div></div></section>

      <section className="home-section home-why"><div className="home-container why-layout"><div><span className="section-kicker">BUILT FOR THE WAY WORK HAPPENS</span><h2>From scattered operations<br/>to <span>intelligent momentum.</span></h2><p>Elvora gives growing teams a clearer view of what’s happening and a more connected way to act on it.</p><Link className="home-text-link" to="/register">Bring your work together <ArrowRight size={15}/></Link></div><div className="why-list"><div><span><Layers3 size={17}/></span><p><b>One connected business ecosystem</b><small>Customer context, communications and workflows in one place.</small></p><Check size={16}/></div><div><span><Sparkles size={17}/></span><p><b>AI-powered decision support</b><small>Useful signals and recommendations where your team works.</small></p><Check size={16}/></div><div><span><MousePointer2 size={17}/></span><p><b>Less repetitive manual work</b><small>Free your team to focus on work that needs a human touch.</small></p><Check size={16}/></div><div><span><Headphones size={17}/></span><p><b>Centralized customer intelligence</b><small>Better conversations begin with a better view of the relationship.</small></p><Check size={16}/></div><div><span><ArrowUpRight size={17}/></span><p><b>Operations that can scale with you</b><small>Build consistent processes as your team and business grow.</small></p><Check size={16}/></div></div></div></section>

      <section className="home-cta" id="contact"><div className="home-container cta-inner"><div className="cta-decoration"><span/><span/><span/></div><span className="section-kicker">ELEVATE. CONNECT. AUTOMATE.</span><h2>Ready to transform the way<br/>your business operates?</h2><p>Bring intelligence, automation and clarity into your everyday business operations.</p><Link className="home-button cta-button" to="/register">Get started with Elvora <ArrowRight size={16}/></Link><small>No setup claims. Just a better way to see what’s possible.</small></div></section>

      <footer className="home-footer"><div className="home-container"><div className="footer-main"><div className="footer-brand-column"><Brand/><p>An intelligent operating layer for customer-focused teams. Elevate the everyday work that moves your business forward.</p><span className="footer-tagline">ELEVATE. CONNECT. AUTOMATE.</span></div><div className="footer-links"><div><b>Explore</b><a href="#features">Features</a><a href="#how-it-works">How it works</a><a href="#preview">Platform preview</a></div><div><b>Company</b><a href="#about">About Elvora</a><a href="#contact">Contact</a><Link to="/login">Log in</Link></div><div><b>Get started</b><Link to="/register">Create an account</Link><Link to="/login">Workspace login</Link><a href="#features">Product overview</a></div></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Elvora. All rights reserved.</span><span>Elevate. Connect. Automate.</span><span className="footer-legal">Privacy Policy · Terms of Service</span></div></div></footer>
    </main>
  );
}
