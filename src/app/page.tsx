import { HomePageClient } from "./HomePageClient";
import { getAllDossiers, getAllEvidenceList } from "@/data/loaders";

export default async function HomePage() {
  const dossiers = await getAllDossiers();
  const evidence = await getAllEvidenceList();

  return <HomePageClient dossiers={dossiers} evidence={evidence} />;
}
