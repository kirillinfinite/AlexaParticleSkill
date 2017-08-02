/* Particle.io access token */

var deviceId = "yourParticleDeviceID"; //replace
var accessToken = "yourParticleAccessToken";  //replace

/* Particle.io cloud function */
var cloudName = "toggle"; //replace

/* Alexa skill / invocation name */
var skillName = "Bar Light";  //replace
var invocationName = "Particle";  //replace

/* App ID for the skill  */
var APP_ID = 'replaceMe'; //replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]"; or undefined

/**
 * The AlexaSkill prototype and helper functions
 * Particle is a child of AlexaSkill.
 */
var http = require('https');
var AlexaSkill = require('./AlexaSkill');
var Particle = function () {
  AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
Particle.prototype = Object.create(AlexaSkill.prototype);
Particle.prototype.constructor = Particle;

Particle.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
  console.log(invocationName + "onSessionStarted requestId: " + sessionStartedRequest.requestId
         + ", sessionId: " + session.sessionId);
     // any initialization logic goes here
};

Particle.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
  console.log(invocationName + " onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
  var speechOutput = "I can control your " + skillName + ", you can tell me to turn on or off";
  var repromptText = "You can tell me to turn on or off";
  response.ask(speechOutput, repromptText);
};

Particle.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
  console.log(skillName + " onSessionEnded requestId: " + sessionEndedRequest.requestId
           + ", sessionId: " + session.sessionId);

};

Particle.prototype.intentHandlers = {
  // Register custom intent handlers.
  "ParticleIntent": function (intent, session, response) {
    var requestURI = "/v1/devices/" + deviceId + "/" + cloudName;

 		var commandSlot = intent.slots.command;
 		var command = commandSlot ? intent.slots.command.value : "";
 		var speakText = "";

    console.log("Command = " + command);

 	// Verify that a command was specified.
    // We can extend this to prompt the user,
    // but let's keep this simple for now.
 		if(command.length > 0){

      var postData = "args=" + 'on';
      console.log("Post data = " + postData);

 		  makeParticleRequest(requestURI, postData, function(resp){
 		    var json = JSON.parse(resp);
 		    console.log(command + ": " + json.return_value);
 		    response.tellWithCard("Ok, bar light is now " + command);
 	    });
 		} else {
 			response.tell("I don't know whether to turn thing on or off.");
 		}
  }, // ParticleIntent

  "AMAZON.HelpIntent": function (intent, session, response) {
    response.ask("You can tell " + invocationName + " to turn on or off.");
  } // HelpIntent
};

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
  var particleSkill = new Particle();
  particleSkill.execute(event, context);
};

function makeParticleRequest(requestURI, postData, callback){
 	var options = {
 		hostname: "api.particle.io",
 		port: 443,
 		path: requestURI,
 		method: 'POST',
 		headers: {
 			'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Bearer ' + accessToken,
 			'Accept': '*.*'
 		}
 	};

 	var req = http.request(options, function(res) {
 		console.log('STATUS: ' + res.statusCode);
 		console.log('HEADERS: ' + JSON.stringify(res.headers));

 		var body = "";

 		res.setEncoding('utf8');
 		res.on('data', function (chunk) {
 			console.log('BODY: ' + chunk);
 			body += chunk;
 		});

 		res.on('end', function () {
       callback(body);
    });
 	});

 	req.on('error', function(e) {
 		console.log('problem with request: ' + e.message);
 	});

 	// write data to request body
 	req.write(postData.toString());
 	req.end();
}
