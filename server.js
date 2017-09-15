var http        = require('http');
var url         = require('url');
var fs          = require('fs');
var mime        = require('mime');
var bodyParser  = require('body-parser');
var storage     = require('node-persist');
var shortid     = require('shortid');
var express     = require('express');
var mongo       = require('mongodb');

const PORT = 8080;

// =======================
// Server
// =======================

var app = express();

var MongoClient = mongo.MongoClient;
var DB_URL = "mongodb://********:********@ds131854.mlab.com:31854/mpg";

app.use(express.static('static'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('port', (process.env.PORT || 8080));

app.put('/signup', handleStaticRequest);
app.put('/signin', handleStaticRequest);
app.put('/addpokemon', handleStaticRequest);
app.put('/removepokemon', handleStaticRequest);
app.put('/actionvisit', handleStaticRequest);

//app.get('/createUser', handleStaticRequest);
//app.get('/getUser', handleStaticRequest);
//app.put('/saveUser', handleStaticRequest);
//app.get('/backup', handleStaticRequest);
//app.put('/restore', handleStaticRequest);


app.listen(app.get('port'), function() {
    //ServerReady
    console.log('Node app is running on port', app.get('port'));

    //DatabaseReady
    MongoClient.connect(DB_URL, function(err, db) {
        if (err) {
            console.log(err);
        } else {
            console.log("Database is running");
        }
    });
});

function handleStaticRequest(request, response) {
    var requestUrl = url.parse(request.url);
    var queryUrl = url.parse(request.url, true).query;

    if (requestUrl.pathname == '/signup') {
        addUser(response, request.body.user, request.body.password);

    } else if (requestUrl.pathname == '/signin') {
        checkUser(response, request.body.user, request.body.password);

    } else if (requestUrl.pathname == '/addpokemon') {
        addPokemon(response, request.body.user, parseInt(request.body.number), parseInt(request.body.level), 
            parseInt(request.body.attack), parseInt(request.body.defense), parseInt(request.body.stamina));

    } else if (requestUrl.pathname == '/removepokemon') {
        removePokemon(response, request.body.user, parseInt(request.body.pokemon));

    } else if (requestUrl.pathname == '/actionvisit') {
        addVisit(response);

    } else {
        response.writeHead(404, {'Content-Type': 'text/plain'});
        response.write('400');//Not found
        response.end();
    }



    //console.log(requestUrl);

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

    } else if (requestUrl.pathname == '/backup') {

        var data = [];
        storage.initSync();
        storage.forEach(function(key, value) {
            data.push({ 'user': key, 'pokemons': value });
        });
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.write(JSON.stringify(data));
        response.end();

    } else if (requestUrl.pathname == '/restore') {

        var data = JSON.parse(request.body.backup) || [];
        var dataLength = data.length;
        storage.initSync();
        for (var i = 0; i < dataLength; i++) {
            storage.setItemSync(data[i].user, data[i].pokemons);
        }
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.end();

    } else {

    }
}


/* Errors */

function responseError(response) {
    db.close();
    response.writeHead(500, {'Content-Type': 'text/plain'});
    response.write('100');//Error interno
    response.end();
}


/* Users */

function addUser(response, user, password) {
    MongoClient.connect(DB_URL, function(err, db) {
        if (err) throw err;
        db.collection("users").count({user: user}, function(err, res) {
            if (err) responseError(response);

            if (res == 0) {
                var myobj = { enabled: true, user: user, password: password, date: new Date() };
                db.collection("users").insertOne(myobj, function(err, res) {
                    if (err) responseError(response);

                    db.close();
                    response.writeHead(200, {'Content-Type': 'text/plain'});
                    response.write(res.ops[0]._id + '');
                    response.end();
                });

            } else {
                db.close();
                response.writeHead(500, {'Content-Type': 'text/plain'});
                response.write('101');//El usuario ya existe
                response.end();
            }
        });
    });
}

function checkUser(response, user, password) {
    MongoClient.connect(DB_URL, function(err, db) {
        if (err) throw err;
        db.collection("users").findOne({user: user, password: password}, function(err, res) {
            if (err) responseError(response);

            if (res) {
                db.close();
                response.writeHead(200, {'Content-Type': 'text/plain'});
                response.write(res._id + '');
                response.end();

            } else {
                db.close();
                response.writeHead(500, {'Content-Type': 'text/plain'});
                response.write('102');//El usuario no existe o la contraseña no es válida
                response.end();
            }
        });
    });
}


/* Pokemons */

function addPokemon(response, userid, number, level, attack, defense, stamina) {
    MongoClient.connect(DB_URL, function(err, db) {
        if (err) throw err;

        db.collection("users").findOne({_id: new mongo.ObjectId(userid)}, function(err, res) {
            if (err) responseError(response);

            if (res) {
                var myobj = { enabled: true, user: res.user, number: number, level: level, attack: attack, defense: defense, stamina: stamina, date: new Date() };
                db.collection("pokemons").insertOne(myobj, function(err, res) {
                    if (err) responseError(response);

                    db.close();
                    response.writeHead(200, {'Content-Type': 'text/plain'});
                    response.write(res.ops[0]._id + '');
                    response.end();
                });

            } else {
                db.close();
                response.writeHead(500, {'Content-Type': 'text/plain'});
                response.write('102');//El usuario no existe o la contraseña no es válida
                response.end();
            }
        });
    });
}

function removePokemon(response, pokemonid) {
    MongoClient.connect(DB_URL, function(err, db) {
        if (err) throw err;

        db.collection("pokemons").findOne({_id: new mongo.ObjectId(pokemonid)}, function(err, res) {
            if (err) responseError(response);

            if (res) {
                db.collection("pokemons").updateOne({_id: new mongo.ObjectId(pokemonid)}, 
                { enabled: false, user: res.user, number: res.number, level: res.level, attack: res.attack, defense: res.defense, stamina: res.stamina, date: new Date() }, 
                function(err, res) {
                    if (err) responseError(response);

                    db.close();
                    response.writeHead(200, {'Content-Type': 'text/plain'});
                    response.write('');
                    response.end();
                });

            } else {
                db.close();
                response.writeHead(500, {'Content-Type': 'text/plain'});
                response.write('202');//El pokemon no existe
                response.end();
            }
        });
    });
}


/* Visits */

function addVisit(response) {
    MongoClient.connect(DB_URL, function(err, db) {
        if (err) throw err;

        db.collection("visits").findOne({enabled: true}, function(err, res) {
            if (err) responseError(response);

            if (res) {
                var count = res.visits + 1;
                db.collection("visits").updateOne({enabled: true}, {enabled: true, visits: count}, function(err, res) {
                    if (err) responseError(response);

                    db.close();
                    response.writeHead(200, {'Content-Type': 'text/plain'});
                    response.write(count + '');
                    response.end();
                });

            } else {
                var myobj = { enabled: true, visits: 1 };
                db.collection("visits").insertOne(myobj, function(err, res) {
                    if (err) responseError(response);

                    db.close();
                    response.writeHead(200, {'Content-Type': 'text/plain'});
                    response.write(1 + '');
                    response.end();
                });
            }
        });
    });
}
