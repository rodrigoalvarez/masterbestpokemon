var userName = '';
var pokemons = [];
var combinations = [];
var battleCombinations = [];
var pokemonTypes = [];
var translatedAttacks = [];
var legendary = ['150','151','243','244','245','250', '251'];//'144','145','146','150','151','243','244','245','249','250', '251'
var raids = ['003','006','009','059','065','068','089','094','103','110','112','125','126','129','131','134','135','136','143','144','153','156','159','248','249'];
var loadingFlag = 0;
var cpM = 0.7317;
var iv = 7;

$(document).ready(function () {
    $.getJSON('pokedata.json', function (data) {
        pokemons = data;
        combinations = getAllPokemonCombinations();
        //battleCombinations = getAllBattleCombinations();
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
                    /*'<div class="best-damage">' +
                        '<div>' +
                            '<span class="best-damage-time">' + value.battles[0].battleTime + '</span>' +
                            '<span class="best-damage-attacker">' + value.battles[0].battleHpA + '</span>' +
                            '<span class="best-damage-deffender">' + value.battles[0].battleHpD + '</span>' +
                        '</div>' +
                    '</div>' +*/
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
    return getPowerCombinations(pokemon);
    /*result = opponents.sort(function(a, b) {
        return b.result - a.result;
    });
    return result.slice(0, 50);*/
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
                                'attack': (parseInt(element.base_attack) + iv) * cpM,
                                'defense': (parseInt(element.base_defense) + iv) * cpM,
                                'stamina': Math.floor((parseInt(element.base_stamina) + iv) * cpM) });
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

        var power1 = Math.floor(0.5 * element.quick.power * (element.attack / pokemon.defense) * stab1 * factor1) + 1;
        var fullPower1 = power1 * Math.ceil(100 / element.quick.energy);
        var power2 = Math.floor(0.5 * element.charge.power * (element.attack / pokemon.defense) * stab2 * factor2) + 1;
        var fullPower2 = power2 * element.charge.energyBars;

        var dps = 1000 * (fullPower1 + fullPower2) / (element.quick.duration * Math.ceil(100 / element.quick.energy) + element.charge.duration * element.charge.energyBars);
        result.push({ 'pokemon': element, 'result': dps, 'warning': getWarningCombinations(element, pokemon) });
    }, this);

    result = result.sort(function(a, b) {
        return b.result - a.result;
    });
    result = result.slice(0, 50);

    result.forEach(function (element) {
        element.battles = getBattleCombinations(element.pokemon, pokemon);
    });
    return result;
}

function getAllBattleCombinations() {
    var result = [];
    combinations.forEach(function (element, index) {
        combinations.forEach(function (kElement, kIndex) {
            if (index <= kIndex) {
                var battle = getBattleResult(element, kElement);
                result.push({ 'attacker': index, 'defender': kIndex, 'battleTime': battle.battleTime, 'battleHpA': battle.battleHpA, 'battleHpD': battle.battleHpD });
            }
        }, this);
    }, this);
    return result;
}

function getBattleCombinations(pokemonA, pokemonD) {
    var result = [];
    combinations.forEach(function (element) {
        if (element.speciesID == pokemonD.speciesID) {
            var battle = getBattleResult(pokemonA, element);
            result.push({ 'battleTime': battle.battleTime, 'battleHpA': battle.battleHpA, 'battleHpD': battle.battleHpD });
        }
    }, this);
    return result;
}

function getBattleResult(element, pokemon) {
    var stabA1 = (element.quick.type == element.type1 || element.quick.type == element.type2) ? 1.2 : 1;
    var stabA2 = (element.charge.type == element.type1 || element.charge.type == element.type2) ? 1.2 : 1;
    var stabD1 = (pokemon.quick.type == pokemon.type1 || pokemon.quick.type == pokemon.type2) ? 1.2 : 1;
    var stabD2 = (pokemon.charge.type == pokemon.type1 || pokemon.charge.type == pokemon.type2) ? 1.2 : 1;

    var factorA1 = getPowerType(element.quick.type, pokemon.type1, pokemon.type2);
    var factorA2 = getPowerType(element.charge.type, pokemon.type1, pokemon.type2);
    var factorD1 = getPowerType(pokemon.quick.type, element.type1, element.type2);
    var factorD2 = getPowerType(pokemon.charge.type, element.type1, element.type2);

    var powerA1 = Math.floor(0.5 * element.quick.power * (element.attack / pokemon.defense) * stabA1 * factorA1) + 1;
    var powerD1 = Math.floor(0.5 * pokemon.quick.power * (pokemon.attack / element.defense) * stabD1 * factorD1) + 1;

    var fullPowerA1 = powerA1 * Math.ceil(100 / element.quick.energy);
    var fullPowerD1 = powerD1 * Math.ceil(100 / pokemon.quick.energy);

    var powerA2 = Math.floor(0.5 * element.charge.power * (element.attack / pokemon.defense) * stabA2 * factorA2) + 1;
    var powerD2 = Math.floor(0.5 * pokemon.charge.power * (pokemon.attack / element.defense) * stabD2 * factorD2) + 1;

    var fullPowerA2 = powerA2 * element.charge.energyBars;
    var fullPowerD2 = powerD2 * pokemon.charge.energyBars;
    
    var dpsA = 1000 * (fullPowerA1 + fullPowerA2) / (element.quick.duration * Math.ceil(100 / element.quick.energy) + element.charge.duration * element.charge.energyBars);
    var dpsD = 1000 * (fullPowerD1 + fullPowerD2) / (pokemon.quick.duration * Math.ceil(100 / pokemon.quick.energy) + pokemon.charge.duration * pokemon.charge.energyBars);

    var time = 0;
    var hpA = element.stamina;
    var hpD = pokemon.stamina;
    var lastA = 0;
    var lastD = 0;
    var chargeA = 0;
    var chargeD = 0;

    while (hpA > 0 && hpD > 0 && time < 120000) {
        if (lastA + parseInt(element.charge.duration) <= time && chargeA >= 100 / element.charge.energyBars)
        {
            hpD -= powerA2;
            lastA = time;
        }
        else if (lastA + parseInt(element.quick.duration) <= time && chargeA < 100 / element.charge.energyBars)
        {
            hpD -= powerA1;
            lastA = time;
            chargeA = parseInt(chargeA) + parseInt(element.quick.energy);
        }
        if (lastD + parseInt(pokemon.charge.duration) <= time && chargeD >= 100 / pokemon.charge.energyBars)
        {
            hpA -= powerD2;
            lastD = time;
        }
        else if (lastD + parseInt(pokemon.quick.duration) <= time && chargeD < 100 / pokemon.charge.energyBars)
        {
            hpA -= powerD1;
            lastD = time;
            chargeD = parseInt(chargeD) + parseInt(pokemon.quick.energy);
        }
        time += 50;
    }

    return { 'battleTime': time, 'battleHpA': hpA, 'battleHpD': hpD };
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
