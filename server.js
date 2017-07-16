var http        = require('http');
var url         = require('url');
var fs          = require('fs');
var mime        = require('mime');
var bodyParser  = require('body-parser');
var storage     = require('node-persist');
var shortid     = require('shortid');
var express     = require('express');

const PORT = 8080;

// =======================
// Server
// =======================

var app = express();

app.use(express.static('static'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('port', (process.env.PORT || 8080));

app.get('/createUser', handleStaticRequest);
app.get('/getUser', handleStaticRequest);
app.put('/saveUser', handleStaticRequest);


app.listen(app.get('port'), function() {
    //ServerReady
    console.log('Node app is running on port', app.get('port'));
});

function handleStaticRequest(request, response) {
    var requestUrl = url.parse(request.url);
    var queryUrl = url.parse(request.url, true).query;

    console.log(requestUrl);
    //console.log(queryUrl);
    //console.log(request.body);
    //console.log(request.body.pokemons);

    if (requestUrl.pathname == '/createUser') {

        var data = shortid.generate();
        console.log(data);
        storage.initSync();
        storage.setItemSync('user-' + data, '[]');
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.write(data);
        response.end();

    } else if (requestUrl.pathname == '/getUser') {

        storage.initSync();
        var data = storage.getItemSync('user-' + queryUrl.username);
        console.log(data);
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.write(data || '[]');
        response.end();

    } else if (requestUrl.pathname == '/saveUser') {

        storage.initSync();
        storage.setItemSync('user-' + queryUrl.username, request.body.pokemons);
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.end();

    } else {

        /*var path = 'static' + requestUrl.pathname;
        if (path =='static/') {
            path = 'static/index.html';
        }
        fs.exists(path, function(exist) {
            if (exist) {
                fs.readFile(path, function(error, data) {
                    if (error) {
                        response.writeHead(500, {'Content-Type': 'text/plain'});
                        response.write('Internal Server Error');
                        response.end();
                    } else {
                        var mimeType = mime.lookup(path);
                        response.writeHead(200, {'Content-Type': mimeType});
                        response.write(data);
                        response.end();
                    }
                });
            } else {
                response.writeHead(404, {'Content-Type': 'text/html'});
                response.write('<!doctype html><html><head></head><body>Sorry: the resource does not exist</body></html>');        
                response.end();
            }
        });*/

    }
}



/*const http = require('http')
const port = 3000

const requestHandler = (request, response) => {
    console.log(request.url)
    response.end('Hello Node.js Server!')
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${port}`)
})*/
