var userName = '';
var pokemons = [];
var combinations = [];
var pokemonTypes = [];
var translatedAttacks = [];
var legendary = ['151','250', '251'];//'144','145','146','150','151','243','244','245','249','250', '251'
var raids = ['003','006','009','059','065','068','089','094','103','110','112','125','126','129','131','134','135','136','143','144','145','146','150','153','156','159','243','244','245','248','249'];
var loadingFlag = 0;
var cpM = 0.7317;
var iv = 7;

$(document).ready(function () {
    $.getJSON('pokedata.json', function (data) {
        pokemons = data;
        combinations = getAllPokemonCombinations();
        loadPokemons();
        $.each(getPokemonNames(), function (key, value) {
            if (value.id == '000') {
                $("#xPokemonListA").append($("<option disabled></option>").attr("value", value.id).text(value.name));
                $("#xPokemonListB").append($("<option disabled></option>").attr("value", value.id).text(value.name));
            } else {
                $("#xPokemonListA").append($("<option></option>").attr("value", value.id).text(value.name));
                $("#xPokemonListB").append($("<option></option>").attr("value", value.id).text(value.name));
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
    Samples.utils.srand(Date.now());
    startPokemon();
    $("#xPokemonListA").change(changePokemon);
    $("#xPokemonListB").change(changePokemon);
});

function loadingCheck() {
    loadingFlag++;
    if (loadingFlag == 3) {
        changePokemon();
    }
}

var barChartData;
var myBar;
var ctx;

function startPokemon() {
    barChartData = {
        labels: ["CP","Attack", "Defense", "Stamina"],
        datasets: [{
            label: 'Dataset 1',
            backgroundColor: window.chartColors.red,
            stack: 'Stack 0',
            data: [
                randomScalingFactor(),
                randomScalingFactor()
            ]
        }, {
            label: 'Dataset 2',
            backgroundColor: window.chartColors.blue,
            stack: 'Stack 0',
            data: [
                randomScalingFactor(),
                randomScalingFactor()
            ]
        }]

    };

    ctx = document.getElementById("myChart").getContext("2d");
    myBar = new Chart(ctx, {
        type: 'horizontalBar',
        data: barChartData,
        options: {
            title:{
                display: true,
                text:"Chart.js Bar Chart - Stacked"
            },
            tooltips: {
                mode: 'index',
                intersect: false
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

function changePokemon() {
    var idA = $("#xPokemonListA option:selected").val();
    var nameA = $("#xPokemonListA option:selected").text();
    var pokemonA = getPokemonData(idA);

    var idB = $("#xPokemonListB option:selected").val();
    var nameB = $("#xPokemonListB option:selected").text();
    var pokemonB = getPokemonData(idB);
    
    barChartData.datasets[0].label = nameA;
    barChartData.datasets[1].label = nameB;

    barChartData.datasets[0].data[0] = pokemonA.maxCP / (pokemonA.maxCP + pokemonB.maxCP);
    barChartData.datasets[0].data[1] = pokemonA.attack / (pokemonA.attack + pokemonB.attack);
    barChartData.datasets[0].data[2] = pokemonA.defense / (pokemonA.defense + pokemonB.defense);
    barChartData.datasets[0].data[3] = pokemonA.stamina / (pokemonA.stamina + pokemonB.stamina);

    barChartData.datasets[1].data[0] = pokemonB.maxCP / (pokemonA.maxCP + pokemonB.maxCP);
    barChartData.datasets[1].data[1] = pokemonB.attack / (pokemonA.attack + pokemonB.attack);
    barChartData.datasets[1].data[2] = pokemonB.defense / (pokemonA.defense + pokemonB.defense);
    barChartData.datasets[1].data[3] = pokemonB.stamina / (pokemonA.stamina + pokemonB.stamina);

    /*barChartData.datasets.forEach(function(dataset, i) {
        dataset.label = i == 0 ? nameA : nameB;
        dataset.data = dataset.data.map(function() {
            return randomScalingFactor();
        });
    });*/
    myBar.update();
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
                                'stamina': Math.floor((parseInt(element.base_stamina) + iv) * cpM),
                                'maxCP': element.max_cp });
                }
            }, this);
        }, this);
    }, this);
    return result;
}

/* === Storage Functions === */

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

function setPokemons(data) {
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem("mbp-pokemons", data);
        changePokemon();
    }
}


// Chart Functions

var chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(201, 203, 207)'
};

function randomScalingFactor() {
    return Math.round(Samples.utils.rand(0, 100));
};

var Months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

var COLORS = [
    '#4dc9f6',
    '#f67019',
    '#f53794',
    '#537bc4',
    '#acc236',
    '#166a8f',
    '#00a950',
    '#58595b',
    '#8549ba'
];

var Samples = this.Samples || (this.Samples = {});
var Color = this.Color;

Samples.utils = {
    srand: function(seed) {
        this._seed = seed;
    },

    rand: function(min, max) {
        var seed = this._seed;
        min = min === undefined ? 0 : min;
        max = max === undefined ? 1 : max;
        this._seed = (seed * 9301 + 49297) % 233280;
        return min + (this._seed / 233280) * (max - min);
    },

    numbers: function(config) {
        var cfg = config || {};
        var min = cfg.min || 0;
        var max = cfg.max || 1;
        var from = cfg.from || [];
        var count = cfg.count || 8;
        var decimals = cfg.decimals || 8;
        var continuity = cfg.continuity || 1;
        var dfactor = Math.pow(10, decimals) || 0;
        var data = [];
        var i, value;

        for (i = 0; i < count; ++i) {
            value = (from[i] || 0) + this.rand(min, max);
            if (this.rand() <= continuity) {
                data.push(Math.round(dfactor * value) / dfactor);
            } else {
                data.push(null);
            }
        }

        return data;
    },

    labels: function(config) {
        var cfg = config || {};
        var min = cfg.min || 0;
        var max = cfg.max || 100;
        var count = cfg.count || 8;
        var step = (max - min) / count;
        var decimals = cfg.decimals || 8;
        var dfactor = Math.pow(10, decimals) || 0;
        var prefix = cfg.prefix || '';
        var values = [];
        var i;

        for (i = min; i < max; i += step) {
            values.push(prefix + Math.round(dfactor * i) / dfactor);
        }

        return values;
    },

    months: function(config) {
        var cfg = config || {};
        var count = cfg.count || 12;
        var section = cfg.section;
        var values = [];
        var i, value;

        for (i = 0; i < count; ++i) {
            value = Months[Math.ceil(i) % 12];
            values.push(value.substring(0, section));
        }

        return values;
    },

    color: function(index) {
        return COLORS[index % COLORS.length];
    },

    transparentize: function(color, opacity) {
        var alpha = opacity === undefined ? 0.5 : 1 - opacity;
        return Color(color).alpha(alpha).rgbString();
    }
};
