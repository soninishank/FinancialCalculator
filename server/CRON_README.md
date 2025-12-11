# Important: Cron Job Disabled by Default

## Issue Encountered

After implementing the automatic cron job for hourly IPO data refresh, we discovered that it was causing database connection errors:

```
Error: Connection terminated unexpectedly
```

This occurred when the cron job tried to sync all 1298 past IPOs, causing the database connection to be terminated during the long-running operation.

## Solution

**Cron jobs are now disabled by default** in `server/app.js`. The automatic hourly refresh functionality is still available but must be explicitly enabled.

### To Enable Cron Jobs (Optional)

If you want automatic hourly data refresh, follow these steps:

1. **Uncomment the cron initialization** in `server/app.js` (lines 23-26):
   ```javascript
   // Uncomment these lines:
   cronJobs.startCronJobs();
   if (ENABLE_CRON) {
       cronJobs.enableCronJobs();
   }
   ```

2. **Set the environment variable**:
   ```bash
   ENABLE_CRON=true npm run dev:scraper
   ```

3. **Consider optimizing the sync** to only fetch current/upcoming IPOs instead of all 1298 past issues.

## Current Behavior

✅ **Server startup**: Checks if database is empty and fetches initial data  
✅ **Manual refresh**: Available via `POST /api/ipos/refresh`  
❌ **Automatic hourly refresh**: Disabled by default (can be enabled manually)

## Recommendation

For most use cases, the automatic startup fetch is sufficient. The data doesn't change frequently enough to warrant hourly refreshes, which can:
- Consume unnecessary API calls to NSE
- Risk database connection timeouts
- Increase server load

If you need fresh data, use the manual refresh endpoint or refresh the page.
