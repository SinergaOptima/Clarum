import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export const metadata: Metadata = {
  title: "Design System — Clarum",
  description: "Live design token reference and component inventory.",
};

/* ── Color token definitions ── */

const colorTokens = [
  { name: "--bg", label: "Background" },
  { name: "--fg", label: "Foreground" },
  { name: "--muted", label: "Muted" },
  { name: "--card", label: "Card" },
  { name: "--border", label: "Border" },
  { name: "--accent", label: "Accent" },
  { name: "--link", label: "Link" },
  { name: "--accent-2", label: "Accent 2" },
  { name: "--accent-3", label: "Accent 3" },
  { name: "--accent-secondary", label: "Accent Secondary" },
  { name: "--good", label: "Good" },
  { name: "--warn", label: "Warn" },
  { name: "--danger", label: "Danger" },
];

const radiusTokens = [
  { name: "--radius-sm", value: "10px" },
  { name: "--radius-md", value: "16px" },
  { name: "--radius-lg", value: "22px" },
  { name: "--radius-xl", value: "28px" },
];

const shadowTokens = [
  { name: "flush", label: "Flush", className: "shadow-flush" },
  { name: "soft", label: "Soft", className: "shadow-soft" },
  { name: "raised", label: "Raised", className: "shadow-raised" },
  { name: "floating", label: "Floating", className: "shadow-floating" },
  { name: "hard", label: "Hard", className: "shadow-hard" },
];

const animTokens = [
  { name: "--anim-micro", value: "100ms", desc: "Micro interactions" },
  { name: "--anim-normal", value: "300ms", desc: "Standard transitions" },
  { name: "--anim-slow", value: "800ms", desc: "Dramatic reveals" },
];

const easingTokens = [
  { name: "--ease-standard", value: "cubic-bezier(0.4, 0.0, 0.2, 1)", desc: "Material standard" },
  { name: "--ease-smooth", value: "cubic-bezier(0.25, 0.46, 0.45, 0.94)", desc: "Smooth, natural" },
];

/* ── Reusable section components ── */

function Section({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="section-label">{title}</div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function TokenCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-border/30 px-1.5 py-0.5 text-[0.72rem] text-fg/80">{children}</code>
  );
}

/* ── Page ── */

