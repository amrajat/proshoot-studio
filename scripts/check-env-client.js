#!/usr/bin/env node
/*
=============================================================================
ENVIRONMENT GUARDRAIL SCRIPT
=============================================================================
PREVENT SERVER-ONLY ENVIRONMENT VARIABLES IN CLIENT COMPONENTS
- FLAGS ANY CLIENT COMPONENT ("use client") THAT USES process.env NOT PREFIXED WITH NEXT_PUBLIC_
- FLAGS ANY CLIENT COMPONENT IMPORTING lib/env
*/

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

// =============================================================================
// DIRECTORY WALKER FUNCTION
// =============================================================================
/**
 * RECURSIVELY WALK A DIRECTORY AND RETURN JS/TS FILES (EXCLUDING node_modules/.next/.git)
 */
const walk = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".next", ".git", "supabase"].includes(entry.name)) continue;
      files.push(...walk(fullPath));
    } else {
      if (!/\.(jsx?|tsx?)$/i.test(entry.name)) continue;
      files.push(fullPath);
    }
  }
  return files;
};

// =============================================================================
// FILE SCANNING CONFIGURATION
// =============================================================================
const files = [
  path.join(projectRoot, 'app'),
  path.join(projectRoot, 'components'),
]
  .filter((p) => fs.existsSync(p))
  .flatMap((p) => walk(p));

// REGULAR EXPRESSIONS FOR DETECTION
const CLIENT_PRAGMA_RE = /^(?:\s*"use client";|\s*'use client';)/m;
const ENV_IMPORT_RE = /from\s+['"](?:@\/)?lib\/env['"];?/;
const BAD_ENV_RE = /process\.env\.(?!NEXT_PUBLIC_[A-Z0-9_]+)\w+/g;

// VIOLATION TRACKING
let hasError = false;
const violations = [];

// =============================================================================
// CLIENT COMPONENT VALIDATION
// =============================================================================
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  if (!CLIENT_PRAGMA_RE.test(src)) continue; // ONLY CHECK CLIENT COMPONENTS

  // DISALLOW IMPORTING ENV HELPER IN CLIENT CODE
  if (ENV_IMPORT_RE.test(src)) {
    hasError = true;
    violations.push({ file, line: 1, message: 'CLIENT COMPONENTS MUST NOT IMPORT lib/env' });
  }

  // FIND NON-PUBLIC ENV USAGES
  let m;
  while ((m = BAD_ENV_RE.exec(src))) {
    const until = src.slice(0, m.index);
    const line = until.split(/\r?\n/).length;
    hasError = true;
    violations.push({ file, line, message: `DISALLOWED ENV USAGE: ${m[0]} (USE NEXT_PUBLIC_* OR MOVE TO SERVER)` });
  }
}

// =============================================================================
// RESULTS AND EXIT
// =============================================================================
if (hasError) {
  const out = violations
    .map((v) => `- ${path.relative(projectRoot, v.file)}:${v.line} -> ${v.message}`)
    .join('\n');
  console.error('\n=== ENVIRONMENT GUARDRAIL FAILED ===\n' + out + '\n');
  process.exit(1);
} else {
  console.log('=== ENVIRONMENT GUARDRAIL: NO ISSUES FOUND ===');
}
