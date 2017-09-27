var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var request = require('request');
var util = require('util');
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});
bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];

        args = args.splice(1);

        switch(cmd) {
            // !ping
            case 'frames':
                var charName = args[0];
                var moveName = "";
                for (var i = 1; i < args.length; i++)
                {
                  moveName += args[i];
                  if (i != args.length - 1)
                    moveName += " ";
                }
                var lastMoveNameChar = moveName[moveName.length-1];
                if (lastMoveNameChar >= '0' && lastMoveNameChar <= '9')
                {
                  moveName = moveName.substring(0,moveName.length-1) + " " + lastMoveNameChar;
                }
                request(util.format('http://api.kuroganehammer.com/api/characters/name/%s/moves', charName), function (error, response, body) {
                    parsedBody = JSON.parse(body)
                    for (var moveIndex in parsedBody)
                    {
                        //console.log(parsedBody[moveIndex].name);
                        var currMove = parsedBody[moveIndex];
                        var currMoveName = currMove.name;
                        var currMoveNameLower = currMoveName.toLowerCase();
                        var currMoveName = currMove.name;
                        if (currMoveNameLower.startsWith(moveName.toLowerCase()))
                        {
                          var output = util.format("%s %s:\n", charName, currMoveName);
                          output += util.format("Hitbox Active: %s\n", currMove.hitboxActive);
                          output += util.format("FAF: %s\n", currMove.firstActionableFrame);
                          var baseDamage = currMove.baseDamage;
                          baseDamage = baseDamage.replace(/&#215;/g, "x");
                          output += util.format("Base Damage: %s", baseDamage);
                          if (currMove.landingLag != "")
                          {
                            output += util.format("\nLanding Lag: %s\n", currMove.landingLag);
                            var autoCancelWindow = currMove.autoCancel;
                            autoCancelWindow = autoCancelWindow.replace(/&gt;/g, ">");
                            autoCancelWindow = autoCancelWindow.replace(/&lt;/g, "<");
                            output += util.format("Autocancel Window: %s", autoCancelWindow);
                          }
                          bot.sendMessage({
                              to: channelID,
                              message: output
                          });
                        }
                    }
                });
                break;
            case 'helpframes':
                bot.sendMessage({
                    to: channelID,
                    message: "Type \"!frames characterName moveName\" to get its frame data."
                });
                break;
            // Just add any case commands if you want to..
         }
     }
});
