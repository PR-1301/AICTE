# AICTE Application Validation Platform (SIH26261)
## Officer Scrutiny Portal · Demo Video Presentation Script

> **Context**: This script documents the exact click path, interface text, sample officer remarks, and visual checkpoints for recording the idea-submission prototype demo video.
> **Role**: Scrutiny Officer (`officer-01`)
> **Demonstration Date Anchor**: `2026-10-21` (`DEMO_TODAY`)
> **Tone**: Government regulatory tool, calm, evidence-linked, strictly advisory.

---

### Demonstration Walkthrough Summary

| Scenario | Application ID | Institute Name | Purpose |
| :--- | :--- | :--- | :--- |
| **Path A (Hero Story)** | `APP-001` | Demo Institute of Technology | Flawed application demonstrating AI cross-document discrepancy detection, expired document detection, human-in-the-loop decision, and audit logging. |
| **Path B (Contrast)** | `APP-002` | Apex Institute of Engineering & Technology | Clean application demonstrating all-green verified statutory records and clean approval flow. |

---

## Path A: The Flawed Application Flow (Hero Path)

### Step 1: Officer Scrutiny Worklist (Dashboard)
- **URL**: `http://localhost:5173/officer/dashboard`
- **What to say / point out**:
  - Point to the persistent ribbon: *"Concept demo · synthetic data"*.
  - Point to the header banner and anchor date pill: *"Evaluation Anchor Date: 21 Oct 2026"*. All statutory expirations are calculated against this fixed date.
  - Explain the 4 Stat Cards:
    - **Pending Officer Review**: `2` (submissions awaiting human scrutiny)
    - **Flagged Applications**: `2` (institutions with open high-severity findings)
    - **Expired Documents**: `2` (lapsed certificate validity)
    - **Fully Verified**: `2` (clean statutory packages)
  - Show the **Pipeline Distribution Chart** (Recharts single bar chart with readable count labels).
  - Show the **Scrutiny Alerts Panel** on the right, listing high-priority discrepancies across applications.
  - In the **Submissions Registry** table below, point out default urgency sorting: `APP-001` sits at the top because it has the highest open high-severity findings.
- **Interactive Action**: Click the **"Flagged Applications"** stat card to show table filtering down to `APP-001` and `APP-003`. Click it again (or "Clear all filters") to reset.

---

### Step 2: Open Flawed Application Review
- **Click**: Click on the row for **Demo Institute of Technology** (`APP-001`) or click the **Open →** button.
- **URL**: `http://localhost:5173/officer/applications/APP-001`
- **What to point out on screen**:
  - Header: Institute Name, ID `APP-001`, Category `EoA - Intake Increase`, Review Status `Validation Complete`.
  - **Summary Count Strip**:
    - `3 Verified`
    - `2 Mismatch detected`
    - `1 Expired`
    - `1 Manual review required`
  - **Document Checklist**:
    - **Affidavit for EoA & Land Details**: Flagged with Land Area discrepancy.
    - **Fire Safety NOC**: Badge `Expired` (Lapsed on 30-06-2026).
    - **Land Title & Ownership Deed**: Badge `Mismatch detected`.
    - **NBA / NAAC Accreditation Certificate**: Shows `Not submitted` row with badge `Manual review required`.
  - **Cross-document & Record Checks section**:
    - `LAND_AREA_CONSISTENCY` (High Severity)
    - `TER_FEE_RECONCILIATION` (Medium Severity)
    - `INSTITUTE_NAME_MATCH` (Fuzzy match passed: *"Non-naive fuzzy match accepted within threshold"*).

---

### Step 3: Evidence Viewer — Land Area Inconsistency (Mismatch Case)
- **Click**: Under Cross-document checks, click on finding **"Land Area Consistency"** (`F-003`) or click **Inspect Evidence →**.
- **URL**: `http://localhost:5173/officer/applications/APP-001/findings/F-003`
- **What to point out on screen**:
  - Two synthetic documents displayed side-by-side with animated fractional highlight boxes:
    - **Left document** (*Affidavit for EoA*): Amber highlight box over `4.2 acres`.
    - **Right document** (*Land Title Deed*): Amber highlight box over `3.8 acres`.
  - **Finding Card**:
    - Status Badge: `Mismatch detected`
    - Severity: `High Severity`
    - Confidence: `94%`
    - Side-by-side value comparison: `4.2 acres` vs `3.8 acres` (0.4 acre discrepancy).
    - Advisory disclaimer: *"Preliminary indicator. Human verification required."*

---

### Step 4: Evidence Viewer — Expired Statutory Document (Expiry Case)
- **Click**: In the left sidebar under "Findings on this Application", click **"Document Validity Check (F-002)"**.
- **URL**: `http://localhost:5173/officer/applications/APP-001/findings/F-002`
- **What to point out on screen**:
  - Left document (*Fire Safety NOC*): Single amber highlight box over validity date `30-06-2026`.
  - Right card: Directorate of Fire & Emergency Services verification portal response.
  - Finding Card: Status `Expired`, Severity `High Severity`, Confidence `99%`.
  - Plain language explanation: *"Fire Safety NOC expired on 30-06-2026. Extension of Approval for academic year 2026-27 requires active validity."*

