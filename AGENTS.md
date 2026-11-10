This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## User management exam conventions

- Preserve the current Expo configuration and dependency versions. Do not run dependency upgrades, downgrades, or `expo install --fix` without an explicit request.
- Firestore CRUD, admin Email/Password authentication and Cloudinary image uploads are authorized. Use expo-image-picker for photos and unsigned Cloudinary uploads via the two public config values; never put an API secret on the client. Do not expose public admin registration.
- Images must be JPEG/PNG/WebP/GIF, verified by signature and no larger than 5 MB. Keep picked files/base64 in memory only. Await upload and Firestore commit before showing success; store only the HTTPS URL in users.hinhanh, never image metadata or bytes.
- Protect all users routes and service entry points by checking the configured EXPO_PUBLIC_ADMIN_UID. Server-side Firestore Rules must check the same UID and enforce exactly four fields. Never store admin roles or authentication metadata inside users documents.
- Keep routes in `src/app`, shared UI in `src/components`, client configuration in `src/config`, service integrations in `src/services`, models in `src/types`, pure helpers in `src/utils`, and shared values in `src/constants`. Existing theme hooks stay in `src/hooks`.
- Required routes: `/`, `/login`, `/users`, `/users/create`, `/users/[id]`. Use the root Stack and users Stack layouts; keep non-route files outside `src/app`.
- `User` in `src/types/user.ts` has exactly four string fields: `email`, `matkhau`, `hoten`, `hinhanh`. Firestore Document ID is separate metadata (`UserDocument.id`); only `UserDocument.data` is a document payload.
- `matkhau` contains only a salted bcrypt hash (cost 12) generated in the service with secure random bytes from expo-crypto. Never return passwords or hashes to UI components. A blank password on edit preserves the existing hash. Firebase Authentication remains separate from CRUD records.
- Every users write must construct an explicit payload with exactly `email`, `matkhau`, `hoten`, `hinhanh`. Never add timestamps, role, id or spread input/snapshot data into a write. Document ID is metadata only.
- Use public Firebase client configuration from `src/config/env.ts`. Keep `.env` out of version control and maintain `.env.example` without real values. Never expose service account keys or private credentials via `EXPO_PUBLIC_*`.
- Prefer existing React Native components and theme helpers. Do not add a UI framework for placeholder screens.
- Use `npm run web` to start web. Run `npx tsc --noEmit` and `npx expo lint` before finishing, and report any failure. If lint tooling is missing, report it instead of silently installing or changing dependencies.
- After adding routes, let Expo CLI regenerate ignored typed-route files in `.expo`; never edit generated route types manually.
- Do not run the template `reset-project` script on the exam scaffold.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
