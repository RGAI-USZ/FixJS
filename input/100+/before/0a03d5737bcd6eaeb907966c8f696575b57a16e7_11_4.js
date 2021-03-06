function ($, fluid) {
    
    fluid.defaults("cspace.recordTraverser", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        model: { },
        selectors: {
            indexTotal: ".csc-recordTraverser-indexTotal",
            returnToSearch: ".csc-recordTraverser-returnToSearch",
            linkNext: ".csc-recordTraverser-next",
            linkPrevious: ".csc-recordTraverser-previous"
        },
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/RecordTraverserTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        },
        styles: {
            indexTotal: "cs-recordTraverser-indexTotal",
            linkNext: "cs-recordTraverser-next",
            linkPrevious: "cs-recordTraverser-previous",
            returnToSearch: "cs-recordTraverser-returnToSearch",
            disabled: "cs-recordTraverser-disabled"
        },
        strings: {},
        parentBundle: "{globalBundle}",
        protoTree: {
            indexTotal: {
                messagekey: "recordTraverser-indexTotal",
                args: ["${adjacentRecords.userIndex}", "${adjacentRecords.total}"],
                decorators: {"addClass": "{styles}.indexTotal"}
            },
            expander: [{
                type: "fluid.renderer.condition",
                condition: "${returnToSearch}",
                trueTree: {
                    returnToSearch: {
                        target: "${returnToSearch}",
                        linktext: {
                            messagekey: "recordTraverser-returnToSearch"
                        },
                        decorators: {"addClass": "{styles}.returnToSearch"}
                    }
                }
            }, {
                type: "fluid.renderer.condition",
                condition: "${adjacentRecords.previous}",
                trueTree: {
                    linkPrevious: {
                        target: "${adjacentRecords.previous.target}",
                        decorators: [{"addClass": "{styles}.linkPrevious"}, {
                            type: "attrs",
                            attributes: {
                                title: "${adjacentRecords.previous.number}"
                            }
                        }]
                    }
                },
                falseTree: {
                    linkPrevious: {
                        decorators: [{"addClass": "{styles}.linkPrevious"}, {"addClass": "{styles}.disabled"}]
                    }
                }
            },
            {
                type: "fluid.renderer.condition",
                condition: "${adjacentRecords.next}",
                trueTree: {
                    linkNext: {
                        target: "${adjacentRecords.next.target}",
                        decorators: [{"addClass": "{styles}.linkNext"}, {
                            type: "attrs",
                            attributes: {
                                title: "${adjacentRecords.next.number}"
                            }
                        }]
                    }
                },
                falseTree: {
                    linkNext: {
                        decorators: [{"addClass": "{styles}.linkNext"}, {"addClass": "{styles}.disabled"}]
                    }
                }
            }]
        },
        finalInitFunction: "cspace.recordTraverser.finalInitFunction",
        components: {
            searchReferenceStorage: {
                type: "cspace.util.localStorageDataSource",
                options: {
                    elPath: "searchReference"
                }
            },
            searchHistoryStorage: {
                type: "cspace.util.localStorageDataSource",
                options: {
                    elPath: "searchHistory",
                    source: "advancedsearch"
               }
            },
            findeditHistoryStorage: {
                type: "cspace.util.localStorageDataSource",
                options: {
                    elPath: "findeditHistory",
                    source: "findedit"
                }
            },
            dataSource: {
                type: "cspace.recordTraverser.dataSource"
            },
            globalNavigator: "{globalNavigator}"
        },
        invokers: {
            prepareModel: {
                funcName: "cspace.recordTraverser.prepareModel",
                args: [
                    ["{cspace.recordTraverser}.searchHistoryStorage", "{cspace.recordTraverser}.findeditHistoryStorage"],
                    "{cspace.recordTraverser}.model",
                    "{cspace.recordTraverser}.applier",
                    "{cspace.recordTraverser}.options.elPaths",
                    "{cspace.recordTraverser}.options.urls"
                ]
            }
        },
        urls: cspace.componentUrlBuilder({
            navigate: "%webapp/html/%recordType.html?csid=%csid",
            adjacentRecords: "%tenant/%tname/adjacentRecords/%token/%index",
            returnToSearch: "%webapp/html/%source.html?hashtoken=%hashtoken"
        }),
        listeners: {
            prepareModelForRender: "{cspace.recordTraverser}.prepareModelForRenderListener"
        },
        preInitFunction: "cspace.recordTraverser.preInitFunction",
        elPaths: {
            returnToSearch: "returnToSearch",
            searchReference: "searchReference",
            index: "index",
            userIndex: "userIndex",
            token: "token",
            total: "total",
            csid: "csid",
            adjacentRecords: "adjacentRecords",
            previous: "adjacentRecords.previous",
            next: "adjacentRecords.next",
            recordType: "recordtype",
            source: "source"
        }
    });

    fluid.demands("cspace.recordTraverser.dataSource", ["cspace.recordTraverser"], {
        funcName: "cspace.URLDataSource",
        args: {
            url: "{cspace.recordTraverser}.options.urls.adjacentRecords",
            termMap: {
                token: "%token",
                index: "%index"
            },
            targetTypeName: "cspace.recordTraverser.dataSource"
        }
    });

    fluid.demands("cspace.recordTraverser.dataSource",  ["cspace.localData", "cspace.recordTraverser"], {
        funcName: "cspace.recordTraverser.testDataSource",
        args: {
            targetTypeName: "cspace.recordTraverser.testDataSource",
            termMap: {
                token: "%token",
                index: "%index"
            }
        }
    });
    fluid.defaults("cspace.recordTraverser.testDataSource", {
        url: "%test/data/person/%token.json"
    });
    cspace.recordTraverser.testDataSource = cspace.URLDataSource;
    
    var get = function (model) {
        return fluid.get(model, fluid.model.composeSegments.apply(null, Array().slice.call(arguments, 1)));
    };
    
    cspace.recordTraverser.prepareModel = function (storages, model, applier, elPaths, urls) {
        fluid.each([elPaths.next, elPaths.previous], function (rec) {
            if (!get(model, rec, elPaths.csid)) {
                return;
            }
            applier.requestChange(rec + ".target", fluid.stringTemplate(urls.navigate, {
                recordType: get(model, rec, elPaths.recordType),
                csid: get(model, rec, elPaths.csid)
            }));
        });
        applier.requestChange(fluid.model.composeSegments(elPaths.adjacentRecords, elPaths.userIndex),
            get(model, elPaths.adjacentRecords, elPaths.index) + 1);
        var hashtoken = get(model, elPaths.searchReference, elPaths.token),
            source = get(model, elPaths.searchReference, elPaths.source),
            returnToSearch;
        fluid.each(storages, function (storage) {
            if (storage.options.source !== source) {
                return;
            }
            var history = storage.get();
            if (!history) {
                return;
            }
            returnToSearch = fluid.find(history, function (search) {
                if (search.hashtoken === hashtoken) {
                    return {
                        hashtoken: hashtoken,
                        source: source
                    };
                }
            });
        });
        if (!returnToSearch) {
            return;
        }
        applier.requestChange(elPaths.returnToSearch, fluid.stringTemplate(urls.returnToSearch, returnToSearch));
    };

    cspace.recordTraverser.preInitFunction = function (that) {
        that.prepareModelForRenderListener = function () {
            that.prepareModel();
        };
    };

    cspace.recordTraverser.finalInitFunction = function(that) {
        var applier = that.applier,
            model = that.model,
            elPaths = that.options.elPaths,
            searchReference = elPaths.searchReference,
            searchReferenceStorage = that.searchReferenceStorage;

        applier.requestChange(searchReference, searchReferenceStorage.get());
        if (!fluid.get(model, searchReference)) {
            return;
        }
        searchReferenceStorage.set();
        that.dataSource.get({
            token: get(model, searchReference, elPaths.token),
            index: get(model, searchReference, elPaths.index),
            source: get(model, searchReference, elPaths.source)
        }, function(data) {
            applier.requestChange(elPaths.adjacentRecords, data);
            that.refreshView();
        });

        that.globalNavigator.events.onPerformNavigation.addListener(function (callback, evt) {
            if (!evt) {
                return;
            }
            var target = $(evt.target);
            if (target.length === 0) {
                return;
            }
            searchReferenceStorage.set(fluid.find({
                "linkNext": 1,
                "linkPrevious": -1
            }, function (increment, selector) {
                if (that.locate(selector).attr("href") === target.attr("href")) {
                    return {
                        token: get(model, searchReference, elPaths.token),
                        index: get(model, searchReference, elPaths.index) + increment,
                        source: get(model, searchReference, elPaths.source)
                    };
                }
            }));
        });
    };
    
    fluid.fetchResources.primeCacheFromResources("cspace.recordTraverser");
    
}