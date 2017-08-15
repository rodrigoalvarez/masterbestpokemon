var userName = '';
var pokemons = [];
var combinations = [];
var pokemonTypes = [];
var translatedAttacks = [];
var legendary = ['243','244','245','250', '251'];//'144','145','146','150','151','243','244','245','249','250', '251'
var raids = ['003','006','009','059','065','068','089','094','103','110','112','125','126','129','131','134','135','136','143','144','145','146','150','151','153','156','159','248','249'];
var loadingFlag = 0;

$(document).ready(function () {
    $.getJSON('pokedata.json', function (data) {
        pokemons = data;
        combinations = getAllPokemonCombinations();
        loadPokemons();
        $.each(getPokemonNames(), function (key, value) {
            if (value.id == '000') {
                $("#xPokedexNewList").append($("<option disabled></option>").attr("value", value.id).text(value.name));
            } else {
                $("#xPokedexNewList").append($("<option></option>").attr("value", value.id).text(value.name));
            }
        });
        loadingCheck();
    });
    $.getJSON('poketypes.json', function (data) {
        pokemonTypes = data;
        loadingCheck();
    });
    $.getJSON('translatedata.json', function (data) {
        translatedAttacks = data;
        loadingCheck();
    });
    $("#xUsernameInput").on('keypress', function(e) {
         if(e.which === 13) {
            saveUsername($("#xUsernameInput").val());
            loadPokemons();
         }
   });
    $("#xPokedexNewList").change(changePokemon);
});

function loadingCheck() {
    loadingFlag++;
    if (loadingFlag == 3) {
        changePokemon();
    }
}

function changePokemon() {
    var id = $("#xPokedexNewList option:selected").val();
    var name = $("#xPokedexNewList option:selected").text();
    $("#xPokedexNewOptionalList").empty();
    $.each(getOptionalPokemonCombinations(id), function (key, value) {
        $("#xPokedexNewOptionalList")
            .append($(
                '<li onclick="addPokemon(' + "'" + value.pokemon.id + "','" + value.pokemon.quick.move_id + "','" + value.pokemon.charge.move_id + "'" + ')" class="new-pokemon">' +
                    '<div class="pokedex-pokemon-data">' +
                        '<div class="pokedex-pokemon-image" style="background-image: url(' + "'images/" + value.pokemon.name + "_GO.png'" + ')"></div>' +
                        '<span class="pokedex-pokemon-name">' + value.pokemon.name + '</span>' +
                    '</div>' +
                    '<div class="pokedex-moves">' +
                        '<div>' +
                            '<span class="pokedex-move-name type-' + value.pokemon.quick.type + '">' + getAttackName(value.pokemon.quick.name) + '</span>' +
                            '<span class="pokedex-move-power">' + value.pokemon.quick.power + '</span>' +
                            '<div class="pokedex-move-image"></div>' +
                        '</div>' +
                        '<div>' +
                            '<span class="pokedex-move-name type-' + value.pokemon.charge.type + '">' + getAttackName(value.pokemon.charge.name) + '</span>' +
                            '<span class="pokedex-move-power">' + value.pokemon.charge.power + '</span>' +
                            '<div class="pokedex-move-image energy-' + value.pokemon.charge.energyBars + '"></div>' +
                        '</div>' +
                    '</div>' +
                '</li>')
            .attr("value", value.pokemon.id));
    });
}

function updatePokemons() {
    $("#xPokedexList").empty();
    $.each(getStoredPokemons(), function (key, value) {
        $("#xPokedexList")
            .append($(
                '<li onclick="removePokemon(' + "'" + value.pokemon.id + "','" + value.pokemon.quick.move_id + "','" + value.pokemon.charge.move_id + "'" + ')">' +
                    '<div class="pokedex-pokemon-data">' +
                        '<div class="pokedex-pokemon-image" style="background-image: url(' + "'images/" + value.pokemon.name + "_GO.png'" + ')"></div>' +
                        '<span class="pokedex-pokemon-name">' + value.pokemon.name + '</span>' +
                    '</div>' +
                    '<div class="pokedex-moves">' +
                        '<div>' +
                            '<span class="pokedex-move-name type-' + value.pokemon.quick.type + '">' + getAttackName(value.pokemon.quick.name) + '</span>' +
                            '<span class="pokedex-move-power">' + value.pokemon.quick.power + '</span>' +
                            '<div class="pokedex-move-image"></div>' +
                        '</div>' +
                        '<div>' +
                            '<span class="pokedex-move-name type-' + value.pokemon.charge.type + '">' + getAttackName(value.pokemon.charge.name) + '</span>' +
                            '<span class="pokedex-move-power">' + value.pokemon.charge.power + '</span>' +
                            '<div class="pokedex-move-image energy-' + value.pokemon.charge.energyBars + '"></div>' +
                        '</div>' +
                    '</div>' +
                '</li>')
            .attr("value", value.pokemon.id));
    });
}

