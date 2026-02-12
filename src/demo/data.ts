import type { Dossier, Evidence } from "./types";

export const dossiers: Dossier[] = [
  {
    slug: "hungary-gd-hun-ev-oem-export-001",
    title: "Hungary EV OEM Export Readiness",
    country: "Hungary",
    region: "Central Europe",
    topic: "EV OEM exports",
    summary:
      "Hungary shows strong supplier density and export infrastructure, with gaps in battery recycling policy clarity.",
    published: "2025-11-02",
    confidence: 0.72,
    completeness: 0.68,
    keyDrivers: [
      "High concentration of tier-1 suppliers in Gyor and Kecskemet",
      "Growing rail freight capacity to German OEM corridors",
      "Stable incentive framework for export-led manufacturing",
    ],
    warnings: [
      "Battery end-of-life policy is fragmented across ministries",
      "Cross-border logistics capacity tight in peak quarters",
    ],
    nextActions: [
      "Validate 2026 logistics capacity forecasts with operator data",
      "Confirm revised recycling compliance timelines",
    ],
    domains: [
      {
        id: "A1",
        name: "Market Access",
        summary: "EU access is favorable; permitting timelines remain moderate.",
        indicators: [
          {
            id: "ma-1",
            name: "Average permitting lead time",
            value: "6.5",
            unit: "months",
            year: "2025",
            source: "Demo registry",
            status: "present",
          },
          {
            id: "ma-2",
            name: "Export tariff exposure",
            value: "0",
            unit: "%",
            year: "2025",
            source: "Demo trade model",
            status: "present",
          },
        ],
      },
      {
        id: "A2",
        name: "Supply Base",
        summary: "Tier-1 density is strong; midstream chemicals are weaker.",
        indicators: [
          {
            id: "sb-1",
            name: "Tier-1 supplier density",
            value: "High",
            unit: "index",
            year: "2025",
            source: "Demo supplier graph",
            status: "present",
          },
          {
            id: "sb-2",
            name: "Cathode material capacity",
            value: "Low",
            unit: "index",
            year: "2025",
            source: "Demo materials scan",
            status: "partial",
          },
        ],
      },
      {
        id: "A3",
        name: "Infrastructure",
        summary: "Rail and highway corridors are mature; grid upgrades lag.",
        indicators: [
          {
            id: "inf-1",
            name: "Rail freight throughput",
            value: "82",
            unit: "score",
            year: "2025",
            source: "Demo infra index",
            status: "present",
          },
          {
            id: "inf-2",
            name: "Grid upgrade backlog",
            value: "14",
            unit: "months",
            year: "2025",
            source: "Demo utility survey",
            status: "partial",
          },
        ],
      },
      {
        id: "A4",
        name: "Policy",
        summary: "Incentive stability is good; recycling guidance is unclear.",
        indicators: [
          {
            id: "pol-1",
            name: "Incentive stability index",
            value: "7.6",
            unit: "score",
            year: "2025",
            source: "Demo policy model",
            status: "present",
          },
          {
            id: "pol-2",
            name: "Recycling policy clarity",
            value: "Medium",
            unit: "index",
            year: "2025",
            source: "Demo policy scan",
            status: "missing",
          },
        ],
      },
      {
        id: "A5",
        name: "Workforce",
        summary: "Skilled labor is available; wage pressure is rising.",
        indicators: [
          {
            id: "wf-1",
            name: "EV technician availability",
            value: "Moderate",
            unit: "index",
            year: "2025",
            source: "Demo labor survey",
            status: "present",
          },
        ],
      },
      {
        id: "A6",
        name: "Financial",
        summary: "Export finance is accessible for large OEMs.",
        indicators: [
          {
            id: "fin-1",
            name: "Export credit coverage",
            value: "65",
            unit: "%",
            year: "2025",
            source: "Demo finance brief",
            status: "present",
          },
        ],
      },
      {
        id: "A7",
        name: "Risk",
        summary: "Moderate geopolitical exposure with EU buffers.",
        indicators: [
          {
            id: "risk-1",
            name: "Supply disruption risk",
            value: "Low",
            unit: "index",
            year: "2025",
            source: "Demo risk model",
            status: "present",
          },
        ],
      },
      {
        id: "A8",
        name: "Sustainability",
        summary: "Emissions tracking is improving; water use is uneven.",
        indicators: [
          {
            id: "sus-1",
            name: "Scope 2 tracking coverage",
            value: "58",
            unit: "%",
            year: "2025",
            source: "Demo ESG scan",
            status: "partial",
          },
        ],
      },
    ],
    evidenceIds: ["ev-hun-customs-2024", "ev-hun-rail-brief"],
  },
  {
    slug: "mexico-pd-mex-ev-oem-export-001",
    title: "Mexico EV OEM Export Corridor",
    country: "Mexico",
    region: "North America",
    topic: "EV OEM exports",
    summary:
      "Mexico benefits from USMCA proximity and strong OEM clusters; energy reliability remains a concern.",
    published: "2025-10-14",
    confidence: 0.69,
    completeness: 0.63,
    keyDrivers: [
      "Cross-border supplier ecosystem with US OEMs",
      "Competitive labor cost with growing EV training",
      "Established export logistics to Gulf ports",
    ],
    warnings: ["Grid reliability varies by state", "Permitting timelines are highly localized"],
    nextActions: [
      "Validate state-level power stability data",
      "Confirm customs modernization rollout dates",
    ],
    domains: [
      {
        id: "A1",
        name: "Market Access",
        summary: "USMCA keeps tariffs low; customs modernization is uneven.",
        indicators: [
          {
            id: "mx-ma-1",
            name: "USMCA tariff exposure",
            value: "0",
            unit: "%",
            year: "2025",
            source: "Demo trade model",
            status: "present",
          },
          {
            id: "mx-ma-2",
            name: "Customs modernization coverage",
            value: "57",
            unit: "%",
            year: "2025",
            source: "Demo logistics note",
            status: "partial",
          },
        ],
      },
      {
        id: "A3",
        name: "Infrastructure",
        summary: "Port capacity is strong; rail congestion is periodic.",
        indicators: [
          {
            id: "mx-inf-1",
            name: "Port dwell time",
            value: "3.1",
            unit: "days",
            year: "2025",
            source: "Demo port model",
            status: "present",
          },
        ],
      },
      {
        id: "A4",
        name: "Policy",
        summary: "State incentives vary and must be negotiated locally.",
        indicators: [
          {
            id: "mx-pol-1",
            name: "Incentive variance",
            value: "High",
            unit: "index",
            year: "2025",
            source: "Demo policy scan",
            status: "present",
          },
        ],
      },
    ],
    evidenceIds: ["ev-mex-grid-brief", "ev-mex-port-note"],
  },
  {
    slug: "malaysia-pd-mys-semi-osat-export-001",
    title: "Malaysia Semiconductor OSAT Export Outlook",
    country: "Malaysia",
    region: "Southeast Asia",
    topic: "Semiconductor OSAT",
    summary:
      "Malaysia offers deep OSAT capability with competitive incentives; talent competition is rising.",
    published: "2025-09-22",
    confidence: 0.75,
    completeness: 0.71,
    keyDrivers: [
      "Long-standing OSAT clusters in Penang",
      "Policy support for advanced packaging",
      "Strong air freight performance",
    ],
    warnings: [
      "Talent retention pressure from regional hubs",
      "Water resilience planning is limited",
    ],
    nextActions: ["Confirm 2026 talent program funding", "Validate water resilience investments"],
    domains: [
      {
        id: "A2",
        name: "Supply Base",
        summary: "Advanced packaging capability is strong in core hubs.",
        indicators: [
          {
            id: "my-sb-1",
            name: "OSAT capacity utilization",
            value: "78",
            unit: "%",
            year: "2025",
            source: "Demo capacity scan",
            status: "present",
          },
        ],
      },
      {
        id: "A5",
        name: "Workforce",
        summary: "Skilled labor is competitive but churn is rising.",
        indicators: [
          {
            id: "my-wf-1",
            name: "Packaging engineer churn",
            value: "12",
            unit: "%",
            year: "2025",
            source: "Demo HR survey",
            status: "partial",
          },
        ],
      },
      {
        id: "A8",
        name: "Sustainability",
        summary: "Carbon reporting coverage is improving with new mandates.",
        indicators: [
          {
            id: "my-sus-1",
            name: "Carbon reporting coverage",
            value: "61",
            unit: "%",
            year: "2025",
            source: "Demo ESG report",
            status: "present",
          },
        ],
      },
    ],
    evidenceIds: ["semi-mys-osat-brief"],
  },
];

