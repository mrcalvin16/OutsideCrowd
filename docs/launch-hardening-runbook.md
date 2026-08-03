# OutsideCrowd Launch and Recovery Runbook

## Release gate

Every production release must satisfy the following checks:

1. The pull request is based on the current `main` branch and contains only intended files.
2. `npm ci --legacy-peer-deps` completes from the lockfile.
3. `npm run typecheck` passes.
4. `npm audit --omit=dev --audit-level=critical` passes.
5. `npm run build` completes with production-equivalent environment variable names.
6. Convex schema and function changes are deployed before the web application is merged.
7. After merge, verify the Vercel production deployment and `/api/health`.
8. Smoke-test sign-in, event discovery, checkout, tickets, organizer dashboard, and check-in.

Lint remains a tracked launch-hardening backlog and is temporarily non-blocking. Do not add new lint suppressions to hide new errors.

## Production incident response

### Severity

- **SEV-1:** checkout, ticket access, authentication, or check-in is broadly unavailable; suspected data loss or unauthorized access.
- **SEV-2:** a major organizer or attendee workflow is degraded without evidence of data loss.
- **SEV-3:** isolated defects with a safe workaround.

### First response

1. Record the time, affected route, deployment commit, and any incident digest shown by the application.
2. Check `/api/health`, the Vercel deployment logs, Convex logs, Clerk status, and Stripe webhook deliveries.
3. Stop additional releases until the incident owner declares recovery.
4. For a suspected security incident, preserve logs and rotate only the affected credentials; do not paste secrets into chat or tickets.

## Web rollback

Use Vercel Instant Rollback to point the production domains to the last known-good deployment. This is faster than rebuilding and preserves the failed deployment for investigation.

After rollback:

1. Confirm `/api/health` returns `status: ok`.
2. Smoke-test authentication, checkout, ticket display, organizer access, and check-in.
3. Revert or fix the bad Git commit through a pull request so `main` matches production.
4. Record the failed and restored commit SHAs in the incident log.

## Convex backups

Configure periodic production backups in the Convex dashboard under Deployment Settings → Backup & Restore.

Recommended operating target:

- daily managed backup;
- weekly downloaded off-platform backup;
- include file storage in exports;
- retain at least one verified backup from before every schema migration;
- run a restore rehearsal at least quarterly in a non-production deployment.

Manual production export:

```bash
npx convex export --prod --include-file-storage --path outsidecrowd-production-backup.zip
```

Store downloaded backups in encrypted storage with access limited to the production administrators. Never commit a production backup to Git.

## Convex restore

Restoring replaces deployment data and is destructive. Require a second administrator to verify the target deployment and backup timestamp.

1. Pause writes or place the application in maintenance mode.
2. Generate one additional backup of the current production state.
3. Verify the selected backup in a non-production deployment when time permits.
4. Prefer the Convex dashboard restore workflow for a full managed backup.
5. If the CLI is required, confirm the production target and then run:

```bash
npx convex import --prod --replace outsidecrowd-production-backup.zip
```

6. Redeploy the matching known-good Convex code and restore the matching environment variables.
7. Verify record counts and smoke-test checkout, tickets, event ownership, check-in, comps, messages, analytics, and Flyer Studio drafts.

## Recovery acceptance

Recovery is complete only when:

- production health is green;
- the affected user workflow succeeds;
- Stripe webhook delivery is current;
- Convex functions and schema match the deployed web commit;
- no unauthorized access or unexplained data loss is observed;
- the incident timeline, cause, impact, and follow-up owner are documented.

## Official references

- Convex backup and restore: https://docs.convex.dev/database/backup-restore
- Convex export CLI: https://docs.convex.dev/cli/reference/export
- Convex import CLI: https://docs.convex.dev/database/import-export/import
- Vercel Instant Rollback: https://vercel.com/docs/instant-rollback
- Vercel production rollback: https://vercel.com/docs/deployments/rollback-production-deployment
