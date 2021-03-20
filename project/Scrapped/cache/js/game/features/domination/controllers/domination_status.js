// Domination tab controller
define('features/domination/controllers/domination_status', function () {
    'use strict';

    var GameControllers = require_legacy('GameControllers'),
        DominationView = require('features/domination/views/domination_status'),
        DefaultColorsHelper = require('helpers/default_colors'),
        Timestamp = require_legacy('Timestamp'),
        FILTERS = require('enums/filters'),
        LAST_STAND_STATUS = require('enums/last_stand_status'),
        DOMINATION_ERAS = require('enums/domination_eras'),
        DominationHelper = require('features/domination/helpers/domination');

    return GameControllers.TabController.extend({

        initialize: function (options) {
            GameControllers.TabController.prototype.initialize.apply(this, arguments);
        },

        registerEventListeners: function () {
            this.stopListening();
            this.collection_colors.onColorChange(this, function () {
                this.view.renderAllianceStatus();
                this.view.registerAllianceStatusProgress();
            });
            this.alliance_status_dominations.onStatusChange(this, this.prepareLastStandStatus.bind(this));
            this.model_player.onChangeAllianceMembership(this, DominationHelper.setTabs.bind(this, this, this.getDominationEra(), this.model_player));
            this.model_status.onStatusChange(this, this.createReFetchTimerAndReRender.bind(this));
            this.collection_benefits.onBenefitStarted(this, this.reRenderLastStandButton.bind(this));
            this.collection_benefits.onBenefitEnded(this, this.reRenderLastStandButton.bind(this));
        },

        renderPage: function () {
            this.model_status = this.getModel('domination_status');
            this.model_player = this.getModel('player');
            this.alliance_status_dominations = this.getCollection('alliance_status_dominations');
            this.collection_colors = this.getCollection('custom_colors');
            this.collection_benefits = this.getCollection('benefits');
            DominationHelper.setTabs(this, this.getDominationEra(), this.model_player);
            DominationHelper.createStatusReFetchTimer(this.model_status);

            this.initializeView();
        },

        createReFetchTimerAndReRender: function () {
            if (this.view) {
                this.view.render();
            }

            DominationHelper.createStatusReFetchTimer(this.model_status);
        },

        prepareLastStandStatus: function () {
            if (this.view) {
                this.view.renderAndRegisterLastStandStatus();
            }
        },

        reRenderLastStandButton: function() {
            if (this.view) {
                this.view.registerLastStandButton();
            }
        },

        initializeView: function () {
            this.view = new DominationView({
                controller: this,

                el: this.$el
            });
            this.registerEventListeners();
        },

        startLastStand: function () {
            this.alliance_status_dominations.startLastStand();
        },

        getLastStandStatus: function () {
            var status = LAST_STAND_STATUS.NOT_REACHED;
            if (this.alliance_status_dominations.length > 0) {
                var started_at = this.getLastStandStartedAtTimestamp(),
                    now = Timestamp.now();

                if (started_at > now) {
                    status = LAST_STAND_STATUS.ACTIVATION_POSSIBLE;
                } else if (started_at <= now) {
                    status = LAST_STAND_STATUS.ACTIVATED;
                }
            }
            return status;
        },

        getLastStandStartedAtTimestamp: function () {
            return this.alliance_status_dominations.getLastStandStartedAtTimestamp();
        },

        getLastStandFinishedAtTimestamp: function () {
            return this.alliance_status_dominations.getLastStandFinishedAtTimestamp();
        },

        isPostDominationEraActive: function () {
            return this.getDominationEra() === DOMINATION_ERAS.POST_DOMINATION;
        },

        getDominationEra: function () {
            return this.model_status.getDominationEra();
        },

        getUnownedCities: function () {
            return this.model_status.getUnownedCities();
        },

        getTotalCities: function () {
            return this.model_status.getTotalCities();
        },

        getAllianceData: function () {
            var alliance_id = this.model_player.getAllianceId();
            return this.model_status.getAllianceData(alliance_id);
        },

        getCurrentGoal: function () {
            return this.model_status.getCurrentGoal();
        },

        getListOfAllianceCustomColors: function () {
            return this.getCollection('custom_colors').getCustomAllianceColorsForCurrentPlayer();
        },

        getCustomColorForOwnAlliance: function () {
            var alliance_color = this.collection_colors.getCustomColorForOwnAlliance();

            if (alliance_color === null) {
                alliance_color = DefaultColorsHelper.getDefaultColorByIdFromGameData(FILTERS.ALLIANCE_TYPES.OWN_ALLIANCE);
            }

            return '#' + alliance_color;
        }
    });
});
