var express = require('express');
var router = express.Router();
var JiraHook = require("../models/jiraHook");

router.post("/createNewHook", function (req, res, next) {

    var newHookParams = {
        hookName: req.body.hookName,
        knotSuiteAccessToken: req.body.knotSuiteAccessToken,
        hashTags: req.body.hashTags,
        iconUrl: req.body.iconUrl,
        orgList: req.body.orgList
    }

    var newJiraHook = new JiraHook({
        hashTags: newHookParams.hashTags,
        knotSuiteAccessToken: newHookParams.knotSuiteAccessToken,
        hookName: newHookParams.hookName,
        iconUrl: newHookParams.iconUrl,
        orgList: newHookParams.orgList
    });

    newJiraHook.save(function (err, jiraHook) {
        if (err) {
            console.log(err);
            res.send({
                code: -1,
                message: "Database error",
                error: err
            });
        }

        res.send(jiraHook);
    });

});

router.post("/getNewWebHook", function (req, res, next) {

    var knotSuitAccessToken = req.query.knotSuiteAccessToken;

    JiraHook.findOne({knotSuiteAccessToken: knotSuitAccessToken}, function (err, jiraHook) {
        if(err){
            console.log(err);
            req.end();
        }
        if(jiraHook){
            jiraHook.hookList.push({hookData: req.body,hookHeader: req.header()});
            jiraHook.save(function(err){
               if(err){
                   console.log(err);
                   req.end();
                   return;
               }
                req.end();
            });
        }
    });

});

module.exports = router;

