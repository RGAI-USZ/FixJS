function() { with (FBL) {

/*************************************************************************************/

var ValueTypeHelper = Firecrow.ValueTypeHelper;

var ASTHelper = Firecrow.ASTHelper;

var fcSimulator = Firecrow.Interpreter.Simulator;

var fcCommands = Firecrow.Interpreter.Commands;

var fcModel = Firecrow.Interpreter.Model;



fcSimulator.ExecutionContext = function(variableObject, scopeChain, thisObject, globalObject, contextCreationCommand)

{

    try

    {

        this.variableObject = variableObject || globalObject.globalVariableObject;

        this.thisObject = thisObject || globalObject;



        this.globalObject = globalObject;



        this.scopeChain = ValueTypeHelper.createArrayCopy(scopeChain);

        this.scopeChain.push(this.variableObject);



        this.id = fcSimulator.ExecutionContext.LAST_INSTANCE_ID++;

        this.contextCreationCommand = contextCreationCommand;



        this.codeConstructValuesMapping = {};

    }

    catch(e) { this.notifyError("Error when constructing execution context: " + e); }

};



fcSimulator.ExecutionContext.prototype =

{

    getCodeConstructValue: function(codeConstruct)

    {

        try

        {

            return this.codeConstructValuesMapping[codeConstruct.nodeId];

        }

        catch(e) { this.notifyError("Error when getting codeConstruct value:" + e);}

    },



    setCodeConstructValue: function(codeConstruct, value)

    {

        try

        {

            this.codeConstructValuesMapping[codeConstruct.nodeId] = value

        }

        catch(e) { this.notifyError("Error when setting codeConstruct value:" + e);}

    },



    registerIdentifier: function(identifier)

    {

       try

       {

           if(!ValueTypeHelper.isOfType(identifier, fcModel.Identifier)) { this.notifyError("When registering identifier the argument has to be an identifier"); }



           this.variableObject.fcInternal.registerIdentifier(identifier);

       }

       catch(e)

       {

           this.notifyError("Error when registering identifier:" + e);

       }

    },



    pushToScopeChain: function(variableObject)

    {

        try

        {

            this.scopeChain.push(variableObject);

        }

        catch(e) { this.notifyError("Error when pushing to scope chain: " + e); }

    },



    popFromScopeChain: function()

    {

        try

        {

            return this.scopeChain.pop();

        }

        catch(e) { this.notifyError("Error when popping from scope chain: " + e); }

    },



    notifyError: function(message) { alert("ExecutionContext - " + e); }

};



fcSimulator.ExecutionContext.createGlobalExecutionContext = function(globalObject)

{

    try

    {

        return new fcSimulator.ExecutionContext

        (

            globalObject, [],

            globalObject, globalObject

        );

    }

    catch(e) { alert("Error when constructing the global execution context: " + e); }

};



fcSimulator.ExecutionContext.LAST_INSTANCE_ID = 0;



fcSimulator.ExecutionContextStack = function(globalObject)

{

    try

    {

        if(globalObject == null) { this.notifyError("GlobalObject can not be null when constructing execution context stack!"); return; }

        this.globalObject = globalObject;



        this.stack = [];

        this.activeContext = null;

        this.push(fcSimulator.ExecutionContext.createGlobalExecutionContext(globalObject));



        this.evaluator = new Firecrow.Interpreter.Simulator.Evaluator(this);



        this.evaluator.registerExceptionCallback(function(exceptionInfo)

        {

            this._callExceptionCallbacks(exceptionInfo);

        }, this);

        this.exceptionCallbacks = [];

        this.blockCommandStack = [];

    }

    catch(e)

    {

        this.notifyError("Error when constructing executionContextStack: " + e);

    }

};



Firecrow.Interpreter.Simulator.ExecutionContextStack.prototype =

{

    _popTillEnterFunctionContextCommand: function(exitFunctionContextCommand)

    {

        try

        {

            if(this.blockCommandStack.length == 0) { this.notifyError("Error when popping function context commands from block stack - empty stack!"); return; }



            var blockCommandStack = this.blockCommandStack;



            for(var i = blockCommandStack.length - 1; i >= 0; i = blockCommandStack.length - 1)

            {

                var command = blockCommandStack[i];



                blockCommandStack.pop();



                if(command.codeConstruct == exitFunctionContextCommand.codeConstruct) { break; }

            }



            this._reevaluateEvaluationPositionId();

        }

        catch(e) { this.notifyError("Error when popping function context commands from block stack: " + e); }

    },



    _popBreakContinueFromBlockStack: function(codeConstruct)

    {

        try

        {

            if(this.blockCommandStack.length == 0) { this.notifyError("Error when popping break/continue commands from block stack - empty stack @" + codeConstruct.loc.source); return; }



            if(ASTHelper.isBreakStatement(codeConstruct))

            {

                var blockCommandStack = this.blockCommandStack;



                for(var i = blockCommandStack.length - 1; i >= 0; i = blockCommandStack.length - 1)

                {

                    var command = blockCommandStack[i];



                    if(command.isLoopStatementCommand() || command.isStartSwitchStatementCommand()) { break; }



                    blockCommandStack.pop();

                }

            }

            else if (ASTHelper.isContinueStatement(codeConstruct))

            {

                var blockCommandStack = this.blockCommandStack;



                for(var i = blockCommandStack.length - 1; i >= 0; i = blockCommandStack.length - 1)

                {

                    var command = blockCommandStack[i];



                    if(command.isLoopStatementCommand()) { break; }



                    blockCommandStack.pop();

                }

            }

            else

            {

                this.notifyError("When popping break continue, codeConstruct should be break or continue!");

            }



            this._reevaluateEvaluationPositionId();

        }

        catch(e) { this.notifyError("Error when popping break continue from block stack: " + e);}

    },



    _popTillLoopCommandFromBlockStack: function(loopCommand)

    {

        try

        {

            if(this.blockCommandStack.length == 0) { this.notifyError("Error when popping loop commands from block stack - empty stack @" + loopCommand.codeConstruct.loc.source); return; }



            var blockCommandStack = this.blockCommandStack;



            for(var i = blockCommandStack.length - 1; i >= 0; i = blockCommandStack.length - 1)

            {

                var command = blockCommandStack[i];



                if(command.codeConstruct == loopCommand.codeConstruct) { blockCommandStack.pop(); }

                else { break; }

            }



            this._reevaluateEvaluationPositionId();

        }

        catch(e) { this.notifyError("Error when popping loop commands from block stack: " + e + "@" + loopCommand.codeConstruct.loc.source); }

    },



    _popTillIfCommand: function(ifCommand)

    {

        try

        {

            if(this.blockCommandStack.length == 0) { this.notifyError("Error when popping if commands from block stack - empty stack!"); return; }



            if(this.blockCommandStack[this.blockCommandStack.length-1].codeConstruct != ifCommand.codeConstruct) { this.notifyError("The top command has to be if command when popping commands from block stack"); return; }



            this.blockCommandStack.pop();

        }

        catch(e) { this.notifyError("Error when popping if command from block stack: " + e);}

    },



    _popTillSwitchStatementCommand: function(switchCommand)

    {

        try

        {

            if(this.blockCommandStack.length == 0) { this.notifyError("Error when popping switch commands from block stack - empty stack!"); return; }



            if(this.blockCommandStack[this.blockCommandStack.length-1].codeConstruct != switchCommand.codeConstruct) { this.notifyError("The top command has to be switch command when popping commands from block stack"); return; }



            this.blockCommandStack.pop();

        }

        catch(e) { this.notifyError("Error when popping if command from block stack: " + e);}

    },



    _popWithCommand: function(withCommand)

    {

        try

        {

            if(this.blockCommandStack.length == 0) { this.notifyError("Error when popping with commands from block stack - empty stack!"); return; }



            if(this.blockCommandStack[this.blockCommandStack.length-1].codeConstruct != withCommand.codeConstruct) { this.notifyError("The top command has to be with command when popping commands from block stack"); return; }



            this.blockCommandStack.pop();

        }

        catch(e) { this.notifyError("Error when popping with command from block stack: " + e);}

    },



    getTopBlockCommandConstructs: function()

    {

        try

        {

            //Loop, With, and If constructs are repeating and constant - makes more sense to link the blockStackConstructs with

            //them, then on commands (which get created for each execution

            //on the other hand EnterFunctionContextCommand is linked to the call expression making the call, which differ

            //makes more sense to link to a command

            if(this.blockCommandStack.length == 0) { return []; }



            var topCommand = this.blockCommandStack[this.blockCommandStack.length - 1];

            var topConstruct = topCommand.codeConstruct;



            if(topCommand.isEnterFunctionContextCommand() && topCommand.blockStackConstructs != null) { return topCommand.blockStackConstructs; }

            if(topCommand.isStartSwitchStatementCommand() && topCommand.blockStackConstructs != null) { return topCommand.blockStackConstructs; }

            if(topConstruct.blockStackConstructs != null) { return topConstruct.blockStackConstructs; }



            if(ASTHelper.isForStatement(topConstruct)

            || ASTHelper.isWhileStatement(topConstruct)

            || ASTHelper.isDoWhileStatement(topConstruct)

            || ASTHelper.isIfStatement(topConstruct))

            {

                topConstruct.blockStackConstructs = [topConstruct.test];

                return topConstruct.blockStackConstructs;

            }

            else if(ASTHelper.isWithStatement(topConstruct))

            {

                topConstruct.blockStackConstructs = [topConstruct.object];

                return topConstruct.blockStackConstructs;

            }

            else if(ASTHelper.isForInStatement(topConstruct))

            {

                topConstruct.blockStackConstructs = [topConstruct.right];

                return topConstruct.blockStackConstructs;

            }



            if(topCommand.isEnterFunctionContextCommand())

            {

                topCommand.blockStackConstructs = [topCommand.codeConstruct, topCommand.parentFunctionCommand.codeConstruct];



                return topCommand.blockStackConstructs;

            }

            else if (topCommand.isStartSwitchStatementCommand())

            {

                topCommand.blockStackConstructs = [topConstruct.discriminant];



                if(topCommand.matchedCaseCommand != null)

                {

                    topCommand.blockStackConstructs.push(topCommand.matchedCaseCommand.codeConstruct);



                    if(topCommand.matchedCaseCommand.codeConstruct.test != null)

                    {

                        topCommand.blockStackConstructs.push(topCommand.matchedCaseCommand.codeConstruct.test);

                    }

                }



                return topCommand.blockStackConstructs;

            }



            this.notifyError("Should not be here when getting top block command @ " + topCommand.codeConstruct.loc.source);

        }

        catch(e) { this.notifyError("Error when getting top block constructs: " + e); }

    },



    _addToBlockCommandStack: function(command)

    {

        try

        {

            this.blockCommandStack.push(command);



            if(command.isLoopStatementCommand() || command.isEnterFunctionContextCommand())

            {

                this.globalObject.evaluationPositionId += "-" + command.executionId;

            }

        }

        catch(e) { this.notifyError("Error when adding to block command stack!"); }

    },



    _reevaluateEvaluationPositionId: function()

    {

        try

        {

            this.globalObject.evaluationPositionId = "root";;



            var blockCommandStack = this.blockCommandStack;



            for(var i = 0, length = blockCommandStack.length; i < length; i++)

            {

                var command = blockCommandStack[i];

                if(command.isLoopStatementCommand() || command.isEnterFunctionContextCommand())

                {

                    this.globalObject.evaluationPositionId += "-" + command.executionId;

                }

            }

        }

        catch(e) { this.notifyError("Error when reevaluating evaluation position id: " + e); }

    },



    executeCommand: function(command)

    {

        try

        {

            if(!ValueTypeHelper.isOfType(command, fcCommands.Command)) { this.notifyError("Argument must be a command when executing command"); return; }



                 if (command.isEnterFunctionContextCommand()) { this._addToBlockCommandStack(command); this._enterFunctionContext(command); }

            else if (command.isExitFunctionContextCommand()) { this._popTillEnterFunctionContextCommand(command); this._exitFunctionContext(command); }

            else if (command.isStartWithStatementCommand()) { this._addToBlockCommandStack(command); this._evaluateStartWithCommand(command); }

            else if (command.isEndWithStatementCommand()) { this._popWithCommand(command); this._evaluateEndWithCommand(command); }

            else if (command.isForStatementCommand() || command.isWhileStatementCommand() ||  command.isDoWhileStatementCommand()) { this._addToBlockCommandStack(command); }

            else if (command.isForUpdateStatementCommand()){}

            else if (command.isIfStatementCommand()) { this._addToBlockCommandStack(command); }

            else if (command.isEndIfCommand()) { this._popTillIfCommand(command);}

            else if (command.isEndLoopStatementCommand()) { this._popTillLoopCommandFromBlockStack(command);}

            else if (command.isEvalConditionalExpressionBodyCommand()) { }

            else if (command.isEvalBreakCommand() || command.isEvalContinueCommand())

            {

                this.evaluator.evaluateBreakContinueCommand(command );

                this._popBreakContinueFromBlockStack(command.codeConstruct);

            }

            else if (command.isStartSwitchStatementCommand()) { this._addToBlockCommandStack(command); }

            else if (command.isEndSwitchStatementCommand()) { this._popTillSwitchStatementCommand(command);}

            else if (command.isCaseCommand()) {}

            else if (command.isStartTryStatementCommand() || command.isEndTryStatementCommand() || command.isEvalThrowExpressionCommand()) {}

            else if (command.isEvalNewExpressionCommand()){ this.evaluator.addDependenciesToTopBlockConstructs(command.codeConstruct); }

            else if (command.isStartLogicalExpressionCommand() || command.isEndLogicalExpressionCommand()) {}

            else if (command.isCallInternalConstructorCommand()) { this.evaluator.addDependenciesToTopBlockConstructs(command.codeConstruct); }

            else if (command.isCallCallbackMethodCommand()) {}

            else if (command.isEvalCallExpressionCommand()) { this.evaluator.addDependenciesToTopBlockConstructs(command.codeConstruct); }

            else if (command.isExecuteCallbackCommand()) {}

            else

            {

                if(command.isEvalForInWhereCommand()) { this._addToBlockCommandStack(command); }

                this.evaluator.evaluateCommand(command);

            }

        }

        catch(e) { this.notifyError("Error when executing command: " + e); }

    },



    _enterFunctionContext: function(enterFunctionContextCommand)

    {

        try

        {

            if(!ValueTypeHelper.isOfType(enterFunctionContextCommand, fcCommands.Command) || !enterFunctionContextCommand.isEnterFunctionContextCommand()) { this.notifyError("Argument must be a enterFunctionContext command"); return; }

            if(enterFunctionContextCommand.callee == null) { this.notifyError("When processing enter function context the callee can not be null!"); return; }



            var functionConstruct = enterFunctionContextCommand.callee.fcInternal.codeConstruct;



            var formalParameters = this._getFormalParameters(functionConstruct);

            var sentArgumentsValues = this._getSentArgumentValues(enterFunctionContextCommand.parentFunctionCommand);

            var arguments = enterFunctionContextCommand.parentFunctionCommand.isExecuteCallbackCommand() ? []

                                                                                                         : enterFunctionContextCommand.parentFunctionCommand.codeConstruct.arguments;



            this._establishParametersDependencies(enterFunctionContextCommand.parentFunctionCommand, formalParameters, arguments);



            this.push

            (

                new fcSimulator.ExecutionContext

                (

                    fcSimulator.VariableObject.createFunctionVariableObject

                    (

                        functionConstruct.id != null ? new fcModel.Identifier(functionConstruct.id.name, enterFunctionContextCommand.callee, functionConstruct, this.globalObject)

                                                     : null,

                        formalParameters,

                        enterFunctionContextCommand.callee,

                        sentArgumentsValues,

                        enterFunctionContextCommand.parentFunctionCommand,

                        this.globalObject

                    ),

                    enterFunctionContextCommand.callee.fcInternal.object.scopeChain,

                    enterFunctionContextCommand.thisObject,

                    this.globalObject,

                    enterFunctionContextCommand

                )

            );

        }

        catch(e)

        {

            this.notifyError("Error when entering function context: " + e);

        }

    },



    _establishParametersDependencies: function(callExpressionCommand, formalParameters, arguments)

    {

        try

        {

            if(callExpressionCommand.isEvalCallExpressionCommand() || callExpressionCommand.isEvalNewExpressionCommand())

            {

                if(callExpressionCommand.isApply)

                {

                    var argumentValue = this.getExpressionValue(arguments[1]);



                    if(argumentValue == null) { this.notifyError("When calling apply the array argument is null!"); return; }

                    var fcArray = argumentValue.fcInternal.object;



                    for(var i = 0, length = formalParameters.length; i < length; i++)

                    {

                        var arrayItem = fcArray.getProperty(i);

                        this.globalObject.browser.callDataDependencyEstablishedCallbacks

                        (

                            formalParameters[i].value.fcInternal.codeConstruct,

                            arrayItem != null ? arrayItem.lastModificationConstruct.codeConstruct : null,

                            this.globalObject.getPreciseEvaluationPositionId()

                        );



                        this.globalObject.browser.callDataDependencyEstablishedCallbacks

                        this.globalObject.browser.callDataDependencyEstablishedCallbacks

                        (

                            formalParameters[i].value.fcInternal.codeConstruct,

                            callExpressionCommand.codeConstruct,

                            this.globalObject.getPreciseEvaluationPositionId()

                        );

                    }

                }

                else if (callExpressionCommand.isCall)

                {

                    for(var i = 0, length = formalParameters.length; i < length; i++)

                    {

                        this.globalObject.browser.callDataDependencyEstablishedCallbacks

                        (

                            formalParameters[i].value.fcInternal.codeConstruct,

                            arguments[i + 1],

                            this.globalObject.getPreciseEvaluationPositionId()

                        );



                        this.globalObject.browser.callDataDependencyEstablishedCallbacks

                        (

                            formalParameters[i].value.fcInternal.codeConstruct,

                            callExpressionCommand.codeConstruct,

                            this.globalObject.getPreciseEvaluationPositionId()

                        );

                    }

                }

                else

                {

                    for(var i = 0, length = formalParameters.length; i < length; i++)

                    {

                        this.globalObject.browser.callDataDependencyEstablishedCallbacks

                        (

                            formalParameters[i].value.fcInternal.codeConstruct,

                            arguments[i],

                            this.globalObject.getPreciseEvaluationPositionId()

                        );



                        this.globalObject.browser.callDataDependencyEstablishedCallbacks

                        (

                            formalParameters[i].value.fcInternal.codeConstruct,

                            callExpressionCommand.codeConstruct,

                            this.globalObject.getPreciseEvaluationPositionId()

                        );

                    }

                }

            }

            else if (callExpressionCommand.isExecuteCallbackCommand())

            {

                var params = callExpressionCommand.callbackFunction.fcInternal.codeConstruct.params;



                for(var i = 0; i < params.length; i++)

                {

                    var argument = callExpressionCommand.arguments[i];

                    this.globalObject.browser.callDataDependencyEstablishedCallbacks

                    (

                        params[i],

                        argument != null ? argument.fcInternal.codeConstruct : null,

                        this.globalObject.getPreciseEvaluationPositionId()

                    );



                    this.globalObject.browser.callDataDependencyEstablishedCallbacks

                    (

                        params[i],

                        callExpressionCommand.codeConstruct,

                        this.globalObject.getPreciseEvaluationPositionId()

                    );

                }

            }

        }

        catch(e) { this.notifyError("Error when establishing dependencies between function parameters and call expression arguments: " + e); }

    },



    _getFormalParameters: function(functionConstruct)

    {

        try

        {

            return functionConstruct.params.map(function(param)

            {

                var identifier = new fcModel.Identifier(param.name, new fcModel.JsValue(undefined, new fcModel.FcInternal(param)), param, this.globalObject);

                identifier.isFunctionFormalParameter = true;

                return identifier

            }, this);

        }

        catch(e) { this.notifyError("Error when getting formal function parameters: " + e); }

    },



    _getSentArgumentValues: function(callExpressionCommand)

    {

        var values = [];



        try

        {

            if(!ValueTypeHelper.isOfType(callExpressionCommand, fcCommands.Command) || (!callExpressionCommand.isEvalCallExpressionCommand() && !callExpressionCommand.isEvalNewExpressionCommand() && !callExpressionCommand.isExecuteCallbackCommand())) { this.notifyError("Argument must be a call or new Expression command"); return; }



            if(callExpressionCommand.isEvalCallExpressionCommand() || callExpressionCommand.isEvalNewExpressionCommand())

            {

                var arguments = callExpressionCommand.codeConstruct.arguments;



                if(arguments != null)

                {

                    if(callExpressionCommand.isApply)

                    {

                        var secondArgument = callExpressionCommand.codeConstruct.arguments[1];



                        if(secondArgument != null)

                        {

                            var secondArgValue = this.getExpressionValue(secondArgument);



                            if(ValueTypeHelper.isArray(secondArgValue.value))

                            {

                                secondArgValue.value.forEach(function(item)

                                {

                                    values.push(item);

                                }, this);

                            }

                        }

                    }

                    else if (callExpressionCommand.isCall)

                    {

                        for(var i = 1; i < arguments.length; i++)

                        {

                            values.push(this.getExpressionValue(arguments[i]));

                        }

                    }

                    else

                    {

                        arguments.forEach(function(argument)

                        {

                            values.push(this.getExpressionValue(argument));

                        }, this);

                    }

                }

            }

            else if (callExpressionCommand.isExecuteCallbackCommand())

            {

                values = callExpressionCommand.arguments;

            }

        }

        catch(e) { this.notifyError("Error when getting sent arguments: " + e); }



        return values;

    },



    _exitFunctionContext: function(exitFunctionContextCommand)

    {

        try

        {

            if(!ValueTypeHelper.isOfType(exitFunctionContextCommand, fcCommands.Command) || !exitFunctionContextCommand.isExitFunctionContextCommand()) { this.notifyError("Argument must be a exitFunctionContext command"); return; }



            this.pop();

        }

        catch(e) { this.notifyError("Error when exiting function context: " + e); }

    },



    _evaluateStartWithCommand: function(startWithCommand)

    {

        try

        {

            if(!ValueTypeHelper.isOfType(startWithCommand, fcCommands.Command) || !startWithCommand.isStartWithStatementCommand()) { this.notifyError("Argument must be a start with command"); return; }



            var withObject = this.getExpressionValue(startWithCommand.codeConstruct.object);



            if(withObject == null) { this.notifyError("With object has to be an object!"); return; }



            this.activeContext.pushToScopeChain(fcSimulator.VariableObject.liftToVariableObject(withObject));

        }

        catch(e) { this.notifyError("Error when evaluating start with command: " + e); }

    },



    _evaluateEndWithCommand: function(endWithCommand)

    {

        try

        {

            if(!ValueTypeHelper.isOfType(endWithCommand, fcCommands.Command) || !endWithCommand.isEndWithStatementCommand()) { this.notifyError("Argument must be an end with command"); return; }



            this.activeContext.popFromScopeChain();

        }

        catch(e) { this.notifyError("Error when evaluating start with command: " + e); }

    },



    push: function(executionContext)

    {

        try

        {

            if(!ValueTypeHelper.isOfType(executionContext, fcSimulator.ExecutionContext)) { this.notifyError("Argument is not ExecutionContext!"); return; }



            this.stack.push(executionContext);



            this.activeContext = executionContext;

        }

        catch(e) { this.notifyError("Error when pushing: " + e); }

    },



    pop: function()

    {

        try

        {

            if(this.stack.length == 0) { this.notifyError("Can not pop an empty stack"); return; }



            this.stack.pop();



            this.activeContext = this.stack[this.stack.length - 1];

        }

        catch(e) { this.notifyError("Error when popping:" + e);}

    },



    registerIdentifier: function(variableDeclarator)

    {

        try

        {

            if(!ASTHelper.isVariableDeclarator(variableDeclarator)) { this.notifyError("ExecutionContextStack: When registering an identifier, the argument has to be variable declarator"); }



            this.activeContext.registerIdentifier

            (

                new fcModel.Identifier

                (

                    variableDeclarator.id.name,

                    new fcModel.JsValue(undefined, new fcModel.FcInternal(variableDeclarator)),

                    variableDeclarator,

                    this.globalObject

                )

            );

        }

        catch(e)

        {

            this.notifyError("ExecutionContextStack - error when registering identifier: " + e);

        }

    },



    registerFunctionDeclaration: function(functionDeclaration)

    {

        try

        {

            if(!ASTHelper.isFunctionDeclaration(functionDeclaration)) { this.notifyError("When registering a function, the argument has to be a function declaration"); return; }



            this.activeContext.registerIdentifier(new fcModel.Identifier(functionDeclaration.id.name, this.createFunctionInCurrentContext(functionDeclaration), functionDeclaration, this.globalObject));

        }

        catch(e) { this.notifyError("ExecutionContextStack - error when registering function declaration: " + e); }

    },



    getIdentifier: function(identifierName)

    {

        try

        {

            for(var i = this.stack.length - 1; i >= 0; i--)

            {

                var scopeChain = this.stack[i].scopeChain;



                for(var j = scopeChain.length - 1; j >= 0; j--)

                {

                    var variableObject = scopeChain[j];



                    var identifier = variableObject.fcInternal.getIdentifier(identifierName);



                    if(identifier != null) { return identifier; }

                }

            }

        }

        catch(e) { this.notifyError("Error when getting Identifier value: " + e); }

    },



    getIdentifierValue: function(identifierName)

    {

        try

        {

            for(var i = this.stack.length - 1; i >= 0; i--)

            {

                var scopeChain = this.stack[i].scopeChain;



                for(var j = scopeChain.length - 1; j >= 0; j--)

                {

                    var variableObject = scopeChain[j];



                    var identifier = variableObject.fcInternal.getIdentifier(identifierName);



                    if(identifier != null) { return identifier.value; }

                }

            }

        }

        catch(e) { this.notifyError("Error when getting Identifier value: " + e); }

    },



    setIdentifierValue: function(identifierName, value, setCodeConstruct)

    {

        try

        {

            for(var i = this.stack.length - 1; i >= 0; i--)

            {

                var scopeChain = this.stack[i].scopeChain;



                for(var j = scopeChain.length - 1; j >= 0; j--)

                {

                    var variableObject = scopeChain[j];



                    var identifier = variableObject.fcInternal.getIdentifier(identifierName);



                    if(identifier != null)

                    {

                        identifier.setValue(value, setCodeConstruct);



                        if(variableObject != this.globalObject && !ValueTypeHelper.isOfType(variableObject, fcSimulator.VariableObject))

                        {

                            variableObject[identifierName] = value;

                        }



                        return;

                    }

                }

            }



            var globalExecutionContext = this.stack[0];



            if(globalExecutionContext == null) { this.notifyError("Global execution context can not be null!"); return; }



            globalExecutionContext.registerIdentifier(new fcModel.Identifier(identifierName, value, setCodeConstruct, this.globalObject));

        }

        catch(e) { this.notifyError("Error when setting Identifier value: " + e); }

    },



    deleteIdentifier: function(identifierName)

    {

        try

        {

            for(var i = this.stack.length - 1; i >= 0; i--)

            {

                var scopeChain = this.stack[i].scopeChain;



                for(var j = scopeChain.length - 1; j >= 0; j--)

                {

                    var variableObject = scopeChain[j];



                    var identifier = variableObject.fcInternal.getIdentifier(identifierName);



                    if(identifier != null)

                    {

                        variableObject.fcInternal.deleteIdentifier(identifier.name); return;

                    }

                }

            }

        }

        catch(e) { this.notifyError("Error when deleting Identifier: " + e); }

    },



    setExpressionValue: function(codeConstruct, value)

    {

        try

        {

            this.activeContext.setCodeConstructValue(codeConstruct, value);

        }

        catch(e) { this.notifyError("Error when setting expression value: " + e); }

    },



    setExpressionValueInPreviousContext: function(codeConstruct, value)

    {

        try

        {

            var previousExecutionContext = this.stack[this.stack.length - 2];



            if(previousExecutionContext == null) { this.notifyError("There is no previous context!"); return; }



            previousExecutionContext.setCodeConstructValue(codeConstruct, value);

        }

        catch(e) { this.notifyError("Error when setting expression value in previous context: " + e); }

    },



    getExpressionValue: function(codeConstruct)

    {

        try

        {

            return this.activeContext.getCodeConstructValue(codeConstruct);

        }

        catch(e) { this.notifyError("Error when setting expression value: " + e); }

    },



    getBaseObject: function(codeConstruct)

    {

        try

        {

            if(ASTHelper.isIdentifier(codeConstruct) || ASTHelper.isFunctionExpression(codeConstruct)) { return this.globalObject; }

            else if (ASTHelper.isMemberExpression(codeConstruct)) { return this.getExpressionValue(codeConstruct.object); }

            else if (ASTHelper.isCallExpression(codeConstruct)) { return this.getExpressionValue(codeConstruct.callee); }

            else { this.notifyError("Not handling getting base object on other expressions"); return this.globalObject; }

        }

        catch(e) { this.notifyError("Error when getting base object: " + e); }

    },



    createFunctionInCurrentContext: function(functionCodeConstruct)

    {

        try

        {

            return this.globalObject.internalExecutor.createFunction(this.activeContext.scopeChain, functionCodeConstruct)

        }

        catch(e) { this.notifyError("Error when creating function: " + e);}

    },



    registerExceptionCallback: function(callback, thisObject)

    {

        try

        {

            if(!ValueTypeHelper.isOfType(callback, Function)) { this.notifyError("Exception callback has to be a function!"); return; }



            this.exceptionCallbacks.push({callback: callback, thisObject: thisObject || this});

        }

        catch(e) { this.notifyError("Error when registering exception callback: " + e); }

    },



    _callExceptionCallbacks: function(exceptionInfo)

    {

        this.exceptionCallbacks.forEach(function(callbackObject)

        {

            callbackObject.callback.call(callbackObject.thisObject, exceptionInfo);

        });

    },



    notifyError: function(message) { alert("ExecutionContextStack - " + message); }

};

}}