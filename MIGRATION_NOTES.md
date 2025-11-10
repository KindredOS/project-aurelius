# CRA to Vite Migration Notes

This project has been migrated from Create React App to Vite.

## What was changed:
- Installed Vite and @vitejs/plugin-react (at workspace root with -w flag)
- Updated package.json scripts (start -> dev)
- Created vite.config.js
- Moved index.html to root and updated it
- Removed %PUBLIC_URL% references and CRA comments
- Renamed .js files containing JSX to .jsx
- Updated imports to reference .jsx files
- Changed REACT_APP_ env vars to VITE_
- Changed process.env to import.meta.env
- Updated .gitignore (/build -> /dist)
- Removed react-scripts

## Next steps:
1. Review the changes
2. Run: pnpm dev
3. Test your application thoroughly
4. Check browser console for any errors
5. Test production build: pnpm build

## Running the app:
- From app directory: `pnpm dev`
- From monorepo root: `pnpm --filter my-app dev`

## Potential issues to check:
- SVG imports (use ?react suffix: import Logo from './logo.svg?react')
- Absolute imports (may need path aliases in vite.config.js)
- Service workers (need manual setup)
- Jest tests (consider Vitest instead)
- Any remaining .js files with JSX that weren't caught

## Common fixes:
- If you see "Cannot find module" errors, check import paths
- If HMR isn't working, try deleting node_modules/.vite and restarting
- Check that all JSX files have .jsx extension

## Rollback:
If you need to rollback, restore from git or:
1. pnpm add -D react-scripts
2. Restore original package.json scripts
3. Move index.html back to public/
4. Delete vite.config.js
5. Rename .jsx files back to .js
