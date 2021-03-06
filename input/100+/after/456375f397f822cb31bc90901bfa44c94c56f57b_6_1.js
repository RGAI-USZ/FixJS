function(browser, documentFragment)

{

    try

    {

        this.__proto__ = new fcModel.Object(this);



        this.origWindow = Firecrow.getWindow();

        this.origDocument = Firecrow.getDocument();



        this.fcInternal = new fcModel.FcInternal(null, this);

        this.internalExecutor = new Firecrow.Interpreter.Simulator.InternalExecutor(this);



        Firecrow.Interpreter.Simulator.VariableObject.liftToVariableObject(this);



        this.arrayPrototype = new fcModel.ArrayPrototype(this);

        this.objectPrototype = new fcModel.ObjectPrototype(this);

        this.functionPrototype = new fcModel.FunctionPrototype(this);

        this.regExPrototype = new fcModel.RegExPrototype(this);

        this.stringPrototype = new fcModel.StringPrototype(this);



        this.stringFunction = new fcModel.StringFunction(this);

        this.arrayFunction = new fcModel.ArrayFunction(this);

        this.regExFunction = new fcModel.RegExFunction(this);

        this.emptyFunction = new fcModel.EmptyFunction(this);

        this.fcMath = new fcModel.Math(this);

        this.math = new fcModel.JsValue(this.fcMath, new fcModel.FcInternal(null, this.fcMath));

        this.document = new fcModel.Document(documentFragment, this);

        this.jsFcDocument = new fcModel.JsValue(this.document.documentFragment, new fcModel.FcInternal(null, this.document));

        this.browser = browser;



        this.addProperty("Array", this.arrayFunction , null);

        this.addProperty("RegExp", this.regExFunction, null);

        this.addProperty("String", this.stringFunction, null);

        this.addProperty("document",this.jsFcDocument, null);

        this.addProperty("Math", this.math, null);

        this.addProperty("window", this, null);

        this.addProperty("undefined", new fcModel.JsValue(undefined, new fcModel.FcInternal()));

        this.addProperty("location", this.internalExecutor.createLocationObject());



        this.currentCommand = null;



        this.internalExecutor.expandInternalFunctions();

        FBL.ORIG_WINDOW = this.origWindow;



        fcModel.GlobalObject.CONST.INTERNAL_PROPERTIES.METHODS.forEach(function(methodName)

        {

            try

            {

                this.addProperty(methodName,  this.origWindow[methodName].jsValue);

            }

            catch(e) { fcModel.GlobalObject.notifyError("Global object error when adding property: " + methodName +", error: " + e);}

        }, this);



        this.identifierSlicingCriteria = [];



        this.registerSlicingCriteria = function(slicingCriteria)

        {

            if(slicingCriteria == null) { return; }



            this.identifierSlicingCriteria = [];



            for(var i = 0; i < slicingCriteria.length; i++)

            {

                var criterion = slicingCriteria[i];



                if(criterion.type == Firecrow.DependencyGraph.SlicingCriterion.TYPES.READ_IDENTIFIER)

                {

                    this.identifierSlicingCriteria.push(criterion);

                }

            }

        };



        this.checkIfSatisfiesIdentifierSlicingCriteria = function(codeConstruct)

        {

            if(codeConstruct == null) { return false; }

            if(this.identifierSlicingCriteria.length == 0) { return false; }



            for(var i = 0; i < this.identifierSlicingCriteria.length; i++)

            {

                var slicingCriterion = this.identifierSlicingCriteria[i];



                //if(slicingCriterion.fileName != codeConstruct.loc.source) { continue; }

                //TODO - uncomment this!

                //if(slicingCriterion.lineNumber != codeConstruct.loc.start.line) { continue; }

                if(slicingCriterion.identifierName != codeConstruct.name) { continue; }



                return true;

            }



            return false;

        }



        this.evaluationPositionId = "root";

        this.getPreciseEvaluationPositionId = function()

        {

            return { groupId : this.evaluationPositionId, currentCommandId : (this.currentCommand != null ? this.currentCommand.executionId : "null") };

        };



        this.getReturnExpressionPreciseEvaluationPositionId = function()

        {

            var evaluationPositionId = this.getPreciseEvaluationPositionId();

            evaluationPositionId.isReturnDependency = true;



            var offset = null;

            evaluationPositionId.groupId.replace(/-[0-9]+f/g, function(match)

            {

                offset = arguments[arguments.length - 2];

            });



            if(offset)

            {

                evaluationPositionId.groupId = evaluationPositionId.groupId.substring(0, offset);

            }



            return evaluationPositionId;

        };



        this.setCurrentCommand = function(command)

        {

            if(command == null) { fcModel.GlobalObject.notifyError("Command can not be null!");}



            this.currentCommand = command;

            this.currentCommand.executionId = this._EXECUTION_COMMAND_COUNTER++;

        };

        this._EXECUTION_COMMAND_COUNTER = 0;

    }

    catch(e) { fcModel.GlobalObject.notifyError("Error when initializing global object:" + e); }

}