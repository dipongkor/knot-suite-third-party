var request = require("request");
var knotSettings = require("../configs/knotSettings");
var     _ = require("lodash");
var signal = function () {
    return {
        saveSignalFromGitWebHook: saveSignalFromGitWebHook,
        saveSignalOnHookCreated: saveSignalOnHookCreated,
        saveSignalFromJiraHook: saveSignalFromJiraHook
    }

    function composeSignalContent(hookObj) {
        switch (hookObj.hookHeader["x-github-event"]) {
            case "issue_comment":
                var content = "[" + hookObj.hookData.repository.full_name + "] " + "New comment on issue " + "\n"
                    + "Commented by " + hookObj.hookData.comment.user.login + "\n"
                    + hookObj.hookData.comment.body;
                return {
                    content: content,
                    ogDataUrl: hookObj.hookData.issue.html_url
                };
                break;
            case "push":
                var content = "[" + hookObj.hookData.repository.name + ": " + hookObj.hookData.ref.substr(hookObj.hookData.ref.lastIndexOf("/") + 1, hookObj.hookData.ref.length) + "] " + "1 new commit by " + "\n"
                    + hookObj.hookData.commits[0].committer.name + "\n"
                    + "Commit message: " + hookObj.hookData.head_commit.message;
                return {
                    content: content,
                    ogDataUrl: hookObj.hookData.head_commit.url
                };
                break;
            case "commit_comment":
                var content = "[" + hookObj.hookData.repository.full_name + ": New comment on commit"
                    + "Commented By: \n" + hookObj.hookData.comment.user.login;
                return {
                    content: content,
                    ogDataUrl: hookObj.hookData.comment.html_url
                };
                break;

        }
    }

    function saveSignalFromGitWebHook(gitHook, hookObj) {
        console.log("Saving signal");
        var signalData = composeSignalContent(hookObj);
        console.log(gitHook.hashTags);

        gitHook.orgList.forEach(function (org) {
            var data = {
                accessToken: gitHook.knotAccessToken,
                content: signalData.content,
                spaceId: null,
                rootId: null,
                verb: null,
                object: null,
                activityType: "Composed-DashBoard",
                objectTags: {
                    objectTags: [],
                    hashTags: gitHook.hashTags,
                    privateTags: []
                },
                ogdataObject: {
                    ogTitle: "",
                    ogDescription: "",
                    ogImage: "",
                    isOgData: false,
                    url: ""
                },
                attachments: [],
                orgId: org,
                visibility: {
                    scope: "Organization",
                    privacy: "AllEmployee"
                }
            };

            request({
                url: knotSettings.knotSuiteServiceUrl + "/api/service/linkService/ogData",
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({"url": signalData.ogDataUrl})
            }, function (err, res, body) {
                if (!res.code) {

                    var ogDataResponse = JSON.parse(res.body);
                    console.log(ogDataResponse);

                    var ogdataObject = {
                        ogTitle: ogDataResponse.ogData.title,
                        ogDescription: ogDataResponse.ogData.description,
                        ogImage: ogDataResponse.ogData.images.length > 0 ? ogDataResponse.ogData.images[0] : "",
                        isOgData: true,
                        url: signalData.ogDataUrl
                    };

                    data.ogdataObject = ogdataObject;

                    request({
                        url: knotSettings.knotSuiteServiceUrl + "/api/signals/saveSignal",
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(data)
                    }, function (err, res, body) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(res.body);
                        }
                    });
                }
            });

        });
    }

    function saveSignalOnHookCreated(newHookParams) {
        var signalContent = "Has hooked " + newHookParams.gitRepo.name + " from GitHub.";
        console.log("Save signal for new hook");

        newHookParams.orgList.forEach(function (org) {
            var data = {
                accessToken: newHookParams.knotSuiteAccessToken,
                content: signalContent,
                spaceId: null,
                rootId: null,
                verb: null,
                object: null,
                activityType: "Composed-DashBoard",
                objectTags: {
                    objectTags: [],
                    hashTags: newHookParams.hashTags,
                    privateTags: []
                },
                ogdataObject: {
                    ogTitle: "",
                    ogDescription: "",
                    ogImage: "",
                    isOgData: false,
                    url: ""
                },
                attachments: [],
                orgId: org,
                visibility: {
                    scope: "Organization",
                    privacy: "AllEmployee"
                }
            };
            console.log(org);

            request({
                url: knotSettings.knotSuiteServiceUrl + "/api/service/linkService/ogData",
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({"url": newHookParams.gitRepo.html_url})
            }, function (err, res, body) {
                if (!res.code) {

                    var ogDataResponse = JSON.parse(res.body);
                    console.log(ogDataResponse);

                    var ogdataObject = {
                        ogTitle: ogDataResponse.ogData.title,
                        ogDescription: ogDataResponse.ogData.description,
                        ogImage: ogDataResponse.ogData.images.length > 0 ? ogDataResponse.ogData.images[0] : "",
                        isOgData: true,
                        url: newHookParams.gitRepo.html_url
                    };

                    data.ogdataObject = ogdataObject;

                    request({
                        url: knotSettings.knotSuiteServiceUrl + "/api/signals/saveSignal",
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(data)
                    }, function (err, res, body) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(res.body);
                        }
                    });
                }
            });

        });
    };

    function composeJiraHookSignal(hookData) {
        var content = "";
        switch (hookData.webhookEvent) {
            case "jira:issue_created":
            {
                if (!hookData.issue.fields.issuetype.subtask) {
                   content = hookData.user.displayName + " created Task";
                } else {
                   content = hookData.user.displayName + " created Sub-task";
                }
                return content + "\n"+
                       "Summary: " +hookData.issue.fields.summary + "\n"+
                        "Priority: " +
                    hookData.issue.fields.priority.name;
                break;
            }
            case "jira:issue_updated":
            {
                var status = hookData.issue.fields.status.name;
                if(status == 'Done'){
                    content =  hookData.issue.fields.creator.displayName + "Completed Task";
                }else if(status == "To Do"){
                    content =  hookData.issue.fields.creator.displayName + "Reopened Task";
                }
                return content + "\n" +
                        "Summary: "+ hookData.issue.fields.summary + "\n" +
                        "Priority: " + hookData.issue.fields.priority.name;
                break;
            }
        }
        return content;
    }

    function saveSignalFromJiraHook(jiraHook, hookData){
        console.log("Saving jira hook signal");
        var signalData = composeJiraHookSignal(hookData);

        if(signalData == "") return;
        console.log(signalData);
        jiraHook.orgList.forEach(function(org){
            var data = {
                accessToken: jiraHook.knotSuiteAccessToken,
                content: signalData,
                spaceId: null,
                rootId: null,
                verb: null,
                object: null,
                activityType: "Composed-DashBoard",
                objectTags: {
                    objectTags: [],
                    hashTags: jiraHook.hashTags,
                    privateTags: []
                },
                ogdataObject: {
                    ogTitle: "",
                    ogDescription: "",
                    ogImage: "",
                    isOgData: false,
                    url: ""
                },
                attachments: [],
                orgId: org,
                visibility: {
                    scope: "Organization",
                    privacy: "AllEmployee"
                }
            };

            request({
                url: knotSettings.knotSuiteServiceUrl + "/api/service/linkService/ogData",
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({"url": jiraHook.jiraHostUrl + "/browse/" + hookData.issue.key})
            }, function (err, res, body) {
                if (!res.code) {
                    var ogDataResponse = JSON.parse(res.body);
                    console.log(ogDataResponse);
                    var ogdataObject = {
                        ogTitle: ogDataResponse.ogData.title,
                        ogDescription: ogDataResponse.ogData.description,
                        ogImage: ogDataResponse.ogData.images.length > 0 ? ogDataResponse.ogData.images[0] : "",
                        isOgData: true,
                        url: jiraHook.jiraHostUrl + "/browse/" + hookData.issue.key
                    };

                    data.ogdataObject = ogdataObject;

                    request({
                        url: knotSettings.knotSuiteServiceUrl + "/api/signals/saveSignal",
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(data)
                    }, function (err, res, body) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(res.body);
                        }
                    });
                }
            });
        });
    }
};

module.exports = signal();
