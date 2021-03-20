// Domination Info tab controller
define('features/domination/controllers/domination_info', function () {
    'use strict';

    var GameControllers = require_legacy('GameControllers'),
        DominationInfoView = require('features/domination/views/domination_info'),
        DominationHelper = require('features/domination/helpers/domination'),
        Timestamp = require('misc/timestamp'),
        getHumanReadableTimeDate = require_legacy('getHumanReadableTimeDate'),
        Artifacts = require('enums/artifacts'),
        DOMINATION_AWARD = 'domination_victors';

    return GameControllers.TabController.extend({

        initialize: function (options) {
            GameControllers.TabController.prototype.initialize.apply(this, arguments);
        },

        getDominationEra: function () {
            return this.model_status.getDominationEra();
        },

        getDominationReward: function () {
            return Artifacts.ATHENAS_CORNUCOPIA;
        },

        getDominationAward: function () {
            return DOMINATION_AWARD;
        },

        getCurrentGoal: function() {
            return this.model_status.getCurrentGoal();
        },

        getNextCalculationTimestamp: function () {
            return this.model_status.getNextCalculationTimestamp();
        },

        getWinningAllianceData: function () {
            var id = this.model_status.getWinningAllianceId(),
                ranking_data = this.model_status.getAllianceRanking(id);

            if (!this.winning_alliance_data) {
                this.winning_alliance_data = ranking_data.find(function (data) {
                    return data.id === id;
                });
            }

            return this.winning_alliance_data;
        },

        getWorldEndDate: function () {
            var timestamp = this.model_status.getShutdownTimestamp();
            return getHumanReadableTimeDate(Timestamp.toDate(timestamp - Timestamp.clientGMTOffset(timestamp)));
        },

        allianceMembershipChanged: function () {
            DominationHelper.setTabs(this, this.getDominationEra(), this.model_player);
            this.view.showAndRegisterAllianceState();
        },

        registerEventListeners: function () {
            this.stopListening();
            this.model_player.onChangeAllianceMembership(this, this.allianceMembershipChanged.bind(this));
            this.model_status.onStatusChange(this, this.createReFetchTimerAndReRender.bind(this));
        },

        renderPage: function () {
            this.model_player = this.getModel('player');
            this.model_status = this.getModel('domination_status');
            DominationHelper.setTabs(this, this.getDominationEra(), this.model_player);
            DominationHelper.createStatusReFetchTimer(this.model_status);

            this.initializeView();
        },

        isPlayerInAlliance: function () {
            return this.model_player.getAllianceId() !== null;
        },

        createReFetchTimerAndReRender: function () {
            if (this.view) {
                this.view.render();
            }

            DominationHelper.createStatusReFetchTimer(this.model_status);
        },

        initializeView: function () {
            this.view = new DominationInfoView({
                controller: this,

                el: this.$el
            });
            this.registerEventListeners();
        }

    });
});