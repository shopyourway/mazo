const namespaceAuthorsScore = {};

exports.save = (fileNameToSave, author, score) => {
    if (!namespaceAuthorsScore.hasOwnProperty(fileNameToSave)) {
		namespaceAuthorsScore[fileNameToSave] = {};
		namespaceAuthorsScore[fileNameToSave][author] = score;
		updateNamespace(fileNameToSave, author, score);
		return;
    }

    if (!namespaceAuthorsScore[fileNameToSave].hasOwnProperty(author)) {
        namespaceAuthorsScore[fileNameToSave][author] = score;
        namespaceAuthorsScore[fileNameToSave] = sortObjects(namespaceAuthorsScore[fileNameToSave]);
		updateNamespace(fileNameToSave, author, score);
        return;
    }

    namespaceAuthorsScore[fileNameToSave][author] += score;
    namespaceAuthorsScore[fileNameToSave] = sortObjects(namespaceAuthorsScore[fileNameToSave]);
	updateNamespace(fileNameToSave, author, score);
};

exports.get = (namespace, author) => {
    if (namespaceAuthorsScore.hasOwnProperty(namespace) && namespaceAuthorsScore[namespace].hasOwnProperty(author))
        return namespaceAuthorsScore[namespace][author];

    throw `No namespace or author was found for ${namespace}, ${author}!`;
};

function sortProperties(obj)
{
    // convert object into array
    var sortable=[];
    for(var key in obj)
        if(obj.hasOwnProperty(key))
            sortable.push([key, obj[key]]); // each item is an array in format [key, value]

    // sort items by value
    sortable.sort(function(a, b)
    {
        return b[1]-a[1]; // compare numbers
    });
    return sortable; // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
}

function sortObjects(objects) {

    var newObject = {};

    var sortedArray = sortProperties(objects);
    for (var i = 0; i < sortedArray.length; i++) {
        var key = sortedArray[i][0];
        var value = sortedArray[i][1];

        newObject[key] = value;

    }
    return newObject;
}

exports.getAll = () => namespaceAuthorsScore;
exports.getByKey = (key) => {
    if (!namespaceAuthorsScore.hasOwnProperty(key))
        return null;

    let scores = namespaceAuthorsScore[key];
    let sumScores = 0;
    for (let author in scores) {
        sumScores += scores[author];
    }

    let result = {};
    for (let author in scores) {
        result[author] = (scores[author] / sumScores * 100).toFixed(2) + '%';
    }

    return result;
};

function saveNamespace(deepestNamespace, author, score) {
	if (!deepestNamespace)
	    return;

	if (!namespaceAuthorsScore.hasOwnProperty(deepestNamespace)) {
		namespaceAuthorsScore[deepestNamespace] = {};
		namespaceAuthorsScore[deepestNamespace][author] = score;
		saveNamespace(getDeepestNamespaceForNamespace(deepestNamespace), author, score);
		return;
	}

	if (!namespaceAuthorsScore[deepestNamespace].hasOwnProperty(author)) {
		namespaceAuthorsScore[deepestNamespace][author] = score;
		namespaceAuthorsScore[deepestNamespace] = sortObjects(namespaceAuthorsScore[deepestNamespace]);
		saveNamespace(getDeepestNamespaceForNamespace(deepestNamespace), author, score);
		return;
	}

	namespaceAuthorsScore[deepestNamespace][author] += score;
	namespaceAuthorsScore[deepestNamespace] = sortObjects(namespaceAuthorsScore[deepestNamespace]);
	saveNamespace(getDeepestNamespaceForNamespace(deepestNamespace), author, score);
}

function updateNamespace(fileNameToSave, author, score) {
	let deepestNamespace = getDeepestNamespaceForFile(fileNameToSave);
    saveNamespace(deepestNamespace, author, score);
}

function getDeepestNamespaceForFile(fileName) {
	const indexOfOneToLastDot = getIndexOfOneToLastDot(fileName);
	return indexOfOneToLastDot
		? fileName.substring(0, indexOfOneToLastDot)
		: "";
}

function getDeepestNamespaceForNamespace(namespace) {
	const indexOfLastDot = getIndexOfLastDot(namespace);
	return indexOfLastDot
		? namespace.substring(0, indexOfLastDot)
		: "";
}

function getIndexOfLastDot(str) {
	let indicesOfDot = indicesOfCharsInString(str, '.');
	return indicesOfDot[indicesOfDot.length-1];
}

function getIndexOfOneToLastDot(str) {
	let indicesOfDot = indicesOfCharsInString(str, '.');
	return indicesOfDot[indicesOfDot.length-2];
}

function indicesOfCharsInString(str, char) {
	let indices = [];
	for(let i=0; i<str.length;i++)
		if (str[i] === char) indices.push(i);
	return indices;
}