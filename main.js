console.log('Sketch Off Server running...');

const http = require('http'),
	  events = require('./gameEvents.js'),
	  httpServer = http.createServer(function(req, res) {}),
	  io = require('socket.io').listen(httpServer),
	  acceptedSockets = [],
	  freeOpponents = [],
	  topics = ['car'];

httpServer.listen(8080);

io.sockets.on('connection', function(socket) {
	socket.on('username', function requestUsername(data) {
        socket.username = data.username;
        acceptedSockets.push(socket);
        socket.on('disconnect', function() {
            acceptedSockets.splice(acceptedSockets.indexOf(socket), 1);
            var freeOpIndx = freeOpponents.indexOf(socket);
            if(freeOpIndx > -1) {
                freeOpponents.splice(freeOpIndx, 1)
            }
        });
        emit(socket, {name: 'usernameAccepted'});
        if(freeOpponents.length > 0) {
            createGame(socket, freeOpponents.pop())
        } else {
            freeOpponents.splice(0, 0, socket)
        }
	})
});

function createGame(socketA, socketB) {
	var game = {
		playerA: socketA, 
		playerB: socketB, 
		topic: topics[Math.floor(Math.random()*topics.length)],
		emit: function(data) {
			emit(socketA, data);
			emit(socketB, data)
		},
		removeAllListeners: function(msg) {
			socketA.removeAllListeners(msg);
			socketB.removeAllListeners(msg)
		}
	};

	setTimeout(function() {
        emit(socketA, {name: 'match', opponent: socketB.username});
        emit(socketB, {name: 'match', opponent: socketA.username});

        setTimeout(function() {
            game.emit({name: 'topic', topic: game.topic});

            setTimeout(function() {
                game.emit({name: 'start'});

                socketA.on('drawing', events(socketA, game).sketchUpload);
                socketB.on('drawing', events(socketB, game).sketchUpload);

                setTimeout(function() {
                    game.emit({name: 'end'});

                    setTimeout(function() {
                        game.removeAllListeners('drawing')
                    }, 5000)
                }, 10000)
            }, 5000)
		}, 5000)
	}, 100)
}

function emit(socket, data) {
	socket.emit('packet', data)
}



 