/* global GameData */

define('feature/colonization/data/colonization', function () {
    'use strict';

    var Game = require_legacy('Game');

    var TOWN_FOUNDATION_BUILDING_LEVELS = {
        main: 10,
        storage: 10,
        farm: 10,
        lumber: 15,
        stoner: 15,
        ironer: 12,
        barracks: 4,
        temple: 1,
        market: 2,
        place: 1
    };

    return {
        getColonizationTownBasePoints: function () {
            return Game.constants.colonization.basepoints;
        },

        getTownFoundationBuildingLevels: function () {
            return TOWN_FOUNDATION_BUILDING_LEVELS;
        },

        getRequiredAcademyLevel: function () {
            return GameData.colonization_requirements.academy;
        },

        getRequiredDocksLevel: function () {
            return GameData.colonization_requirements.docks;
        }
    };
});