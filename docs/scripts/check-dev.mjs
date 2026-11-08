#!/usr/bin/env node
// Smoke test for the dev server. Some pages build fine but fail in `astro dev`
// (for example a frontmatter error in a custom page), so the build alone doesn't catch them.
//
// Starts `astro dev` on a free port, requests a few pages and fails on any 5xx.
// Usage: node scripts/check-dev.mjs

import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createServer } from 'node:net';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const root = fileURLToPath(new URL('..', import.meta.url));
const contentDir = join(root, 'src/content/docs');
const astroBin = join(root, 'node_modules/.bin/astro');
const START_TIMEOUT_MS = 90_000;
const REQUEST_TIMEOUT_MS = 60_000;

function walk(dir) {
	return readdirSync(dir).flatMap((name) => {
		const path = join(dir, name);
		if (statSync(path).isDirectory()) return walk(path);
		return /\.mdx?$/.test(name) ? [path] : [];
	});
}

// Pick one article and one tag in use.
const files = walk(contentDir).sort();
if (files.length === 0) throw new Error('No articles found');
const articleSlug = relative(contentDir, files[0]).split('\\').join('/').replace(/\.mdx?$/, '').replace(/(^|\/)index$/, '');
let tag;
for (const file of files) {
	const match = readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
	const tags = match ? parse(match[1])?.tags : undefined;
	if (Array.isArray(tags) && tags.length > 0) {
		tag = tags[0];
		break;
	}
}

const paths = ['/', '/troubleshooting/', '/tags/', ...(tag ? [`/tags/${tag}/`] : []), `/${articleSlug}/`];

function freePort() {
	return new Promise((resolve, reject) => {
		const server = createServer();
		server.unref();
		server.on('error', reject);
		server.listen(0, '127.0.0.1', () => {
			const { port } = server.address();
			server.close(() => resolve(port));
		});
	});
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function request(url) {
	const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS), redirect: 'manual' });
	const body = await response.text();
	return { status: response.status, body };
}

const port = await freePort();
const base = `http://127.0.0.1:${port}`;
let output = '';
const child = spawn(astroBin, ['dev', '--port', String(port), '--host', '127.0.0.1'], {
	cwd: root,
	stdio: ['ignore', 'pipe', 'pipe'],
	detached: process.platform !== 'win32',
	env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
});
child.stdout.on('data', (chunk) => (output += chunk));
child.stderr.on('data', (chunk) => (output += chunk));
let exited = false;
child.on('exit', () => (exited = true));

// In a non-interactive shell astro may start the server in the background and exit,
// printing "Dev server running at ... (pid N)". Track that pid so it can be killed too.
const backgroundPid = () => Number(output.match(/Dev server running at [^\n]*\(pid (\d+)\)/)?.[1]) || null;

let stopped = false;
function stopServer() {
	if (stopped) return;
	stopped = true;
	spawnSync(astroBin, ['dev', 'stop'], { cwd: root, stdio: 'ignore', timeout: 30_000 });
	const pid = backgroundPid();
	if (pid) {
		try {
			process.kill(pid, 'SIGTERM');
		} catch {
			// Already stopped by `astro dev stop`.
		}
	}
	if (!exited) {
		try {
			// Kill the whole process group so no worker is left behind.
			if (process.platform !== 'win32') process.kill(-child.pid, 'SIGTERM');
			else child.kill('SIGTERM');
		} catch {
			// Already gone.
		}
	}
}
process.on('exit', stopServer);
for (const signal of ['SIGINT', 'SIGTERM']) {
	process.on(signal, () => {
		stopServer();
		process.exit(1);
	});
}

const failures = [];
try {
	// Wait for the server to answer.
	const deadline = Date.now() + START_TIMEOUT_MS;
	let ready = false;
	while (Date.now() < deadline && !(exited && !backgroundPid())) {
		try {
			await fetch(base, { signal: AbortSignal.timeout(5_000), method: 'HEAD' });
			ready = true;
			break;
		} catch {
			await sleep(500);
		}
	}
	if (!ready) {
		throw new Error(`astro dev did not start on port ${port}.\n${output.slice(-3000)}`);
	}

	for (const path of paths) {
		const { status, body } = await request(base + path);
		const line = `${status} ${path}`;
		if (status >= 500) {
			const detail = body.match(/<title>([^<]*)<\/title>/)?.[1] ?? body.slice(0, 300);
			failures.push(`${line}: ${detail.trim()}`);
		} else console.log(`  ${line}`);
	}
} catch (error) {
	failures.push(error.message);
} finally {
	stopServer();
}

if (failures.length > 0) {
	console.error(`Dev server check failed:\n`);
	for (const failure of failures) console.error(`  - ${failure}`);
	process.exit(1);
}
console.log(`Dev server check passed: ${paths.length} page(s) returned no server error.`);
