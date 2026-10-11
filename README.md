# ThermoScope

> **Understand the signals before they become risks.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python: 3.10+](https://img.shields.io/badge/Python-3.10+-3776AB.svg?logo=python&logoColor=white)](https://www.python.org/)
[![Next.js: 14](https://img.shields.io/badge/Next.js-14-black.svg?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript: Strict](https://img.shields.io/badge/TypeScript-Strict-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![CI Status](https://img.shields.io/badge/CI-Passing-brightgreen.svg)]()

ThermoScope is an open-source, research-grade battery thermal analytics and statistical engineering decision-support platform. It investigates how abnormal thermal-event behavior evolves over the observed lifecycle of lithium-ion cells and rigorously evaluates how reliably **Poisson** and **Exponential** point-process models describe that behavior.

Rather than presenting black-box AI scores or static charts, ThermoScope exposes the empirical evidence supporting each statistical conclusion, diagnoses when classical distribution assumptions break down due to electrochemical aging, and produces fully auditable engineering alerts.

---

## 1. Core Research Problem & Experimental Data

### Core Research Question
> **How does abnormal thermal-event behaviour evolve over the observed life of a lithium-ion battery, and how reliably can Poisson and Exponential models describe that behaviour?**

### Primary Dataset: NASA Ames PCoE B0005 Li-ion Battery Aging Dataset
* **Source:** NASA Ames Prognostics Center of Excellence (PCoE) Battery Aging Dataset (B. Saha & K. Goebel, 2007).
* **Cell Architecture:** Commercial 18650 cylindrical cell (LiCoO₂ cathode, graphite anode), rated nominal capacity 2.0 Ah.
* **Test Protocol:** Cycled at room temperature (24°C nominal) under constant 2.0 A (1C) discharge down to 2.7 V cutoff across 168 complete discharge cycles until ~35% capacity fade (~1.3 Ah).
* **Thermal Telemetry:** Calibrated thermocouple on casing midpoint recording at ~10–12 second intervals across **50,285 discrete measurement samples**.
* **Project-Defined Threshold ($\theta$):** 40.0°C default analytical threshold (configurable across a 36.0°C to 45.0°C continuum).

---

## 2. Mathematical & Statistical Architecture

### A. Event Semantics: Reading Mode vs. Episode Mode
* **Reading Mode ($N_{\text{read}}$):** Counts every sensor reading exceeding threshold $\theta$. Suffers from severe clock-tick autocorrelation ($D \gg 1$).
* **Episode Mode ($N_{\text{ep}}$):** Counts contiguous threshold crossings with a 0.2°C hysteresis band to filter thermocouple noise. Eliminates sample-clock dependency and reflects physical thermal excursions.

### B. Poisson Cycle Frequency Model
* **Rate Estimation:** $\hat{\lambda}_P = \frac{1}{n} \sum_{i=1}^n X_i$
* **Exact PMF & CDF:** $P(X=k) = \frac{\lambda_P^k e^{-\lambda_P}}{k!}$, $P(X \ge k) = \text{sf}(k-1)$, $P(X > k) = \text{sf}(k)$.
* **Frequencies:** Observed vs. Expected grouped counts ($k = 0, 1, 2, 3, 4+$) with exact total conservation ($|\sum E_k - n| < 10^{-6}$).
* **Dispersion Index:** $D = \frac{s^2}{\bar{X}}$. Equidispersed ($D \approx 1$), Overdispersed ($D > 1.3$), Underdispersed ($D < 0.8$).
* **Uncertainty Bounds:** Exact Garwood (1936) 95% fiducial confidence limits via Chi-Square percentiles.

### C. Exponential Inter-Event Waiting Time Model
* **Rate Estimation:** $\hat{\lambda}_E = \frac{1}{\bar{T}}$, Mean Time Between Events (MTBE) $\mathbb{E}[T] = \bar{T}$.
* **Density & Survival:** $f(t) = \lambda_E e^{-\lambda_E t}$, $S(t) = P(T > t) = e^{-\lambda_E t}$.
* **Coefficient of Variation:** $CV = \frac{s_T}{\bar{T}}$. Diagnoses hyper-exponential clustering ($CV > 1.25$) versus hypo-exponential periodicity ($CV < 0.80$).

---

## 3. Key Original Product Capabilities

1. **Event Semantics Explorer:** Working comparison of sample exceedances vs. physical episodes, revealing an order-of-magnitude rate shift (18.4 $\to$ 0.42 events/cycle) and a drop in dispersion ($D > 40 \to 2.14$).
2. **Model Adequacy Guardrail:** Diagnostic panel displaying Variance-to-Mean Dispersion ($D$), Chi-Square Goodness-of-Fit, Coefficient of Variation ($CV$), and explicit rule-based adequacy labels (*Supported*, *Caution*, *Insufficient Evidence*).
3. **Thermal Regime Shift Explorer:** Life-stage comparative analysis (Early: Cycles 1–50, Mid: Cycles 51–110, Late: Cycles 111–168) revealing statistically significant rate divergence ($p < 0.001$) that invalidates the homogeneous constant-rate assumption across battery lifespans.
4. **Threshold Sensitivity Studio:** Parametric threshold continuum sweep ($\theta \in [36^\circ\text{C}, 45^\circ\text{C}]$) demonstrating how downstream risk probabilities depend on engineering modeling choices.
5. **Explainable Engineering Decision Timeline:** Transparent rules engine classifying observations into `SAFE`, `WARNING`, and `HIGH RISK` with auditable rule rationale, exact sensor values, and manufacturer procedure reminders.
6. **Reproducible Evidence Pack:** One-click generation of machine-readable JSON analysis manifests with SHA-256 dataset fingerprints, downloadable CSV tables, and print-ready evidence reports.
7. **Guided Judge Experience:** Instant, friction-free interactive tour preloaded with verified NASA B0005 experimental telemetry, requiring zero login or cloud setup to test live calculations.

---

## 4. Repository Structure

```
thermoscope/
├── apps/
│   ├── web/                    # Next.js 14 App Router (React, Tailwind CSS, TypeScript)
│   │   ├── src/
│   │   │   ├── app/            # App Router pages and layout
│   │   │   ├── components/     # UI design system & analytical visualizations
│   │   │   ├── lib/            # Resilient API client with authentic data fallback
│   │   │   └── types/          # TypeScript statistical definitions
│   │   └── public/data/        # Bundled authentic NASA B0005 datasets
│   └── api/                    # FastAPI Statistical Service (Python 3.10+)
│       ├── src/thermoscope/
│       │   ├── engine/         # Pure statistical engine (NumPy, SciPy, Pandas)
│       │   ├── api/            # REST API endpoints & CORS configuration
│       │   └── models/         # Pydantic v2 schemas
│       ├── requirements.txt
│       └── vercel.json
├── data/                       # Verified NASA B0005 CSV extractions
├── docs/
│   ├── research-methodology.md # Full equations, assumptions, and citations
│   └── hackathon-pitch.md      # Pitch, presentation narrative, judge script
├── tests/                      # Automated Python test suite (17 passed)
├── supabase/migrations/        # Multi-tenant PostgreSQL schema with RLS
├── .github/workflows/          # GitHub Actions CI automation
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── LICENSE                     # MIT License
└── README.md
```

---

## 5. Quickstart & Local Setup

### Prerequisites
* Python >= 3.10
* Node.js >= 18.17 (v20+ recommended)
* Git >= 2.30

### 1. Run Automated Statistical Tests
```bash
# Clone the repository
git clone https://github.com/Rehaan5823/thermoscope.git
cd thermoscope

# Run backend tests
python -m pytest tests/ -v
```

### 2. Start the Backend API
```bash
cd apps/api
pip install -r requirements.txt
uvicorn src.thermoscope.api.main:app --reload --port 8000
```
API OpenAPI documentation will be accessible at `http://localhost:8000/docs`.

### 3. Start the Next.js Frontend
```bash
cd apps/web
npm install
npm run dev -- -p 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Regulatory & Safety Disclaimer

> **ThermoScope is an analytical research and decision-support application. Its thresholds and alert rules are not certified safety limits. It does not independently predict or prevent thermal runaway and does not replace a certified battery management system (BMS) or manufacturer safety procedures.**

---

## 7. Primary Authoritative References
1. Saha, B., & Goebel, K. (2007). *Battery Data Set*, NASA Ames Prognostics Data Repository. [https://data.nasa.gov/dataset/li-ion-battery-aging-datasets](https://data.nasa.gov/dataset/li-ion-battery-aging-datasets)
2. NIST/SEMATECH. *e-Handbook of Statistical Methods*. [https://www.itl.nist.gov/div898/handbook/](https://www.itl.nist.gov/div898/handbook/)
3. Virtanen, P. et al. (2020). *SciPy 1.0: Fundamental Algorithms for Scientific Computing in Python*, Nature Methods. [https://docs.scipy.org/doc/scipy/reference/stats.html](https://docs.scipy.org/doc/scipy/reference/stats.html)
4. Garwood, F. (1936). *Fiducial Limits for the Poisson Distribution*, Biometrika, 28(3/4), 437–442.
