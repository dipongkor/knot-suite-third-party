var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var hookSchema = new Schema({
    repoId: {type: Number},
    orgList: [],
    knotAccessToken: String,
    hookList: [],
    hashTags: []
});

var GitHook = mongoose.model('GitHook', hookSchema);

module.exports = GitHook;