# Razorpay Production Setup

## Test Mode

1. Use Razorpay test keys.
2. Add:

```env
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
NEXT_PUBLIC_RAZORPAY_KEY_ID=""
RAZORPAY_WEBHOOK_SECRET=""
```

3. Test order creation, checkout, payment verification, subscription update, and payment history.

## Live Mode

1. Complete Razorpay account activation.
2. Switch to Live Mode.
3. Replace test keys with live keys in Vercel.
4. Redeploy.

## Webhook

Set webhook URL:

```text
https://your-domain.com/api/webhooks/razorpay
```

Required events:

- `payment.captured`
- `payment.failed`

Copy the webhook secret into:

```env
RAZORPAY_WEBHOOK_SECRET=""
```

## Security Requirements

- Never expose `RAZORPAY_KEY_SECRET`.
- Only expose `NEXT_PUBLIC_RAZORPAY_KEY_ID` to browser.
- Verify payment signatures server-side.
- Activate subscription only after server verification.
- Verify webhook signature before processing webhook events.
