---
case_id: GD-HUN-EV-OEM-EXPORT-001
slug: gd-hun-ev-oem-export-001
publish_version: v1
generated_at: 2026-02-10T23:46:39
---

# Publish v0.1 - Hungary - China EV OEM Export Hub (LRF-1)

**Case ID:** GD-HUN-EV-OEM-EXPORT-001
**Date:** 2026-02-10
**LRF version:** 1.1
**Weight profile ID:** WP-EV-OEM-EXPORT-1.1
**Overlay:** Balanced

## Executive Summary (3-6 bullets)
- WGI regulatory quality (0.3183) and rule of law (0.4271) estimates for 2023 indicate mid-range institutional quality. (IND-A1-REG-001, IND-A1-REG-002; EV-2026-024, EV-2026-025, EV-2026-026, EV-2026-027, EV-2026-028)
- Conflict intensity proxy (WGI PV.EST) yields a 3.54/10 risk score (2023), indicating low-to-moderate conflict exposure. (IND-A2-GEO-004; EV-2026-001, EV-2026-002)
- Customs clearance proxy is 2.19 days (2023), signaling relatively efficient export processing. (IND-A4-INF-004; EV-2026-007, EV-2026-008)
- Manufacturing value added is 15.80% of GDP (2024), indicating a moderate industrial base. (IND-A5-SUP-002; EV-2026-029, EV-2026-030)
- Human Capital Index is 0.683 (2020), indicating mid-range workforce human capital. (IND-A6-LAB-001; EV-2026-031, EV-2026-032)

## Decision framing
**Supports:** Early-stage market entry screening for export-oriented EV OEM assembly in Hungary using LRF-1 profile WP-EV-OEM-EXPORT-1.1.
**Does NOT support:** Legal export control determinations, site-specific engineering feasibility, or financial underwriting.

## Coverage & Missingness
- **Report completeness (overall):** 46.67% (report 2026-02-10 19:07)
- **Profile-weighted completeness:** 80.0%
- **Confidence cap (overall):** Low
- **Domain caps:** A2 High; A3 High; A4 High; A1/A5/A6/A7/A8 Low
- **Out-of-scope domains:** A3, A7, A8
- **Profile-scope TODO indicators:** None

## Risk Drivers (Key)
1. **Regulatory quality estimate** (IND-A1-REG-001) — 2023 value 0.3183; mid-range governance signal. (EV-2026-024, EV-2026-025, EV-2026-027)
2. **Rule of law estimate** (IND-A1-REG-002) — 2023 value 0.4271; mid-range legal reliability signal. (EV-2026-024, EV-2026-026, EV-2026-028)
3. **Conflict intensity proxy** (IND-A2-GEO-004) — WGI PV.EST-based mapping yields 3.54/10; monitor for deterioration. (EV-2026-001, EV-2026-002)
4. **Customs clearance time** (IND-A4-INF-004) — 2.19 days (2023) suggests efficient export clearance. (EV-2026-007, EV-2026-008)
5. **Operating license lead time** (IND-A4-INF-006) — 32.48 days (2023) signals regulatory friction for industrial setup. (EV-2026-011, EV-2026-012)
6. **Manufacturing value added** (IND-A5-SUP-002) — 15.80% of GDP (2024) indicates moderate industrial base depth. (EV-2026-029, EV-2026-030)
7. **Human Capital Index** (IND-A6-LAB-001) — 0.683 (2020) indicates mid-range workforce human capital. (EV-2026-031, EV-2026-032)

## Claims & Evidence
| Claim | Evidence ID(s) | Indicator IDs | Confidence | Notes |
| --- | --- | --- | --- | --- |
| WGI Regulatory Quality definition and scale are standardized across countries. | EV-2026-024, EV-2026-025, EV-2026-027 | IND-A1-REG-001 | Medium | WGI estimate range approx -2.5 to 2.5. |
| WGI Rule of Law definition and scale are standardized across countries. | EV-2026-024, EV-2026-026, EV-2026-028 | IND-A1-REG-002 | Medium | WGI estimate range approx -2.5 to 2.5. |
| Hungary RQ.EST 2023 value = 0.3183. | EV-2026-027 | IND-A1-REG-001 | Medium | Value from WB API endpoint used in pack. |
| Hungary RL.EST 2023 value = 0.4271. | EV-2026-028 | IND-A1-REG-002 | Medium | Value from WB API endpoint used in pack. |
| WGI PV.EST defines a standardized political stability estimate. | EV-2026-001 | IND-A2-GEO-004 | Medium | Proxy for conflict intensity; not event-count data. |
| Hungary PV.EST 2023 value = 0.7319, mapped to 3.54/10 conflict intensity. | EV-2026-002 | IND-A2-GEO-004 | Medium | Mapping: clamp01((-PV + 2.5)/5)*10. |
| Hungary customs clearance proxy = 2.19 days (2023). | EV-2026-007, EV-2026-008 | IND-A4-INF-004 | Medium | Proxy for dwell time efficiency. |
| Operating license proxy = 32.48 days (2023). | EV-2026-011, EV-2026-012 | IND-A4-INF-006 | Medium | Proxy for industrial land setup friction. |
| Manufacturing value added % GDP definition (NV.IND.MANF.ZS). | EV-2026-029, EV-2026-030 | IND-A5-SUP-002 | Medium | WDI definition of manufacturing value added. |
| Hungary MVA % GDP 2024 value = 15.80. | EV-2026-030 | IND-A5-SUP-002 | Medium | Value from WB API endpoint used in pack. |
| Human Capital Index definition (HD.HCI.OVRL). | EV-2026-031, EV-2026-032 | IND-A6-LAB-001 | Medium | HCI scale 0-1. |
| Hungary HCI 2020 value = 0.683. | EV-2026-032 | IND-A6-LAB-001 | Medium | Value from WB API endpoint used in pack. |
| EG.ELC.LOSS.ZS defines electric power transmission/distribution losses % of output. | EV-2026-016 | IND-A4-INF-003 | Medium | Tier-A proxy series for volatility. |
| Hungary 3-year EG.ELC.LOSS.ZS volatility CV = 0.0785 (mean=7.7278). | EV-2026-017, EV-2026-020, EV-2026-023 | IND-A4-INF-003 | Medium | CV over 2023-2021 values; std dev=0.6064. |

## What would change my view
- Material change in WGI regulatory quality or rule of law estimates (>0.3 shift).
- Material change in electricity loss volatility proxy (>30% shift).
- Material change in customs clearance proxy (>30% shift) indicating logistics friction change.
- Material change in operating license proxy (>30% shift) indicating regulatory timing change.
- Material change in MVA % GDP or HCI (>15% relative shift).

## Appendix
- **Report artifact:** 04 - Data & Ontology/Ontology/_machine/reports/hungary.ev_oem_export.wp-ev-oem-export-1.1.balanced.report.v1.json
- **Runlogs:** flagship_sprint4_phase0_baseline_2026-02-10_1903.txt; flagship_sprint4_phase1_required_by_expand_2026-02-10_1904.txt; flagship_sprint4_phase2_fills_2026-02-10_1907.txt; flagship_sprint4_hungary_regen_2026-02-10_1907.txt; flagship_sprint4_phase4_dossiers_2026-02-10_1930.txt
