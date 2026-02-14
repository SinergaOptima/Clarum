import { Suspense } from "react";
import { DossiersClient } from "@/app/dossiers/DossiersClient";
import { getAllDossiers } from "@/data/loaders";

export default async function DossiersPage() {
  const items = await getAllDossiers();
  return (
    <Suspense
      fallback={
        <div className="page-shell section-y text-sm">
          <section className="card-pad rounded-2xl border border-border/90 bg-card shadow-raised">
            <div className="text-xs uppercase tracking-[0.14em] text-muted">Loading dossiers...</div>
          </section>
        </div>
      }
    >
      <DossiersClient items={items} />
    </Suspense>
  );
}
