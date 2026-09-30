# Release Checklist

This checklist is used to validate release readiness and improve repeatability.

## v1.0.1 - Hardening and Documentation

### Scope

- Align docs with implemented functionality
- Stabilize current UX and quality baseline
- Verify release process is reproducible

### Acceptance Criteria

- [x] README reflects current feature set
- [x] Release milestones and roadmap are documented
- [x] Local quality gate passes: `npm run quality:gate`
- [x] Browser smoke tests pass for main timer, overlay, persistence, and offline mode
- [ ] Accessibility smoke checks pass

### Verification Commands

```bash
npm run lint
npm run format:check
npm test
npm run build
```

Or run all gates in one command:

```bash
npm run quality:gate
```

### Manual Smoke Test Matrix

- [ ] Chrome latest: main timer flow (start/pause/reset, settings save/load)
- [ ] Firefox latest: main timer flow
- [ ] Edge latest: main timer flow
- [ ] Overlay mode flow (`overlay.html?work=50&break=10`)

### Accessibility Smoke

- [ ] Full keyboard path through controls and settings
- [ ] Visible focus indicator on controls and inputs
- [ ] Session/status updates announced through live region behavior

## v1.1 - PWA + E2E Confidence

### Scope

- Add offline support baseline
- Add E2E smoke coverage for release-critical user journeys

### Acceptance Criteria

- [x] Service worker implemented and registered
- [x] Offline app shell is configured for the main timer and overlay
- [x] E2E smoke tests pass in CI
- [x] Release gate includes lint, format, unit tests, build, and E2E

### Suggested Verification

```bash
npm run quality:gate
npm run test:e2e
```

### Manual PWA Verification

- [ ] Serve `dist/` over HTTP and open the app once while online
- [ ] Confirm `service-worker.js` is registered in browser developer tools
- [ ] Disable the network and reload the main timer
- [ ] Disable the network and reload `overlay.html`
- [ ] Verify that a subdirectory deployment resolves assets correctly

### Browser Visual Regression

- [x] Main timer baseline is checked in Chromium
- [x] Overlay baseline is checked in Chromium
- [ ] Review baseline changes intentionally when UI changes are made

## v1.2 - Product Expansion (Post-Stability)

### Candidate Epics

- [ ] i18n foundation
- [x] Export/import settings and session history
- [x] Visual regression tests
- [ ] Additional UX polish and optional feature expansion
