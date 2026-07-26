# Static mobile route inventory

All routes use `MaterialPageRoute` and local fixture state. No route calls a
backend service.

- Splash → onboarding → login
- Login → signup / forgot password / main shell
- Main shell → Home / Search / Create sheet / Messages / Profile
- Home → Notifications / Community Feed / My Items / Create Post / QR Scanner
- Feed → filters / post detail / comments / share / report / user preview
- Search → results / filters / Nearby map-list view / post detail
- Create → lost / found / missing pet / document report / publish success
- Items → add / edit / detail / status menu / delete / QR hub
- QR hub → full screen / print / share / scanner / scan results / finder preview
- Messages → search / conversation / attachment / block-report confirmation
- Profile → notifications / settings / claims / leaderboard / stories / edit
- Claims → received / submitted / claim detail / verification / recovery
- Verification → questions / evidence / review / decision / arrangement / success
- Recovery → meeting / delivery / confirmations / reward / dispute / story consent
- Stories → list / detail / submit story
- Settings → account / privacy / notifications / location / language / appearance
  / storage / safety / help / legal / about / plans / logout
- Plans → current plan / comparison / payment success-failure preview / history

System back navigation returns through the local Navigator stack. The persistent
main shell returns secondary tabs to Home before exiting.
