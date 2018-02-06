const patchScorePersistor = require('./patch-score-persistor');
const nconf = require('nconf');

let possibleComiters;

const classifyCommits = commits => {
    console.log(`${new Date().toISOString()}: Classifying stage started. Handling ${commits.length} commits for path ${commits[0].repo.path()}.`);
    return Promise.all(commits.map(classifySingleCommit));
}

const getFilteredPatches = patches => {
	let excludePattern = nconf.get('excludePattern');
	if (excludePattern != "") {
		let filteredPatches = patches.filter(patch => !patch.newFile().path().match(excludePattern));
		return filteredPatches;
	}
	return patches;
}


const classifySingleCommit = (commit, index) => {
    if (commit.parentcount() > 1 || (possibleComiters && possibleComiters.indexOf(commit.author().name().toLowerCase()) == -1)) {
        printCommitInfo(commit, index, 'Skipping...');
        return;
    }

    return commit.getDiff()
        .then(diffs => {
            if (diffs.length > 1)
                throw 'Multiple diffs were found, but only a single one was expected.';

            return diffs[0].patches();
        })
        .then(patches => {
            printCommitInfo(commit, index, `Handling ${patches.length} changes.`);
            if (index % 500 == 0)
                console.log(`${new Date().toISOString()}: New bulk started: ${index}`);
            let filteredPatches = getFilteredPatches(patches);
            return Promise.all(filteredPatches
                .map(patch => patchScorePersistor.persist(patch, commit)));
        });
}

const printCommitInfo = (commit, index, handlingInfo) => {
    // console.log(`#${index}`);
    // console.log(`#${index}: ${commit.author().name().toLowerCase()}'s commit with message: ${commit.summary()}`);
    // console.log(handlingInfo);
    // console.log('');
}

exports.classifyCommits = classifyCommits
exports.setPossibleComiters = comiters => {
    possibleComiters = comiters;
};