export default function DesignSystemPage() {
  return (
    <div className="page-shell section-y pb-16">
      <header className="stack-sm">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Design System</h1>
        <p className="max-w-[58ch] text-fg/70">
          Live reference of all design tokens, utilities, and components used across Clarum. Values
          are rendered from the actual CSS custom properties so this page stays in sync automatically.
        </p>
      </header>

      {/* ── Color Palette ── */}
      <Section title="Color Palette" id="colors">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {colorTokens.map((token) => (
            <div
              key={token.name}
              className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/60 p-3"
            >
              <div
                className="h-12 w-12 shrink-0 rounded-lg border border-border/50"
                style={{ background: `rgb(var(${token.name}))` }}
              />
              <div className="min-w-0">
                <div className="text-sm font-medium">{token.label}</div>
                <TokenCode>{token.name}</TokenCode>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Typography ── */}
      <Section title="Typography" id="typography">
        <div className="stack-lg">
          {/* Font families */}
          <div className="stack-md">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">Font Families</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border/70 bg-card/60 p-4">
                <div className="text-xs uppercase tracking-[0.12em] text-muted">Display</div>
                <div className="mt-2 font-display text-2xl font-semibold">Space Grotesk</div>
                <TokenCode>--font-display</TokenCode>
              </div>
              <div className="rounded-xl border border-border/70 bg-card/60 p-4">
                <div className="text-xs uppercase tracking-[0.12em] text-muted">Body</div>
                <div className="mt-2 text-2xl">Manrope</div>
                <TokenCode>--font-body</TokenCode>
              </div>
              <div className="rounded-xl border border-border/70 bg-card/60 p-4">
                <div className="text-xs uppercase tracking-[0.12em] text-muted">Mono</div>
                <div className="mt-2 font-mono text-2xl">JetBrains Mono</div>
                <TokenCode>--font-mono</TokenCode>
              </div>
            </div>
          </div>

          {/* Type scale */}
          <div className="stack-md">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">Type Scale</h3>
            <div className="rounded-xl border border-border/70 bg-card/60 p-5">
              <div className="stack-md">
                <div>
                  <div className="text-[0.68rem] uppercase tracking-[0.16em] text-muted">h1 — text-4xl (2.25rem)</div>
                  <h1 className="font-display text-4xl font-bold tracking-tight">Evidence-Linked Analysis</h1>
                </div>
                <div>
                  <div className="text-[0.68rem] uppercase tracking-[0.16em] text-muted">h2 — text-2xl (1.5rem)</div>
                  <h2 className="font-display text-2xl font-semibold">Domain Overview</h2>
                </div>
                <div>
                  <div className="text-[0.68rem] uppercase tracking-[0.16em] text-muted">h3 — text-lg (1.125rem)</div>
                  <h3 className="font-display text-lg font-semibold">Indicator Detail</h3>
                </div>
                <div>
                  <div className="text-[0.68rem] uppercase tracking-[0.16em] text-muted">h4 — text-base (1rem)</div>
                  <h4 className="font-display text-base font-semibold">Section Header</h4>
                </div>
                <div>
                  <div className="text-[0.68rem] uppercase tracking-[0.16em] text-muted">Body — text-sm (0.875rem)</div>
                  <p className="text-sm">Body text at 0.875rem with 1.6 line-height for comfortable reading across long-form analysis reports and dossier summaries.</p>
                </div>
                <div>
                  <div className="text-[0.68rem] uppercase tracking-[0.16em] text-muted">Caption — text-xs (0.75rem)</div>
                  <p className="text-xs text-muted">Metadata, labels, and secondary information at small scale.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Font weights */}
          <div className="stack-md">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">Font Weights</h3>
            <div className="grid gap-3 sm:grid-cols-4">
              {([
                ["400", "Regular"],
                ["500", "Medium"],
                ["600", "Semibold"],
                ["700", "Bold"],
              ] as const).map(([weight, label]) => (
                <div key={weight} className="rounded-xl border border-border/70 bg-card/60 p-3 text-center">
                  <div className="text-2xl" style={{ fontWeight: Number(weight) }}>{label}</div>
                  <div className="mt-1 text-xs text-muted">{weight}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Spacing & Layout ── */}
      <Section title="Spacing & Layout" id="spacing">
        <div className="grid gap-4 sm:grid-cols-2">
          {([
            ["--content-width", "1100px", "Max content width"],
            ["--content-pad", "1.5rem", "Content horizontal padding"],
            ["--layout-gap", "2.1rem", "Gap between layout sections"],
          ] as const).map(([token, value, desc]) => (
            <div key={token} className="rounded-xl border border-border/70 bg-card/60 p-4">
              <div className="text-sm font-medium">{desc}</div>
              <div className="mt-1 flex items-center gap-2">
                <TokenCode>{token}</TokenCode>
                <span className="text-xs text-muted">{value}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border/70 bg-card/60 p-4">
            <div className="text-xs uppercase tracking-[0.12em] text-muted">.card-pad</div>
            <div className="mt-2 rounded-lg border border-dashed border-accent/40 card-pad bg-accent/5">
              <span className="text-xs text-muted">p-5 (1.25rem)</span>
            </div>
          </div>
          <div className="rounded-xl border border-border/70 bg-card/60 p-4">
            <div className="text-xs uppercase tracking-[0.12em] text-muted">.card-pad-tight</div>
            <div className="mt-2 rounded-lg border border-dashed border-accent/40 card-pad-tight bg-accent/5">
              <span className="text-xs text-muted">p-3 (0.75rem)</span>
            </div>
          </div>
          <div className="rounded-xl border border-border/70 bg-card/60 p-4">
            <div className="text-xs uppercase tracking-[0.12em] text-muted">.prose-pad</div>
            <div className="mt-2 rounded-lg border border-dashed border-accent/40 prose-pad bg-accent/5">
              <span className="text-xs text-muted">p-6 (1.5rem)</span>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Border Radius ── */}
      <Section title="Border Radius" id="radius">
        <div className="grid gap-4 sm:grid-cols-4">
          {radiusTokens.map((token) => (
            <div
              key={token.name}
              className="flex flex-col items-center gap-3 rounded-xl border border-border/70 bg-card/60 p-4"
            >
              <div
                className="h-16 w-16 border-2 border-accent/50 bg-accent/10"
                style={{ borderRadius: token.value }}
              />
              <div className="text-center">
                <TokenCode>{token.name}</TokenCode>
                <div className="mt-1 text-xs text-muted">{token.value}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Shadows & Elevation ── */}
      <Section title="Shadows & Elevation" id="shadows">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {shadowTokens.map((token) => (
            <div
              key={token.name}
              className="flex flex-col items-center gap-3 rounded-xl border border-border/70 bg-card/60 p-4"
            >
              <div className={`h-16 w-full rounded-lg border border-border/40 bg-card ${token.className}`} />
              <div className="text-center">
                <div className="text-sm font-medium">{token.label}</div>
                <TokenCode>--shadow-{token.name}</TokenCode>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Surface Utilities ── */}
      <Section title="Surface Utilities" id="surfaces">
        <div className="grid gap-4 sm:grid-cols-3">
          {(["flush", "raised", "floating"] as const).map((level) => (
            <div
              key={level}
              className={`surface-${level} rounded-xl border border-border/70 p-5`}
            >
              <div className="text-sm font-medium capitalize">{level}</div>
              <div className="mt-1">
                <TokenCode>.surface-{level}</TokenCode>
              </div>
              <p className="mt-2 text-xs text-muted">
                Card background with {level} elevation shadow, highlight, and edge insets.
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Animation Timing ── */}
      <Section title="Animation Timing" id="animation">
        <div className="stack-md">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">Durations</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {animTokens.map((token) => (
              <div key={token.name} className="rounded-xl border border-border/70 bg-card/60 p-4">
                <div className="text-sm font-medium">{token.desc}</div>
                <div className="mt-1 flex items-center gap-2">
                  <TokenCode>{token.name}</TokenCode>
                  <span className="text-xs text-muted">{token.value}</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-border/40">
                  <div
                    className="h-full rounded-full bg-accent/60"
                    style={{
                      width: `${(parseInt(token.value) / 800) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <h3 className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-muted">Easing Curves</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {easingTokens.map((token) => (
              <div key={token.name} className="rounded-xl border border-border/70 bg-card/60 p-4">
                <div className="text-sm font-medium">{token.desc}</div>
                <div className="mt-1">
                  <TokenCode>{token.name}</TokenCode>
                </div>
                <div className="mt-1 text-xs text-muted font-mono">{token.value}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Component Inventory ── */}
      <Section title="Component Inventory" id="components">
        <div className="stack-lg">
          {/* Buttons */}
          <div className="stack-md">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">Buttons</h3>
            <div className="rounded-xl border border-border/70 bg-card/60 p-5">
              <div className="stack-md">
                <div>
                  <div className="text-[0.68rem] uppercase tracking-[0.16em] text-muted mb-2">Variants</div>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary">Primary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="soft">Soft</Button>
                    <Button variant="ghost">Ghost</Button>
                  </div>
                </div>
                <div>
                  <div className="text-[0.68rem] uppercase tracking-[0.16em] text-muted mb-2">Sizes</div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="primary" size="sm">Small</Button>
                    <Button variant="primary" size="md">Medium</Button>
                    <Button variant="primary" size="lg">Large</Button>
                  </div>
                </div>
                <div>
                  <div className="text-[0.68rem] uppercase tracking-[0.16em] text-muted mb-2">States</div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="primary">Default</Button>
                    <Button variant="primary" disabled>Disabled</Button>
                    <Button variant="outline" disabled>Disabled Outline</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="stack-md">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">Badges</h3>
            <div className="rounded-xl border border-border/70 bg-card/60 p-5">
              <div className="flex flex-wrap gap-3">
                <Badge variant="neutral">Neutral</Badge>
                <Badge variant="good">Good</Badge>
                <Badge variant="warn">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
              </div>
            </div>
          </div>

          {/* Inputs */}
          <div className="stack-md">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">Inputs</h3>
            <div className="rounded-xl border border-border/70 bg-card/60 p-5">
              <div className="stack-md max-w-sm">
                <div>
                  <div className="text-[0.68rem] uppercase tracking-[0.16em] text-muted mb-2">Default</div>
                  <Input placeholder="Enter a value..." />
                </div>
                <div>
                  <div className="text-[0.68rem] uppercase tracking-[0.16em] text-muted mb-2">Error</div>
                  <Input placeholder="Invalid input" error />
                </div>
                <div>
                  <div className="text-[0.68rem] uppercase tracking-[0.16em] text-muted mb-2">Disabled</div>
                  <Input placeholder="Disabled" disabled />
                </div>
              </div>
            </div>
          </div>

          {/* Cards */}
          <div className="stack-md">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">Cards</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {(["flush", "raised", "floating"] as const).map((elevation) => (
                <div
                  key={elevation}
                  className={`card-surface card-pad rounded-xl border border-border bg-card surface-${elevation}`}
                >
                  <h4 className="font-display text-lg font-semibold capitalize">{elevation}</h4>
                  <p className="mt-1 text-sm text-fg/70">
                    Card with <TokenCode>elevation=&quot;{elevation}&quot;</TokenCode>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Link styles */}
          <div className="stack-md">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">Link Styles</h3>
            <div className="rounded-xl border border-border/70 bg-card/60 p-5">
              <div className="flex flex-wrap gap-6">
                <span className="link-underline link-accent cursor-pointer">Link underline + accent</span>
                <span className="link-accent cursor-pointer">Link accent only</span>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
