
// 1. Text strings =====================================================================================================
//    Modify these strings and messages to change the behavior of your Lambda function

const languageStrings = {
    'en': {
        'translation': {
            'WELCOME' : "Hey, Welcome to talk about Beer!",
            'HELP'    : "This skill will give a small description on your favourite beer. Try, tell me about <break time=\"1s\"/> followed by your favourite beer!",
            'STOP'    : "Okay, see you next time!"
        }
    }
    // , 'de-DE': { 'translation' : { 'TITLE'   : "Local Helfer etc." } }
};

const SKILL_NAME = "Talk about beer";

// Weather courtesy of the Yahoo Weather API.
// This free API recommends no more than 2000 calls per day

myAPI = {
    host: 'api.brewerydb.com',
    port: 443,
    path: ``,
    method: 'GET'
};
// 2. Skill Code =======================================================================================================

const Alexa = require('alexa-sdk');

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);

    // alexa.appId = 'amzn1.echo-sdk-ams.app.1234';
    ///alexa.dynamoDBTableName = 'YourTableName'; // creates new table for session.attributes
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

const handlers = {
    'LaunchRequest': function () {
        var say = this.t('WELCOME') + ' ' + this.t('HELP');
        this.response.speak(say).listen(say);
        this.emit(':responseReady');
    },

    'TalkIntent': function () {
      if (this.event.request.intent.slots.beerName.value) {
          beerName = this.event.request.intent.slots.beerName.value;
      }else{
          beerName = 'bulmers';
      }
      getBeerDescription( beerName, (description ) => {

          var say = '<say-as interpret-as="interjection">all righty</say-as> <break time=\"1s\"/> Here you go <break time=\"1s\"/>'
              + description;
          this.response.speak(say);
          this.emit(':responseReady');

      });
    },

    'AMAZON.NoIntent': function () {
        this.emit('AMAZON.StopIntent');
    },
    'AMAZON.HelpIntent': function () {
        this.response.speak(this.t('HELP')).listen(this.t('HELP'));
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(this.t('STOP'));
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest': function () {
        this.response.speak(this.t('STOP'));
        this.emit(':responseReady');
    }
};

function getBeerDescription(beerName, callback) {
    var https = require('https');

    myAPI.path = '/v2/search?type=beer&key=e27da46afc5b0482969f19a77cbe6855&q='.concat(beerName);
    console.log(myAPI.path);

    var req = https.request(myAPI, res => {
        res.setEncoding('utf8');
        var returnData = "";

        res.on('data', chunk => {
            returnData = returnData + chunk;
        });
        res.on('end', () => {
            var description = JSON.parse(returnData).data[0].description;

            callback(description);

        });

    });
    req.end();
}
