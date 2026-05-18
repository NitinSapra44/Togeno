"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Menu, X } from "lucide-react";

const sections = [
  { id: "introduction", title: "Introduction" },
  { id: "about", title: "About Trodec" },
  { id: "eligibility", title: "Eligibility" },
  { id: "user-accounts", title: "User Accounts" },
  { id: "ai-systems", title: "AI & Automated Systems" },
  { id: "expert-trust", title: "Expert Trust System" },
  { id: "user-content", title: "User Content" },
  { id: "platform-rules", title: "Platform Rules" },
  { id: "product-disclaimer", title: "Product Disclaimer" },
  { id: "account-termination", title: "Account Termination" },
  { id: "liability", title: "Limitation of Liability" },
  { id: "policy-updates", title: "Policy Updates" },
  { id: "contact", title: "Contact" },
];

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState("introduction");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white/10">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-purple-500/5 blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#050505]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-black tracking-tighter text-white hover:opacity-80 transition-opacity">
            TRODEC
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">
              Privacy Policy
            </Link>
            <Link
              href="/"
              className="text-sm px-4 py-1.5 rounded-lg border border-white/10 text-zinc-300 hover:bg-white/5 transition-colors"
            >
              Back to Home
            </Link>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-10 py-12 relative">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-16 left-0 z-50 lg:z-auto
            w-72 lg:w-60 xl:w-72 h-[calc(100vh-4rem)] lg:max-h-[calc(100vh-6rem)]
            bg-[#050505] lg:bg-transparent border-r border-white/5 lg:border-none
            overflow-y-auto flex-shrink-0 lg:self-start
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            px-4 lg:px-0 py-6 lg:py-0
          `}
        >
          <div className="mb-6 lg:mb-8">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-1">Document</p>
            <p className="text-sm font-semibold text-white">Terms & Conditions</p>
            <p className="text-xs text-zinc-500 mt-1">v1.0 · Effective May 2026</p>
          </div>
          <nav className="space-y-0.5">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollTo(section.id)}
                className={`
                  w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200
                  ${activeSection === section.id
                    ? "bg-white/8 text-white font-medium"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/4"
                  }
                `}
              >
                {activeSection === section.id && (
                  <ChevronRight className="w-3 h-3 text-white/50 flex-shrink-0" />
                )}
                <span className={activeSection === section.id ? "" : "pl-5"}>{section.title}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8 p-3 rounded-xl border border-white/5 bg-white/2">
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Questions? Contact us at{" "}
              <a href="mailto:officialtrodec@gmail.com" className="text-white/70 hover:text-white underline">
                officialtrodec@gmail.com
              </a>
            </p>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 max-w-3xl">
          {/* Hero */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/3 text-xs text-zinc-400 mb-6">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              Effective May 2026 · v1.0
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-4">
              Terms &<br />Conditions
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-xl">
              By accessing or using the Trodec platform, you agree to these Terms & Conditions. Please read them carefully.
            </p>
          </div>

          <div className="space-y-16 pb-24">
            {/* Introduction */}
            <Section id="introduction" number="01" title="Introduction">
              <Prose>
                Trodec is building the next generation of trust commerce — a platform where users, experts, brands,
                and communities discover, discuss, and evaluate products through honest, intelligent, and AI-assisted
                conversations.
              </Prose>
              <Prose>
                This document brings every policy that governs the Trodec platform into one unified framework.
                It is designed to be transparent for users, accountable for regulators, defensible for the company,
                and credible for investors.
              </Prose>
              <Callout title="Plain-English Commitment">
                We have intentionally kept this document free of unnecessary legal jargon. Where legal precision
                is required, we say so clearly. Everywhere else, we speak in plain English so anyone using
                Trodec can understand exactly how the platform works.
              </Callout>
            </Section>

            {/* About */}
            <Section id="about" number="2.1" title="About Trodec">
              <Prose>
                Trodec is an AI-powered trust commerce platform that helps users, experts, brands, and communities
                discover, discuss, review, and evaluate products through community-driven interactions and
                AI-assisted trust intelligence.
              </Prose>
            </Section>

            {/* Eligibility */}
            <Section id="eligibility" number="2.2" title="Eligibility">
              <Prose>By using Trodec, you confirm that:</Prose>
              <BulletList items={[
                "You are legally permitted to use the platform in your country.",
                "Information you provide is accurate and current.",
                "You will not misuse the platform or its AI systems.",
                "You will follow our Community Guidelines and Expert Policy.",
              ]} />
            </Section>

            {/* User Accounts */}
            <Section id="user-accounts" number="2.3" title="User Accounts">
              <Prose>
                You may create a Trodec account to join communities, interact with experts, post reviews,
                save products, and participate in discussions. You are responsible for keeping your account
                credentials secure.
              </Prose>
              <Prose>Trodec reserves the right to suspend or terminate accounts involved in:</Prose>
              <BulletList items={[
                "Fake engagement or coordinated inauthentic activity.",
                "Spam, abuse, harassment, or impersonation.",
                "Manipulation of reviews, rankings, or AI signals.",
                "Any other violation of these Terms or our policies.",
              ]} />
            </Section>

            {/* AI & Automated Systems */}
            <Section id="ai-systems" number="2.4" title="AI & Automated Systems">
              <Prose>
                Trodec uses artificial intelligence and automated systems to analyze platform interactions,
                discussions, reviews, engagement signals, product interactions, and other activity in order to:
              </Prose>
              <BulletList items={[
                "Improve recommendations and personalization.",
                "Generate trust-related insights.",
                "Detect manipulation, fraud, and coordinated abuse.",
                "Improve platform safety and quality.",
                "Rank experts, communities, and content.",
              ]} />
              <Callout title="Important">
                AI-generated scores, rankings, and trust insights are estimates produced by automated systems
                and may evolve over time. Trodec does not guarantee the absolute accuracy of any
                AI-generated insight.
              </Callout>
            </Section>

            {/* Expert Trust System */}
            <Section id="expert-trust" number="2.5" title="Expert Trust System">
              <Prose>
                Experts on Trodec may receive trust scores, rankings, visibility boosts, engagement insights,
                and recommendation analytics. These signals may consider factors such as community feedback,
                engagement quality, return-related signals, user satisfaction, consistency, educational value,
                and recommendation outcomes.
              </Prose>
              <Prose>
                Trodec reserves the right to modify expert visibility, rankings, and trust metrics at any
                time as the platform evolves.
              </Prose>
            </Section>

            {/* User Content */}
            <Section id="user-content" number="2.6" title="User Content">
              <Prose>
                You retain ownership of the content you upload. By posting content to Trodec, you grant
                Trodec a non-exclusive, worldwide license to display, host, process, analyze, and use the
                content to operate, improve, and personalize the platform — including through AI analysis
                and recommendation systems.
              </Prose>
              <div className="mt-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3">This license covers</p>
                <BulletList items={[
                  "Reviews, ratings, and recommendations.",
                  "Discussions, comments, and replies.",
                  "Videos, audio, and image content.",
                  "Text content posted publicly on Trodec surfaces.",
                ]} />
              </div>
            </Section>

            {/* Platform Rules */}
            <Section id="platform-rules" number="2.7" title="Platform Rules">
              <Prose>To keep Trodec trustworthy, users must not:</Prose>
              <BulletList items={[
                "Post fake reviews or manipulated ratings.",
                "Engage in artificial engagement, vote rings, or manipulation.",
                "Impersonate other users, experts, brands, or organizations.",
                "Post harmful, illegal, or deceptive content.",
                "Misuse, probe, or attempt to bypass Trodec's AI systems.",
                "Engage in fraud, spam, or harassment of any kind.",
              ]} />
              <Prose>
                Violations may result in content removal, restricted visibility, account suspension, or
                permanent removal from the platform.
              </Prose>
            </Section>

            {/* Product Disclaimer */}
            <Section id="product-disclaimer" number="2.8" title="Product & Recommendation Disclaimer">
              <Prose>
                Trodec does not manufacture, sell, or warrant third-party products. Reviews, discussions,
                and recommendations on the platform represent individual opinions and experiences.
              </Prose>
              <Prose>Trodec does not guarantee:</Prose>
              <BulletList items={[
                "Product quality, durability, or performance.",
                "Product safety or regulatory compliance.",
                "Purchase satisfaction or financial outcomes.",
                "The accuracy of any expert opinion.",
                "The reliability of any recommendation.",
              ]} />
              <Prose>
                Users should make independent purchasing decisions based on their own research and judgment.
              </Prose>
            </Section>

            {/* Account Termination */}
            <Section id="account-termination" number="2.9" title="Account Termination">
              <Prose>
                Trodec reserves the right to remove content, suspend accounts, restrict access, or terminate
                accounts where users violate these Terms, our Community Guidelines, or our Expert Policy.
              </Prose>
            </Section>

            {/* Liability */}
            <Section id="liability" number="2.10" title="Limitation of Liability">
              <Prose>
                Trodec is provided on an "as-is" and "as-available" basis. To the maximum extent permitted
                by law, Trodec is not liable for:
              </Prose>
              <BulletList items={[
                "Third-party content, opinions, or reviews.",
                "Expert recommendations or purchase outcomes.",
                "Quality, safety, or performance issues with third-party products or brands.",
                "Any direct, indirect, incidental, or consequential losses.",
              ]} />
            </Section>

            {/* Policy Updates */}
            <Section id="policy-updates" number="2.11" title="Policy Updates">
              <Prose>
                These Terms may be updated as Trodec evolves. Material changes will be communicated through
                the platform. Continued use of Trodec after an update constitutes acceptance of the updated Terms.
              </Prose>
            </Section>

            {/* Contact */}
            <Section id="contact" number="2.12" title="Contact">
              <Prose>
                For support or policy-related questions, contact us at{" "}
                <a href="mailto:officialtrodec@gmail.com" className="text-white underline hover:text-zinc-200 transition-colors">
                  officialtrodec@gmail.com
                </a>{" "}
                or visit{" "}
                <a href="https://trodec.com" target="_blank" rel="noopener noreferrer" className="text-white underline hover:text-zinc-200 transition-colors">
                  trodec.com
                </a>
                .
              </Prose>
            </Section>

            {/* Divider */}
            <div className="border-t border-white/5 pt-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">Trodec Master Policy v1.0</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Effective May 2026</p>
                </div>
                <Link
                  href="/privacy"
                  className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors group"
                >
                  Privacy Policy
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Section({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 font-mono">{number}</span>
        <div className="h-px flex-1 bg-white/5" />
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 tracking-tight">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return <p className="text-[15px] text-zinc-400 leading-relaxed">{children}</p>;
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5 my-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-[15px] text-zinc-400">
          <span className="mt-1.5 w-1 h-1 bg-zinc-600 rounded-full flex-shrink-0" />
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Callout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="my-6 pl-4 border-l-2 border-white/10 bg-white/[0.02] rounded-r-xl p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">{title}</p>
      <p className="text-[14px] text-zinc-400 leading-relaxed italic">{children}</p>
    </div>
  );
}
