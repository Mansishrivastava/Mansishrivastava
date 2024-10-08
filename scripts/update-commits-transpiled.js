const fs = require('fs');
const https = require('https');
async function fetchCommits(owner, repo) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo}/commits`,
      method: 'GET',
      headers: {
        'User-Agent': 'Node.js' // Required by GitHub API
      }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          const commits = JSON.parse(data);
          resolve(commits);
        } else {
          reject(new Error(`Failed to fetch commits: ${res.statusCode}`));
        }
      });
    });
    req.on('error', error => {
      reject(error);
    });
    req.end();
  });
}
async function updateCommits(owner, repo) {
  try {
    const commits = await fetchCommits(owner, repo);
    const commitList = commits.map(commit => `- [${commit.commit.message}](${commit.html_url})`).join('\n');
    const readmePath = 'README.md';
    let readmeContent = fs.readFileSync(readmePath, 'utf-8');
    const startTag = '<!--START_SECTION:commits-->';
    const endTag = '<!--END_SECTION:commits-->';
    const regex = new RegExp(`${startTag}[\\s\\S]*${endTag}`, 'g');
    readmeContent = readmeContent.replace(regex, `${startTag}\n${commitList}\n${endTag}`);
    fs.writeFileSync(readmePath, readmeContent, 'utf-8');
    console.log(`README.md updated with recent commits from ${owner}/${repo}.`);
  } catch (error) {
    console.error(`Error fetching commits from ${owner}/${repo}:`, error.message);
  }
}

// Call the function with the provided owner and repository name
const owner = 'Mansishrivastava'; // Replace with your GitHub username or organization name
const repo = 'typescript-practice'; // Replace with the name of your repository

updateCommits(owner, repo);
