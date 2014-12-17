// Server Variable
var io;
// Socket Variable
var gameSocket;
// URL Variable
var url;
// hostID Variable
var hostSocketId;
// Spieler Array mit gameId, mySocketId, y und x position. 
var playerArray  = new Array();

// initGame wird von app.js aus aufgerufen.
exports.initGame = function(sio, socket){
        io = sio;
        gameSocket = socket;
        // Socket versendet die Nachricht 'verbunden' und sendet msg.  
        gameSocket.emit('verbunden', { message: "          ---->   Du bist verbunden!" });
        // HOST 
        // hört auf Nachricht 'hostCreateNewGame' und ruft die Funktion hostCreateNewGame() auf.
        gameSocket.on('hostCreateNewGame', hostCreateNewGame);
        // SPIELER
        gameSocket.on('playerJoinGame',playerJoinGame);
        gameSocket.on('anmelden', onAnmelden);
        gameSocket.on('gameOver', playerWon);
        gameSocket.on('disconnected', disconnect);
        // Steuerung 
        gameSocket.on('links', links);
        gameSocket.on('rechts', rechts);
        gameSocket.on('hoch', hoch);
        gameSocket.on('runter', runter);
};

// url wird von app.js aus aufgerufen und bekommt die localhosturl samt port 
exports.url = function(lhurl){
        // lokalhost url wird in globale url variable gespeichert
        url = lhurl;
        // bei empfang der Nachricht 'getURL' wird die Funktion sendURL() aufgerufen
        gameSocket.on('getURL', sendURL);
        //url.toString();
};

// sendURL übermittelt die Nachtricht "sendURL" mit dem Inhalt der url
function sendURL(){
        gameSocket.emit('sendURL', url);

};

// HOST

// hostCreateNewGame wird vie "gameSocket.on('hostCreateNewGame', hostCreateNewGame);" aufgerufen
function hostCreateNewGame() {
        // Erstellt neuen Socket.IO Room
        var thisGameId = ( Math.random() * 10000 ) | 0;

        // Übermittelt die Nachticht 'newGameCreated'. 
        // Returnt die RommID (gameId) und die socket ID (mySocketId) dem browser client
        this.emit('newGameCreated', {gameId: thisGameId, mySocketId: this.id});

        // Join the Room and wait for the players
        this.join(thisGameId.toString());
        // Zum direkten emitten gedacht
        hostSocketId = this.id;
};

// Spieler

// wird bei Empfangener Nachtricht 'playerJoinGame' ausgeführt.
function playerJoinGame(data) {
        //console.log('Player ' + data.playerName + ' attempting to join game: ' + data.gameId );
        // Referenz auf Spieler Socket.IO socket object
        var sock = this;
         // die room ID wird vom Socket.IO manager ObjeKt genommen.
        var room = gameSocket.manager.rooms["/" + data.gameId];

        // Wenn der Raum existiert...
        if( room != undefined ){
                // socketId wird in data gespeichert
                data.mySocketId = sock.id;


                // der Spieler "betritt" den Raum (gameId) den er angegeben hat
                sock.join(data.gameId);

                //console.log('Player ' + data.playerName + ' joining game: ' + data.gameId );

                // Emit an event notifying the clients that the player has joined the room.
                io.sockets.in(data.gameId).emit('playerJoinedRoom', data);
                playerArray.push(data);
                

        } else {
                // Else --> Fehlermeldung
                this.emit('error',{message: "Diesen Raum gibt es nicht."} );
        }
};

function playerWon(data){
        // wird für alle extra emittet - Host, Verlierer und Gewinner
        gameSocket.broadcast.emit('playerWon', data);
        gameSocket.emit('playerWon', data);
};


