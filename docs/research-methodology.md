# ThermoScope — Research Methodology & Statistical Foundations

**Document Version:** 1.0.0  
**Project:** ThermoScope: Battery Thermal Analytics & Statistical Decision Support  
**Authors:** ThermoScope Scientific & Engineering Team  
**Status:** Canonical Reference Document  

---

## 1. Executive Summary & Core Research Questions

Lithium-ion battery degradation is an electro-chemo-thermal phenomenon. As cells undergo repeated charge and discharge cycling, degradation mechanisms—including Solid Electrolyte Interphase (SEI) layer thickening, lithium plating, transition metal dissolution, and mechanical micro-cracking of electrode particles—cause an increase in cell internal resistance ($R_{\text{int}}$) and loss of active lithium inventory. In turn, Joule heating ($Q = I^2 R_{\text{int}}$) and entropic heating accelerate, leading to abnormal temperature excursions under constant electrical workloads.

ThermoScope addresses the fundamental research problem:
> **How does abnormal thermal-event behaviour evolve over the observed operating life of a lithium-ion battery, and how reliably can homogeneous Poisson and Exponential models describe that behaviour?**

ThermoScope is engineered to transform raw battery thermal time series into an inspectable, auditable, and scientifically grounded statistical decision-support system. It evaluates whether the canonical assumptions of memoryless point processes hold across battery degradation stages, explains the mathematical consequences of event semantics (reading vs. episode), and provides evidence-backed engineering alerts without making unverified claims of physical thermal runaway prediction.

---

## 2. Experimental Data Foundation: NASA Li-ion B0005 Dataset

### 2.1 Primary Data Source
The primary benchmark dataset utilized in ThermoScope is derived from the **NASA Ames Prognostics Center of Excellence (PCoE) Battery Aging Dataset** (Specifically Cell **B0005**).

