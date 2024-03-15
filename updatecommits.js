const fs = require('fs');
const { Octokit } = require('@octokit/rest');

const octokit = new Octokit();

async function updateCommits(owner, repo) {
    try {
        const { data: commits } = await octokit.repos.listCommits({
            owner,
            repo,
            per_page: 5 // Number of commits to fetch
        });

        const commitList = commits.map(commit => {
            return `- ${commit.commit.message}`;
        }).join('\n');

        const readmePath = 'README.md';
        let readmeContent = fs.readFileSync(readmePath, 'utf-8');

        // Replace placeholder with the actual commit list
        readmeContent = readmeContent.replace(/<!--START_SECTION:commits-->(.|[\r\n])*<!--END_SECTION:commits-->/, `<!--START_SECTION:commits-->\n${commitList}\n<!--END_SECTION:commits-->`);

        fs.writeFileSync(readmePath, readmeContent, 'utf-8');

        console.log(`README.md updated with recent commits from ${owner}/${repo}.`);
    } catch (error) {
        console.error(`Error fetching commits from ${owner}/${repo}:`, error.message);
    }
}

// Call the function with the owner and repository name
updateCommits('Mansishrivastava', 'typescript-practice');
