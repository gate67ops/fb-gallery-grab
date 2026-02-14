

## Add Terms of Service Links

### Changes

**1. Settings Panel (`src/components/SettingsPanel.tsx`)**
- Add a "Terms of Service" row below the existing "Privacy Policy" row, with the same layout (Shield icon, label, "View" button linking to `/terms`)

**2. Auth Page (`src/pages/Auth.tsx`)**
- Update the footer text from just "Privacy Policy" to include "Terms of Service" as well, e.g.: "By using this app, you agree to our Privacy Policy and Terms of Service"

### Technical Details

Both are small UI-only changes -- adding a `<Link>` to `/terms` in two existing components. No new dependencies, routes, or backend changes needed.

