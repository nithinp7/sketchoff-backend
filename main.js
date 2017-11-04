console.log('Sketch Off Server running...')

const app = require('express')(),
	  http = require('http'),
	  events = require('./gameEvents.js'),
	  httpServer = http.createServer(function(req, res) {}),
	  io = require('socket.io').listen(httpServer),
	  acceptedSockets = []
	  freeOponents = []
	  topics = []

httpServer.listen(8080)

io.sockets.on('connection', function(socket) {
	socket.on('requestUsername', function requestUsername(data) {
		name = data.username
		if(name === undefined || name === null || accepted_sockets.includes(name)) {
			emit(socket, {name: 'usernameDenied'})
		} else {
			socket.username = name
			accepted_sockets.push(socket)
			socket.on('disconnect', function(data) {
				accepted_sockets.splice(accepted_sockets.indexOf(socket), 1)
				freeOpIndx = freeOponents.indexOf(socket)
				if(freeOpIndx > -1) {
					freeOponents.splice(freeOpIndx, 1)
				}
			})
			emit(socket, {name: 'usernameAccepted'})
			if(freeOponents.length > 0) {
				createGame(socket, freeOponents.pop())
			} else {
				freeOponents.splice(0, 0, socket)
			}
		}
	})
})

function createGame(socketA, socketB) {
	game = {
		playerA: socketA, 
		playerB: socketB, 
		topic: topics[Math.floor(Math.random()*items.length)]
		emit: function(data) {
			emit(socketA, data)
			emit(socketB, data)
		},
		removeAllListeners: function(msg) {
			socketA.removeAllListeners(msg)
			socketB.removeAllListeners(msg)
		}
	}

	emit(socketA, {name: 'opponentFound', opponent: socketB.username})
	emit(socketB, {name: 'opponentFound', opponent: socketA.username})

	game.emit('topic', {topic: game.topic})

	setTimeout(function() {
		game.emit({name: 'start'})

		socketA.on('sketchUpload', events(socketA, game).sketchUpload)
		socketB.on('sketchUpload', events(socketB, game).sketchUpload)

		setTimeout(function() {
			game.emit({name: 'end'})

			setTimeout(function() {
				game.removeAllListeners('sketchUpload')
			}, 5000)
		}, 10000)
	}, 5000)
}

function emit(socket, data) {
	socket.emit('packet', data)
}



 