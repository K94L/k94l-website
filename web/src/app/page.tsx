import Image from "next/image";
import Link from "next/link";
import { getAnonSupabaseClient } from "@/lib/supabase";
import {
  calculateStats,
  normaliseStatus,
  sortPortfolio,
  statusBadgeClass,
} from "@/lib/portfolio";
import type { PortfolioCompany } from "@/types/portfolio";

export const revalidate = 86400;

async function fetchPortfolio(): Promise<PortfolioCompany[]> {
  const supabase = getAnonSupabaseClient();
  const { data, error } = await supabase
    .from("portfolio_companies")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch portfolio:", error.message);
    return [];
  }

  return data ?? [];
}

export default async function HomePage() {
  const portfolio = sortPortfolio(await fetchPortfolio());
  const { active, exits } = calculateStats(portfolio);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
          <Link href="#" className="flex items-center gap-2">
            <Image src="/k94l-red.png" alt="K94L Holding" width={72} height={16} />
          </Link>
          <div className="flex gap-6 text-sm font-medium text-slate-700">
            <a className="hover:text-slate-900" href="#about">
              Approach
            </a>
            <a className="hover:text-slate-900" href="#portfolio">
              Portfolio
            </a>
            <a className="hover:text-slate-900" href="#contact">
              Contact
            </a>
          </div>
        </nav>
      </header>

      <main>
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-5xl px-6 py-24">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              K94L Holding
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-600">
              Private investment company focusing primarily on startups.
            </p>
            <a
              className="mt-8 inline-flex rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              href="#portfolio"
            >
              View Portfolio
            </a>
          </div>
        </section>

        <section className="border-b border-slate-200">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-6 py-12 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold">2016</div>
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Founded
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold" data-testid="portfolio-count">
                {active}
              </div>
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Portfolio Companies
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{exits}</div>
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Exits
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">10+</div>
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Years Experience
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="border-b border-slate-200">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <h2 className="text-center text-3xl font-semibold text-slate-900">
              Approach
            </h2>
            <div className="mt-12 grid gap-10 md:grid-cols-3">
              {[
                {
                  title: "Focus",
                  description:
                    "We back companies with a clear niche and problem-solving mission, where sharp focus drives meaningful impact.",
                  icon: "🎯",
                },
                {
                  title: "Talent",
                  description:
                    "We partner with teams who deeply understand their field and bring the expertise needed to succeed.",
                  icon: "👥",
                },
                {
                  title: "Experience",
                  description:
                    "We help companies work purposefully toward their goals, using our experience to steer clear of common pitfalls.",
                  icon: "📈",
                },
              ].map((item) => (
                <div key={item.title} className="space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-lg text-white">
                    <span aria-hidden>{item.icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="portfolio" className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <div className="text-center">
              <h2 className="text-3xl font-semibold text-slate-900">Portfolio</h2>
              <p className="mt-3 text-base text-slate-600">
                Overview of portfolio companies.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {portfolio.length === 0 && (
                <p className="col-span-full rounded-lg border border-dashed border-slate-200 px-6 py-10 text-center text-slate-500">
                  No portfolio entries yet.
                </p>
              )}

              {portfolio.map((company) => {
                const status = normaliseStatus(company.tag);
                const statusClass = statusBadgeClass(status);
                const year = company.year ?? "—";
                const website = company.website?.startsWith("http")
                  ? company.website
                  : company.website
                    ? `https://${company.website}`
                    : null;

                return (
                  <article
                    key={company.id}
                    className="rounded-xl border border-slate-200 p-6 transition hover:-translate-y-0.5 hover:border-slate-900"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {company.name}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {company.industry ?? "—"}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusClass}`}
                      >
                        {status}
                      </span>
                    </div>
                    <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 text-sm text-slate-600">
                      {website ? (
                        <a
                          className="font-semibold text-slate-900 hover:underline"
                          href={website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Visit Website
                        </a>
                      ) : (
                        <span />
                      )}
                      <div className="text-right">
                        <div className="text-sm font-semibold text-slate-900">
                          {year}
                        </div>
                        <div className="text-xs text-slate-500">Year</div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="bg-slate-50">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              K94L Holding
            </h3>
            <p className="text-sm text-slate-600">
              Org.nr: {" "}
              <a
                href="https://www.proff.no/selskap/k94l-holding-as/oslo/-/IF6FD3Q0000"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-slate-900 hover:underline"
              >
                917 787 158
              </a>
            </p>
          </div>
          <div className="text-sm text-slate-600">
            <div className="font-semibold text-slate-900">Contact</div>
            <a className="font-semibold text-slate-900 hover:underline" href="mailto:hello@k94l.com">
              hello@k94l.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
