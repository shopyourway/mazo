const nconf = require('nconf');

exports.extract = filename => {
    let filePathPrefixToIgnore = nconf.get('filePathPrefixToIgnore');
    return filename.replace(new RegExp("^" + filePathPrefixToIgnore), '').replace(/\//g,'.');
};