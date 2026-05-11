#!/usr/bin/env node
/**
 * Fast API verification - direct Node.js approach
 */
import https from 'https';
import http from 'http';
import fs from 'fs';

const TIMEOUT_MS = 8000;
const content = fs.readFileSync('src/data/apis.ts', 'utf8');

// Parse APIs
const apis = [];
let entry = {};
for (const line of content.split('\n')) {
  const idMatch = line.match(/id:\s*(\d+)/);
  if (idMatch && !line.includes('api_key') && !line.includes('apikey')) {
    if (entry.id) apis.push(entry);
    entry = { id: parseInt(idMatch[1]) };
  }
  const nm = line.match(/name:\s*'([^']+)'/); if (nm) entry.name = nm[1];
  const um = line.match(/url:\s*'([^']+)'/); if (um) entry.url = um[1];
  const am = line.match(/auth:\s*'([^']+)'/); if (am) entry.auth = am[1];
  const mm = line.match(/method:\s*'([^']+)'/); if (mm) entry.method = mm[1];
  const cm = line.match(/category:\s*'([^']+)'/); if (cm) entry.category = cm[1];
}
if (entry.id) apis.push(entry);

// Deduplicate
const seen = new Set();
const unique = [];
for (const a of apis) {
  if (!seen.has(a.url)) { seen.add(a.url); unique.push(a); }
}

console.log(`Total: ${apis.length} entries, ${unique.length} unique URLs to test`);

const skipUrls = new Set([
  'https://corsproxy.io/?', 'https://api.codetabs.com/v1/proxy?quest=', 'https://api.allorigins.win/raw?url='
]);
const skipMethods = new Set(['POST', 'PUT', 'DELETE']);

const toTest = unique.filter(a => !skipUrls.has(a.url) && !skipMethods.has(a.method));
console.log(`Testing ${toTest.length} endpoints (${TIMEOUT_MS/1000}s timeout)...\n`);

function testOne(api) {
  return new Promise((resolve) => {
    let parsedUrl;
    try { parsedUrl = new URL(api.url); } catch {
      resolve({ ...api, status: 'error', reason: 'Invalid URL', time: 0 });
      return;
    }

    const mod = parsedUrl.protocol === 'https:' ? https : http;
    const timer = setTimeout(() => {
      resolve({ ...api, status: 'timeout', reason: `${TIMEOUT_MS}ms timeout`, time: TIMEOUT_MS });
    }, TIMEOUT_MS);

    const req = mod.request({
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      timeout: TIMEOUT_MS,
      headers: { 'User-Agent': 'API-Hub/3.0' }
    }, (res) => {
      clearTimeout(timer);
      // Consume data to prevent memory leak but don't wait for it all
      res.resume();
      const time = res.socket ? undefined : 0;
      
      // Handle redirect
      if (res.statusCode >= 300 && res.statusCode < 400) {
        resolve({ ...api, status: 'redirect', reason: `${res.statusCode} -> ${res.headers.location || 'unknown'}`, httpStatus: res.statusCode });
        return;
      }

      if (res.statusCode >= 200 && res.statusCode < 300) {
        resolve({ ...api, status: 'ok', httpStatus: res.statusCode });
      } else if (res.statusCode === 401 || res.statusCode === 403) {
        resolve({ ...api, status: 'auth', httpStatus: res.statusCode, reason: `HTTP ${res.statusCode}` });
      } else if (res.statusCode === 429) {
        resolve({ ...api, status: 'rate_limited', httpStatus: res.statusCode, reason: 'Rate limited' });
      } else {
        resolve({ ...api, status: 'error', httpStatus: res.statusCode, reason: `HTTP ${res.statusCode}` });
      }
    });

    req.on('error', (err) => {
      clearTimeout(timer);
      const msg = err.message || '';
      if (msg.includes('ENOTFOUND')) resolve({ ...api, status: 'dead', reason: 'DNS failed (domain dead)' });
      else if (msg.includes('ECONNREFUSED')) resolve({ ...api, status: 'dead', reason: 'Connection refused' });
      else if (msg.includes('CERT')) resolve({ ...api, status: 'error', reason: 'SSL certificate error' });
      else if (msg.includes('timeout') || msg.includes('ETIMEDOUT')) resolve({ ...api, status: 'timeout', reason: 'Timeout' });
      else resolve({ ...api, status: 'error', reason: msg.substring(0, 80) });
    });

    req.on('timeout', () => {
      clearTimeout(timer);
      req.destroy();
      resolve({ ...api, status: 'timeout', reason: `${TIMEOUT_MS}ms timeout` });
    });

    req.end();
  });
}