function loadPokemons() {
    userName = getUsername();
    $("#xUsernameInput").val(userName);
    if (userName == '') {
        $.get('createUser', function (data) {
            saveUsername(data);
            loadPokemons();
        });
    } else {
        $.get('getUser?username=' + userName, function (data) {
            setPokemons(data);
        });
    }
}

function synPokemons() {
    var data = '';
    if (typeof(Storage) !== "undefined") {
        data = localStorage.getItem("mbp-pokemons") || '';
    }
    $.ajax({
        url: 'saveUser?username=' + userName,
        type: 'PUT',
        data: JSON.stringify({pokemons: data}),
        contentType: 'application/json',
        success: function () {
        }
    });
}

// UI Functions

function getPokemonNames() {
    var result = [];
    result.push({ 'id': '000', 'name': '- Raids -', 'raid': 1 });
    result.push({ 'id': '000', 'name': '- Todos -', 'raid': 0 });
    pokemons.forEach(function (element) {
        if (legendary.indexOf(element.speciesID) == -1) {
            result.push({ 'id': element.speciesID, 'name': element.speciesName, 'raid': 0 });
            if (raids.indexOf(element.speciesID) > -1) {
                result.push({ 'id': element.speciesID, 'name': element.speciesName, 'raid': 1 });
            }
        }
    }, this);
    result = result.sort(function(a, b) {
        return a.raid > b.raid ? -1 : (a.raid < b.raid ? 1 : (a.name < b.name ? -1 : 1));
    });
    return result;
}

function getOptionalPokemonCombinations(id) {
    var result = [];
    combinations.forEach(function (element) {
        if (element.id == id) {
            var stab1 = (element.quick.type == element.type1 || element.quick.type == element.type2) ? 1.2 : 1;
            var stab2 = (element.charge.type == element.type1 || element.charge.type == element.type2) ? 1.2 : 1;
            var power1 = element.quick.power * element.attack * stab1 * Math.ceil(100 / element.quick.energy);
            var power2 = element.charge.power * element.attack * stab2 * element.charge.energyBars;
            var dps = (power1 + power2) / (element.quick.duration * Math.ceil(100 / element.quick.energy) + element.charge.duration * element.charge.energyBars);
            result.push({ 'pokemon': element, 'result': dps });
        }
    }, this);
    result = result.sort(function(a, b) {
        return b.result - a.result;
    });
    return result.slice(0, 50);
}

// Storage Functions

function getUsername() {
    var result = '';
    if (typeof(Storage) !== "undefined") {
        result = localStorage.getItem("mbp-username") || '';
    }
    return result;
}

function saveUsername(username) {
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem("mbp-username", username);
    }
}

function getStoredPokemons() {
    var result = [];
    if (typeof(Storage) !== "undefined") {
        var data = JSON.parse(localStorage.getItem("mbp-pokemons")) || [];
        data.forEach(function (element) {
            combinations.forEach(function (k) {
                if (element.pokemon == k.id && element.quick == k.quick.move_id && element.charge == k.charge.move_id) {
                    result.push({ 'pokemon': k });
                }
            }, this);
        }, this);
    }
    return result;
}

function setPokemons(data) {
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem("mbp-pokemons", data);
    }
    updatePokemons();
}

function addPokemon(pokemonId, quickId, chargeId) {
    if (typeof(Storage) !== "undefined") {
        var data = JSON.parse(localStorage.getItem("mbp-pokemons")) || [];
        data.push({ 'pokemon': pokemonId, 'quick': quickId, 'charge': chargeId });
        localStorage.setItem("mbp-pokemons", JSON.stringify(data));
    }
    synPokemons();
    updatePokemons();
}

function removePokemon(pokemonId, quickId, chargeId) {
    if (typeof(Storage) !== "undefined") {
        var result = [];
        var data = JSON.parse(localStorage.getItem("mbp-pokemons")) || [];
        var flagRemoved = false;
        data.forEach(function (element) {
            if (flagRemoved || element.pokemon != pokemonId || element.quick != quickId || element.charge != chargeId) {
                result.push(element);
            } else {
                flagRemoved = true;
            }
        }, this);
        localStorage.setItem("mbp-pokemons", JSON.stringify(result));
    }
    synPokemons();
    updatePokemons();
}

// Common Functions

function getPokemon(id) {
    var result = {};
    pokemons.forEach(function (element) {
        if (element.speciesID == id) {
            result = element;
        }
    }, this);
    return result;
}

function getAllPokemonCombinations() {
    var result = [];
    pokemons.forEach(function (element) {
        element.quickMoves.forEach(function (quick) {
            element.chargeMoves.forEach(function (charge) {
                if (legendary.indexOf(element.id) == -1) {
                    result.push({ 'id': element.speciesID, 
                        'name': element.speciesName, 
                        'type1': element.type1, 
                        'type2': element.type2, 
                        'quick': quick, 
                        'charge': charge, 
                        'attack': element.base_attack });
                }
            }, this);
        }, this);
    }, this);
    return result;
}

function getAttackName(attack) {
    var result = attack;
    translatedAttacks.forEach(function (element) {
        if (element.name == attack) {
            result = element.translate;
        }
    }, this);
    return result;
}
