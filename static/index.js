var pokemons = [];
var combinations = [];
var pokemonTypes = [];
var translatedAttacks = [];
var legendary = ['144','145','146','150','151','243','244','245','249','250', '251'];

$(document).ready(function () {
    $.getJSON('pokedata.json', function (data) {
        pokemons = data;
        combinations = getAllPokemonCombinations();
        $.each(getPokemonNames(), function (key, value) {
            $("#xPokemonList").append($("<option></option>").attr("value", value.id).text(value.name));
        });
        setTimeout(function() { changePokemon(); }, 1000);
    });
    $.getJSON('poketypes.json', function (data) {
        pokemonTypes = data;
    });
    $.getJSON('translatedata.json', function (data) {
        translatedAttacks = data;
    });
    $("#xPokemonList").change(changePokemon);
});

function changePokemon() {
    var id = $("#xPokemonList option:selected").val();
    var name = $("#xPokemonList option:selected").text();
    $("#xPokemonName").text(name);
    $("#xPokemonImage .best-pokemon-image").css('background-image', 'url(' + "'images/" + name + "_GO.png'" + ')');
    $("#xOpponentList").empty();
    $.each(getPokemonOpponents(id), function (key, value) {
        $("#xOpponentList")
            .append($(
                '<li>' +
                    '<div class="best-pokemon-data">' +
                        '<div class="best-pokemon-image" style="background-image: url(' + "'images/" + value.pokemon.name + "_GO.png'" + ')"></div>' +
                        '<span class="best-pokemon-name">' + value.pokemon.name + '</span>' +
                    '</div>' +
                    '<div class="best-moves">' +
                        '<div>' +
                            '<span class="best-move-name">' + getAttackName(value.pokemon.quick.name) + '</span>' +
                            '<span class="best-move-power">' + value.pokemon.quick.power + '</span>' +
                            '<div class="best-move-image"></div>' +
                        '</div>' +
                        '<div>' +
                            '<span class="best-move-name">' + getAttackName(value.pokemon.charge.name) + '</span>' +
                            '<span class="best-move-power">' + value.pokemon.charge.power + '</span>' +
                            '<div class="best-move-image energy-' + value.pokemon.charge.energyBars + '"></div>' +
                        '</div>' +
                    '</div>' +
                '</li>')
            .attr("value", value.pokemon.id));
            //.text(value.pokemon.name + ' [ ' + value.result + ' - ' + value.factor1 + ' - ' + value.factor2 + ' - ' + value.power1 + ' - ' + value.power2 + ' - ' + value.pokemon.quick.name + ' - ' + value.pokemon.charge.name + ' ]'));
            //.text(value.pokemon.name + ' [ ' + value.pokemon.quick.name + ' - ' + value.pokemon.charge.name + ' - ' + value.result + ' ]'));
    });
}

// UI Functions

function getPokemonNames() {
    var result = [];
    pokemons.forEach(function (element) {
        result.push({ 'id': element.speciesID, 'name': element.speciesName });
    }, this);
    result = result.sort(function(a, b) {
        return a.name < b.name ? -1 : 1;
    });
    return result;
}

function getPokemonOpponents(id) {
    var result = [];
    var pokemon = getPokemon(id);
    var opponents = getPowerCombinations(pokemon.type1, pokemon.type2);
    result = opponents.sort(function(a, b) {
        return b.result - a.result;
    });
    return result.slice(0, 50);
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
                result.push({ 'id': element.speciesID, 'name': element.speciesName, 'type1': element.type1, 'type2': element.type2, 'quick': quick, 'charge': charge, 'attack': element.base_attack });
            }, this);
        }, this);
    }, this);
    return result;
}

function getPowerCombinations(type1, type2) {
    var result = [];
    combinations.forEach(function (element) {
        var stab = (element.quick.type == element.charge.type && (element.quick.type == element.type1 || element.quick.type == element.type2)) ? 1.2 : 1;
        var factor1 = getPowerType(element.quick.type, type1, type2);
        var factor2 = getPowerType(element.charge.type, type1, type2);
        var power1 = element.quick.power * element.attack * stab * factor1 * Math.round(100 / element.quick.energy);
        var power2 = element.charge.power * element.attack * stab * factor2;
        var dps = (power1 + power2) / (element.quick.duration * Math.round(100 / element.quick.energy) + element.charge.duration);
        if (legendary.indexOf(element.id) > -1) {
            dps = 0;
        }
        //result.push({ 'pokemon': element, 'result': dps, 'factor1': factor1, 'factor2': factor2, 'power1': power1, 'power2': power2 });
        result.push({ 'pokemon': element, 'result': dps });
    }, this);
    return result;
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

/*var types = pokemon.superEffectiveDefense.filter(function (value) {
    return pokemon.notEffectiveDefense.indexOf(value) < 0;
});*/

/*function getPokemonByAttackType(name) {
    //Stab
    var resultA = [];
    //BothMove
    var resultB = [];
    //QuickMove
    var resultC = [];
    //ChargeMove
    var resultD = [];

    pokemons.forEach(function (element) {
        if (element.type1 == name || element.type2 == name) {

        }
        result.push({ 'id': element.speciesID, 'name': element.speciesName });
    }, this);
    return result;
}*/
