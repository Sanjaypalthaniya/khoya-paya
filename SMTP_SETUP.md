# SMTP setup

Use a controlled staging sender/recipient domain. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM`. Verify connection, HTML and text content, invalid recipients, authentication failure, timeout, CTA URLs, and preference handling. Delivery failures must be inspected in sanitized server logs and must not expose credentials or private recovery details.
