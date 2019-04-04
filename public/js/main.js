// Computer makes a move with algorithm choice and skill/depth level
var makeMove = function(algo, skill=3, options) {
  // exit if the game is over
  if (game.game_over() === true) {
    console.log('game over');
    return;
  }
  // Calculate the best move, using chosen algorithm
  var move = null;
  if (algo === 1) {
    move = randomMove();
  } else if (algo === 2) {
    move = calcBestMoveOne(game.turn());
  } else if (algo === 3) {
    move = calcBestMoveNoAB(skill, game, game.turn())[1];
  } else if (algo === 4) {
    move = calcBestMove(skill, game, game.turn())[1];
  }
  else if (algo === 5) {
    console.log("Running stockfish.js");
    // var game = engineGame({book: 'book.bin'});
    options = options || {}
    var engine = new Worker(options.stockfishjs || './stockfish.js');
    function uciCmd(cmd) {
        engine.postMessage(cmd);
    }
    uciCmd('uci');
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
        console.log("BA");
        var line = event.data;
        console.log("line:" + line);
        var match = line.match(/^bestmove ([a-h][1-8])([a-h][1-8])([qrbk])?/);
        if(match) {
            move = ({from: match[1], to: match[2], promotion: match[3]});
            //prepareMove();
        }
    };
    console.log("C");
    if(options.book) {
        //bookRequest.open('GET', options.book, true);
        //https://github.com/bjedrzejewski/stockfish-js/blob/master/example/book.bin
        var reader = new FileReader();

        reader.onload = function(e) {
          var rawData = reader.result;
          engine.postMessage({book: reader.result});
        }
        reader.readAsBinaryString('book.bin');

        // bookRequest.open('GET', './book.bin', true);
        // bookRequest.responseType = "arraybuffer";
        // console.log("CAC");
        // bookRequest.onload = function(event) {
        //     console.log("CB");
        //     engine.postMessage({book: bookRequest.response});
        //     console.log("CC");
        // };
        // bookRequest.send(null);
    }
    console.log("D");
    console.log(move.toString());
  }
  else {
    console.log("Uknown algorithm.");
  }
  // Make the calculated move
  game.move(move);
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
  makeMove(algo, skill, {book: 'book.bin'});
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
    makeMove(5, 3, {book: 'book.bin'});
  }, 250);
};
