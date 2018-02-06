const git = require('nodegit');
const nconf = require('nconf');


exports.provide = (firstCommitOnMaster) => {
    let walker = firstCommitOnMaster.repo.createRevWalk();
    walker.push(firstCommitOnMaster.sha());
    walker.sorting(git.Revwalk.SORT.Time);

    let earliestCommitDate = calcEarliestCommitDate();

    return walker.getCommitsUntil(commit => {
        return commit.date() > earliestCommitDate;
    });
};

calcEarliestCommitDate = () => {
    let earliestCommitDate = new Date();
    earliestCommitDate.setDate(earliestCommitDate.getDate() - nconf.get('maxDaysToFetchCommits'))
    return earliestCommitDate;
}