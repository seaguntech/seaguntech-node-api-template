# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please send an email to dev@seaguntech.com.

Please include the following:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact of the vulnerability
- Any possible fixes (if known)

We will acknowledge your report within 24 hours and provide a timeline for the fix.

## Security Best Practices

When using this template:

- Change all default secrets in `.env` before deployment
- Use strong JWT secrets (minimum 256-bit)
- Enable rate limiting in production
- Configure CORS properly for your domains
- Use HTTPS in production
- Keep dependencies updated
- Review and rotate secrets periodically
