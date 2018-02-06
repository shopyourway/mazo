const commitScorer = require('./commit-scorer');
const namespaceExtractor = require('./namespace-extractor');
const fileAuthorContributorRepository = require('./namespace-author-contributor-repository');

exports.persist = (patch, commit) => {
	return commitScorer.getScore(patch, new Date(), commit.date())
		.then(score => {
			if (score == 0)
				return;

            let newFilename = patch.newFile().path();
			let fileNameToSave = namespaceExtractor.extract(newFilename);

			fileAuthorContributorRepository.save(fileNameToSave, commit.author().name().toLowerCase(), score);
		});
};