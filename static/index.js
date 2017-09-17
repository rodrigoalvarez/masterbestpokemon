var userId = '';
var userName = '';
var pokemons = [];
var myPokemons = [];
var combinations = [];
var pokemonTypes = [];
var translatedAttacks = [];
var legendary = ['151','250', '251'];//'144','145','146','150','151','243','244','245','249','250', '251'
var raids = ['003','006','009','059','065','068','089','094','103','110','112','125','126','129','131',
            '134','135','136','143','144','145','146','150','153','156','159','243','244','245','248','249'];
var filterId = 1;
var loadingFlag = 0;

const cpM = 0.7317;
const iv = 7;
const pokedexCount = 251;

$(document).ready(function () {
    actionVisit();
    getStoredUser();
    if (userId && userName) {
        login(userId, userName);
    }

    $.getJSON('pokedata.json', function (data) {
        pokemons = data;
        combinations = getAllPokemonCombinations();
        loadPokemons();
        $.each(getPokemonNames(), function (key, value) {
            if (value.id == '000') {
                $("#xBattleSelect").append($("<option disabled></option>").attr("value", value.id).text(value.name));
                $("#xArenaSelectA").append($("<option disabled></option>").attr("value", value.id).text(value.name));
                $("#xArenaSelectB").append($("<option disabled></option>").attr("value", value.id).text(value.name));
            } else {
                $("#xBattleSelect").append($("<option></option>").attr("value", value.id).text(value.name));
                $("#xArenaSelectA").append($("<option></option>").attr("value", value.id).text(value.name));
                $("#xArenaSelectB").append($("<option></option>").attr("value", value.id).text(value.name));
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

    $("#xBattleSelect").change(battleChangePokemon);
    $("#xBattleFilter").change(battleChangePokemon);
    
    arenaStartChart();
    $("#xArenaSelectA").change(arenaChangePokemon);
    $("#xArenaSelectB").change(arenaChangePokemon);
});

function loadingCheck() {
    loadingFlag++;
    if (loadingFlag == 3) {
        battleChangePokemon();
    }
}

function battleChangePokemon() {
    filterId = $("#xBattleFilter option:selected").val();
    if (filterId == 1) {
        $("#xBattleDescription")
            .text('Pokemons que tienen mejor DPS (daño por segundo) sin importar que el pokemon muera intentando derrotar al oponente. ' +
                    'En este supuesto, el pokemon no esquiva los ataques del oponente.');
    } else if (filterId == 2) {
        $("#xBattleDescription")
            .text('Pokemons que tienen mejor DPS (daño por segundo) y que logran derrotar al oponente al menos una vez sin morir en el intento. ' +
                    'En este supuesto, el pokemon no esquiva los ataques del oponente.');
    } else if (filterId == 3) {
        $("#xBattleDescription")
            .text('Pokemons que tienen mejor DPS (daño por segundo) y que logran derrotar al oponente sin morir en el intento. ' +
                    'En este supuesto, el pokemon no esquiva los ataques del oponente.');
    } else if (filterId == 4) {
        $("#xBattleDescription")
            .text('Pokemons que tienen mejor DPS (daño por segundo) y que logran derrotar al oponente al menos una vez sin morir en el intento. ' +
                'En este supuesto, el pokemon esquiva los ataques del oponente.');
    } else if (filterId == 5) {
        $("#xBattleDescription")
            .text('Pokemons que tienen mejor DPS (daño por segundo) y que logran derrotar al oponente sin morir en el intento. ' +
                'En este supuesto, el pokemon esquiva los ataques del oponente.');
    }

    var id = $("#xBattleSelect option:selected").val();
    var name = $("#xBattleSelect option:selected").text();
    $("#xBattleImage").css('background-image', 'url(' + "'images/" + name + "_GO.png'" + ')');
    $("#xBattleList").empty();
    $.each(getPokemonOpponents(id), function (key, value) {
        $("#xBattleList")
            .append($(
                '<li class="' + (isMyPokemon(value.pokemon) ? 'pokemon-stored ' : '') + (value.warning > 0 ? 'pokemon-warning ' : '') + 'warning-' + value.warning + '" ' + 
                    'onclick="showBattles(this)">' +
                    '<div class="pokemon-data">' +
                        '<div class="pokemon-image" style="background-image: url(' + "'images/" + value.pokemon.name + "_GO.png'" + ')"></div>' +
                        '<span class="pokemon-name">' + value.pokemon.name + '</span>' +
                        '<span class="pokemon-warning"></span>' +
                    '</div>' +
                    '<div class="pokemon-moves">' +
                        '<div>' +
                            '<span class="pokemon-move-name type-' + value.pokemon.quick.type + '">' + getAttackName(value.pokemon.quick.name) + '</span>' +
                            '<span class="pokemon-move-power">' + value.pokemon.quick.power + '</span>' +
                            '<div class="pokemon-move-image"></div>' +
                        '</div>' +
                        '<div>' +
                            '<span class="pokemon-move-name type-' + value.pokemon.charge.type + '">' + getAttackName(value.pokemon.charge.name) + '</span>' +
                            '<span class="pokemon-move-power">' + value.pokemon.charge.power + '</span>' +
                            '<div class="pokemon-move-image energy-' + value.pokemon.charge.energyBars + '"></div>' +
                        '</div>' +
                    '</div>' +
                    getBattleTemplate(value.battles) +
                '</li>')
            .attr("value", value.pokemon.id));
    });
}

function getBattleTemplate(battles) {
    var result = '<div class="pokemon-damage">';
    battles.forEach(function (element) {
        var item = '<div>' +
                        '<span class="pokemon-damage-win">' + (element.win ? 'Win' : 'Lose') + '</span>' +
                        '<span class="pokemon-damage-time">' + getTimeUI(element.battleTime) + '</span>' +
                        '<span class="pokemon-damage-hp">' + (element.win ? (Math.max(element.battleHpA, 0) + '/' + element.hpA) : (Math.max(element.battleHpD, 0) + '/' + element.hpD)) + '</span>' +
                    '</div>';
        result += item;
    });
    result += '</div>';
    return result;
}

function getTimeUI(value) {
    var time = Math.floor(value / 1000);
    var result = Math.floor(time / 60) + 'm ' + (time % 60) + 's';
    return result;
}

function showBattles(element) {
    if ($(element).hasClass('show-battles')) {
        $(element).removeClass('show-battles');
    } else {
        $(element).addClass('show-battles');
    }
}

function loadPokemons() {
    /*userName = getUsername();
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
    }*/
}

// UI Functions

function getPokemonNames() {
    var result = [];
    result.push({ 'id': '000', 'name': '- Raids -', 'raid': 1 });
    result.push({ 'id': '000', 'name': '- Todos -', 'raid': 0 });
    for (var i = 1; i <= pokedexCount; i++) {
        var element = pokemons[i];
        if (legendary.indexOf(element.speciesID) == -1) {
            result.push({ 'id': element.speciesID, 'name': element.speciesName, 'raid': 0 });
            if (raids.indexOf(element.speciesID) > -1) {
                result.push({ 'id': element.speciesID, 'name': element.speciesName, 'raid': 1 });
            }
        }
    }
    result = result.sort(function(a, b) {
        return a.raid > b.raid ? -1 : (a.raid < b.raid ? 1 : (a.name < b.name ? -1 : 1));
    });
    return result;
}

function getPokemonOpponents(id) {
    var result = [];
    var pokemon = getPokemonData(id);
    return getPowerCombinations(pokemon);
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

function getPokemonData(id) {
    var result = {};
    combinations.forEach(function (element) {
        if (element.id == id) {
            result = element;
        }
    }, this);
    return result;
}

function getAllPokemonCombinations() {
    var result = [];
    for (var i = 1; i <= pokedexCount; i++) {
        var element = pokemons[i];
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
                                'stamina': Math.floor((parseInt(element.base_stamina) + iv) * cpM),
                                'maxCP': element.max_cp });
                }
            }, this);
        }, this);
    }
    return result;
}

