"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Menu, X } from "lucide-react";

const sections = [
  { id: "introduction", title: "Our Position on Data" },
  { id: "data-collected", title: "Information We Collect" },
  { id: "how-we-use", title: "How We Use Information" },
  { id: "ai-processing", title: "AI & Automated Processing" },
  { id: "data-sharing", title: "Data Sharing" },
  { id: "data-security", title: "Data Security" },
  { id: "user-rights", title: "User Rights" },
  { id: "cookies", title: "Cookies & Analytics" },
  { id: "policy-changes", title: "Policy Changes" },
  { id: "contact", title: "Contact" },
];

const dataTable = [
  {
    category: "Account information",
    description: "Name, email, username, profile details, and other information you choose to add.",
  },
  {
    category: "Platform activity",
    description: "Reviews, discussions, comments, ratings, engagement, saved products, and expert interactions.",
  },
  {
    category: "Technical information",
    description: "Browser, device type, IP address, cookies, and analytics data.",
  },
  {
    category: "AI & recommendation signals",
    description: "Interaction patterns, trust-related signals, recommendation behavior, and satisfaction-related insights.",
  },
];

export default function PrivacyPage() {
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
        <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-emerald-500/4 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-blue-500/4 blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#050505]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-black tracking-tighter text-white hover:opacity-80 transition-opacity">
            TRODEC
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">
              Terms & Conditions
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
            <p className="text-sm font-semibold text-white">Privacy Policy</p>
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
                  <span className="w-1 h-1 bg-emerald-400 rounded-full flex-shrink-0" />
                )}
                <span className={activeSection === section.id ? "" : "pl-3"}>{section.title}</span>
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
              Privacy<br />Policy
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-xl">
              Trodec is built on transparency. This policy explains what data we collect, why we collect it,
              how we use it, and the rights you have over it.
            </p>
          </div>

          <div className="space-y-16 pb-24">
            {/* Our Position */}
            <Section id="introduction" number="3.0" title="Our Position on User Data">
              <Callout>
                Trodec does not sell personal data. We use data only to operate, improve, and protect the
                platform — and to make trust intelligence work for our users.
              </Callout>
              <Prose>
                We believe your data belongs to you. Every data decision we make is guided by one question:
                does this make Trodec more useful, fair, and trustworthy for users? If the answer is no,
                we don't do it.
              </Prose>
            </Section>

            {/* Data Collected */}
            <Section id="data-collected" number="3.1" title="Information We Collect">
              <Prose>
                We collect several types of information to operate and improve the platform:
              </Prose>
              <div className="mt-6 overflow-hidden rounded-xl border border-white/8">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/8">
                      <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 w-2/5">
                        Category
                      </th>
                      <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                        What It Includes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataTable.map((row, i) => (
                      <tr
                        key={i}
                        className="border-b border-white/5 last:border-none hover:bg-white/2 transition-colors"
                      >
                        <td className="px-4 py-4 font-semibold text-white text-[13px] align-top">
                          {row.category}
                        </td>
                        <td className="px-4 py-4 text-zinc-400 text-[13px] leading-relaxed align-top">
                          {row.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* How We Use */}
            <Section id="how-we-use" number="3.2" title="How We Use Information">
              <Prose>Data collected by Trodec is used to:</Prose>
              <BulletList items={[
                "Improve recommendations and personalization.",
                "Generate AI insights and trust signals.",
                "Improve trust scoring and expert ranking systems.",
                "Detect spam, fraud, and coordinated manipulation.",
                "Improve platform performance, reliability, and safety.",
                "Operate, maintain, and develop new features.",
              ]} />
            </Section>

            {/* AI Processing */}
            <Section id="ai-processing" number="3.3" title="AI & Automated Processing">
              <Prose>
                Trodec uses AI systems to analyze discussions, reviews, engagement signals, trust-related
                activity, and recommendation outcomes. These systems help improve trust intelligence,
                recommendation quality, fraud prevention, and platform safety.
              </Prose>
              <Prose>
                Where automated systems may meaningfully affect a user's experience — for example, expert
                visibility or recommendation reach — those outcomes can be reviewed and contested through
                our support channels.
              </Prose>
            </Section>

            {/* Data Sharing */}
            <Section id="data-sharing" number="3.4" title="Data Sharing">
              <Prose>
                Trodec does not sell personal data. We may share limited data with:
              </Prose>
              <BulletList items={[
                "Cloud infrastructure providers that host platform services.",
                "Analytics providers that help us understand usage patterns.",
                "Security and fraud-prevention systems that protect users.",
                "Legal authorities, when required by valid legal process.",
              ]} />
            </Section>

            {/* Data Security */}
            <Section id="data-security" number="3.5" title="Data Security">
              <Prose>
                Trodec uses reasonable technical and organizational measures — including access controls,
                encryption in transit, and monitoring — to help protect user information. No system can
                guarantee absolute security, but we continuously invest in protecting your data.
              </Prose>
            </Section>

            {/* User Rights */}
            <Section id="user-rights" number="3.6" title="User Rights">
              <Prose>Subject to applicable law, you may request to:</Prose>
              <BulletList items={[
                "Access the data Trodec holds about you.",
                "Correct inaccurate or outdated information.",
                "Delete specific content or your full account.",
                "Withdraw consent or object to certain types of processing.",
              ]} />
              <Prose>
                Requests can be submitted through our official support channels and will be handled within
                a reasonable time frame. Contact us at{" "}
                <a href="mailto:officialtrodec@gmail.com" className="text-white underline hover:text-zinc-200 transition-colors">
                  officialtrodec@gmail.com
                </a>
                .
              </Prose>
            </Section>

            {/* Cookies */}
            <Section id="cookies" number="3.7" title="Cookies & Analytics">
              <Prose>
                Trodec may use cookies and analytics technologies to improve user experience, analyze usage
                behavior, improve performance, and personalize content. You can manage cookie preferences
                through your browser settings.
              </Prose>
            </Section>

            {/* Policy Changes */}
            <Section id="policy-changes" number="3.8" title="Policy Changes">
              <Prose>
                This Privacy Policy may evolve as Trodec grows. Material changes will be highlighted on
                the platform. Continued use of Trodec after an update indicates acceptance of the updated policy.
              </Prose>
            </Section>

            {/* Contact */}
            <Section id="contact" number="3.9" title="Contact">
              <Prose>
                Questions about this Privacy Policy can be sent to{" "}
                <a href="mailto:officialtrodec@gmail.com" className="text-white underline hover:text-zinc-200 transition-colors">
                  officialtrodec@gmail.com
                </a>{" "}
                or submitted via{" "}
                <a href="https://trodec.com" target="_blank" rel="noopener noreferrer" className="text-white underline hover:text-zinc-200 transition-colors">
                  trodec.com
                </a>
                .
              </Prose>
            </Section>

            {/* Bottom */}
            <div className="border-t border-white/5 pt-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">Trodec Master Policy v1.0</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Effective May 2026</p>
                </div>
                <Link
                  href="/terms"
                  className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors group"
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  Terms & Conditions
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

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 pl-4 border-l-2 border-emerald-500/30 bg-emerald-500/[0.03] rounded-r-xl p-4">
      <p className="text-[14px] text-zinc-300 leading-relaxed italic">{children}</p>
    </div>
  );
}
