# AICTE Application Validation Platform (SIH26261)
### AI-Powered Document Authentication, Cross-Validation & Regulatory Compliance Scrutiny
**Smart India Hackathon 2026 · Problem Statement SIH26261**  
*Ministry of Education & All India Council for Technical Education (AICTE), Government of India*

---

[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/State-Zustand-443e38?style=flat)](https://github.com/pmndrs/zustand)
[![Recharts](https://img.shields.io/badge/Charts-Recharts-22b5bf?style=flat)](https://recharts.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 1. Executive Summary & Problem Context

Every academic year, thousands of technical and higher education institutes across India apply for **Extension of Approval (EoA)**, new programs, or intake increases through AICTE. To comply with statutory norms, each institution submits dozens of complex multi-page regulatory documents, including:
- Registered Land Title & Ownership Deeds
- Municipal / Government Land Demarcation & EoA Affidavits
- Directorate of Fire & Emergency Services No-Objection Certificates (Fire NOC)
- National Board of Accreditation (NBA) / NAAC Accreditation Certificates
- Technical Education Regulatory (TER) Processing Fee payment receipts
- Faculty registers, building completion certificates, and structural stability certificates

### The Challenge
Scrutiny officers manually examine thousands of pages under strict administrative deadlines. This process is vulnerable to cognitive fatigue, missed certificate expirations, subtle discrepancies between legal affidavits and government deeds, and unverified payment records.

### Our Solution
An AI-assisted, **strictly advisory, first-pass regulatory scrutiny layer** designed specifically for AICTE scrutiny officers. The platform:
1. Performs automated document intake, classification, and metadata extraction.
2. Cross-verifies values across disparate statutory documents (e.g., comparing land area declared in an affidavit against registered sale deeds).
3. Evaluates certificate expirations against an authoritative regulatory anchor date.
4. Produces an **explainable, evidence-linked scrutiny report** highlighting exact document passages using normalized fractional coordinates.
5. **Enforces Human-in-the-Loop decision governance**: The AI *never* approves or rejects an application. Only the statutory officer can render a regulatory determination.

---

## 2. Non-Negotiable Regulatory & Domain Principles

The platform is designed in strict compliance with public-sector regulatory ethics and AI safety standards:

| Principle | Regulatory Requirement | System Implementation |
| :--- | :--- | :--- |
| **Strictly Advisory** | AI findings are preliminary decision-support indicators, never administrative rulings. | The UI clearly notes *"Preliminary indicator. Human verification required."* No AI routine can accept or decline an application. |
| **Evidence-Linked & Explainable** | Findings must never be black-box assertions; officers must see the original source evidence. | Every finding pairs extracted text with normalized fractional bounding boxes (`0.0`–`1.0`) over original synthetic documents. |
| **Fail-Safe Design** | Low confidence or uncontactable verification registries must never silently pass. | Ambiguity or unverified records automatically resolve to `MANUAL_REVIEW_REQUIRED`. |
| **Authoritative Status Vocabulary** | Standardized status nomenclature across all inspection channels. | `VERIFIED`, `MISMATCH_DETECTED`, `EXPIRED`, `VERIFICATION_PENDING`, `SOURCE_UNAVAILABLE`, `MANUAL_REVIEW_REQUIRED`. |
| **Immutable Audit Governance** | Total accountability for every automated finding and human determination. | All system checks and officer determinations append to a timestamped audit trail recording actor, action, remarks, and finding references. |

---

## 3. Core Features of the Officer Scrutiny Portal

### 3.1 Statutory Scrutiny Dashboard (`/officer/dashboard`)
- **Key Metrics Overview**: Instant tallies of *Pending Officer Review*, *Flagged Discrepancies*, *Expired Documents*, and *Fully Verified Submissions*.
- **Evaluation Anchor Date**: Fixed evaluation anchor (`2026-10-21`) ensuring reproducible validity evaluations regardless of local clock drift.
- **Interactive Metric Filtering**: Clicking any stat card filters the application registry to match the selected category.
- **Pipeline Status Distribution**: Visualized with Recharts to show pipeline volume across validation stages.
- **Scrutiny Alerts Panel**: Highlights high-severity issues (expired safety permits, land title variances) across active institutional applications.
- **Submissions Registry Table**: Urgency-weighted default sort placing institutions with high-severity discrepancies first, accompanied by live search and status filters.

### 3.2 Comprehensive Application Review (`/officer/applications/:id`)
- **Institution Overview**: Displays Application ID, category (e.g., *EoA - Intake Increase*), and current review stage.
- **Summary Count Bar**: Clear badge counts of verified items, detected mismatches, expired documents, and manual reviews.
- **Statutory Document Checklist**: Detailed checklist of all required documents with status badges, upload timestamps, and direct links to inspection findings. Clearly flags missing mandatory documents as *Not submitted*.
- **Cross-Document Consistency Checks**: Direct cards for multi-document comparisons (e.g., Land Area Consistency, TER Fee Reconciliation, and Fuzzy Institute Name matching).

### 3.3 Side-by-Side Dual Evidence Viewer (`/officer/applications/:id/findings/:fid`)
- **Fractional Bounding Boxes**: Side-by-side document views with highlighted inspection zones using resolution-independent normalized coordinates (`left`, `top`, `width`, `height` from `0` to `1`).
- **Discrepancy Case**: Simultaneously displays the Affidavit (`4.2 acres`) and the registered Land Title Deed (`3.8 acres`) with matching amber highlights and confidence metrics.
- **Expiration Case**: Displays the Fire Safety NOC highlighting the expired validity date (`30-06-2026`) paired with third-party registry response metadata.
- **Missing Document Case**: Graceful fallback displaying statutory criteria and submission guidelines when a document was omitted.

### 3.4 Human-in-the-Loop Officer Determination Panel
- **Statutory Actions**: `Approve`, `Request more info`, or `Send for inspection`.
- **Mandatory Officer Remarks**: Required rationale field ensuring institutional accountability for every decision.
- **High-Severity Warning Modal**: Safety interlock preventing inadvertent approval when high-severity findings remain open without an explicit confirmation acknowledgment.

### 3.5 Immutable Audit Trail (`/officer/audit`)
- Real-time vertical chronological timeline of all system events and officer actions.
- Tracks `RULE_APPLIED`, `RECORD_CHECKED`, `ALERT_RAISED`, and `DECISION_SUBMITTED`.
- Filterable by actor (`system` vs `officer-01`) with direct inspection links to referenced findings.

### 3.6 Built-in Demo Controller (`Alt+Shift+D`)
- A dedicated **"Reset Demo"** control in the top bar instantly restores seed data to its initial baseline state without requiring a browser reload.
- Essential for recording seamless video demonstrations and hackathon evaluations.

---

## 4. Demonstration Scenarios & Seed Data

The platform comes preloaded with carefully crafted synthetic scenarios illustrating real-world edge cases:

| Application ID | Institution Name | Status & Scenario | Planted Statutory Cases |
| :--- | :--- | :--- | :--- |
| **`APP-001`** *(Hero Story)* | **Demo Institute of Technology** | `VALIDATION_COMPLETE` (Flawed Package) | • **Land Area Discrepancy** (`4.2 acres` in Affidavit vs `3.8 acres` in Land Deed) → `MISMATCH_DETECTED` (High Severity)<br>• **Fire Safety NOC Expired** on `2026-06-30` against `DEMO_TODAY` (`2026-10-21`) → `EXPIRED` (High Severity)<br>• **Omitted NBA/NAAC Certificate** → `MANUAL_REVIEW_REQUIRED`<br>• **TER Fee Variance** (`₹3,00,000` paid vs `₹4,50,000` due) → `MISMATCH_DETECTED` (Medium Severity)<br>• **Fuzzy Name Tolerance** (*"Demo Inst. of Tech."* vs *"Demo Institute of Technology"*) → `VERIFIED` within safe threshold |
| **`APP-002`** *(Benchmark)* | **Apex Institute of Engineering & Technology** | `VALIDATION_COMPLETE` (Clean Package) | • All statutory documents present, current, and verified.<br>• Clean approval pathway showing all-green contrast. |
| **`APP-003`** | **National Institute of Management Studies** | `UNDER_OFFICER_REVIEW` | • Faculty roster verification pending; building completion certificate under review. |
| **`APP-004`** | **Vanguard College of Pharmacy** | `INFO_REQUESTED` | • Structural stability certificate expired within 90 days; officer requested renewal. |
| **`APP-005`** | **Horizon Institute of Technology** | `APPROVED` | • Fully scrutinized and approved with officer sign-off and complete audit trail. |
| **`APP-006`** | **Zenith Academy of Polytechnic** | `AI_VALIDATING` | • Submissions undergoing initial OCR ingestion and cross-reference analysis. |

---

## 5. Technology Stack

- **Framework**: [React 19](https://react.dev/) with [Vite 6](https://vitejs.dev/)
- **Styling & Design System**: [Tailwind CSS 3](https://tailwindcss.com/)
  - Custom government palette: Navy (`#0F2A4A`), AICTE Accent Blue (`#1F6FEB`), Slate, Amber, and Emerald.
  - Fully accessible badges pairing color, typography, and SVG iconography.
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Session store, demo resets, application filtering)
- **Data Visualization**: [Recharts 3](https://recharts.org/) (Responsive scrutiny pipeline bar charts)
- **Transitions & Micro-interactions**: [Framer Motion](https://www.framer.com/motion/)
- **Routing**: [React Router 7](https://reactrouter.com/)

---

## 6. Architecture & Decoupled Service Layer

The frontend components **never** directly access mock JSON files. All reads and state mutations pass through a centralized service interface (`src/api/index.js` backed by `src/api/mockDb.js`):

```
client/
├── src/
│   ├── api/                 # Single decoupled service layer (replaces with real REST/FastAPI endpoints)
│   │   ├── index.js         # getApplications(), getFindings(), submitDecision(), resetDemo()
│   │   └── mockDb.js        # In-memory database with synthetic latency simulation (300ms)
│   ├── constants.js         # Authoritative status vocabularies, severities, colors, DEMO_TODAY
│   ├── components/          # Shared atomic components (StatusBadge, SeverityTag, ConfidenceBar, etc.)
│   ├── portals/
│   │   ├── officer/         # Officer scrutiny portal
│   │   │   ├── pages/       # Dashboard, ApplicationReview, EvidenceViewer, AuditTrail
│   │   │   └── components/  # DecisionPanel, AuditTimeline, DocViewer, FindingCard, etc.
│   │   ├── college/         # College applicant portal (modular stub)
│   │   └── admin/           # Admin configuration portal (modular stub)
│   └── store/               # Session & portal Zustand stores
└── public/
    └── docs/                # High-fidelity synthetic statutory document images
```

> **Finals Integration Note:** To connect this prototype to a real backend (Node.js/Express + Python FastAPI with PaddleOCR and LLMs), only `src/api/` needs to be updated with real `fetch()` / `axios` endpoints. The UI components remain completely untouched.

---

## 7. Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- `npm` or `yarn`

### Installation & Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/PR-1301/sih26261-.git
   cd sih26261-
   ```

2. **Navigate to the client directory and install dependencies**:
   ```bash
   cd client
   npm install
   # or: yarn install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   # or: yarn dev
   ```

4. **Access the Officer Portal**:
   Open your browser and navigate to:
   ```text
   http://localhost:5173/officer/dashboard
   ```

---

## 8. Recorded Demo Script Reference

For the full step-by-step narrative script and screen-recording click path, refer to:
📖 **[`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md)**

### Quick Click Path
1. **Worklist Dashboard** (`/officer/dashboard`): Observe stat cards, alerts, and pipeline chart.
2. **Open Flawed Application** (`/officer/applications/APP-001`): Review document checklist and discrepancy summary.
3. **Inspect Land Discrepancy** (`/officer/applications/APP-001/findings/F-003`): Examine side-by-side bounding box highlights (`4.2` vs `3.8` acres).
4. **Inspect Expired Fire NOC** (`/officer/applications/APP-001/findings/F-002`): Note expired validity warning.
5. **Issue Officer Determination**: Submit `"Request more info"` with mandatory explanatory remarks.
6. **Verify Audit Trail** (`/officer/audit`): Confirm the officer action is immediately logged.
7. **Reset Demo**: Click **Reset Demo** (`Alt+Shift+D`) to restore original seed data.

---

## 9. Future Roadmap (Grand Finale & Production)

- **AI Core Service**: Integration with Python FastAPI microservices utilizing `PaddleOCR` / `Surya`, `PyMuPDF`, and local LLM reasoning via `Ollama`.
- **National Registry Integrations**: Live API verification hooks into DigiLocker, state Fire Services portals, and municipal land registry APIs.
- **Document Tampering & Forgery Detection**: Error Level Analysis (ELA) and spectral forensic checks on uploaded PDF/TIFF documents.
- **Physical Infrastructure Computer Vision**: Geospatial satellite verification and 360° campus video verification for mandatory playground/laboratory norms.

---