function getPowerCombinations(pokemon) {
    var opponent = [];
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
        opponent.push({ 'pokemon': element, 'result': dps, 'warning': getWarningCombinations(element, pokemon) });
    }, this);

    opponent = opponent.sort(function(a, b) {
        return b.result - a.result;
    });

    var result = [];
    var count = 0;
    opponent.forEach(function (element) {
        if (count < 50) {
            element.battles = getBattleCombinations(element.pokemon, pokemon);
            if (element.battles.length > 0) {
                result.push(element);
                count++;
            }
        }
    });
    return result;
}

function getBattleCombinations(pokemonA, pokemonD) {
    var result = [];
    var flagAnyOk = false;
    var flagAllOk = true;
    var flagOk = true;
    combinations.forEach(function (element) {
        if (flagOk && element.id == pokemonD.id) {
            var battle = getBattleResult(pokemonA, element);
            flagAllOk = flagAllOk && battle.win;
            flagAnyOk = flagAnyOk || battle.win;
            flagOk = flagOk && ((filterId == 1 || filterId == 2 || filterId == 4) || ((filterId == 3 || filterId == 5) && flagAllOk));
            result.push(battle);
        }
    }, this);
    if (filterId == 1) {
        return result;
    } else if ((filterId == 2 || filterId == 4) && flagAnyOk) {
        return result;
    } else if ((filterId == 3 || filterId == 5) && flagAllOk) {
        return result;
    } else {
        return [];
    }
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
    var dodgeLastA = 0;

    while (hpA > 0 && hpD > 0 && time < 120000) {
        if (lastA + parseInt(element.charge.duration) + dodgeLastA <= time && chargeA >= 100 / element.charge.energyBars)
        {
            hpD -= powerA2;
            lastA = time;
            dodgeLastA = 0;
        }
        else if (lastA + parseInt(element.quick.duration) + dodgeLastA <= time && chargeA < 100 / element.charge.energyBars)
        {
            hpD -= powerA1;
            lastA = time;
            dodgeLastA = 0;
            chargeA = parseInt(chargeA) + parseInt(element.quick.energy);
        }
        if (lastD + parseInt(pokemon.charge.duration) <= time && chargeD >= 100 / pokemon.charge.energyBars)
        {
            if (filterId == 4 || filterId == 5) {
                hpA -= Math.floor(powerD2 * 0.25);
                lastD = time;
                dodgeLastA += parseInt(pokemon.charge.damage_window);
            } else {
                hpA -= powerD2;
                lastD = time;
            }
        }
        else if (lastD + parseInt(pokemon.quick.duration) <= time && chargeD < 100 / pokemon.charge.energyBars)
        {
            hpA -= powerD1;
            lastD = time;
            chargeD = parseInt(chargeD) + parseInt(pokemon.quick.energy);
        }
        time += 50;
    }

    return { 'battleTime': time, 'win': hpA > 0 && hpA > hpD, 'hpA': element.stamina, 'hpD': pokemon.stamina, 'battleHpA': hpA, 'battleHpD': hpD };
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




/* Functions - Auxiliar */

function login(id, user) {
    userId = id;
    userName = user;
    setStoredUser();
    $('.header-user .header-option-text').text(user);

    $('.header-signup .header-option-text').hide();
    $('.header-signin .header-option-text').hide();
    $('.header-user .header-option-text').show();
    $('.header-pokedex .header-option-text').show();
    $('.header-logout .header-option-text').show();
}

function logout() {
    userId = '';
    userName = '';
    setStoredUser();
    $('.header-user .header-option-text').text('');

    $('.header-signup .header-option-text').show();
    $('.header-signin .header-option-text').show();
    $('.header-user .header-option-text').hide();
    $('.header-pokedex .header-option-text').hide();
    $('.header-logout .header-option-text').hide();
}

function errorFormat(code) {
    if (code == 100) {
        return 'Error interno en el servidor, inténtelo más tarde';

    } else if (code == 101) {
        return 'El usuario ya existe';

    } else if (code == 102) {
        return 'El usuario no existe o la contraseña no es válida';

    } else if (code == 201) {
        return 'El relato no existe';

    }
    return '';
}


/* Functions - Actions */

function actionVisit() {
    $.ajax({
        url: 'actionvisit',
        type: 'PUT',
        cache: false,
        contentType: 'application/json',
        success: function (res) {
            //$('.content-visit').show();
            //$('.content-visit .content-visit-value').text(res);
        }
    });
}


/* Functions - Pokedex */

function isMyPokemon(pokemon) {
    return false;
}


/* Functions - Arena */

var barChartData;
var myBar;
var ctx;

var chartColors = {
	normal: '#FFEB3B',
	fire: '#FF5722',
	water: '#2196F3',
	electric: '#FFC107',
	grass: '#4CAF50',
	ice: '#00BCD4',
	fighting: '#FF9800',
	poison: '#9C27B0',
	ground: '#795548',
	flying: '#009688',
	psychic: '#673AB7',
	bug: '#CDDC39',
	rock: '#9E9E9E',
	ghost: '#3F51B5',
	dragon: '#F44336',
	dark: '#000000',
	steel: '#607D8B',
	fairy: '#E91E63',
	other: '#E0E0E0'
};

function arenaStartChart() {
    barChartData = {
        labels: ["CP","Attack", "Defense", "Stamina"],
        datasets: [{
            label: 'Dataset1',
            backgroundColor: chartColors.normal,
            stack: 'Stack0',
            data: [
                0.5,
                0.5
            ]
        }, {
            label: 'Dataset2',
            backgroundColor: chartColors.normal,
            stack: 'Stack0',
            data: [
                0.5,
                0.5
            ]
        }]

    };

    ctx = document.getElementById("xArenaChart").getContext("2d");
    myBar = new Chart(ctx, {
        type: 'horizontalBar',
        data: barChartData,
        options: {
            title: {
                display: false
            },
            tooltips: {
            },
            responsive: true,
            scales: {
                xAxes: [{
                    stacked: true,
                }],
                yAxes: [{
                    stacked: true
                }]
            }
        }
    });
}

function arenaChangePokemon() {
    var idA = $("#xArenaSelectA option:selected").val();
    var nameA = $("#xArenaSelectA option:selected").text();
    var pokemonA = getPokemonData(idA);

    var idB = $("#xArenaSelectB option:selected").val();
    var nameB = $("#xArenaSelectB option:selected").text();
    var pokemonB = getPokemonData(idB);
    
    barChartData.datasets[0].label = nameA;
    barChartData.datasets[1].label = nameB;

    barChartData.datasets[0].backgroundColor = chartColors[pokemonA.type1];
    barChartData.datasets[1].backgroundColor = chartColors[pokemonA.type1] != chartColors[pokemonB.type1] ? chartColors[pokemonB.type1] : chartColors.other;

    barChartData.datasets[0].data[0] = Math.round(1000 * pokemonA.maxCP / (pokemonA.maxCP + pokemonB.maxCP)) / 1000;
    barChartData.datasets[0].data[1] = Math.round(1000 * pokemonA.attack / (pokemonA.attack + pokemonB.attack)) / 1000;
    barChartData.datasets[0].data[2] = Math.round(1000 * pokemonA.defense / (pokemonA.defense + pokemonB.defense)) / 1000;
    barChartData.datasets[0].data[3] = Math.round(1000 * pokemonA.stamina / (pokemonA.stamina + pokemonB.stamina)) / 1000;

    barChartData.datasets[1].data[0] = Math.round(1000 * (1 - barChartData.datasets[0].data[0])) / 1000;
    barChartData.datasets[1].data[1] = Math.round(1000 * (1 - barChartData.datasets[0].data[1])) / 1000;
    barChartData.datasets[1].data[2] = Math.round(1000 * (1 - barChartData.datasets[0].data[2])) / 1000;
    barChartData.datasets[1].data[3] = Math.round(1000 * (1 - barChartData.datasets[0].data[3])) / 1000;

    myBar.update();
}


/* Functions - Storage */

function getStoredUser() {
    if (typeof(Storage) !== "undefined") {
        userId = localStorage.getItem("mpg-userid") || '';
        userName = localStorage.getItem("mpg-username") || '';
    }
}

function setStoredUser() {
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem("mpg-userid", userId);
        localStorage.setItem("mpg-username", userName);
    }
}


