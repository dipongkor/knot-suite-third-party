var express = require('express');
var router = express.Router();
var JiraHook = require("../models/jiraHook");
var shortid = require('shortid');
var knotSettings = require("../configs/knotSettings");
var signal = require("../modules/signal");

router.post("/createNewHook", function (req, res, next) {
    var newHookParams = {
        hookName: req.body.hookName,
        knotSuiteAccessToken: req.body.knotSuiteAccessToken,
        hashTags: req.body.hashTags,
        iconUrl: req.body.iconUrl,
        orgList: req.body.orgList,
        hookUrl: req.body.orgList.hookUrl,
        jiraHostUrl: req.body.jiraHostUrl,
        hookId: req.body.hookId
    };
    var newJiraHook = new JiraHook({
        hashTags: newHookParams.hashTags,
        knotSuiteAccessToken: newHookParams.knotSuiteAccessToken,
        hookName: newHookParams.hookName,
        iconUrl: newHookParams.iconUrl,
        orgList: newHookParams.orgList,
        hookUrl: newHookParams.hookUrl,
        jiraHostUrl: newHookParams.jiraHostUrl,
        hookId: newHookParams.hookId
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

router.post("/getNewWebHook/:knotSuitAccessToken/:hookId", function (req, res, next) {
    console.log("Jira Hook fired");
    var knotSuitAccessToken = req.params.knotSuitAccessToken;
    var hookId = req.params.hookId;
    console.log(hookId);

    var newJiraHook = new JiraHook({
        hashTags: [],
        knotSuiteAccessToken: "",
        hookName: "",
        iconUrl: "",
        orgList: "",
        hookUrl: "",
        jiraHostUrl: "",
        hookId: "",
        hookData: req.body
    });
    newJiraHook.save(function(err, data){
        if(err){
            console.log(err);
        }else{
            console.log(data);
        }
    });

    //JiraHook.findOne({knotSuiteAccessToken: knotSuitAccessToken, hookId: hookId}, function (err, jiraHook) {
    //    if (err) {
    //        console.log(err);
    //        res.end();
    //    }
    //    console.log(jiraHook);
    //    if (jiraHook) {
    //        jiraHook.hookList.push({hookData: req.body});
    //        if (signal.isValidJiraHook(req.body) == "") {
    //            res.end();
    //            return;
    //        }
    //        signal.saveSignalFromJiraHook(jiraHook, req.body);
    //        jiraHook.save(function (err) {
    //            if (err) {
    //                console.log(err);
    //                res.end();
    //                return;
    //            }
    //            res.end();
    //        });
    //    } else {
    //        console.log("hook not found");
    //        res.end();
    //    }
    //});
});

router.post("/getAuthorizedAccount", function (req, res, next) {
    var knotSuiteAccessToken = req.body.knotSuitAccessToken;
    JiraHook.find({knotSuiteAccessToken: knotSuiteAccessToken}, function (err, jiraHooks) {
        if (err) {
            console.log(err);
            res.send({
                message: "Database error",
                code: -1,
                error: err
            });
            return;
        }

        res.send({
            message: "User found",
            code: 1,
            data: jiraHooks
        });

    });
});

router.post("/getNewHookUrl", function (req, res, next) {
    var uniqueId = shortid.generate();
    var newJiraHook = {
        hookId: uniqueId,
        hookUrl: knotSettings.apiServerUrl + "/api/jira/getNewWebHook/" + req.body.knotSuiteAccessToken + "/" + uniqueId
    };
    res.send(newJiraHook);
});

router.post("/getHookById", function (req, res) {
    JiraHook.findOne({knotSuiteAccessToken: req.body.knotSuiteAccessToken, hookId: req.body.hookId},
        function (err, jiraHook) {
            if (err) {
                console.log(err);
                res.send({
                    code: -1,
                    message: "Database error",
                    data: err
                });
            }
            console.log(jiraHook);
            res.send({
                code: 1,
                message: "Hook found",
                data: jiraHook
            });
        });
});

router.post("/updateHook", function (req, res) {
    var updatedHook =  req.body.updatedHook;
    JiraHook.findOne({
            knotSuiteAccessToken: updatedHook.knotSuiteAccessToken,
            hookId: updatedHook.hookId
        },
        function (err, jiraHook) {
            if(err){
                console.log(err);
                res.send({
                    code: -1,
                    message: "Database error",
                    data: err
                })
            }
            jiraHook.hookName = updatedHook.hookName;
            jiraHook.hashTags = updatedHook.hashTags;
            jiraHook.orgList = updatedHook.orgList;
            jiraHook.save(function(err){
               if(err){
                   console.log(err);
                   res.send({
                      code: -1,
                       message: "Database error",
                       data: err
                   });
               }
                res.send({
                   code: 1,
                    message: "Hook updated successfully",
                    data: jiraHook
                });
            });
        });
});
module.exports = router;

