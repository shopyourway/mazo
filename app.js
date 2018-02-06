const commitsClassifierBuilder = require('./commits-classifier-builder');

commitsClassifierBuilder.init()
    .then(() => {
        let scores = fileAuthorContributorRepository.getByKey('my-namespace');
        if (scores != null) {
            console.log(scores);
            return;
        }
    })
    .catch(console.error);
