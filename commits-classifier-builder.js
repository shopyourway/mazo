const git = require('nodegit');
const gitCommitHistoryClassifier = require('./git-commit-history-classifier');
const gitCommitsProvider = require('./git-commits-provider');
const nconf = require('nconf');

exports.init = settings => {
    if (settings) {
        gitCommitHistoryClassifier.setPossibleComiters(settings.possibleCommiters);
    }
    return Promise.all(nconf.get('git:repositoriesUrls').map(repositoryUrl => {
        let folder = nconf.get('git:rootFolder') + repositoryUrl.substring(repositoryUrl.lastIndexOf('/'));
        const cloneOptions = {
            fetchOpts: {
                callbacks: {
                    certificateCheck: function() { return 1; },
                    credentials: function(url, userName) {
                        return git.Cred.sshKeyNew(userName, nconf.get('git:publicSshKey'), nconf.get('git:privateSshKey'), '');
                    }
                }
            }
        };
        console.log(`${new Date().toISOString()}: Cloning ${repositoryUrl} into ${folder}`);
        return git.Clone(repositoryUrl, folder, cloneOptions)
            .catch(err => {
                if (err.errno == -4) {
                    console.info(`Folder ${folder} already exists. Will open it instead...`);
                    return git.Repository.open(folder);
                    return;
                }

                throw err;
            })
            .then(repository => {
                return repository.fetch(nconf.get('git:remoteName'), cloneOptions.fetchOpts).then(() => {
                    return repository.getBranchCommit(`${nconf.get('git:remoteName')}/master`);
                })
            })
            .then(firstCommitOnMaster => gitCommitsProvider.provide(firstCommitOnMaster))
            .then(gitCommitHistoryClassifier.classifyCommits)
    }));
};