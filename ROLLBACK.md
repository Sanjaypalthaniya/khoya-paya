# Rollback

Roll back the Vercel deployment to the previous immutable build. Fix database changes forward; do not delete migration history or run destructive down migrations. Before every migration, create a managed backup and record its ID. Restore only after stopping writes and validating the backup in an isolated database.

For provider incidents, disable the affected optional integration or restore its previous secret/configuration. Preserve payment/webhook, audit, recovery, claim, and evidence records. Reprocess failed webhooks only after the handler fix is deployed and idempotency is confirmed.