* **Source URL:** [https://data.nasa.gov/dataset/li-ion-battery-aging-datasets](https://data.nasa.gov/dataset/li-ion-battery-aging-datasets)
* **Experimenters:** Bhaskar Saha and Kai Goebel (NASA Ames Research Center, Moffett Field, CA).
* **Reference:** Saha, B., & Goebel, K. (2007). *Battery Data Set*, NASA Ames Prognostics Data Repository.

### 2.2 Experimental Conditions of Cell B0005
* **Form Factor & Chemistry:** Commercial 18650 cylindrical lithium-ion cell (LiCoO$_2$ cathode, graphite anode), rated nominal capacity 2.0 Ah.
* **Ambient Test Chamber Temperature:** Regulated at 24°C nominal room temperature.
* **Cycling Protocol:**
  * **Charging:** Constant Current Constant Voltage (CCCV) protocol at 1.5 A until terminal voltage reached 4.2 V, followed by constant voltage until charge current tapered below 20 mA.
  * **Discharging:** Constant Current (CC) regime at 2.0 A until cell voltage dropped to the end-of-life cutoff threshold of 2.7 V.
  * **Impedance Spectroscopy:** Periodic electrochemical impedance measurements (EIS) from 0.1 Hz to 5 kHz.
* **Thermal Measurement:** Calibrated surface thermocouple affixed to the midpoint of the cylindrical cell casing, recording temperature (°C) continuously at sampling intervals of approximately 10 to 12 seconds throughout each discharge run.
* **Total Discharge Cycles:** 168 complete discharge cycles tracked from pristine state down to ~1.3 Ah remaining capacity (~35% capacity fade).

### 2.3 Data Integrity & Processing Conventions
1. **Time Indexing:** Each discharge cycle $i \in \{1, \dots, N_{\text{cycles}}\}$ comprises discrete sensor readings $(t_{i,j}, T_{i,j})$, where $t_{i,j}$ represents elapsed discharge time in seconds and $T_{i,j}$ represents cell surface temperature in degrees Celsius (°C).
2. **Cycle Boundaries:** Discharge cycles represent discrete operational intervals separated by rest and charge phases. The primary interval unit for the Poisson model is **one discharge cycle**.
3. **Data Quality Assurance:**
   * Monotonicity check on elapsed time within each discharge cycle.
   * Rejection of NaN, null, and non-physical values ($T < -20^\circ\text{C}$ or $T > 120^\circ\text{C}$).
   * Detection and handling of thermocouple dropouts and non-uniform sampling rates.

---

## 3. Project-Defined Thermal Event Definitions

### 3.1 Default Analytical Threshold ($\theta = 40.0^\circ\text{C}$)
ThermoScope establishes a default analytical temperature threshold of **$\theta = 40.0^\circ\text{C}$**.
* **Rationale:** In a 24°C ambient environment with a 1C discharge rate (2.0 A on a 2.0 Ah cell), healthy pristine cells typically peak below 36°C to 38°C due to natural convective dissipation. Surface temperatures exceeding 40.0°C indicate substantial Joule heating driven by elevated internal impedance in later cycles.
* **Regulatory & Scientific Disclaimer:** $\theta = 40.0^\circ\text{C}$ is a project-defined research threshold for statistical event characterization. It is **not** an official OEM cutoff, UL 1642 safety standard, or universal critical runaway limit. The application allows users to evaluate thresholds across an analytical continuum (36.0°C to 46.0°C).

### 3.2 Event Semantics: Reading Mode vs. Episode Mode
A foundational innovation of ThermoScope is resolving the mathematical conflation between raw sensor exceedances and distinct physical thermal events.

#### A. Reading Mode (Sample Exceedance)
In Reading Mode, every single sensor observation exceeding the threshold is counted:
$$X_i^{\text{read}} = \sum_{j=1}^{M_i} \mathbf{1}(T_{i,j} > \theta)$$
where $M_i$ is the number of samples in cycle $i$, and $\mathbf{1}(\cdot)$ is the indicator function.
* **Limitation:** Highly dependent on sensor sampling frequency $\Delta t$. If $\Delta t = 1\,\text{s}$, a 10-minute overheat yields 600 events; if $\Delta t = 10\,\text{s}$, it yields 60 events. Furthermore, consecutive readings exhibit strong positive auto-correlation, violating independent trials.

#### B. Episode Mode (Run Exceedance with Hysteresis)
In Episode Mode, an event is initiated only when temperature crosses strictly above $\theta$ from a sub-threshold state:
$$X_i^{\text{ep}} = \sum_{j=1}^{M_i} \mathbf{1}(T_{i,j} > \theta \;\land\; T_{i, j-1} \le \theta)$$
An optional hysteresis band $\epsilon = 0.2^\circ\text{C}$ is applied to eliminate sensor noise flickering near $\theta$.
* **Significance:** Represents distinct thermal excursions, drastically reducing autocorrelation and providing a defensible basis for waiting-time point-process analysis.

---

## 4. Mathematical & Statistical Framework

### 4.1 Poisson Process Model for Cycle Event Counts
Let $X_i \in \mathbb{N}_0$ be the count of abnormal thermal events observed in discharge cycle $i$, for $i = 1, \dots, n$.

#### 4.1.1 Parameter Estimation
Under the hypothesis that events follow a homogeneous Poisson distribution $X \sim \text{Poisson}(\lambda_P)$:
$$\hat{\lambda}_P = \bar{X} = \frac{1}{n} \sum_{i=1}^n X_i$$
By Maximum Likelihood Estimation (MLE), $\hat{\lambda}_P$ is the uniformly minimum-variance unbiased estimator (UMVUE).

#### 4.1.2 Probability Mass Function & Cumulative Metrics
$$P(X = k) = \frac{\lambda_P^k e^{-\lambda_P}}{k!}, \quad k \in \{0, 1, 2, \dots\}$$
ThermoScope explicitly computes and distinguishes:
1. $P(X = 0) = e^{-\lambda_P}$ (Zero-event probability)
2. $P(X = 1) = \lambda_P e^{-\lambda_P}$
3. $P(X = k)$ for arbitrary integer $k \ge 0$
4. At least $k$ events: $P(X \ge k) = 1 - \sum_{j=0}^{k-1} P(X = j) = \text{sf}(k-1)$ (Survival Function)
5. More than $k$ events: $P(X > k) = 1 - \sum_{j=0}^k P(X = j) = \text{sf}(k)$

Numerical stability is guaranteed using SciPy's `scipy.stats.poisson.pmf`, `cdf`, and `sf` (log-space evaluations prevent numerical underflow for large factorial values).

#### 4.1.3 Observed vs. Expected Grouped Frequency
To evaluate empirical agreement, cycle counts are grouped into mutually exclusive bins:
$$\mathcal{B} \in \{k=0, k=1, k=2, k=3, k \ge 4\}$$
* Expected count for bin $k$:
  $$E_k = n \cdot P(X = k) \quad \text{for } k \in \{0, 1, 2, 3\}$$
  $$E_{4+} = n \cdot P(X \ge 4) = n \left(1 - \sum_{j=0}^3 P(X = j)\right)$$
* Total conservation check: $\sum_{k=0}^{3} E_k + E_{4+} = n \cdot 1.0 = n$ within numerical precision $| \sum E_k - n | < 10^{-7}$.

#### 4.1.4 Index of Dispersion (Variance-to-Mean Ratio)
For a true Poisson process, the mean equals the variance: $\mathbb{E}[X] = \text{Var}(X) = \lambda_P$.
The sample variance is:
$$s^2 = \frac{1}{n - 1} \sum_{i=1}^n (X_i - \bar{X})^2$$
The Index of Dispersion is defined as:
$$D = \frac{s^2}{\bar{X}}$$
* **Interpretation:**
  * $D \approx 1.0$: Equidispersion (compatible with homogeneous Poisson).
  * $D > 1.0$: Overdispersion (signals event clustering, unobserved heterogeneity, or non-stationary aging trends).
  * $D < 1.0$: Underdispersion (signals regular, repelling, or constrained event processes).
  * **Edge Cases:** If $\bar{X} = 0$, $D$ is formally undefined (reported as 0 with explicit indicator).

#### 4.1.5 Goodness-of-Fit Diagnostic
When sample size permits ($E_k \ge 5$ across bins, with bin pooling applied when necessary):
$$\chi^2 = \sum_{k} \frac{(O_k - E_k)^2}{E_k}$$
Degrees of freedom: $\nu = K_{\text{pooled}} - 1 - 1$ (subtracting 1 for sample size normalization, 1 for estimated parameter $\hat{\lambda}_P$).
$p$-value calculated via `scipy.stats.chi2.sf(\chi^2, \nu)`.

#### 4.1.6 Confidence Intervals for Rate $\lambda_P$
To convey statistical uncertainty, ThermoScope calculates the exact confidence interval for $\lambda_P$ at significance level $1 - \alpha = 0.95$ using **Garwood's Method** (based on the exact relationship with the Chi-Square distribution):
$$\lambda_{\text{lower}} = \frac{1}{2n} \chi^2_{2S, \, \alpha/2}, \quad \lambda_{\text{upper}} = \frac{1}{2n} \chi^2_{2(S+1), \, 1 - \alpha/2}$$
where $S = \sum_{i=1}^n X_i$ is the total number of events observed across $n$ cycles.

---

### 4.2 Exponential Distribution Model for Inter-Event Waiting Times

#### 4.2.1 Waiting Time Definition
Let $\tau_m$ denote the timestamp (or cycle coordinate) of the $m$-th distinct thermal episode.
The inter-event waiting time interval is:
$$T_m = \tau_{m} - \tau_{m-1}, \quad m = 2, \dots, M$$
* **Observation Units:**
  * Within-cycle episodes: Measured in **seconds** (elapsed discharge duration).
  * Cycle-level event waiting times: Measured in **cycles** (inter-cycle gap).
  * **Rule:** Cycle counts are strictly labeled as "cycles", never synthesized into physical seconds or hours without empirical time stamps.

#### 4.2.2 Parameter Estimation
Under the hypothesis that inter-event intervals follow an Exponential distribution $T \sim \text{Exp}(\lambda_E)$:
$$\hat{\lambda}_E = \frac{1}{\bar{T}} = \frac{M - 1}{\sum_{m=2}^M T_m}$$
Expected waiting time (Mean Time Between Events, MTBE):
$$\mathbb{E}[T] = \frac{1}{\lambda_E} = \bar{T}$$

#### 4.2.3 Probability Density & Cumulative Functions
$$f(t) = \lambda_E e^{-\lambda_E t}, \quad t \ge 0$$
$$F(t) = P(T \le t) = 1 - e^{-\lambda_E t}$$
$$S(t) = P(T > t) = e^{-\lambda_E t} \quad (\text{Survival Probability})$$

#### 4.2.4 Coefficient of Variation ($CV$)
The sample standard deviation of waiting times is $s_T = \sqrt{\frac{1}{(M-1)-1} \sum (T_m - \bar{T})^2}$.
$$CV = \frac{s_T}{\bar{T}}$$
* **Diagnostic Interpretation:**
  * For a theoretical exponential distribution, standard deviation equals mean, hence $CV = 1.0$.
  * $CV > 1.0$: Hyper-exponential dispersion, indicating bursty or clustered arrival times.
  * $CV < 1.0$: Hypo-exponential dispersion, indicating periodic or regular thermal occurrences.

#### 4.2.5 Confidence Interval for Exponential Rate $\lambda_E$
For $K = M - 1$ observed uncensored intervals, the exact $(1-\alpha)$ confidence interval for $\lambda_E$ is:
$$\left[ \frac{\chi^2_{2K, \, \alpha/2}}{2 K \bar{T}}, \; \frac{\chi^2_{2K, \, 1 - \alpha/2}}{2 K \bar{T}} \right]$$

---

## 5. Non-Stationarity & Thermal Regime Shifts Across Battery Lifetime

### 5.1 Battery Ageing Stages
A homogeneous Poisson or Exponential model assumes stationary rate parameters ($\lambda_P = \text{const}$, $\lambda_E = \text{const}$). In lithium-ion cells, this assumption is inherently challenged by electrochemical degradation.
ThermoScope partitions the operational life into three configurable stages:
1. **Pristine / Early Stage** (Cycles 1 to 50): Low internal resistance, negligible thermal exceedances.
2. **Mid-Life Degradation Stage** (Cycles 51 to 110): Gradual impedance rise, transient thermal episodes during peak discharge C-rate.
3. **Knee-Point / Late-Stage Aging** (Cycles 111 to 168): Accelerated degradation, frequent and sustained thermal excursions.

### 5.2 Comparative Rate Analysis
For each stage $s \in \{\text{Early}, \text{Mid}, \text{Late}\}$:
$$\hat{\lambda}_{P, s} = \frac{1}{n_s} \sum_{i \in \text{Stage } s} X_i, \qquad D_s = \frac{s_s^2}{\bar{X}_s}$$
By comparing $\hat{\lambda}_{P, s}$ and their Garwood confidence intervals across stages, ThermoScope reveals whether rate divergence is statistically significant, explicitly guarding against naive extrapolation of early-stage rates to end-of-life battery operations.

---

## 6. Model Adequacy Guardrail & Diagnostic Engine

ThermoScope implements a rule-based model suitability classification system:

| Status | Diagnostic Criteria | Engineering Action |
| :--- | :--- | :--- |
| **Supported by Current Diagnostics** | $0.80 \le D \le 1.30$, Chi-square $p > 0.05$, $0.80 \le CV \le 1.25$, $n \ge 30$, event count $\ge 20$. | Poisson/Exponential probability models may be utilized for short-term risk estimations. |
| **Caution: Non-Stationary or Overdispersed** | $D > 1.30$ or $D < 0.80$, or $CV > 1.25$, or stage-wise rates differ by $>2\times$ with non-overlapping 95% CIs. | Homogeneous Poisson assumption violated. Probabilities should not be relied upon without regime conditioning. |
| **Insufficient Evidence** | Total cycles $n < 15$ or total events $< 5$. | Statistical estimators have high standard error; metrics flagged as preliminary. |

---

## 7. Explainable Engineering Decision Engine

ThermoScope translates statistical indicators into three operational states:
1. **SAFE:** No configured threshold or rate rules exceeded within the evaluation window.
2. **WARNING:** Sustained moderate temperature exceedances or rate acceleration above baseline ($\ge 2$ consecutive cycles with events).
3. **HIGH RISK:** Severe temperature exceedance ($T > 45^\circ\text{C}$) or rapid multi-episode cascade.

### Auditability Requirements
Every decision output includes:
* Trigger rule ID and human-readable name.
* Configured parameter thresholds.
* Exact empirical telemetry values (cycle number, maximum recorded temperature, episode count).
* Statistical context ($\hat{\lambda}_P$, local dispersion, survival probability).
* Standard disclaimer reminding operators of the research decision-support scope.

---

## 8. Primary Authoritative References

1. **NASA Li-ion Battery Aging Dataset:**  
   B. Saha and K. Goebel, "Battery Data Set", NASA Ames Prognostics Data Repository, NASA Ames Research Center, Moffett Field, CA, 2007.  
   URL: [https://data.nasa.gov/dataset/li-ion-battery-aging-datasets](https://data.nasa.gov/dataset/li-ion-battery-aging-datasets)
2. **SciPy Statistical Distributions:**  
   Virtanen, P. et al., "SciPy 1.0: Fundamental Algorithms for Scientific Computing in Python", *Nature Methods*, 17, 261–272, 2020.  
   Documentation: [https://docs.scipy.org/doc/scipy/reference/stats.html](https://docs.scipy.org/doc/scipy/reference/stats.html)
3. **NIST/SEMATECH e-Handbook of Statistical Methods:**  
   National Institute of Standards and Technology (NIST), Information Technology Laboratory.  
   Sections: 1.3.6.6 (Poisson Distribution), 1.3.6.7 (Exponential Distribution), 8.4.2 (Reliability Modeling).  
   URL: [https://www.itl.nist.gov/div898/handbook/](https://www.itl.nist.gov/div898/handbook/)
4. **Point Process Statistical Foundations:**  
   D. R. Cox and P. A. W. Lewis, *The Statistical Analysis of Series of Events*, Methuen & Co., London, 1966.
5. **Garwood Confidence Limits for Poisson Parameters:**  
   F. Garwood, "Fiducial Limits for the Poisson Distribution", *Biometrika*, 28(3/4), 437–442, 1936.
