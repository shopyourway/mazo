const nconf = require('nconf');

exports.getScore = (patch, currentDate, commitDate) => {
    return getScoreWithoutDecay(patch).then((score) => {
        let timeFromCommit = Math.abs(currentDate.getTime() - commitDate.getTime());
        let daysFromCommit = Math.ceil(timeFromCommit / (1000 * 3600 * 24));
        let boost = Math.log(Math.pow(2, 600/daysFromCommit));

        return Promise.resolve(score * boost);
    });
};

let getScoreWithoutDecay = patch => {
    if (patch.isAdded() || patch.isDeleted())
        return Promise.resolve(10);

    if (!patch.isModified())
        return Promise.resolve(patch.isRenamed() ? 3 : 0);

    return patch.hunks()
        .then(hunks => {

            let realModificationsAmountPromises =
                hunks.map(hunk => {
                    return hunk.lines().then(lines => {
                        return Promise.resolve(countRealModifications(lines));
                    })
                })

            return Promise.all(realModificationsAmountPromises);
        })
        .then(values => {
            let realChangedLines = values.reduce((a, b) => a + b, 0);

            return Promise.resolve(realChangedLines ? 7 : 0);
        });
};

const countRealModifications = lines => {
    let realChanges = lines.filter(line => {
        if (line.origin() == 32) // Unmodified line.
            return false;

        if (shouldIgnoreContent(line.content().trim()))
            return false;

        return true;
    });

    return realChanges.length;
}

const shouldIgnoreContent = content =>
        nconf.get('ignoreModifiedLineWords').some(word => content.startsWith(word)) ||
        nconf.get('ignoreModifiedWholeLines').some(word => content == word)