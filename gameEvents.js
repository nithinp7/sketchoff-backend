
// creates closure over returned object so that 'socket'
// is in scope

var request = require('request');

function doRequest(sketch, cb) {
    var options = {
        method: 'post',
        body: {data: sketch},
        json: true,
        url: 'http://ml.sketchoff.net/eval'
    };

    request.post(options, function (err, res, body) {
        //console.log('error:', err); // Print the error if one occurred
        //console.log('statusCode:', res && res.statusCode); // Print the response status code if a response was received
        //console.log('body:', body); // Print the HTML for the Google homepage.
        cb(body);
    });
}

function check(game) {
    if(game.scoreA !== undefined && game.scoreB !== undefined) {
        setTimeout(function() {
            game.emit({
                name: 'results',
                players: [{name: game.playerA.username, score: game.scoreA, sketch: game.sketchA},
                    {name: game.playerB.username, score: game.scoreB, sketch: game.sketchB}]
            })
        }, 100);
    }
}

module.exports = function(socket, game) { return {
	sketchUpload: function(data) {
		if(socket === game.playerA) {
			game.sketchA = data.sketch;
			doRequest(data.sketch, function(score) {
			    game.scoreA = parseInt(score);
			    check(game);
            });
		} else if(socket === game.playerB) {
		    game.sketchB = data.sketch;
            doRequest(data.sketch, function(score) {
                game.scoreB = parseInt(score);
                check(game);
            });
		}
	}
} };