// SPIEL STEUERUNG
function links(data){
        for (var j = 0; j < playerArray.length; j++) {
                    if (playerArray[j].mySocketId == data) {
                            playerArray[j].bootArraybild++;
                            if(playerArray[j].bootArraybild > 3){
                                    playerArray[j].bootArraybild = 0;
                            }
                             // abgrenzung wo der Ruderer in x richtung hinfahren kann
                            if(playerArray[j].xpos == 80 && playerArray[j].ypos < 75 || 
                               playerArray[j].xpos == 155 && playerArray[j].ypos > 15 ||
                               playerArray[j].xpos == 230 && playerArray[j].ypos < 50 ||
                               playerArray[j].xpos == 230 && playerArray[j].ypos > 55 ){
                                    playerArray[j].xpos = playerArray[j].xpos;
                            }
                            else if(playerArray[j].xpos > 0){
                                    playerArray[j].xpos = playerArray[j].xpos - 5;
                            }
                    };
        };
        
                gameSocket.broadcast.emit('moveGedrückt', playerArray);
};

function rechts(data){
        for (var j = 0; j < playerArray.length; j++) {
                    if (playerArray[j].mySocketId == data) {
                            playerArray[j].bootArraybild++;
                            if(playerArray[j].bootArraybild > 3){
                                    playerArray[j].bootArraybild = 0;
                            }
                            // abgrenzung wo der Ruderer in x richtung hinfahren kann
                            if(playerArray[j].xpos == 50 & playerArray[j].ypos < 75 || 
                               playerArray[j].xpos == 125 & playerArray[j].ypos > 15 ||
                               playerArray[j].xpos == 200 & playerArray[j].ypos < 50 ||
                               playerArray[j].xpos == 200 & playerArray[j].ypos > 55 ){
                                    playerArray[j].xpos = playerArray[j].xpos;
                            }
                            else if(playerArray[j].xpos < 280){
                                    playerArray[j].xpos = playerArray[j].xpos + 5;
                            }
                    };
        };
        gameSocket.broadcast.emit('moveGedrückt', playerArray);   
};

function hoch(data){
        for (var j = 0; j < playerArray.length; j++) {
                    if (playerArray[j].mySocketId == data) {
                            playerArray[j].bootArraybild++;
                            if(playerArray[j].bootArraybild > 3){
                                    playerArray[j].bootArraybild = 0;
                            }
                            if((playerArray[j].xpos > 50 && playerArray[j].xpos < 80 && playerArray[j].ypos == 75) ||
                               (playerArray[j].xpos > 200 && playerArray[j].xpos < 230 && playerArray[j].ypos == 50)){
                                    playerArray[j].xpos = playerArray[j].xpos;
                            }
                            else if (playerArray[j].ypos > 0){
                                    playerArray[j].ypos = playerArray[j].ypos - 5;
                            };
                    };
        
        };
        gameSocket.broadcast.emit('moveGedrückt', playerArray);
};

function runter(data){
        for (var j = 0; j < playerArray.length; j++) {
                    if (playerArray[j].mySocketId == data) {
                        playerArray[j].bootArraybild++;
                            if(playerArray[j].bootArraybild > 3){
                                    playerArray[j].bootArraybild = 0;
                            }
                            if((playerArray[j].xpos > 125 && playerArray[j].xpos < 155 && playerArray[j].ypos == 10) || 
                               (playerArray[j].xpos > 200 && playerArray[j].xpos < 230 && playerArray[j].ypos == 55)){
                                    playerArray[j].xpos = playerArray[j].xpos;
                            }
                            else if (playerArray[j].ypos < 85){
                                    playerArray[j].ypos = playerArray[j].ypos + 5;
                            };
                    };
        };
        gameSocket.broadcast.emit('moveGedrückt', playerArray);
};

// Spieler An-/Abmelden

// wird aufgerufen um das array erneut zu malen - ohne Positionsveränderung
function onAnmelden (){
        // um canvas upzudaten
        gameSocket.broadcast.emit('moveGedrückt', playerArray);
};

// Socket.IO "hört" auf Verbindungsabbruch löscht cliet aus dem playerArray
function disconnect(data){
        for (var j = 0; j < playerArray.length; j++) {
                if (playerArray[j].mySocketId == data){
                                playerArray.splice(j,1);
                                // um canvas upzudaten
                                gameSocket.broadcast.emit('moveGedrückt', playerArray);
                };
        }; 
};

/*rknoll*/