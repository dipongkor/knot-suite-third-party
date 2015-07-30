var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var hookSchema = new Schema({
    orgList: [],
    knotSuiteAccessToken: String,
    hookList: [],
    hashTags: [],
    iconUrl: String,
    hookName: String,
    hookUrl: String
});

var JiraHook = mongoose.model('JiraHook', hookSchema);

module.exports = JiraHook;