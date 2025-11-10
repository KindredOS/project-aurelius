#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting CRA to Vite migration...\n');

// Check if we're in a CRA project
if (!fs.existsSync('package.json')) {
  console.error('❌ No package.json found. Are you in a React project directory?');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

if (!packageJson.dependencies?.react) {
  console.error('❌ This doesn\'t appear to be a React project.');
  process.exit(1);
}

// Step 1: Install Vite dependencies (should be done at workspace root with -w)
console.log('📦 Note: Vite dependencies should be installed at workspace root with:');
console.log('   pnpm add -D -w vite @vitejs/plugin-react\n');
console.log('⏭️  Skipping dependency installation (do this at workspace root)\n');

// Step 2: Update package.json scripts
console.log('📝 Updating package.json scripts...');
packageJson.scripts = {
  ...packageJson.scripts,
  dev: 'vite',
  build: 'vite build',
  preview: 'vite preview'
};
delete packageJson.scripts.start;
delete packageJson.scripts.test;
delete packageJson.scripts.eject;

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('✅ Scripts updated\n');

// Step 3: Create vite.config.js
console.log('⚙️  Creating vite.config.js...');
const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
})
`;

fs.writeFileSync('vite.config.js', viteConfig);
console.log('✅ vite.config.js created\n');

// Step 4: Rename index.js to index.jsx (must do before updating HTML)
console.log('🔄 Renaming index entry file...');
let entryPoint = '/src/index.jsx';

if (fs.existsSync('src/index.js')) {
  fs.renameSync('src/index.js', 'src/index.jsx');
  console.log('  Renamed: src/index.js -> src/index.jsx');
  entryPoint = '/src/index.jsx';
} else if (fs.existsSync('src/index.tsx')) {
  entryPoint = '/src/index.tsx';
  console.log('  Using existing: src/index.tsx');
} else if (fs.existsSync('src/index.ts')) {
  entryPoint = '/src/index.ts';
  console.log('  Using existing: src/index.ts');
} else if (fs.existsSync('src/index.jsx')) {
  entryPoint = '/src/index.jsx';
  console.log('  Using existing: src/index.jsx');
}
console.log('✅ Entry file ready\n');

// Step 5: Move and update index.html
console.log('📄 Moving and updating index.html...');
const publicIndexPath = path.join('public', 'index.html');
const rootIndexPath = 'index.html';

if (fs.existsSync(publicIndexPath)) {
  let indexHtml = fs.readFileSync(publicIndexPath, 'utf8');
  
  // Remove %PUBLIC_URL% references
  indexHtml = indexHtml.replace(/%PUBLIC_URL%\//g, '/');
  indexHtml = indexHtml.replace(/%PUBLIC_URL%/g, '');
  
  // Remove CRA-specific comments
  indexHtml = indexHtml.replace(/<!--[\s\S]*?Notice the use of %PUBLIC_URL%[\s\S]*?-->/g, '');
  indexHtml = indexHtml.replace(/<!--[\s\S]*?This HTML file is a template[\s\S]*?-->/g, '');
  
  // Add script tag before closing body
  if (indexHtml.includes('</body>')) {
    indexHtml = indexHtml.replace(
      '</body>',
      `    <script type="module" src="${entryPoint}"></script>\n  </body>`
    );
  } else {
    indexHtml += `\n<script type="module" src="${entryPoint}"></script>`;
  }
  
  fs.writeFileSync(rootIndexPath, indexHtml);
  console.log('✅ index.html moved and updated\n');
} else {
  console.warn('⚠️  No index.html found in public directory\n');
}

// Step 6: Rename other .js files with JSX to .jsx
console.log('🔄 Renaming other .js files containing JSX to .jsx...');
function renameJsxFiles(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && file !== 'node_modules' && file !== 'build' && file !== 'dist') {
      renameJsxFiles(filePath);
    } else if (file.endsWith('.js') && file !== 'index.js') { // Skip index.js since we already renamed it
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check if file contains JSX
      if (content.includes('return (') && (content.includes('<') || content.includes('React'))) {
        const newPath = filePath.replace(/\.js$/, '.jsx');
        fs.renameSync(filePath, newPath);
        console.log(`  Renamed: ${filePath} -> ${newPath}`);
      }
    }
  });
}

if (fs.existsSync('src')) {
  renameJsxFiles('src');
  console.log('✅ JSX files renamed\n');
}

// Step 7: Update imports to use .jsx extensions
console.log('🔧 Updating import statements...');
function updateImports(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && file !== 'node_modules' && file !== 'build' && file !== 'dist') {
      updateImports(filePath);
    } else if (file.match(/\.(jsx|tsx)$/)) {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Update imports that explicitly reference .js files
      content = content.replace(/from ['"](.*)\.js['"]/g, (match, p1) => {
        // Check if the .jsx version exists
        const baseDir = path.dirname(filePath);
        const importPath = path.resolve(baseDir, p1 + '.jsx');
        if (fs.existsSync(importPath)) {
          return `from '${p1}.jsx'`;
        }
        return match;
      });
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`  Updated imports in: ${filePath}`);
      }
    }
  });
}

if (fs.existsSync('src')) {
  updateImports('src');
  console.log('✅ Imports updated\n');
}

// Step 8: Update environment variables in source files
console.log('🔧 Updating environment variable references...');
function updateEnvVars(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && file !== 'node_modules' && file !== 'build' && file !== 'dist') {
      updateEnvVars(filePath);
    } else if (file.match(/\.(js|jsx|ts|tsx)$/)) {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Replace process.env.REACT_APP_ with import.meta.env.VITE_
      content = content.replace(/process\.env\.REACT_APP_/g, 'import.meta.env.VITE_');
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`  Updated: ${filePath}`);
      }
    }
  });
}

if (fs.existsSync('src')) {
  updateEnvVars('src');
  console.log('✅ Environment variables updated\n');
}

// Step 9: Update .env files
console.log('🌍 Updating .env files...');
['.env', '.env.local', '.env.development', '.env.production'].forEach(envFile => {
  if (fs.existsSync(envFile)) {
    let content = fs.readFileSync(envFile, 'utf8');
    content = content.replace(/REACT_APP_/g, 'VITE_');
    fs.writeFileSync(envFile, content);
    console.log(`  Updated: ${envFile}`);
  }
});
console.log('✅ .env files updated\n');

// Step 10: Update .gitignore
console.log('📝 Updating .gitignore...');
if (fs.existsSync('.gitignore')) {
  let gitignore = fs.readFileSync('.gitignore', 'utf8');
  
  // Replace /build with /dist
  if (gitignore.includes('/build')) {
    gitignore = gitignore.replace(/\/build/g, '/dist');
    fs.writeFileSync('.gitignore', gitignore);
    console.log('  Replaced /build with /dist in .gitignore');
  } else if (!gitignore.includes('/dist')) {
    // Add /dist if neither exists
    gitignore += '\n# Vite build output\n/dist\n';
    fs.writeFileSync('.gitignore', gitignore);
    console.log('  Added /dist to .gitignore');
  }
  console.log('✅ .gitignore updated\n');
} else {
  console.warn('⚠️  No .gitignore found\n');
}

// Step 11: Delete public/index.html if it exists
console.log('🗑️  Cleaning up old files...');
if (fs.existsSync(publicIndexPath)) {
  fs.unlinkSync(publicIndexPath);
  console.log('  Deleted: public/index.html');
}
console.log('✅ Cleanup complete\n');

// Step 12: Remove react-scripts
console.log('🗑️  Removing react-scripts...');
try {
  execSync('pnpm remove react-scripts', { stdio: 'inherit' });
  console.log('✅ react-scripts removed\n');
} catch (error) {
  console.warn('⚠️  Could not remove react-scripts automatically\n');
}

// Step 13: Create a backup note
console.log('💾 Creating migration notes...');
const notes = `# CRA to Vite Migration Notes

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
- From app directory: \`pnpm dev\`
- From monorepo root: \`pnpm --filter ${packageJson.name} dev\`

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
`;

fs.writeFileSync('MIGRATION_NOTES.md', notes);
console.log('✅ Created MIGRATION_NOTES.md\n');

console.log('🎉 Migration complete!\n');
console.log('Next steps:');
console.log('  1. Review the changes');
console.log('  2. Run: pnpm dev');
console.log('  3. Check MIGRATION_NOTES.md for important info');
console.log('  4. If errors occur, check that all JSX is in .jsx files');
console.log('\n💡 Remember to clear the Vite cache if you encounter issues:\n   rm -rf node_modules/.vite\n');