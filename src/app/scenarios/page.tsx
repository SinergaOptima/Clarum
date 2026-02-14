import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SectionHeader } from "@/components/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getAllDossiers } from "@/data/loaders";
import {
  type TrackKey,
  deriveTrackFromReportId,
  getTrackDescription,
  getTrackLabel,
  getTrackSlug,
  normalizeTrack,
} from "@/data/track";

const scenarioTracks: TrackKey[] = [
  "ev_oem_domestic",
  "ev_oem_export",
  "semi_osat_export",
  "battery_supply_chain",
  "industrial_power_grid",
  "critical_minerals",
  "maritime_logistics",
  "sanctions_controls",
];

export default async function ScenariosPage() {
  const dossiers = await getAllDossiers();
  const counts = new Map<TrackKey, number>();
  for (const track of [...scenarioTracks, "other"] as const) {
    counts.set(track, 0);
  }

  for (const dossier of dossiers) {
    const trackFromId = deriveTrackFromReportId(dossier.id);
    const track = trackFromId === "other" ? normalizeTrack(dossier.track) : trackFromId;
    counts.set(track, (counts.get(track) ?? 0) + 1);
  }

  const tracksToShow = counts.get("other")
    ? [...scenarioTracks, "other" as const]
    : scenarioTracks;

  return (
    <div className="page-shell section-y text-sm">
      <Breadcrumb segments={[{ label: "Scenarios" }]} />
      <ScrollReveal>
        <section className="card-pad rounded-2xl border border-border/90 bg-card shadow-raised">
          <div className="section-label">Scenario directory</div>
          <h1 className="mt-3 font-display text-2xl font-normal text-fg md:text-3xl">Scenarios</h1>
          <p className="section-preface max-w-3xl">
            Compare dossier families by risk lens. Each scenario groups countries under the same
            decision frame so you can compare like-for-like profiles.
          </p>
        </section>
      </ScrollReveal>

      <section className="stack-lg">
        {tracksToShow.map((track) => (
          <article
            key={track}
            className="card-pad rounded-xl border border-border/90 bg-card shadow-raised"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <SectionHeader
                className="mb-0"
                title={getTrackLabel(track)}
                subtitle="Decision-support scenario"
              />
              <Badge variant="neutral">{counts.get(track) ?? 0} dossiers</Badge>
            </div>
            <p className="mt-3 max-w-4xl text-sm leading-relaxed text-fg/85">
              {getTrackDescription(track)}
            </p>
            {(counts.get(track) ?? 0) === 0 ? (
              <p className="mt-2 text-xs text-muted">Data not present in current export bundle.</p>
            ) : null}
            <div className="mt-4">
              <Button asChild variant="outline" size="sm">
                <Link href={`/dossiers?track=${getTrackSlug(track)}`}>Browse dossiers</Link>
              </Button>
            </div>
          </article>
        ))}
      </section>

      <section className="card-pad rounded-xl border border-border/90 bg-card shadow-flush">
        <h2 className="font-display text-lg text-fg">Method note</h2>
        <p className="mt-2 text-sm leading-relaxed text-fg/85">
          These dossiers map structured indicators into a consistent risk lens. They are decision
          support, not forecasts.
        </p>
      </section>
    </div>
  );
}
