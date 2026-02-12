import { EvidenceClient } from "@/app/evidence/EvidenceClient";
import { getAllEvidenceList } from "@/data/loaders";

export default async function EvidencePage() {
  const items = await getAllEvidenceList();
  return <EvidenceClient items={items} />;
}
