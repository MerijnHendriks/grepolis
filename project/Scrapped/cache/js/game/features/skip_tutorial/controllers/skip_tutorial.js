define('features/skip_tutorial/controllers/skip_tutorial', function () {
    'use strict';

    var Game = require_legacy('Game');
    var GameControllers = require_legacy('GameControllers');
    var GameEvents = require_legacy('GameEvents');
    var ConfirmationWindowFactory = require('factories/windows/dialog/confirmation_window_factory');
    var View = require('features/skip_tutorial/views/skip_tutorial');

    return GameControllers.BaseController.extend({
        initialize: function (options) {
            GameControllers.BaseController.prototype.initialize.apply(this, arguments);

            this.player_model = this.getModel('player');
            this.player_settings_model = this.getModel('player_settings');
            this.grepo_score_model = this.getModel('grepo_score');
            this.player_heroes_collection = this.getCollection('player_heroes');
            this.MIN_REQUIRED_QUESTS = 20;

            if (this.hasPlayerReachedQuestLimit()) {
                this._destroy();
            }
            else {
                this.renderPage();
            }
        },

        renderPage: function () {
            this.view = new View({
                controller : this,
                el : this.$el
            });

            this.registerEventListeners();
        },

        disableGuidedTutorialArrows: function () {
            var l10n = this.l10n.confirmation,
                onConfirm = function () {
                    this.player_model.saveReminders(
                        {activate_tutorial_arrow_by_default: false},
                        window.location.reload()
                    );
                };

            ConfirmationWindowFactory.openSimpleConfirmation(l10n.window_title, l10n.question, onConfirm.bind(this));
        },

        registerEventListeners: function () {
            $.Observer().unsubscribe(this.cm_context);
            $.Observer(GameEvents.tutorial.started).subscribe(this.cm_context, function () {
                this.options.hidden = false;
                this.view.toggleSkipTutorialButton(false);
            }.bind(this));

            $.Observer(GameEvents.window.minimized_windows_area.show).subscribe(this.cm_context, function () {
                this.$el.addClass('minimized_windows');
            }.bind(this));

            $.Observer(GameEvents.window.minimized_windows_area.hide).subscribe(this.cm_context, function () {
                this.$el.removeClass('minimized_windows');
            }.bind(this));

            this.player_model.onChangeQuestsClosed(this, function () {
                if (this.hasPlayerReachedQuestLimit()) {
                    this.view.toggleSkipTutorialButton(true);
                    this._destroy();
                }
            }.bind(this));
        },

        canShowButton: function () {
            var MIN_REQUIRED_SCORE = 250;

            return !this.options.hidden &&
                this.player_settings_model.tutorialArrowActivatedByDefault() && (
                this.getGrepoScoreOnOtherWorlds() >= MIN_REQUIRED_SCORE ||
                this.player_heroes_collection.getHeroes().length > 0);
        },

        hasPlayerReachedQuestLimit: function () {
            return this.player_model.getQuestsClosed() >= this.MIN_REQUIRED_QUESTS;
        },

        /**
         * Gets the total grepo score without the current world score
         * to check if the minimum required score for skipping the tutorial is reached
         *
         * @returns {number}
         */
        getGrepoScoreOnOtherWorlds: function () {
            var world_score;

            world_score = this.grepo_score_model.getWorldScores().filter(function (world_score) {
                return world_score.id === Game.world_id;
            });

            return world_score.length === 1 ? this.grepo_score_model.getTotalScore() - world_score[0].score : 0;
        }
    });
});