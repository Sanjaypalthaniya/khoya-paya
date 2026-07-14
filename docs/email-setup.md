# Email Setup

Khoya Paya sends owner alerts when a finder submits a message.

## SMTP Option

Use any SMTP provider:

```env
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="Khoya Paya <support@your-domain.com>"
```

## Gmail App Password

1. Enable 2FA on Google account.
2. Create app password.
3. Use Gmail SMTP:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"
SMTP_FROM="Khoya Paya <your_email@gmail.com>"
```

## Resend SMTP

If using Resend SMTP, configure Resend's SMTP host/user/password values in the same SMTP variables.

## Failure Behavior

Finder messages are saved first. If email fails, the API logs the email error and still returns success for the saved finder message.

## Test

1. Generate item QR.
2. Submit finder message.
3. Confirm owner gets email.
4. Temporarily break SMTP credentials and confirm finder message still saves.
