/*globals DM*/

define('events/grepolympia/helpers/grepolympia', function () {
    var BenefitHelper = require('helpers/benefit');
    var DISCIPLINES = require('enums/happenings/grepolympia');

    return {
        getl10nForPlayerHints: function () {
            var player_hints_l10n = DM.getl10n('player_hints');

            return BenefitHelper.getl10nForSkin(player_hints_l10n, 'player_hints');
        },

        getDisciplinesDependingOnSkin : function() {
            var disciplines = {
                    grepolympia_summer : [
                        DISCIPLINES.HOPLITE_RACE,
                        DISCIPLINES.ARCHERY,
                        DISCIPLINES.JAVELIN_THROWING,
                        DISCIPLINES.CHARIOT_RACE
                    ],
                    grepolympia_winter : [
                        DISCIPLINES.SHIELD_LUGE,
                        DISCIPLINES.WINTER_BIATHLON,
                        DISCIPLINES.FIGURE_SKATING,
                        DISCIPLINES.SKI_JUMP
                    ],
                    grepolympia_worldcup : [
                        DISCIPLINES.MATCH_VS_ATHENTS,
                        DISCIPLINES.MATCH_VS_SPARTA,
                        DISCIPLINES.MATCH_VS_CORINTH,
                        DISCIPLINES.MATCH_VS_OLYMPUS
                    ]
                },

            skin = BenefitHelper.getBenefitSkin();
            return disciplines[skin];
        },

        getDisciplineDataByDisciplineId: function(discipline_id, model_grepolympia) {
            var discipline_data = model_grepolympia.getDataDisciplines();

            return discipline_data[discipline_id];
        },

        getActiveOrLastDiscipline : function(active_discipline) {
            var disciplines = this.getDisciplinesDependingOnSkin();
            return active_discipline ? active_discipline : disciplines[disciplines.length - 1];
        }
    };
});