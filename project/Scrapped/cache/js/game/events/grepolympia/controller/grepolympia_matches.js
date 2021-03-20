define('events/grepolympia/controller/grepolympia_matches', function (require) {
    'use strict';

    var EventJsonTrackingController = require('controllers/common/event_json_tracking'),
        GrepolympiaMatchesView = require('events/grepolympia/views/grepolympia_matches'),
        GrepolympiaHelper = require('events/grepolympia/helpers/grepolympia'),
        LAURELS = 'laurels';

    return EventJsonTrackingController.extend({
        view: null,

        initialize: function (options) {
            //Don't remove it, it should call its parent
            EventJsonTrackingController.prototype.initialize.apply(this, arguments);
        },

        registerEventListeners: function () {
            this.stopListening();
            this.model_player_ledger.onLaurelsChange(this, this.view.setNewLaurelAmountToLaurelBox.bind(this.view));
            this.model_match.onChange(this, this.view.reRender.bind(this.view));
        },

        getCurrency: function () {
            return this.model_player_ledger.getCurrency(LAURELS);
        },

        renderPage: function () {
            this.model_discipline = this.getModel('grepolympia_discipline');
            this.model_player_ledger = this.getModel('player_ledger');
            this.model_match = this.getModel('grepolympia_match');
            this.model_grepolympia = this.getModel('grepolympia');

            this.initializeView();
            this.fetchMatch(this.getActiveOrLastDiscipline());

            return this;
        },

        initializeView: function () {
            this.view = new GrepolympiaMatchesView({
                controller: this,
                el: this.$el
            });

            this.registerEventListeners();
        },

        getTopTeams: function () {
            return this.model_match.getTopTeams();
        },

        getDisciplineEndsAt: function () {
            return this.model_discipline.getDisciplineEndsAt();
        },

        getActiveGrepolympiaDiscipline: function () {
            return this.model_discipline.getDiscipline();
        },

        getActiveOrLastDiscipline: function () {
            var active_discipline = this.getActiveGrepolympiaDiscipline();
            return GrepolympiaHelper.getActiveOrLastDiscipline(active_discipline);
        },

        getCurrentReward: function () {
            return this.model_match.getReward();
        },

        getCurrentAward: function () {
            return this.model_match.getAward();
        },

        getOpponentScore: function () {
            return this.model_match.getOpponentScore();
        },

        getCommunityScore: function () {
            return this.model_match.getCommunityScore();
        },

        fetchMatch: function (discipline_id) {
            this.showLoading();

            return this.model_match.fetchMatch(discipline_id, function () {
                this.view.render(discipline_id);
                this.hideLoading();
            }.bind(this));
        },

        getScoreUnit: function(discipline_id) {
            var active_discipline_data = GrepolympiaHelper.getDisciplineDataByDisciplineId(discipline_id, this.model_grepolympia);

            return active_discipline_data.score_unit;
        },

        getDisciplineDescription: function(discipline_id) {
            var active_discipline_data = GrepolympiaHelper.getDisciplineDataByDisciplineId(discipline_id, this.model_grepolympia);
            return active_discipline_data.description;
        }
    });
});
