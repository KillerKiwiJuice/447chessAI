function engineGame() {
	var move = 0;
	var engineStatus = {};
	console.log("Running stockfish.js");
    // var game = engineGame({book: 'book.bin'});
    var engine = new Worker('stockfish.js');
    console.log("A");
    function prepareMove() {
        var moves = '';
        var history = game.history({verbose: true});
        for(var i = 0; i < history.length; ++i) {
            var moveW = history[i];
            moves += ' ' + moveW.from + moveW.to + (moveW.promotion ? moveW.promotion : '');
        }
    }
    console.log("B");
    engine.onmessage = function(event) {
	    var line = event.data;
        if(line == 'uciok') {
            engineStatus.engineLoaded = true;
        } else if(line == 'readyok') {
            engineStatus.engineReady = true;
        } else {
	        //console.log("BA");
	        console.log("line:", line);
	        var match = line.match(/^bestmove ([a-h][1-8])([a-h][1-8])([qrbk])?/);
	        console.log(match);
	        if(match) {
	            move = ({from: match[1], to: match[2], promotion: match[3]});
	            console.log(move.toString());
	            game.move(move);
	            prepareMove();
	        }
			else if(match = line.match(/^info .*\bdepth (\d+) .*\bnps (\d+)/)) {
	                engineStatus.search = 'Depth: ' + match[1] + ' Nps: ' + match[2];
	        }
    	}
    };
    engine.onmessageerror = function() { console.log("unkown error"); };
    function uciCmd(cmd) {
        engine.postMessage(cmd);
    }
    uciCmd('uci');
    console.log("C");
    var bookRequest = new XMLHttpRequest();
    //console.log(bookRequest.status);
    bookRequest.open('GET', 'book.bin', true);
    //console.log(bookRequest.status);
    bookRequest.responseType = "arraybuffer";
    //console.log(bookRequest.status);
    bookRequest.onload = function(event) {
    	//console.log(bookRequest.status);
        //console.log("loaded book");
        engine.postMessage({book: bookRequest.response});
        //console.log("sent book");
        //console.log(bookRequest.response);
    };
    bookRequest.send(null);
    return {
    	start: function () {
    		uciCmd('ucinewgame');
            uciCmd('isready');
            prepareMove();
    	},
    	move: function() {
    		return move;
    	}
    }
}

// Computer makes a move with algorithm choice and skill/depth level
var makeMove = function(algo, skill=3) {
  // exit if the game is over
  if (game.game_over() === true) {
    console.log('game over');
    return;
  }
  // Calculate the best move, using chosen algorithm
  var move = null;
  if (algo === 1) {
    move = randomMove();
      // Make the calculated move
  game.move(move);
  } else if (algo === 2) {
    move = calcBestMoveOne(game.turn());
      // Make the calculated move
  game.move(move);
  } else if (algo === 3) {
    move = calcBestMoveNoAB(skill, game, game.turn())[1];
      // Make the calculated move
  game.move(move);
  } else if (algo === 4) {
    move = calcBestMove(skill, game, game.turn())[1];
	  // Make the calculated move
	  game.move(move);
  }
  else if (algo === 5) {
  	var AI = engineGame();
  	AI.start();
  	//move = AI.move();
  }
  else {
    console.log("Uknown algorithm.");
  }
  // Update board positions
  board.position(game.fen());
}

// Computer vs Computer
var playGame = function(algo=4, skillW=2, skillB=2) {
  console.log("AAAAAA");
  if (game.game_over() === true) {
    console.log('game over');
    return;
  }
  var skill = game.turn() === 'w' ? skillW : skillB;
  makeMove(algo, skill);
  window.setTimeout(function() {
    playGame(algo, skillW, skillB);
  }, 250);
};

// Handles what to do after human makes move.
// Computer automatically makes next move
var onDrop = function(source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  });

  // If illegal move, snapback
  if (move === null) return 'snapback';

  // Log the move
  console.log(move)
  // make move for black
  window.setTimeout(function() {
    makeMove(5, 3);
  }, 250);
};
