# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.2.x   | :white_check_mark: |
| < 1.2   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email: **deveshmanani1818@gmail.com**

Include the following in your report:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if any)

### What to Expect

- **Acknowledgment** within 48 hours of your report
- **Status update** within 7 days with an assessment
- **Fix timeline** based on severity:
  - Critical: 24-48 hours
  - High: 7 days
  - Medium: 30 days
  - Low: next release cycle

## Security Best Practices for Contributors

- Never commit `.env`, `.env.local`, or any file containing secrets
- Never commit Supabase service role keys, API keys, or credentials
- Use environment variables for all sensitive configuration
- Keep dependencies up to date — run `pnpm audit` regularly
- Do not disable or weaken Row Level Security (RLS) policies in migrations

## Scope

The following are in scope for security reports:

- Authentication/authorization bypasses
- SQL injection or RLS policy bypasses
- Cross-site scripting (XSS)
- Sensitive data exposure
- Server-side request forgery (SSRF)

The following are **out of scope**:

- Denial of service attacks
- Social engineering
- Issues in third-party dependencies (report those upstream)
- Issues requiring physical access to a user's device