export const evidence: Evidence[] = [
  {
    id: "ev-hun-customs-2024",
    title: "Hungary customs throughput update",
    source: "Demo logistics note",
    date: "2024-12-08",
    tags: ["customs", "exports", "logistics"],
    summary: "Throughput has improved on primary rail corridors serving German OEMs.",
    markdown: `# Hungary customs throughput update\n\n**Key points**\n- Rail clearance times fell by ~12% year over year.\n- Priority lanes for EV components are expanding.\n\n## Why it matters\nFaster throughput lowers working capital tied to inbound components.\n\n## Caution\nSeasonal congestion still spikes in Q4.`,
    dossierSlugs: ["hungary-gd-hun-ev-oem-export-001"],
  },
  {
    id: "ev-hun-rail-brief",
    title: "Gyor-Kecskemet rail capacity brief",
    source: "Demo infrastructure brief",
    date: "2025-01-18",
    tags: ["rail", "infrastructure"],
    summary: "Planned siding upgrades add buffer capacity through 2026.",
    markdown: `# Gyor-Kecskemet rail capacity\n\nUpgrade work expands sidings by 14%.\n\n## Outlook\nCapacity is sufficient for one additional OEM line if synchronized with port slots.`,
    dossierSlugs: ["hungary-gd-hun-ev-oem-export-001"],
  },
  {
    id: "ev-mex-grid-brief",
    title: "Mexico grid reliability snapshot",
    source: "Demo energy brief",
    date: "2025-02-12",
    tags: ["energy", "grid"],
    summary: "Reliability is improving in northern states, mixed elsewhere.",
    markdown: `# Mexico grid reliability\n\nReliability scores improved in Nuevo Leon and Coahuila.\n\n## Watchlist\nSouthern corridors still show elevated outage minutes.`,
    dossierSlugs: ["mexico-pd-mex-ev-oem-export-001"],
  },
  {
    id: "ev-mex-port-note",
    title: "Gulf port capacity update",
    source: "Demo port note",
    date: "2025-03-04",
    tags: ["ports", "logistics"],
    summary: "Port dwell times remain stable with minor congestion risk.",
    markdown: `# Gulf port capacity update\n\nPort dwell time averages 3.1 days.\n\n## Risk\nWeather-related slowdowns expected in late summer.`,
    dossierSlugs: ["mexico-pd-mex-ev-oem-export-001"],
  },
  {
    id: "semi-mys-osat-brief",
    title: "Malaysia OSAT cluster status",
    source: "Demo industry brief",
    date: "2025-01-29",
    tags: ["semiconductor", "osat"],
    summary: "Penang cluster sees strong advanced packaging investment.",
    markdown: `# Malaysia OSAT cluster status\n\nAdvanced packaging investments are accelerating.\n\n## Talent\nHiring competition is up, prompting retention bonuses.`,
    dossierSlugs: ["malaysia-pd-mys-semi-osat-export-001"],
  },
];

export const featuredSlugs = [
  "hungary-gd-hun-ev-oem-export-001",
  "mexico-pd-mex-ev-oem-export-001",
];

export const allTags = Array.from(new Set(evidence.flatMap((item) => item.tags))).sort();

export function getDossierBySlug(slug: string) {
  return dossiers.find((item) => item.slug === slug);
}

export function getEvidenceById(id: string) {
  return evidence.find((item) => item.id === id);
}

export function getEvidenceForDossier(slug: string) {
  return evidence.filter((item) => item.dossierSlugs.includes(slug));
}