/* UI */

function goLogout() {
    logout();
    goHome();
}

function goHome() {
    $('#xContentPokedex').hide();
    $('#xContentBattle').hide();
    $('#xContentArena').hide();

    $('.master-content').fadeIn();
    $('.master-dialog').fadeOut();
}

function goDialog() {
    $('#xSignupDialog').hide();
    $('#xSigninDialog').hide();
    $('#xPokemonDialog').hide();

    $('.master-content').fadeOut();
    $('.master-dialog').fadeIn();
}

function goSignup() {
    goDialog();
    $('#xSignupDialog').show();
    $('.dialog-field-error').hide();
    $('#xSignupUser').val('');
    $('#xSignupPass').val('');
    $('#xSignupRepass').val('');
    $('#xSignupOk').prop('disabled', false);
}

function goSignin() {
    goDialog();
    $('#xSigninDialog').show();
    $('.dialog-field-error').hide();
    $('#xSigninUser').val('');
    $('#xSigninPass').val('');
    $('#xSigninOk').prop('disabled', false);
}

function goPokedex() {
    if (!userId) {
        goSignin();
        return;
    }
    goHome();
    $('#xContentPokedex').show();
}

function goBattle() {
    goHome();
    $('#xContentBattle').show();
}

function goArena() {
    goHome();
    arenaChangePokemon();
    $('#xContentArena').show();
}
