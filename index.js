var Express = require('express');
var app = Express();
var ExpressPeerServer = require('peer').ExpressPeerServer;

// test response from GET, on http://localhost:9000/direct/test
app.get('/direct/test', function(req, res, next){
    // has to redirect this to the client first page (use .static instead)
    res.send('Hello From Server');
});

var options = {
    debug: true,
    allow_discovery: true
}

var server = require('http').createServer(app);
var peerServer = ExpressPeerServer(server, options);
// '/api' the main path to Peer Server, we also can use this to access Websocket Server
app.use('/api', peerServer);
// set server to serve static files here
app.use(Express.static(__dirname + '/public'));

// process.env.PORT for Heroku
server.listen(process.env.PORT || 9000);

peerServer.on('connection', function(id){
    console.log('someone connected: ' + id);
});

peerServer.on('disconnect', function(id){
    console.log('someone disconnected: ' + id);
});