define('features/god_selection/controllers/artifacts', function (require) {
    'use strict';

    var GameControllers = require_legacy('GameControllers');
    var ArtifactsView = require('features/god_selection/views/artifacts');
    var ARTIFACTS = require('enums/artifacts');
    var MAX_FAVOR = 500;

    return GameControllers.TabController.extend({
        initialize: function (options) {
            GameControllers.TabController.prototype.initialize.apply(this, arguments);
        },

        initializeView: function () {
            this.view = new ArtifactsView({
                controller: this,
                el: this.$el
            });
        },

        renderPage: function () {
            this.player_model = this.getModel('player');
            this.player_gods_model = this.getModel('player_gods');

            this.initializeView();
        },

        isArtifactUnlocked: function (artifact_id) {
            var result;

            switch (artifact_id) {
                case ARTIFACTS.ATHENAS_CORNUCOPIA:
                    result = this.hasDominationArtifactUnlocked();
                    break;
                case ARTIFACTS.ZEUS_SPARK:
                    result = this.hasWorldWondersArtifactUnlocked();
                    break;
                case ARTIFACTS.GOLDEN_FLEECE:
                    result = this.hasOlympusArtifactUnlocked();
                    break;
                default:
                    result = false;
                    break;
            }

            return result;
        },

        hasDominationArtifactUnlocked: function () {
            return this.player_model.getDominationArtifactUnlocked();
        },

        hasOlympusArtifactUnlocked: function () {
            return this.player_model.getOlympusArtifactUnlocked();
        },

        hasWorldWondersArtifactUnlocked: function () {
            return this.player_gods_model.getMaxFavor() > MAX_FAVOR;
        }
    });
});