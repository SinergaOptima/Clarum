import { Breadcrumb } from "@/components/Breadcrumb";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const plans = [
  {
    name: "Personal",
    subtitle: "Non-Commercial",
    price: "$15/mo",
    license: "Personal, non-commercial use only.",
    allowed: [
      "Personal learning",
      "Home research",
      "Hobby analysis",
      "YouTube viewing/notes",
      "Private curiosity projects",
    ],
    notAllowed: [
      "Any professional use",
      "Consulting or client work",
      "Workplace decisions",
      "Paid research",
      "Monetized newsletters or YouTube",
      "Any use for business benefit",
      "Reselling outputs",
    ],
    includes: ["3 dossiers/month", "Memo", "Evidence links"],
    bestFor: "Individuals exploring topics casually.",
  },
  {
    name: "Team",
    subtitle: "Non-Commercial / Internal Eval",
    price: "$40/mo",
    perWorkspace: true,
    license: "Non-commercial, for internal evaluation/learning only.",
    allowed: ["Internal team evaluation", "Student teams", "Non-profit learning contexts"],
    notAllowed: [
      "Production professional use",
      "Revenue-generating use",
      "Client deliverables",
      "Operational decisions",
    ],
    includes: ["10 dossiers/month", "Shared workspace features"],
    bestFor: "Small groups evaluating Clarum, student teams, non-profit learning.",
  },
  {
    name: "Enterprise",
    subtitle: "Commercial License",
    price: "Starting at $399/mo",
    license: "Commercial use granted.",
    allowed: [
      "Professional use",
      "Workplace decisions",
      "Paid/internal research",
      "Integration into business workflows",
      "Commercial publications (with citations)",
      "Consulting deliverables",
    ],
    includes: [
      "50 dossiers/month",
      "Scheduled refresh options",
      "Collaboration features",
      "Audit exports",
      "Priority support",
    ],
    bestFor: "Organizations requiring commercial use rights.",
    note: "Large-company deployments: priced by seats, refresh cadence, and source connectors.",
  },
];

const faqItems = [
  {
    q: "What is non-commercial use?",
    a: "Use that is personal, educational, or exploratory without any revenue or professional benefit. It excludes consulting, workplace decisions, monetized content, and client deliverables.",
  },
  {
    q: "Can I use Personal for school projects?",
    a: "Yes, if the project is not monetized and not for professional purposes. Academic research without commercial intent qualifies.",
  },
  {
    q: "Can I use Personal for a monetized newsletter or YouTube?",
    a: "No. Any revenue-generating use requires an Enterprise license.",
  },
  {
    q: "What counts as commercial use?",
    a: "Professional work, revenue-adjacent activities, workplace decisions, consulting, paid research, monetized content, and any use that provides business benefit.",
  },
  {
    q: "Can I switch from Personal/Team to Enterprise later?",
    a: "Yes. Upgrade anytime to unlock commercial use rights and higher allowances.",
  },
  {
    q: "Do you predict outcomes?",
    a: "No. Clarum provides decision support, exposure mapping, and uncertainty documentation. It does not forecast or predict future events.",
  },
];

