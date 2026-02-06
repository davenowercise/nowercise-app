import { Octokit } from '@octokit/rest';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;
  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function createRepo() {
  const accessToken = await getAccessToken();
  const octokit = new Octokit({ auth: accessToken });

  const { data: user } = await octokit.users.getAuthenticated();
  console.log(`Authenticated as: ${user.login}`);

  try {
    const { data: repo } = await octokit.repos.createForAuthenticatedUser({
      name: 'nowercise-app',
      description: 'Nowercise - Exercise for Cancer Recovery. A digital health platform for cancer patients and exercise specialists.',
      private: false,
      auto_init: false,
    });
    console.log(`Repository created: ${repo.html_url}`);
    console.log(`Clone URL: ${repo.clone_url}`);
    console.log(`\nTo push, run:`);
    console.log(`  git remote add github ${repo.clone_url}`);
    console.log(`  git push github main`);
  } catch (err: any) {
    if (err.status === 422) {
      console.log(`Repository 'nowercise-app' may already exist.`);
      const { data: repo } = await octokit.repos.get({ owner: user.login, repo: 'nowercise-app' });
      console.log(`Existing repo: ${repo.html_url}`);
      console.log(`Clone URL: ${repo.clone_url}`);
    } else {
      throw err;
    }
  }
}

createRepo().catch(e => { console.error(e); process.exit(1); });
