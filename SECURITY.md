# Security Policy

## Supported Versions

ThermoScope actively maintains security patches for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

---

## Reporting a Vulnerability

The ThermoScope team takes application security seriously. If you discover a vulnerability, please do NOT file a public issue.

Instead, please send an encrypted or direct email to `rehaan5823@gmail.com` with:
1. Description of the vulnerability.
2. Steps to reproduce or proof-of-concept payload.
3. Potential impact on user data or backend services.

### Response Timeline
* **Initial response:** Within 48 hours.
* **Triage & patch:** Within 7 business days for high/critical severity issues.
* **Public disclosure:** Coordinated with the reporter after mitigation is deployed.

---

## Security Practices
* **No Hardcoded Secrets:** Private service-role tokens and database passwords must never be committed to Git.
* **Server-Side Validation:** All CSV inputs and API payloads are strictly validated using Pydantic and safe Pandas routines.
* **CSV Formula Injection Defense:** CSV export routines sanitize cells beginning with dangerous characters (`=`, `+`, `-`, `@`).