---

### Step 5: Officer Determination (Human-in-the-Loop)
- **Click**: Click **"← Return to Application Review"** (top navigation).
- **URL**: `http://localhost:5173/officer/applications/APP-001`
- **Scroll**: Scroll to the **Officer Scrutiny Determination** panel at the bottom.
- **Point out**:
  - Persistent advisory notice: *"AI findings are advisory. The decision rests with the officer."*
  - The three officer action buttons (*Approve*, *Request more info*, *Send for inspection*).
- **Type Remarks**: In the remarks textarea (`officer-remarks`), type:
  ```text
  Submitted Fire Safety NOC expired on 2026-06-30. Land deed area differs from proposal. Please upload renewed Fire NOC and municipal demarcation within 15 days.
  ```
- **Click**: Click the **"Request more info"** button.
- **Confirmation Dialog**:
  - A modal appears: *"Confirm Determination with Open Discrepancies"*.
  - It lists the open high-severity findings: Land area inconsistency, expired Fire NOC, and missing NAAC certificate.
  - Click **"Confirm Determination"**.
- **Outcome**:
  - The Decision Panel instantly locks into **Scrutiny Decision Outcome**.
  - Review Status updates to **More Info Requested**.
  - A green indicator confirms: *"Audit event recorded"*.

---

### Step 6: Immutable Audit Trail
- **Click**: Click the **"Audit Trail"** tab on the Application Review page, OR click **"Audit Trail"** in the sidebar.
- **URL**: `http://localhost:5173/officer/audit`
- **What to point out on screen**:
  - Top event in the chronological timeline:
    - **Actor**: `officer-01`
    - **Action**: `DECISION_SUBMITTED`
    - **Detail**: Displays the exact decision (`REQUEST_MORE_INFO`) and officer remarks just submitted.
  - Second event:
    - **Action**: `APPLICATION_STATUS_UPDATED` (`VALIDATION_COMPLETE → INFO_REQUESTED`).
  - Demonstrate the filter bar: Select **"Officer Only"** to filter out system rule executions.

---

### Step 7: Live Dashboard Update & Reset Demo
- **Click**: In the sidebar, click **"Dashboard"**.
- **URL**: `http://localhost:5173/officer/dashboard`
- **What to point out on screen**:
  - `APP-001` now displays status **More Info Requested**.
  - Open findings for `APP-001` no longer raise unresolved alerts in the Scrutiny Alerts panel.
  - The pipeline distribution chart updated dynamically.
- **Click**: Click the **"Reset demo"** button in the top navbar (or press **Alt + Shift + D**).
- **Confirmation**: Dialog opens: *"Restore All Demo Data?"*. Click **"Reset Demo Data"**.
- **Result**:
  - Toast confirmation: `✓ Demo data restored to initial state`.
  - Submissions worklist and alerts return to seed state.

---

## Path B: Clean Application Flow (Contrast)

### Step 1: Open Clean Submission
- **URL**: `http://localhost:5173/officer/dashboard`
- **Click**: In the table, click on **Apex Institute of Engineering & Technology** (`APP-002`).
- **URL**: `http://localhost:5173/officer/applications/APP-002`

### Step 2: Review Clean Statutory Checklist
- **What to point out on screen**:
  - **Summary Strip**: `5 Verified | 0 Mismatch | 0 Expired | 0 Manual Review`.
  - All 5 documents have green `Verified` badges:
    - Affidavit for EoA (Verified)
    - Fire Safety NOC (Verified active through 31-12-2027)
    - Land Title Deed (Verified 5.0 acres matching)
    - NAAC Accreditation (Grade 'A+' verified with council)
    - TER Receipt (₹1,00,000 matches fee schedule)
  - Zero defect findings.

### Step 3: Officer Approval
- **Scroll**: Scroll to the Decision Panel at the bottom.
- **Type Remarks**:
  ```text
  All statutory compliance documents verified against issuing sources. Land title, NAAC accreditation, and TER fee fully reconciled. Recommended for EoA.
  ```
- **Click**: Click the green **"Approve"** button.
- **Result**:
  - No confirmation dialog required (clean application).
  - Status immediately transitions to **Approved** with immutable audit event logged.

---

## Verification & Keyboard Shortcuts Reference

- **Quick Reset Demo**: `Alt + Shift + D` (opens confirmation dialog anywhere in the Officer portal).
- **Keyboard Navigation**: Press `Tab` and `Enter` on any table row to open its review page.
- **Screen Reader Support**: All status badges combine high-contrast colors, icon glyphs, and text labels.