export default function CostsPage() {
  return (
    <div className="page-shell section-y">
      <Breadcrumb segments={[{ label: "Costs" }]} />
      <ScrollReveal>
        <section>
          <div className="section-label">01 Costs & Licensing</div>
          <h1 className="mt-4 font-display text-3xl font-normal text-fg md:text-4xl lg:text-5xl">
            Costs & Licensing
          </h1>
          <p className="mt-3 section-preface">
            Clarum is priced by subscription plus dossier credits. The Personal plan is for
            non-commercial personal use only. Commercial use requires an Enterprise license.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section>
          <div className="section-label">02 Plans</div>
          <div className="mt-4 grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`surface-raised card-pad rounded-xl border flex flex-col ${plan.name === "Enterprise" ? "border-accent3/40" : "border-border"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-display text-lg text-fg">{plan.name}</h2>
                    <p className="text-xs text-muted">{plan.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-lg text-fg">{plan.price}</div>
                    {plan.perWorkspace && <p className="text-xs text-muted">per workspace</p>}
                  </div>
                </div>
                <div className="mt-4 flex flex-col space-y-3 text-sm flex-1">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">License</p>
                    <p className="mt-1 text-fg/80">{plan.license}</p>
                  </div>
                  {plan.allowed.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-muted">Allowed</p>
                      <ul className="mt-1 space-y-0.5 text-fg/80">
                        {plan.allowed.map((item) => (
                          <li key={item}>· {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {plan.notAllowed && plan.notAllowed.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-muted">Not allowed</p>
                      <ul className="mt-1 space-y-0.5 text-fg/80">
                        {plan.notAllowed.map((item) => (
                          <li key={item}>· {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">Includes</p>
                    <ul className="mt-1 space-y-0.5 text-fg/80">
                      {plan.includes.map((item) => (
                        <li key={item}>· {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">Best for</p>
                    <p className="mt-1 text-fg/80">{plan.bestFor}</p>
                  </div>
                  {plan.note && <p className="text-xs text-muted">{plan.note}</p>}
                  <div className="mt-auto pt-4 border-t border-border/50">
                    <Button asChild variant={plan.name === "Enterprise" ? "primary" : "outline"} className="w-full">
                      <Link href="/about">{plan.name === "Enterprise" ? "Contact sales" : "Get started"}</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted">
            A dossier credit represents a full run: report + memo + evidence index + export.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section>
          <div className="section-label">03 Licensing summary</div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="surface-raised card-pad rounded-xl border border-border border-accent/30">
              <h2 className="font-display text-base text-fg">Non-Commercial License</h2>
              <p className="mt-1 text-xs text-muted">Personal / Team</p>
              <ul className="mt-3 space-y-1 text-sm text-fg/80">
                <li>· No professional use</li>
                <li>· No monetization</li>
                <li>· No client work</li>
                <li>· No internal business decisions</li>
                <li>· No resale of outputs</li>
              </ul>
            </div>
            <div className="surface-raised card-pad rounded-xl border border-border border-accent/30">
              <h2 className="font-display text-base text-fg">Commercial License</h2>
              <p className="mt-1 text-xs text-muted">Enterprise</p>
              <ul className="mt-3 space-y-1 text-sm text-fg/80">
                <li>· Professional and revenue-adjacent use permitted</li>
                <li>· Team workflows and sharing</li>
                <li>· Audit/export features intended for business use</li>
              </ul>
            </div>
          </div>
          <p className="mt-4 text-sm text-fg/80">
            If you are unsure whether your use is commercial, assume it is and use Enterprise.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section>
          <div className="section-label">04 Compute options</div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="surface-raised card-pad rounded-xl border border-border">
              <h2 className="font-display text-lg text-fg">BYO Key</h2>
              <p className="mt-1 text-xs text-muted">Bring Your Own API Keys</p>
              <p className="mt-3 text-sm text-fg/80">
                Lower compute cost burden on Clarum; your usage is billed by your model provider.
                Clarum provides the product, pipeline, caching, evidence ledger, and exports.
              </p>
            </div>
            <div className="surface-raised card-pad rounded-xl border border-border">
              <h2 className="font-display text-lg text-fg">Managed Compute</h2>
              <p className="mt-1 text-xs text-muted">Clarum-hosted</p>
              <p className="mt-3 text-sm text-fg/80">
                Clarum includes compute up to your plan&apos;s allowance (dossier credits). Heavy
                usage is handled via additional dossier packs.
              </p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section>
          <div className="section-label">05 What drives costs</div>
          <ul className="mt-4 space-y-2 text-sm text-fg/80">
            <li>· Dossiers per month</li>
            <li>· Refresh cadence (on-demand vs scheduled)</li>
            <li>· Depth of synthesis (quick summary vs deep memo)</li>
            <li>· Source coverage (public APIs vs premium connectors)</li>
          </ul>
          <p className="mt-4 text-sm text-fg/80">
            Caching and deterministic runs reduce waste and improve reproducibility.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section>
          <div className="section-label">06 Plan estimator</div>
          <div className="mt-4 surface-raised card-pad rounded-xl border border-border">
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted">Dossiers/month</p>
                <ul className="mt-2 space-y-1 text-sm text-fg/80">
                  <li>1–3</li>
                  <li>4–10</li>
                  <li>11–50</li>
                  <li>50+</li>
                </ul>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted">Recommended plan</p>
                <ul className="mt-2 space-y-1 text-sm text-fg/80">
                  <li>1–3 + Personal use → Personal plan</li>
                  <li>4–10 + Evaluation → Team plan</li>
                  <li>Any Professional commercial → Enterprise</li>
                  <li>50+ → Enterprise (larger deployment)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section>
          <div className="section-label">07 FAQ</div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {faqItems.map((item) => (
              <div key={item.q} className="surface-flush card-pad rounded-xl border border-border">
                <h2 className="font-display text-base text-fg">{item.q}</h2>
                <p className="mt-2 text-sm text-fg/80">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
