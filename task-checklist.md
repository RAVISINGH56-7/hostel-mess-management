# Scanner Fix Checklist

Found issues:
1. **Two duplicate API route files** — `src/app/scanner/scan/route.ts` (dead, at path `/scanner/scan`) and `src/app/api/scanner/scan/route.ts` (live, at path `/api/scanner/scan`). The dead one has the proper meal window logic; the live one is simplified.
2. **Meal window logic missing from the live API** — the page POSTs to `/api/scanner/scan` but that route doesn't check meal times.
3. **Broken Prisma query** — the dead route includes `scannedByUser` relation which doesn't exist in the schema.
4. **Recent scans endpoint missing date filter, status messages, and proper status mapping**.
5. **`suspended` status not handled** in the page's `VALID_STATUSES` or `SCAN_UI`.
6. **Type mismatch** — `ScanResult.id` is `number` but Prisma returns strings.

Fixes needed:
- [ ] Fix `src/app/api/scanner/scan/route.ts` — add meal-window checking, proper status returns
- [ ] Fix `src/app/api/scanner/scan/recent/route.ts` — add date filter, status messages, proper query 
- [ ] Delete `src/app/scanner/scan/route.ts` (dead code, broken query)
- [ ] Fix `src/app/scanner/page.tsx` — add `suspended` status handling
- [ ] Verify with build / type check
