# Razorpay setup

Use test-mode keys in staging. Configure the webhook URL `/api/webhooks/razorpay`, create a unique webhook secret, and subscribe to `payment.captured`, `payment.failed`, `order.paid`, `refund.created`, and `refund.processed`. The route verifies the raw request body before JSON parsing and deduplicates using the provider event ID or a stable event/entity/hash key.

Test success, failure, cancellation, duplicate callbacks, invalid signatures, duplicate webhooks, and refunds before rotating to live keys. Rotate checkout and webhook secrets independently. Reconciliation must use verified Razorpay API data and dry-run first.
