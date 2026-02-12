import { DossiersClient } from "@/app/dossiers/DossiersClient";
import { getAllDossiers } from "@/data/loaders";

export default async function DossiersPage() {
  const items = await getAllDossiers();
  return <DossiersClient items={items} />;
}
