# Contributing to ThermoScope

Thank you for your interest in contributing to **ThermoScope**! We welcome pull requests, issue reports, statistical peer reviews, and performance optimizations.

---

## 1. Development Environment Setup

### Prerequisites
* **Node.js** >= 18.17 (v20+ recommended)
* **Python** >= 3.10
* **Git** >= 2.30

### Initial Setup
```bash
# Clone the repository
git clone https://github.com/Rehaan5823/thermoscope.git
cd thermoscope

# Install Python backend dependencies
cd apps/api
pip install -r requirements.txt
cd ../..

# Install frontend dependencies
cd apps/web
npm install
cd ../..
```

---

## 2. Running Locally

### Start Python Statistical Backend
```bash
cd apps/api
uvicorn src.thermoscope.api.main:app --reload --port 8000
```
API OpenAPI documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

### Start Next.js Frontend
```bash
cd apps/web
npm run dev -- -p 3000
```
Frontend web application will run at [http://localhost:3000](http://localhost:3000).

---

## 3. Running Automated Tests

Before submitting any code changes, ensure all test suites pass cleanly:

```bash
# Run statistical engine unit tests & API endpoint integration tests
python -m pytest tests/ -v

# Run frontend linting & TypeScript typecheck
cd apps/web
npm run lint
npm run build
cd ../..
```

---

## 4. Pull Request Guidelines

1. **Create a topic branch:** `git checkout -b feature/your-feature-name`
2. **Follow scientific conventions:** Preserve all statistical equations and ensure analytical changes include unit tests with independently computed expected values.
3. **Commit hygiene:** Use clear, conventional commit messages (e.g. `feat(engine): add piecewise Poisson rate estimator`).
4. **Submit PR:** Open a Pull Request targeting the `main` branch using the provided PR template.
