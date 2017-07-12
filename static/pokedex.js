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
            $("#xPokedexNewList").append($("<option></option>").attr("value", value.id).text(value.name));
        });
        setTimeout(function() { changePokemon(); }, 1000);
    });
    $.getJSON('poketypes.json', function (data) {
        pokemonTypes = data;
    });
    $.getJSON('translatedata.json', function (data) {
        translatedAttacks = data;
    });
    $("#xPokedexNewList").change(changePokemon);
});

function changePokemon() {
    var id = $("#xPokedexNewList option:selected").val();
    var name = $("#xPokedexNewList option:selected").text();
    $("#xPokedexNewOptionalList").empty();
    $.each(getOptionalPokemonCombinations(id), function (key, value) {
        $("#xPokedexNewOptionalList")
            .append($(
                '<li>' +
                    '<div class="pokedex-pokemon-data">' +
                        '<div class="pokedex-pokemon-image" style="background-image: url(' + "'images/" + value.pokemon.name + "_GO.png'" + ')"></div>' +
                        '<span class="pokedex-pokemon-name">' + value.pokemon.name + '</span>' +
                    '</div>' +
                    '<div class="pokedex-moves">' +
                        '<div>' +
                            '<span class="pokedex-move-name">' + getAttackName(value.pokemon.quick.name) + '</span>' +
                            '<span class="pokedex-move-power">' + value.pokemon.quick.power + '</span>' +
                            '<div class="pokedex-move-image"></div>' +
                        '</div>' +
                        '<div>' +
                            '<span class="pokedex-move-name">' + getAttackName(value.pokemon.charge.name) + '</span>' +
                            '<span class="pokedex-move-power">' + value.pokemon.charge.power + '</span>' +
                            '<div class="pokedex-move-image energy-' + value.pokemon.charge.energyBars + '"></div>' +
                        '</div>' +
                    '</div>' +
                '</li>')
            .attr("value", value.pokemon.id));
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

function getOptionalPokemonCombinations(id) {
    var result = [];
    combinations.forEach(function (element) {
        if (element.id == id) {
            result.push({ 'pokemon': element });
        }
    }, this);
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

function getAttackName(attack) {
    var result = attack;
    translatedAttacks.forEach(function (element) {
        if (element.name == attack) {
            result = element.translate;
        }
    }, this);
    return result;
}
