# Release Checklist

This checklist is used to validate release readiness and improve repeatability.

## v1.0.1 - Hardening and Documentation

### Scope

- Align docs with implemented functionality
- Stabilize current UX and quality baseline
- Verify release process is reproducible

### Acceptance Criteria

- [ ] README reflects current feature set
- [ ] Release milestones and roadmap are documented
- [ ] Local quality gate passes: `npm run quality:gate`
- [ ] Browser smoke tests pass for main timer and overlay mode
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

- [ ] Service worker implemented and registered
- [ ] Offline app shell works after first visit
- [ ] E2E smoke tests pass in CI
- [ ] Release gate includes lint, format, unit tests, build, and E2E

### Suggested Verification

```bash
npm run quality:gate
# plus E2E command when configured, for example:
# npm run test:e2e
```

## v1.2 - Product Expansion (Post-Stability)

### Candidate Epics

- [ ] i18n foundation
- [ ] Export/import session history
- [ ] Visual regression tests
- [ ] Additional UX polish and optional feature expansion
