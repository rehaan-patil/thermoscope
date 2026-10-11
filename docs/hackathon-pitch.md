# ThermoScope — Hackathon Evaluation & Research Pitch

**Product Name:** ThermoScope  
**Tagline:** Understand the signals before they become risks.  
**Track:** Battery Analytics, Statistical Decision Support, & Reliability Engineering  

---

## 1. The Real-World Engineering Problem
Battery safety systems in electric vehicles (EVs) and grid-scale Energy Storage Systems (ESS) face a challenging statistical problem: **detecting thermal anomaly escalation long before physical thermal runaway occurs.**

Today's Battery Management Systems (BMS) rely almost exclusively on crude deterministic thresholds (e.g. if $T > 60^\circ\text{C}$, trigger emergency shutdown). By the time such limits are breached during an active thermal event, catastrophic failure may be minutes away.

However, battery cells do not degrade silently: as lithium-ion cells age, internal resistance increases, generating transient thermal excursions during standard cycling. Engineering teams need to answer:
> **How does abnormal thermal-event behaviour evolve over the observed life of a lithium-ion battery, and how reliably can Poisson and Exponential models describe that behaviour?**

---

## 2. The Statistical Insight
Many data science projects naively fit a Poisson distribution to sensor data without checking foundational assumptions:
1. **Poisson Processes assume memorylessness and constant event rate ($\lambda$).** Yet electrochemical aging is inherently non-stationary—a degraded cell undergoes rapid impedance escalation.
2. **Poisson Processes assume independent events.** Raw sensor readings sampled every 10 seconds exhibit massive autocorrelation—one 5-minute hot streak looks like 30 separate events, artificially inflating variance and inducing massive overdispersion ($D \gg 1$).

ThermoScope does not simply calculate probabilities. It evaluates the **validity of the underlying statistical models**, diagnoses when they break down, and explains the engineering significance of model violations.

---

## 3. Why Event Semantics Matter (Reading vs. Episode Mode)
ThermoScope introduces the **Event Semantics Explorer**:
* **Reading Mode (Point Exceedance):** Every sensor tick where $T > \theta$ is counted as an event. This conflates duration with frequency and heavily distorts Poisson rates ($\hat{\lambda}_P$ becomes an artifact of the sampling clock).
* **Episode Mode (Continuous Excursion):** A single thermal episode is defined by the transition across threshold $\theta$, continuing until the temperature returns below the threshold with hysteresis.

**Result:** In NASA B0005 data, switching from Reading to Episode mode changes $\hat{\lambda}_P$ by over an order of magnitude and drops the dispersion index $D$ from extreme overdispersion ($D > 40$) toward interpretable values, showing judges why data semantics dictate engineering safety conclusions.

---

## 4. Key Original Product Capabilities

1. **Event Semantics Explorer:** Side-by-side comparison of sample exceedances vs. physical thermal episodes with live recalculated rates and dispersion indices.
2. **Model Adequacy Guardrail:** Diagnostic panel displaying Variance-to-Mean Dispersion ($D$), Chi-Square Goodness-of-Fit, Coefficient of Variation ($CV$), and explicit rule-based adequacy labels (*Supported*, *Caution*, *Insufficient Evidence*).
3. **Thermal Regime Shift Explorer:** Life-stage comparative analysis (Early: Cycles 1–50, Mid: Cycles 51–110, Late: Cycles 111–168) revealing how degradation violates the constant-rate assumption with non-overlapping Garwood confidence intervals.
4. **Threshold Sensitivity Studio:** Interactive threshold sensitivity curve ($\theta \in [36^\circ\text{C}, 46^\circ\text{C}]$) demonstrating how analytical model conclusions shift based on engineering parameter selection.
5. **Explainable Engineering Decision Timeline:** Transparent rules engine classifying observations into `SAFE`, `WARNING`, and `HIGH RISK` with auditable rule rationale, exact sensor values, and manufacturer procedure reminders.
6. **Reproducible Evidence Pack:** One-click generation of machine-readable JSON analysis manifests with SHA-256 dataset fingerprints, downloadable CSVs, and print-ready evidence reports.
7. **Guided Judge Experience:** Instant, friction-free interactive tour preloaded with verified NASA B0005 experimental telemetry, requiring zero login or cloud setup to test live calculations.

---

## 5. Live Demonstration Script for Reviewers & Judges

### Step 1: Landing Page & Problem Context (30 seconds)
* Reviewer opens the live URL. The dark graphite, high-contrast typography immediately communicates research-grade instrumentation.
* Reviewer clicks **"Launch Guided Demo"** to access the live workspace loaded with real NASA B0005 data.

### Step 2: Event Semantics Explorer (45 seconds)
* Reviewer observes the cycle thermal profile.
* Toggle between **Reading Mode** and **Episode Mode**.
* Note how the estimated Poisson rate $\hat{\lambda}_P$ adjusts from $18.4$ readings/cycle down to $0.42$ episodes/cycle.
* Reviewer sees why counting raw clock ticks corrupts the point-process model.

### Step 3: Statistical Laboratory & Model Diagnostics (60 seconds)
* Reviewer navigates to the **Statistical Laboratory**.
* Reviewer examines the Poisson observed vs. expected frequencies:
  * Bin counts: 0, 1, 2, 3, and 4+ events.
  * Grouped conservation check verifying exact total cycle count.
* Reviewer inspects the **Model Adequacy Guardrail**:
  * Dispersion Index $D = 2.14$ ($s^2 > \bar{X}$).
  * Status badge: **"Caution: Overdispersed Process"**.
  * Explanation: Cell degradation causes thermal events to cluster in late cycles, violating the stationary Poisson assumption.

### Step 4: Thermal Regime Shift & Ageing Stages (45 seconds)
* In the **Ageing Analysis** tab, reviewer inspects rates across stages:
  * Early (Cycles 1–50): $\hat{\lambda} \approx 0.00$
  * Mid-life (Cycles 51–110): $\hat{\lambda} \approx 0.18$
  * Late-life (Cycles 111–168): $\hat{\lambda} \approx 0.95$
* Garwood 95% confidence intervals confirm rate acceleration is statistically significant ($p < 0.001$), demonstrating why constant-rate predictions fail across battery lifespans.

### Step 5: Engineering Decision Timeline & Reproducibility Pack (42 seconds)
* Reviewer visits the **Decision Center** and inspects the timeline of alerts:
  * Cycle 124 triggers **WARNING** (Consecutive cycle thermal episodes detected).
  * Cycle 152 triggers **HIGH RISK** (Temperature exceeded $43.2^\circ\text{C}$).
  * Each alert expands to show exact trigger rule, empirical telemetry, and safety disclaimer.
* Reviewer clicks **"Export Evidence Pack"** to download the complete JSON manifest with SHA-256 dataset hash for independent verification.

---

## 6. Scientific Limitations & Responsible Engineering
* **Not a certified BMS:** ThermoScope provides statistical decision support; it does not replace certified hardware protection or ISO 26262 functional safety units.
* **Non-predictive of physical runaway:** Elevated surface temperature indicates electrochemical impedance growth; catastrophic runaway involves separator collapse and chemical exothermic cascades which require multi-physics modeling.
