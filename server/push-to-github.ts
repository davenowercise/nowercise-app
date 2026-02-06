import { Octokit } from '@octokit/rest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

let connectionSettings: any;

async function getAccessToken() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) throw new Error('X_REPLIT_TOKEN not found');

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    { headers: { 'Accept': 'application/json', 'X_REPLIT_TOKEN': xReplitToken } }
  ).then(res => res.json()).then(data => data.items?.[0]);

  return connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;
}

async function pushToGithub() {
  const token = await getAccessToken();
  const owner = 'davenowercise';
  const repo = 'nowercise-app';

  console.log('Pushing to GitHub using authenticated URL...');

  const remoteUrl = `https://x-access-token:${token}@github.com/${owner}/${repo}.git`;

  try {
    execSync(`git push "${remoteUrl}" HEAD:main`, {
      cwd: '/home/runner/workspace',
      stdio: 'inherit',
      timeout: 60000,
    });
    console.log(`\nSuccess! Code pushed to https://github.com/${owner}/${repo}`);
  } catch (err: any) {
    console.error('Push failed:', err.message);
    process.exit(1);
  }
}

pushToGithub();
