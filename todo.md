# Full Repository Audit & Fix Plan

## ✅ Critical Security
- [x] Remove hardcoded QR_SECRET fallback (forgot-password, reset-password routes)
- [x] Use separate secret for password reset tokens (getResetTokenSecret in env.ts)
- [x] Add proper next-auth type augmentation for role

## ✅ Dead Code Removal
- [x] Remove duplicate admin analytics route (src/app/dashboard/admin/analytics/route.ts)
- [x] Remove duplicate warden pages under student/warden/ subtree
- [x] Remove unused ThemeProvider.tsx component
- [x] Remove dev artifacts (todo.md, test.txt)

## 🔄 In Progress — Bug Fixes & Error Handling
- [ ] Fix `any` casts for session.role in API routes
- [ ] Add proper error toast for catch blocks across all frontend pages
- [ ] Fix scanner page cleanup on unmount
- [ ] Fix middleware non-null assertion

## 📋 Code Quality
- [ ] Fix empty .catch() handlers to show user feedback
- [ ] Remove `any` casts in API routes
- [ ] Fix "Forgot password?" link in staff-admin page
- [ ] Fix scanner recent scans polling leak

## 📋 Build Verification
- [ ] Run TypeScript check
- [ ] Run lint
- [ ] Verify build
