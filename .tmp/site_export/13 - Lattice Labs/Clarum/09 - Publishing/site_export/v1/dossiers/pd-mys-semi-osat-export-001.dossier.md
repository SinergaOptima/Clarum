---
case_id: PD-MYS-SEMI-OSAT-EXPORT-001
slug: pd-mys-semi-osat-export-001
publish_version: v1
generated_at: 2026-02-10T23:46:39
---

# Publish v0.1 - Malaysia - Semiconductor OSAT Export Hub (LRF-1)

**Case ID:** PD-MYS-SEMI-OSAT-EXPORT-001
**Date:** 2026-02-10
**LRF version:** 1.1
**Weight profile ID:** WP-SEMI-OSAT-EXPORT-1.1
**Overlay:** Balanced

## Executive Summary (3-6 bullets)
- WGI regulatory quality (0.6609) and rule of law (0.5719) estimates for 2023 indicate stronger institutional quality. (IND-A1-REG-001, IND-A1-REG-002; EV-2026-024, EV-2026-025, EV-2026-026, EV-2026-027, EV-2026-028)
- Conflict intensity proxy (WGI PV.EST) yields a 2.51/10 risk score (2023), indicating low conflict exposure. (IND-A2-GEO-004; EV-2026-001, EV-2026-004)
- Customs clearance proxy is 2.95 days (2023), indicating relatively efficient export processing. (IND-A4-INF-004; EV-2026-007, EV-2026-010)
- Manufacturing value added is 22.50% of GDP (2024), indicating a strong industrial base. (IND-A5-SUP-002; EV-2026-029, EV-2026-030)
- Human Capital Index is 0.6110 (2020), indicating mid-range workforce human capital. (IND-A6-LAB-001; EV-2026-031, EV-2026-032)

## Decision framing
**Supports:** Early-stage market entry screening for export-oriented OSAT/ATP operations using LRF-1 profile WP-SEMI-OSAT-EXPORT-1.1.
**Does NOT support:** Legal export control determinations, site-specific engineering feasibility, or financial underwriting.

## Coverage & Missingness
- **Report completeness (overall):** 34.17% (report 2026-02-10 19:07)
- **Profile-weighted completeness:** 86.67%
- **Confidence cap (overall):** Low
- **Domain caps:** A2 High; A4 High; A1/A3/A5/A6/A7/A8 Low
- **Out-of-scope domains:** A3, A7, A8
- **Profile-scope TODO indicators:** None

## Risk Drivers (Key)
1. **Regulatory quality estimate** (IND-A1-REG-001) — 2023 value 0.6609; strong governance signal. (EV-2026-024, EV-2026-025, EV-2026-027)
2. **Rule of law estimate** (IND-A1-REG-002) — 2023 value 0.5719; solid legal reliability signal. (EV-2026-024, EV-2026-026, EV-2026-028)
3. **Conflict intensity proxy** (IND-A2-GEO-004) — WGI PV.EST-based mapping yields 2.51/10; monitor for deterioration. (EV-2026-001, EV-2026-004)
4. **Customs clearance time** (IND-A4-INF-004) — 2.95 days (2023) suggests efficient export clearance. (EV-2026-007, EV-2026-010)
5. **Operating license lead time** (IND-A4-INF-006) — 15.01 days (2023) indicates moderate regulatory friction for industrial setup. (EV-2026-011, EV-2026-014)
6. **Manufacturing value added** (IND-A5-SUP-002) — 22.50% of GDP (2024) indicates strong industrial base depth. (EV-2026-029, EV-2026-030)
7. **Human Capital Index** (IND-A6-LAB-001) — 0.6110 (2020) indicates mid-range workforce human capital. (EV-2026-031, EV-2026-032)

## Claims & Evidence
| Claim | Evidence ID(s) | Indicator IDs | Confidence | Notes |
| --- | --- | --- | --- | --- |
| WGI Regulatory Quality definition and scale are standardized across countries. | EV-2026-024, EV-2026-025, EV-2026-027 | IND-A1-REG-001 | Medium | WGI estimate range approx -2.5 to 2.5. |
| WGI Rule of Law definition and scale are standardized across countries. | EV-2026-024, EV-2026-026, EV-2026-028 | IND-A1-REG-002 | Medium | WGI estimate range approx -2.5 to 2.5. |
| Malaysia RQ.EST 2023 value = 0.6609. | EV-2026-027 | IND-A1-REG-001 | Medium | Value from WB API endpoint used in pack. |
| Malaysia RL.EST 2023 value = 0.5719. | EV-2026-028 | IND-A1-REG-002 | Medium | Value from WB API endpoint used in pack. |
| WGI PV.EST defines a standardized political stability estimate. | EV-2026-001 | IND-A2-GEO-004 | Medium | Proxy for conflict intensity; not event-count data. |
| Malaysia PV.EST 2023 value = 1.2470, mapped to 2.51/10 conflict intensity. | EV-2026-004 | IND-A2-GEO-004 | Medium | Mapping: clamp01((-PV + 2.5)/5)*10. |
| Malaysia customs clearance proxy = 2.95 days (2023). | EV-2026-007, EV-2026-010 | IND-A4-INF-004 | Medium | Proxy for dwell time efficiency. |
| Operating license proxy = 15.01 days (2023). | EV-2026-011, EV-2026-014 | IND-A4-INF-006 | Medium | Proxy for industrial land setup friction. |
| Manufacturing value added % GDP definition (NV.IND.MANF.ZS). | EV-2026-029, EV-2026-030 | IND-A5-SUP-002 | Medium | WDI definition of manufacturing value added. |
| Malaysia MVA % GDP 2024 value = 22.50. | EV-2026-030 | IND-A5-SUP-002 | Medium | Value from WB API endpoint used in pack. |
| Human Capital Index definition (HD.HCI.OVRL). | EV-2026-031, EV-2026-032 | IND-A6-LAB-001 | Medium | HCI scale 0-1. |
| Malaysia HCI 2020 value = 0.6110. | EV-2026-032 | IND-A6-LAB-001 | Medium | Value from WB API endpoint used in pack. |
| EG.ELC.LOSS.ZS defines electric power transmission/distribution losses % of output. | EV-2026-016 | IND-A4-INF-003 | Medium | Tier-A proxy series for volatility. |
| Malaysia 3-year EG.ELC.LOSS.ZS volatility CV = 0.0174 (mean=6.3282). | EV-2026-019, EV-2026-022, EV-2026-023 | IND-A4-INF-003 | Medium | CV over 2023-2021 values; std dev=0.1099. |

## What would change my view
- Material change in WGI regulatory quality or rule of law estimates (>0.3 shift).
- Material change in electricity loss volatility proxy (>30% shift).
- Material change in customs clearance proxy (>30% shift) indicating logistics friction change.
- Material change in operating license proxy (>30% shift) indicating regulatory timing change.
- Material change in MVA % GDP or HCI (>15% relative shift).

## Appendix
- **Report artifact:** 04 - Data & Ontology/Ontology/_machine/reports/malaysia.semi_osat_export.wp-semi-osat-export-1.1.balanced.report.v1.json
- **Runlogs:** flagship_sprint4_phase0_baseline_2026-02-10_1903.txt; flagship_sprint4_phase1_required_by_expand_2026-02-10_1904.txt; flagship_sprint4_phase2_fills_2026-02-10_1907.txt; flagship_sprint4_malaysia_regen_2026-02-10_1907.txt; flagship_sprint4_phase4_dossiers_2026-02-10_1930.txt
