
// creates closure over returned object so that 'socket'
// is in scope

module.exports = function(socket, game) { return {

	sketchUpload: function(data) {
		
		if(socket === game.playerA) {
			game.sketchA = data.sketch
			game.scoreA = 0 //TODO: retrieve score from neural net backend 
		} else if(socket === game.playerB) {
			game.sketchB = data.sketch
			game.scoreB = 0 //TODO: retrieve score from neural net backend 
		}

		if(game.scoreA !== undefined && game.scoreB !== undefined) {
			game.emit({
				name: 'scores'
				players: [{name: game.playerA.username, score: game.scoreA, sketch: game.sketchA},
						  {name: game.playerB.username, score: game.scoreB, sketch: game.sketchB}]
			})
		}
	}
} }