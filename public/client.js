// jQuery Funktion.
(function($){
    // Strict mode -->  http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
    'use strict';

// Variable für relevanten socket.io Code.    
var IO = {

    // Inizalisiert sie Socket.io Serververbindung mit dem Client
    init: function(){
            // Verbindung
            IO.socket = io.connect();
            // Startet bindEvents  
            IO.bindEvents();
    },

    // Funktion wird immer dann aufgeführt wenn eine Nachricht abgefangen wird.
    bindEvents : function() {
            IO.socket.on('verbunden', IO.onConnected);
            IO.socket.on('newGameCreated', IO.onNewGameCreated);
            IO.socket.on('playerJoinedRoom', IO.playerJoinedRoom);
            IO.socket.on('moveGedrückt', App.Host.onMoveClicked);
            IO.socket.on('playerWon', IO.playerWon);
            IO.socket.on('playerWon', App.Host.playerWon);
            IO.socket.on('error', IO.error);

            //IO.socket.on('beginNewGame', IO.beginNewGame );
    },

    // Wird ausgeführt wenn die die Nachricht 'verbund' empfangen wird
    onConnected : function() {
            // Nimmt die Socket.io Session ID  vom Client (aus App)
            App.mySocketId = IO.socket.socket.sessionid;
            // Ausgabe der Session ID 
            console.log(App.mySocketId +" --> meine Session ID");
    },

    // Wird ausgeführt wenn die die Nachricht 'onNewGameCreated' empfangen wird
    // data enthält Objekt mit gameId und mySocketId
    onNewGameCreated : function(data) {
            // gameInit wird aufgerufen
            App.Host.gameInit(data);
    },

    // Spieler hat "Raum" betreten
    playerJoinedRoom : function(data) {
            // Player Array "bekommt" Objekt mit gameId, mySocketId und playerName 
            App.Host.players.push(data);
            // Anzahl der Spieler im Raum wird erhöht
            // Falls man später einen max Anzahl an spielern festlegen möchte
            App.Host.numPlayersInRoom += 1;
            // wenn Host dann draw(); - Setzt Spielfigur auf die canvas 
            //if(App.myRole == 'Host' && data.gameId == App.gameId){
            // Erste Bewegung wird simuliert um unmittelbar nacht dem Start-klick den Ruderer auf der Cabnvas zuhaben
            IO.socket.emit('anmelden', App.mySocketId);
    },

    // Spieler hat gewonne
    playerWon : function (data){
            if(data.rID == App.gameId && data.sID == App.mySocketId){
                    App.$gameArea.html(App.$gewonnen);
                    $('#hatGewonnen').append('<p/>').text(data.sName + ' hat gewonnen!');
                    
            }
            if(data.rID == App.gameId && data.sID != App.mySocketId){
                App.$gameArea.html(App.$verloren);
            }
    },

    // wird ausgegene wenn ein Spieler eine nicht vorhandene GameID eingegeben hat
    error : function(data) {
                alert(data.message);
    }
    

};

// App Objekt
var App = {
    // Attribute von App
    gameId: 0,
    myRole: '',
    mySocketId: '',

    // fürt den html-Elementaustausch --> zeigt den Startbildschirm / und bindEvents()
    init: function(){
            App.cacheElements();
            App.showInitScreen();
            App.bindEvents();
            // FastClick.attach(document.body);*/
    },

    // tauscht an Hand von IDs Elemente im html aus
    cacheElements : function () {
            App.$doc = $(document);
            App.$gameArea = $('#gameArea');
            App.$templateIntroScreen = $('#intro-screen-template').html();
            App.$templateNewGame = $('#create-game-template').html();
            App.$templateJoinGame = $('#join-game-template').html();
            App.$inputForGame = $('#input-device-template').html();
            App.$gameOver = $('#gameOver-template').html();
            App.$gewonnen = $('#gewonnen-template').html();
            App.$verloren = $('#verloren-template').html();

    },        
    
    // Funktion wird immer dann aufgeführt wenn ein Klick abgefangen wird.
    bindEvents : function () {
            // Host
            App.$doc.on('click', '#btnNeuesSpiel', App.Host.onCreateClick);
            // Player
            App.$doc.on('click', '#btnNeuerSpieler', App.Player.onJoinClick);
            App.$doc.on('click', '#btnStart',App.Player.onPlayerStartClick);
            // Steuerung
            App.$doc.on('click', '#links',App.Player.onClickLinks);
            App.$doc.on('click', '#rechts',App.Player.onClickRechts);
            App.$doc.on('click', '#hoch',App.Player.onClickHoch);
            App.$doc.on('click', '#runter',App.Player.onClickRunter);
    },

    // wird von init aufgerufen und zeigt den Anfangsbildschirm.
    showInitScreen: function() {
            App.$gameArea.html(App.$templateIntroScreen);
    },

    // Host Attribut mit Host Attributen 
    Host : {
        players : [],
        // für Spätere Spieleranzahl Begrenzung
        numPlayersInRoom: 0,

        // wird von bindEvents() aus aufgerufen um neues Spiel zu erstellen
        onCreateClick: function () {
                //console.log('gerade geklickt "Create A Game"');
                IO.socket.emit('hostCreateNewGame');                       
        },

        // wird von onGameCreated aufgerufen 
        // data enthält Objekt mit gameId und mySocketId
        gameInit: function (data) {
                // Übergabewerte werden eingespeichert 
                App.gameId = data.gameId;
                App.mySocketId = data.mySocketId;
                App.myRole = 'Host';
                App.Host.numPlayersInRoom = 0;
                // ruft Funktion auf
                App.Host.displayNewGameScreen();
                console.log("Game started with ID: " + App.gameId + ' by host: ' + App.mySocketId);
        },

        // zeigt/macht platz für die canvas und zeigt die URL zum Einloggen 
        displayNewGameScreen : function() {
                // fragt nach URL  
                IO.socket.emit('getURL');
                // erhält URL und sendet an die id 'gameURL' von index.html 
                IO.socket.on('sendURL',function (data){$('#gameURL').text("http://" + data + "  GameID: " + App.gameId);});
                // Aufruf von "htmlteil" templateNewGame zum Anzeigen lassen
                App.$gameArea.html(App.$templateNewGame);
        },

        // Spieler hat eine Richtungstaste geklickt
        onMoveClicked : function(data){
                // Unterscheideung host oder player zum zeichen
                console.log(data);
                if(App.myRole == 'Host'){
                            // PlayeArray wird durch iterriert
                            for(var i = 0; i < data.length; i++){
                                    // Abfrage ob raumID übereinstimmt
                                    if(data[i].gameId == App.gameId){
                                            // jedes Boot mit der richtigen RaumID wird auf die vorgebufferte canvas gemalt
                                            draw(data[i].bootArraybild ,data[i].xpos, data[i].ypos);
                                            // Abfrage ob eine Spieler im Ziel ist
                                            if (data[i].xpos > 279){
                                                    var won = {
                                                        sID: data[i].mySocketId,
                                                        sName: data[i].playerName,
                                                        rID: data[i].gameId
                                                    };
                                                    IO.socket.emit('gameOver',won);
                                            };
                                    };
                            };      
                            drawAlle();
                            context.clearRect(0,0,300,100);
                };
        },
        // Spieler hat gewonne
        playerWon : function (data){
                if(data.rID == App.gameId && App.myRole == 'Host'){
                        App.$gameArea.html(App.$gameOver);
                        $('#hatGewonnen').append('<p/>').text(data.sName + ' hat gewonnen!.');
                };
        }

    },
            
    // Attribut Player mit eigenen Attributen
    Player : {

        // Attribute
        hostSocketId: '',
        myName: '',


        // wird von bindEvents() aus aufgerufen um login form anzuzeigen
        onJoinClick: function () {
                // Formular wird angezeigt
                App.$gameArea.html(App.$templateJoinGame);
        },

        // Start button wurde geklickt
        onPlayerStartClick: function() {
                // data Objekt wird angelegt mit den Eingaben des Spielers
                var data = {
                    xpos : 0,
                    ypos : 40,
                    bootArraybild: 0,
                    gameId : +($('#inputGameId').val()),
                    playerName : $('#inputPlayerName').val() || 'anon'
                };
                // data wird mit der der Nachtricht 'playerJoinGame' an den Server geschickt
                IO.socket.emit('playerJoinGame', data);
                // Attributeigenschften werden gespeichert
                App.myRole = 'Player';
                App.gameId = data.gameId;
                App.Player.myName = data.playerName;
                // Input Screen für device wird angezeigt
                App.$gameArea.html(App.$inputForGame);
        },

        // Steuerung wird emittet - links rechts hoch runter
        onClickLinks: function () {
                IO.socket.emit('links', App.mySocketId);
        },

        onClickRechts: function () {
                IO.socket.emit('rechts', App.mySocketId);
        },

        onClickHoch: function () {
                IO.socket.emit('hoch', App.mySocketId);
        },

        onClickRunter: function () {
                IO.socket.emit('runter', App.mySocketId);
        },


       

    }
};
    
    // Funktions Aufruf
    IO.init();
    App.init();

    // Animationsbilder Array
    var boot = new Array();
    // canvas wird via ID gefunden/abgerufen und in Variable gespeichert
    var c=document.getElementById('Canvas');
    // built-in HTML5 Objekt
    var ctx=c.getContext('2d');
    // "virtuelle" canvas wird erzeugt um sämtliche positioenen abzufangen und darzustellen
    var vCanvas = document.createElement( 'canvas' );
    var context = vCanvas.getContext('2d');

    // IMG-Element wird erstellt und die dazugehörige Src mit ins Array gepeichert
    boot[0] = new Image(); boot[0].src = "img/boot0.png";
    boot[1] = new Image(); boot[1].src = "img/boot1.png";
    boot[2] = new Image(); boot[2].src = "img/boot2.png";
    boot[3] = new Image(); boot[3].src = "img/boot3.png";
                  
    // draw Funktion wird von onMoveClicked in Schleife aufgerufen 
    function draw(bild,x,y) {
            context.drawImage(boot[bild],x,y);
    };
    // drawAlle Funktion wird von onMoveClicked aufgerufen
    function drawAlle(){
            // Canvas wird geleert und dann wieder neu "bemalt"
            ctx.clearRect(0,0,c.width,c.height);
            //console.log(ctx);
            // imgData bekommt "Vollbild" der virtuellen Canvas
            var imgData = context.getImageData(0,0,c.width,c.height);
            //console.log(imgData);
            // Vollbild wird auf die Canvas gezeichnet (ID/#Canvas)
            ctx.putImageData(imgData,0,0);
            ctx.fillStyle = "Sienna";
            ctx.fillRect(75,0,5,75);
            ctx.fillRect(150,25,5,75);
            ctx.fillRect(225,0,5,50);
            ctx.fillRect(225,70,5,30);
    };

    //wird nicht von allen Browsern unterstütz und deshalb bleiben manche "leichen" auf der Canvas
    $(window).on('beforeunload ',function() {
            IO.socket.emit("disconnected", App.mySocketId);
    });

}($));
/*rknoll*/