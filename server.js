var http        = require('http');
var url         = require('url');
var fs          = require('fs');
var mime        = require('mime');
var bodyParser  = require('body-parser');

const PORT = 8080;

// =======================
// Server
// =======================

var express = require('express');
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('static'));

app.set('port', (process.env.PORT || 8080));

//app.get('/', handleStaticRequest);
//app.get('/index.html', handleStaticRequest);
//app.get('/index.css', handleStaticRequest);
//app.get('/index.js', handleStaticRequest);
//app.get('/pokedata.json', handleStaticRequest);
//app.get('/poketypes.json', handleStaticRequest);
//app.get('/favicon.ico', handleStaticRequest);


app.listen(app.get('port'), function() {
    //ServerReady
    console.log('Node app is running on port', app.get('port'));
});

function handleStaticRequest(request, response) {
    var requestUrl = url.parse(request.url);

    var path = 'static' + requestUrl.pathname;
    if (path =='static/') {
        path = 'static/index.html';
    }
    fs.exists(path, function(exist){
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
    });
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