// Batch processing with 15 parallel
const BATCH = 15;
const results = [];
for (let i = 0; i < toTest.length; i += BATCH) {
  const batch = toTest.slice(i, i + BATCH);
  const batchResults = await Promise.all(batch.map(testOne));
  results.push(...batchResults);
  process.stdout.write(`\rProgress: ${Math.min(i + BATCH, toTest.length)}/${toTest.length}`);
}
console.log('\n');

// Categorize
const cats = { ok: [], auth: [], dead: [], timeout: [], error: [], redirect: [], rate_limited: [] };
for (const r of results) {
  const bucket = cats[r.status] || cats.error;
  bucket.push(r);
}

const total = results.length;
const okPct = ((cats.ok.length / total) * 100).toFixed(1);

console.log('='.repeat(60));
console.log('API VERIFICATION RESULTS');
console.log('='.repeat(60));
console.log(`\n✅ WORKING:            ${cats.ok.length} (${okPct}%)`);
console.log(`🔑 NEEDS AUTH:         ${cats.auth.length}`);
console.log(`💀 DEAD/DNS FAILED:    ${cats.dead.length}`);
console.log(`⏱️  TIMEOUT:            ${cats.timeout.length}`);
console.log(`❌ HTTP ERROR:         ${cats.error.length}`);
console.log(`🔄 REDIRECTS:          ${cats.redirect.length}`);
console.log(`⚠️  RATE LIMITED:       ${cats.rate_limited.length}`);

function printGroup(title, items) {
  if (!items.length) return;
  console.log(`\n${title} (${items.length}):`);
  for (const r of items) {
    console.log(`  [${r.id}] ${r.name} (${r.category})`);
    console.log(`       URL: ${r.url}`);
    console.log(`       → ${r.reason || `HTTP ${r.httpStatus}`}`);
  }
}

printGroup('💀 DEAD / DNS FAILED', cats.dead);
printGroup('⏱️ TIMEOUT', cats.timeout);
printGroup('❌ HTTP ERROR', cats.error);
printGroup('🔑 NEEDS AUTH', cats.auth);
printGroup('⚠️ RATE LIMITED', cats.rate_limited);
printGroup('🔄 REDIRECTS', cats.redirect);

// Save report
const report = {
  timestamp: new Date().toISOString(),
  summary: { total, ok: cats.ok.length, auth: cats.auth.length, dead: cats.dead.length, timeout: cats.timeout.length, error: cats.error.length, redirect: cats.redirect.length, rate_limited: cats.rate_limited.length },
  problem_apis: [
    ...cats.dead.map(r => ({ id: r.id, name: r.name, url: r.url, category: r.category, auth: r.auth, status: 'dead', reason: r.reason })),
    ...cats.timeout.map(r => ({ id: r.id, name: r.name, url: r.url, category: r.category, auth: r.auth, status: 'timeout', reason: r.reason })),
    ...cats.error.map(r => ({ id: r.id, name: r.name, url: r.url, category: r.category, auth: r.auth, status: 'error', reason: r.reason })),
    ...cats.auth.map(r => ({ id: r.id, name: r.name, url: r.url, category: r.category, auth: r.auth, status: 'auth', reason: r.reason })),
    ...cats.rate_limited.map(r => ({ id: r.id, name: r.name, url: r.url, category: r.category, auth: r.auth, status: 'rate_limited', reason: r.reason })),
    ...cats.redirect.map(r => ({ id: r.id, name: r.name, url: r.url, category: r.category, auth: r.auth, status: 'redirect', reason: r.reason })),
  ],
  working: cats.ok.map(r => ({ id: r.id, name: r.name, url: r.url, category: r.category }))
};

fs.writeFileSync('api-verification-report.json', JSON.stringify(report, null, 2));
console.log(`\n📄 Report saved to api-verification-report.json`);
