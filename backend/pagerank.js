"use strict";

/*
    PAGERANK ALGORITHM IMPLEMENTATION BY STEPHEN MACNEIL
    https://github.com/stevemacn/PageRank
    https://raw.githubusercontent.com/stevemacn/PageRank/master/lib/pagerank.js
    MODIFIED FOR ES6, PROMISES (REPLACING CALLBACKS), AND FUNCTIONAL PROGRAMMING

    NONE OF THIS CODE BELONGS TO US
*/

// pagerank.js 0.0.1

//Use a random surfer algorithm to determine the relative 
//rank of nodes. The importance of each node is determined
//by the number of incoming links as well as the importance 
//of those incoming links. 

// Expose
// ----------

//Expose our library to be called externally
export default async function (nodeMatrix, linkProb, tolerance, debug) {
    if (!nodeMatrix || !linkProb || !tolerance) {
        throw new Error("Provide 3 arguments: "+
            "nodeMatrix, link probability, tolerance");
    }
    //If debug is unset set it to false
    if (!debug) { 
        debug=false;
    }
    // return Promise.resolve(true)
    return await Pagerank(nodeMatrix, linkProb, tolerance, debug);
};

// Initialize
// ----------
async function Pagerank(nodeMatrix, linkProb, tolerance, debug) {
    const rankInfo = {}

    //**OutgoingNodes:** represents an array of nodes. Each node in this 
    //array contains an array of nodes to which the corresponding node has
    //outgoing links.
    rankInfo.outgoingNodes = nodeMatrix;
    //**LinkProb:** a value ??
    rankInfo.linkProb = linkProb;
    //**Tolerance:** the point at which a solution is deemed optimal. 
    //Higher values are more accurate, lower values are faster to computer. 
    rankInfo.tolerance = tolerance;

    //Number of outgoing nodes
    rankInfo.pageCount = Object.keys(rankInfo.outgoingNodes).length;
    //**Coeff:** coefficient for the likelihood that a page will be visited.
    rankInfo.coeff = (1-linkProb)/rankInfo.pageCount;
    
    rankInfo.probabilityNodes = !(nodeMatrix instanceof Array) ? {} : [];
    rankInfo.incomingNodes = !(nodeMatrix instanceof Array) ? {} : [];
    rankInfo.debug=debug;
    
    return await startRanking(rankInfo);
}

//Start ranking 
// ----------
const startRanking = async (rankInfo) => {

    //we initialize all of our probabilities
    var initialProbability = 1/rankInfo.pageCount, 
        outgoingNodes = rankInfo.outgoingNodes, i, a, index;
    
    //rearray the graph and generate initial probability
    for (i in outgoingNodes) {
        rankInfo.probabilityNodes[i]=initialProbability;
        for (a in outgoingNodes[i]) {
            index = outgoingNodes[i][a];
            if (!rankInfo.incomingNodes[index]) {
                rankInfo.incomingNodes[index]=[]; 
            }
            rankInfo.incomingNodes[index].push(i);
        }
    }

    //if debug is set, print each iteration
    if (rankInfo.debug) reportDebug(1)
    
    return await iterate(1, rankInfo);
};

//Log iteration to console 
// ----------
const reportDebug = (count, rankInfo) => {
    console.log("____ITERATION "+count+"____");
    console.log("Pages: " + Object.keys(rankInfo.outgoingNodes).length);
    console.log("outgoing %j", rankInfo.outgoingNodes);
    console.log("incoming %j",rankInfo.incomingNodes);
    console.log("probability %j",rankInfo.probabilityNodes);
};


//Calculate new weights 
// ----------
const iterate = async (count, rankInfo) => {
    var result = [];
    var resultHash={};
    var prob, ct, b, a, sum, res, max, min;

    //For each node, we look at the incoming edges and 
    //the weight of the node connected via each edge. 
    //This weight is divided by the total number of 
    //outgoing edges from each weighted node and summed to 
    //determine the new weight of the original node.
    for (b in rankInfo.probabilityNodes) {
        sum = 0;
        if( rankInfo.incomingNodes[b] ) {
            for ( a=0; a<rankInfo.incomingNodes[b].length; a++) {
                prob = rankInfo.probabilityNodes[ rankInfo.incomingNodes[b][a] ];
                ct = rankInfo.outgoingNodes[ rankInfo.incomingNodes[b][a] ].length;
                sum += (prob/ct) ;
            }
        }

        //determine if the new probability is within tolerance.
        res = rankInfo.coeff+rankInfo.linkProb*sum;
        max = rankInfo.probabilityNodes[b]+rankInfo.tolerance;
        min = rankInfo.probabilityNodes[b]-rankInfo.tolerance;   

        //if the result has changed push that result
        if (min <= res && res<= max) {
            resultHash[b]=res;
            result.push(res);
        }
    
        //update the probability for node *b*
        rankInfo.probabilityNodes[b]=res;
    }

    //When we have all results (no weights are changing) we return via callback
    if (result.length == rankInfo.pageCount) {
        if( !(rankInfo.outgoingNodes instanceof Array)) {
            return Promise.resolve(resultHash)
        }
        return Promise.resolve(result)
    }
    
    //if debug is set, print each iteration
    if (rankInfo.debug) {
        reportDebug(count); 
    }
    
    ++count;
    return await iterate(count, rankInfo);
};