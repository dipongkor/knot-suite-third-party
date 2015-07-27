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
    };

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

router.post("/getNewWebHook/:knotSuitAccessToken", function (req, res, next) {
    console.log("Jira Hook fired");

    var knotSuitAccessToken = req.params.knotSuitAccessToken;

    console.log(knotSuitAccessToken);

    JiraHook.findOne({knotSuiteAccessToken: knotSuitAccessToken}, function (err, jiraHook) {
        if(err){
            console.log(err);
            res.end();
        }

        console.log(jiraHook);
        if(jiraHook){
            jiraHook.hookList.push({hookData: req.body,hookHeader: req.header});
            jiraHook.save(function(err){
               if(err){
                   console.log(err);
                   res.end();
                   return;
               }
                res.end();
            });
        }else{
            console.log("hook not found");
            res.end();
        }
    });

});

module.exports = router;

