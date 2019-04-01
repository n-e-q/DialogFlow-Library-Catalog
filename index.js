/**
 * Example request body:
 * {"responseId":"8bfa7a57-af95-462d-b6f7-759b6edb12db",
 * 	"queryResult":{"queryText":"Where can I find \"White privilege\"?",
 * 		"parameters":{"booktitle":"\"White privilege\"?","catalog_service":"where"},
 * 		"allRequiredParamsPresent":true,
 * 		"fulfillmentText":"You done goofed",
 * 		"fulfillmentMessages":[{"text":{"text":["You done goofed"]}}],
 * 		"intent":{"name":"projects/devhubsquad/agent/intents/fc46da4c-7fee-426c-bd53-5c1b67f127d7","displayName":"library_catalog"},
 * 		"intentDetectionConfidence":1,
 * 		"languageCode":"en",
 * 		"sentimentAnalysisResult":{
 * 			"queryTextSentiment":{"score":-0.1,"magnitude":0.1}}},
 * 	"originalDetectIntentRequest":{"payload":{}},"session":"projects/devhubsquad/agent/sessions/c30007ed-5f78-52ed-1bdb-a09533cfed3c"}
 */
/*const hour_url = 'https://api.devhub.virginia.edu/v1/library/hours';
const catalog_url = 'https://api.devhub.virginia.edu/v1/library/catalog/';

function catalog(agent) {
    console.log("Inside catalog function");
    return rp.get(catalog_url)
		.then(jsonBody => {
			var body = JSON.parse(jsonBody);
			var rbody = request.body;
			// Location service
			if(body.queryResult.parameters.catalog_service == "where"){
					
			}
			
			// Author service
			if(body.queryResult.parameters.catalog_service == "who"){
				
			}
			
			// Description service
			if(body.queryResult.parameters.catalog_service == "where"){
				
			}
			
			agent.add("catalog is wip...");
      		return Promise.resolve(agent);
		});
  }

function hours(agent) {
    return rp.get(hour_url)
        .then(jsonBody => {
            var body = JSON.parse(jsonBody);
      		var rbody = request.body;
      		var date = rbody.queryResult.parameters.date.substring(0,10);
      		var time = body["2090"][date].rendered;
      		console.log(date);
            agent.add(time);
            return Promise.resolve(agent);
        });
  }*/
const rp = require('request-promise-native');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const fetch = require('isomorphic-fetch');
const hour_url = 'https://api.devhub.virginia.edu/v1/library/hours';
const catalog_url = 'https://api.devhub.virginia.edu/v1/library/catalog/';

function test(agent, requestBody, url){
	
	return rp.get(url)
		.then(jsonBody => {
			var body = JSON.parse(jsonBody);
			console.log(body);
			var docArray = body.response.docs;
			//var rbody = request.body;
			// Location service
			/*if(requestBody.queryResult.parameters.catalog_service == "where"){
				console.log("where...");
			}
			
			// Author service
			if(requestBody.queryResult.parameters.catalog_service == "who"){
				console.log("who");
			}
			
			// Description service
			if(requestBody.queryResult.parameters.catalog_service == "describe"){
				console.log("description")
			}*/
			
			if(docArray.length > 1)
				agent.add("There are at least " + docArray.length + " instances of this item. Here are the most relevant ones:\n");
			
			var result = "";
			var no = 1;
			var promises = [];
			var avail_data = [];
			
			for(var i = 0; i < docArray.length; i++){
				//result = "" + no + ". '" + docArray[i].title_display;
				var item_title = "" + docArray[i].title_display;
				if(typeof docArray[i].subtitle_display != 'undefined')
					result = ("" + docArray[i].subtitle_display);
				else
					result = "";
				//result += "'";
				result += " [" + docArray[i].format_facet + "]";
				if(typeof docArray[i].author_display != 'undefined')
					result += (" -- " + docArray[i].author_display);
				result += "\n";
				
				let card = new Card({
					title: "this is a title",
					text: "this is text"
				});
				agent.add(card);
				
				no++;
				
				var avail_url = "http://search.lib.virginia.edu/catalog/";
				avail_url += docArray[i].id;
				avail_url += "/availability.json";
				//promises.append(promiseRequest(avail_url));
				//promiseRequest(agent,avail_url);
				//console.log(avail_url);
				
				let p = fetch(avail_url)
		        	.then(res=>{return res.json()})
		        	.then(avaData=>{avail_data.push(avaData)});
				
		      promises.push(p);
			}
			Promise.all(promises).then(notneeded => {
			
					for(var j = 0; j < avail_data.length; j++){
						console.log(avail_data[j]);
					}
			
					return Promise.resolve(agent);
			});
		});
}

module.exports = {
		test: test
}

/*
	var url = "http://search.lib.virginia.edu/catalog?q=";
	var bookQuery = $booktitle.replace(/ /g, +);
	url += bookQuery;
	url += "&catalog_select=all";


*/