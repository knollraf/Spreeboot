// Import Express
var express = require('express');

// Import 'path'
var path = require('path');

// Neue Express Instanz
var app = express();

// Port als Variable
var portNr = 3000;

// Import Spiel-Datei
var spiel = require('./game');

// App erstellen 
app.configure(function() {
        // CMD loggs abstellen
        app.use(express.logger('dev'));

        // Dateipfad 'public' stellt html,css,js und bilder
        app.use(express.static(path.join(__dirname,'public')));
});

// Node.js Server erstellen  mit port 3000
var server = require('http').createServer(app).listen(portNr);

// Socket.IO-Server an den http-Server "binden"
var io = require('socket.io').listen(server);

// Socket.IO CMD loggs reduzieren - nur wengen der übersichtlichkeit im CMD
io.set('log level',1);

// Socket.IO "hört" auf einen Verbindungsaufbau (index.html wird über broweser aufgerufen) --> initGame() wird ausgeführt
io.sockets.on('connection', function (socket) {
        //console.log('Verbundung ist aufgebaut');
        // initGame wird aufgerufen und in der game.js ausgeführt
        // Server und Socket werden übergeben 
        spiel.initGame(io, socket);
        // url wird aufgerufen in der game.js - URL wird übergeben
        spiel.url(url);
});

// Import von OperatingSystem 
var os = require('os');
var interfaces = os.networkInterfaces();

// Gibt die IPv4-Adresse wieder
var addresses = [];
for (k in interfaces) {
        for (k2 in interfaces[k]) {
                var address = interfaces[k][k2];
                if (address.family == 'IPv4' && !address.internal) {
                        addresses.push(address.address)
                }
        }
}
// Konsolenausgabe IPv4+Port - (Pink für bessere Wahrnehmung)
console.log( "\033[40;1;35m ---->   " + addresses + ":" + portNr + "\033[40;1;37m" );

url = (addresses + ":" + portNr);
//console.log(hostundport);
/*rknoll*/