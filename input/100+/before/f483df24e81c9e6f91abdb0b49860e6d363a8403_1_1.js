function() { with (FBL) {

/*************************************************************************************/

var ValueTypeHelper = Firecrow.ValueTypeHelper;

var ASTHelper = Firecrow.ASTHelper;

var Node = Firecrow.DependencyGraph.Node;



Firecrow.DependencyGraph.DependencyGraph = function()

{

    this.nodes = [];

    this.controlFlow = [];

    this.importantConstructDependencyIndexMapping = [];

    this.controlDependencies = [];



    this.dependencyEdgesCounter = 0;

    this.inculsionFinder = new Firecrow.DependencyGraph.InclusionFinder();

};



var DependencyGraph = Firecrow.DependencyGraph.DependencyGraph;



DependencyGraph.prototype.addNode = function(node)

{

    if(!ValueTypeHelper.isOfType(node, Node)) { alert("DependencyGraph.DependencyGraph: node is not of type DependencyGraph.Node!"); }



    this.nodes.push(node);

};



DependencyGraph.prototype.handleNodeCreated = function(nodeModelObject, type, isDynamic)

{

    this.addNode(new Node(nodeModelObject, type, isDynamic));

};



DependencyGraph.prototype.handleNodeInserted = function(nodeModelObject, parentNodeModelObject, isDynamic)

{

    if(nodeModelObject == null) { alert("DependencyGraph.DependencyGraph nodeModelObject must not be null!"); return; }



    if(parentNodeModelObject != null)

    {

        nodeModelObject.graphNode.addStructuralDependency(parentNodeModelObject.graphNode, isDynamic);

    }

};



DependencyGraph.prototype.handleDataDependencyEstablished = function(sourceNodeModelObject, targetNodeModelObject, dependencyCreationInfo, destinationNodeDependencyInfo)

{

    try

    {

        if(sourceNodeModelObject == null || targetNodeModelObject == null) { return; }



        sourceNodeModelObject.graphNode.addDataDependency(targetNodeModelObject.graphNode, true, this.dependencyEdgesCounter++, dependencyCreationInfo, destinationNodeDependencyInfo);

    }

    catch(e)

    {

        this.notifyError("Error when handling data dependency established: " + e);

    }

};



DependencyGraph.prototype.handleControlDependencyEstablished = function(sourceNodeModelObject, targetNodeModelObject, dependencyCreationInfo, destinationNodeDependencyInfo)

{

    try

    {

        if(sourceNodeModelObject == null || targetNodeModelObject == null) { return; }



        sourceNodeModelObject.graphNode.addControlDependency

        (

            targetNodeModelObject.graphNode,

            true,

            this.dependencyEdgesCounter++,

            dependencyCreationInfo,

            destinationNodeDependencyInfo

        );

    }

    catch(e)

    {

        this.notifyError("Error when handling data dependency established: " + e);

    }

};



DependencyGraph.prototype.handleControlFlowConnection = function(sourceNode)

{

    sourceNode.hasBeenExecuted = true;

};



DependencyGraph.prototype.handleImportantConstructReached = function(sourceNode)

{

    try

    {

        var dataDependencies = sourceNode.graphNode.dataDependencies;

        this.importantConstructDependencyIndexMapping.push

        (

            {

                codeConstruct: sourceNode,

                dependencyIndex: dataDependencies.length > 0 ? dataDependencies[dataDependencies.length - 1].index : -1

            }

        );

    }

    catch(e){ this.notifyError("Error when handling important construct reached:" + e);}

};



DependencyGraph.prototype.markGraph = function(model)

{

    try

    {

        var importantConstructDependencyIndexMapping = this.importantConstructDependencyIndexMapping;

        var breakContinueMapping = [];

        for(var i = 0, length = importantConstructDependencyIndexMapping.length; i < length; i++)

        {

            var mapping = importantConstructDependencyIndexMapping[i];



            if(ASTHelper.isBreakStatement(mapping.codeConstruct) || ASTHelper.isContinueStatement(mapping.codeConstruct))

            {

                breakContinueMapping.push(mapping);

            }

            else

            {

                this.traverseAndMark(mapping.codeConstruct, mapping.dependencyIndex, null);

            }

        }



        for(var i = 0, length = breakContinueMapping.length; i < length; i++)

        {

            var mapping = breakContinueMapping[i];



            var parent = ASTHelper.isBreakStatement(mapping.codeConstruct) ? ASTHelper.getLoopOrSwitchParent(mapping.codeConstruct)

                                                                           : ASTHelper.getLoopParent(mapping.codeConstruct);



            if(this.inculsionFinder.isIncludedElement(parent))

            {

                this.traverseAndMark(mapping.codeConstruct, mapping.dependencyIndex, null);

            }

        }



        var postProcessor = new Firecrow.DependencyGraph.DependencyPostprocessor();

        postProcessor.processHtmlElement(model);

    }

    catch(e) { this.notifyError("Error occurred when marking graph:" + e);}

};



DependencyGraph.prototype.traverseAndMark = function(codeConstruct, maxDependencyIndex, dependencyConstraint)

{

    try

    {

 /*       if(codeConstruct.nodeId == 630)

        {

            var a = 3;

        }



        if(codeConstruct.loc != null && codeConstruct.loc.start.line == 690)

        {

            var a = 3;

            //console.log("nodeIndex: " + codeConstruct.nodeId + " : edgeIndex" + maxDependencyIndex);

        }*/

        codeConstruct.shouldBeIncluded = true;

        codeConstruct.inclusionDependencyConstraint = dependencyConstraint;



        var potentialDependencyEdges = codeConstruct.graphNode.getDependencies(maxDependencyIndex, dependencyConstraint);



        for(var i = potentialDependencyEdges.length - 1; i >= 0; i--)

        {

            var dependencyEdge = potentialDependencyEdges[i];



            if(dependencyEdge.hasBeenTraversed) { continue; }



            dependencyEdge.hasBeenTraversed = true;



            this.traverseAndMark

            (

                dependencyEdge.destinationNode.model,

                dependencyEdge.index,

                (dependencyConstraint == null || dependencyEdge.destinationNodeDependencyConstraints.currentCommandId < dependencyConstraint.currentCommandId)

                ?  dependencyEdge.destinationNodeDependencyConstraints

                :  dependencyConstraint

            )

        }

    }

    catch(e) { this.notifyError("Error occurred when traversing and marking the graph: " + e);}

};



DependencyGraph.prototype.notifyError = function(message) { alert("DependencyGraph - :" + message);}

}}