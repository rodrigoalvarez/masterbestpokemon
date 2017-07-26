var userName = '';
var pokemons = [];
var combinations = [];
var pokemonTypes = [];
var translatedAttacks = [];
var legendary = ['150','151','243','244','245','250', '251'];//'144','145','146','150','151','243','244','245','249','250', '251'
var raids = ['003','006','009','059','065','068','089','094','103','110','112','125','126','129','131','134','135','136','143','144','153','156','159','248','249'];
var loadingFlag = 0;

$(document).ready(function () {
    $.getJSON('pokedata.json', function (data) {
        pokemons = data;
        combinations = getAllPokemonCombinations();
        loadPokemons();
        $.each(getPokemonNames(), function (key, value) {
            if (value.id == '000') {
                $("#xPokemonList").append($("<option disabled></option>").attr("value", value.id).text(value.name));
            } else {
                $("#xPokemonList").append($("<option></option>").attr("value", value.id).text(value.name));
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
    $("#xPokemonList").change(changePokemon);
});

function loadingCheck() {
    loadingFlag++;
    if (loadingFlag == 3) {
        changePokemon();
    }
}

function changePokemon() {
    var id = $("#xPokemonList option:selected").val();
    var name = $("#xPokemonList option:selected").text();
    $("#xPokemonName").text(name);
    $("#xPokemonImage .best-pokemon-image").css('background-image', 'url(' + "'images/" + name + "_GO.png'" + ')');
    $("#xOpponentList").empty();
    $.each(getPokemonOpponents(id), function (key, value) {
        $("#xOpponentList")
            .append($(
                '<li class="' + (inStorage(value.pokemon) ? 'pokemon-stored ' : '') + (value.warning > 0 ? 'pokemon-warning ' : '') + 'warning-' + value.warning + '">' +
                    '<div class="best-pokemon-data">' +
                        '<div class="best-pokemon-image" style="background-image: url(' + "'images/" + value.pokemon.name + "_GO.png'" + ')"></div>' +
                        '<span class="best-pokemon-name">' + value.pokemon.name + '</span>' +
                        '<span class="best-pokemon-warning"></span>' +
                    '</div>' +
                    '<div class="best-moves">' +
                        '<div>' +
                            '<span class="best-move-name type-' + value.pokemon.quick.type + '">' + getAttackName(value.pokemon.quick.name) + '</span>' +
                            '<span class="best-move-power">' + value.pokemon.quick.power + '</span>' +
                            '<div class="best-move-image"></div>' +
                        '</div>' +
                        '<div>' +
                            '<span class="best-move-name type-' + value.pokemon.charge.type + '">' + getAttackName(value.pokemon.charge.name) + '</span>' +
                            '<span class="best-move-power">' + value.pokemon.charge.power + '</span>' +
                            '<div class="best-move-image energy-' + value.pokemon.charge.energyBars + '"></div>' +
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

function getPokemonOpponents(id) {
    var result = [];
    var pokemon = getPokemon(id);
    var opponents = getPowerCombinations(pokemon);
    result = opponents.sort(function(a, b) {
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
        changePokemon();
    }
}

function inStorage(pokemon) {
    var result = false;
    $.each(getStoredPokemons(), function (index, element) {
        result = result || (element.pokemon.id == pokemon.id && 
                            element.pokemon.quick.move_id == pokemon.quick.move_id && 
                            element.pokemon.charge.move_id == pokemon.charge.move_id);
    }, this);
    return result;
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
                if (legendary.indexOf(element.speciesID) == -1) {
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

function getPowerCombinations(pokemon) {
    var result = [];
    combinations.forEach(function (element) {
        var stab1 = (element.quick.type == element.type1 || element.quick.type == element.type2) ? 1.2 : 1;
        var stab2 = (element.charge.type == element.type1 || element.charge.type == element.type2) ? 1.2 : 1;
        var factor1 = getPowerType(element.quick.type, pokemon.type1, pokemon.type2);
        var factor2 = getPowerType(element.charge.type, pokemon.type1, pokemon.type2);
        var power1 = element.quick.power * element.attack * stab1 * factor1 * Math.ceil(100 / element.quick.energy);
        var power2 = element.charge.power * element.attack * stab2 * factor2 * element.charge.energyBars;
        var dps = (power1 + power2) / (element.quick.duration * Math.ceil(100 / element.quick.energy) + element.charge.duration * element.charge.energyBars);
        result.push({ 'pokemon': element, 'result': dps, 'warning': getWarningCombinations(element, pokemon) });
    }, this);
    return result;
}

function getWarningCombinations(pokemonA, pokemonD) {
    var result = 0;
    combinations.forEach(function (element) {
        if (element.id == pokemonA.id) {
            var factor1 = getPowerType(pokemonA.quick.type, pokemonD.type1, pokemonD.type2);
            var factor2 = getPowerType(pokemonA.charge.type, pokemonD.type1, pokemonD.type2);
            if (factor1 * factor2 > 1) {
                result += 1;
            }
        }
    }, this);
    return Math.ceil(result / 3);
}

function getPowerType(type, type1, type2) {
    var value1 = 1;
    var value2 = 1;
    pokemonTypes.forEach(function (element) {
        if (element.name == type) {
            value1 = (element.weaknesses.indexOf(type1) > -1) ? 0.714 : ((element.strengths.indexOf(type1) > -1) ? 1.4 : 1);
            value2 = (element.weaknesses.indexOf(type2) > -1) ? 0.714 : ((element.strengths.indexOf(type2) > -1) ? 1.4 : 1);
        }
    }, this);
    return type2 == undefined ? value1 : value1 * value2;
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
