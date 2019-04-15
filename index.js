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

'use strict';
const functions = require('firebase-functions');
const {WebhookClient, Card, Suggestion} = require('dialogflow-fulfillment');
const rp = require('request-promise-native');
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
				result = "" + no + ". '" + docArray[i].title_display;
				var item_title = "" + docArray[i].title_display;
				if(typeof docArray[i].subtitle_display != 'undefined')
					result = ("" + docArray[i].subtitle_display);
				else
					result += "'";
				
				result += " [" + docArray[i].format_facet + "]";
				if(typeof docArray[i].author_display != 'undefined')
					result += (" -- " + docArray[i].author_display);
				result += "\n";
				
				no++;
				agent.add(result);
				
				var avail_url = "http://search.lib.virginia.edu/catalog/";
				avail_url += docArray[i].id;
				avail_url += "/availability.json";
				
				let p = fetch(avail_url)
		        	.then(res=>{return res.json()})
		        	.then(avaData=>{avail_data.push(avaData)});
				
				promises.push(p);
			}
			Promise.all(promises).then(notneeded => {
			
					for(var j = 0; j < avail_data.length; j++){
						console.log(avail_data[j]);
					}
					
					// Card test
					/*agent.add('3. This message is from Dialogflow\'s Cloud Functions for Firebase editor!');
				    agent.add(new Card({
				        title: 'Title: this is a card title',
				        imageUrl: 'https://developers.google.com/actions/assistant.png',
				        text: 'This is the body text of a card.  You can even use line\n  breaks and emoji! 💁',
				        buttonText: 'This is a button',
				        buttonUrl: 'https://assistant.google.com/'
				      })
				    );
				    agent.add(new Suggestion('Quick Reply'));
				    agent.add(new Suggestion('Suggestion'));*/
					
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