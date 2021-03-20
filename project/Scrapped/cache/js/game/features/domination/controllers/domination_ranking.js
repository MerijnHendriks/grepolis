// Domination Ranking tab controller
define('features/domination/controllers/domination_ranking', function () {
    'use strict';

    var BaseRankingControllers = require('features/ranking/controllers/base_ranking'),
        DominationRankingView = require('features/domination/views/domination_ranking'),
        DominationHelper = require('features/domination/helpers/domination'),
        MainRankingController = require('features/ranking/controllers/ranking'),
        Filters = require('enums/filters'),
        AllianceFlagHelper = require('helpers/alliance_flag'),
        AllianceLinkHelper = require('helpers/alliance_link');

    return BaseRankingControllers.extend({

        initialize: function (options) {
            BaseRankingControllers.prototype.initialize.apply(this, arguments);
        },

        registerEventListeners: function () {
            this.stopListening();
            this.model_player.onChangeAllianceMembership(this, DominationHelper.setTabs.bind(this, this, this.getDominationEra(), this.model_player));
            this.model_status.onStatusChange(this, this.createReFetchTimerAndReRender.bind(this));
            this.custom_colors.onColorChange(this, function () {
                this.view.renderWinnerPedestal();
            }.bind(this));
        },

        getDominationEra: function () {
            return this.model_status.getDominationEra();
        },

        getNextCalculationTimestamp: function () {
            return this.model_status.getNextCalculationTimestamp();
        },

        getFlagForAlliance: function (alliance_rank) {
            var ranking_data = this.getRankingData(),
                alliance_data = ranking_data[alliance_rank],
                alliance_flag_type = (alliance_data && alliance_data.flag_type) ? alliance_data.flag_type : 0;

            return AllianceFlagHelper.getCdnFlagImageUrl(alliance_flag_type);
        },

        getFlagColorForAlliance: function (alliance_rank) {
            var ranking_data = this.getRankingData(),
                alliance_data = ranking_data[alliance_rank],
                alliance_id = (alliance_data && alliance_data.id) ? alliance_data.id : null;

            return AllianceFlagHelper.getFlagColorForAlliance(alliance_id, this.custom_colors);
        },

        renderPage: function () {
            this.custom_colors = this.getCollection('custom_colors');
            this.model_status = this.getModel('domination_status');
            BaseRankingControllers.prototype.getAllGeneralModels.apply(this, arguments);
            DominationHelper.setTabs(this, this.getDominationEra(), this.model_player);
            DominationHelper.createStatusReFetchTimer(this.model_status);
            this.initializeView();
        },

        initializeView: function () {
            this.view = new DominationRankingView({
                controller: this,

                el: this.$el
            });
            this.registerEventListeners();
        },

        createReFetchTimerAndReRender: function () {
            if (this.view) {
                this.view.render();
            }

            DominationHelper.createStatusReFetchTimer(this.model_status);
        },

        getRankingData: function () {
            return this.model_status.getAllianceRanking();
        },

        getRankingHeaderRow: function () {
            var ranking_data = this.getRankingData(),
                first_object_properties = Object.assign({}, ranking_data[Object.keys(ranking_data)[0]]);
            delete first_object_properties.id;
            delete first_object_properties.flag_type;
            delete first_object_properties.is_in_last_stand;
            delete first_object_properties.last_stand_started_on;

            return Object.keys(first_object_properties);
        },

        getAllRankingColumnRows: function () {
            var column_rows = [],
                ranking_data = Object.assign({}, this.getRankingData()),
                i = 0;
            Object.keys(ranking_data).forEach(function (key) {
                var data = [],
                    alliance_id,
                    alliance_name,
                    columns_to_ignore = ['flag_type', 'is_in_last_stand', 'last_stand_started_on'];
                Object.keys(ranking_data[key]).forEach(function (data_key) {
                    if (data_key === 'id') {
                        alliance_id = ranking_data[key][data_key];
                    } else if (columns_to_ignore.indexOf(data_key) === -1) {
                        var final_data = ranking_data[key][data_key];
                        if (data_key === 'domination_percentage') {
                            final_data = final_data + '%';
                        } else if (data_key === 'alliance_name') {
                            alliance_name = final_data;
                            final_data = AllianceLinkHelper.getAllianceLink(alliance_id, alliance_name);
                        }
                        data.push(final_data);
                    }
                });

                var column_data = {
                    alliance_id: alliance_id,
                    alliance_name: alliance_name,
                    data: data,
                    row_id: i,
                    highlight_row: ranking_data[key].is_in_last_stand,
                    last_stand_started_on: ranking_data[key].last_stand_started_on
                };
                column_rows.push(column_data);
                i++;
            });
            return column_rows;
        },

        getRowsPerPage: function () {
            return 10; //10 rows per page for this ranking
        },

        registerRanking: function () {
            this.unregisterController('domination_ranking');
            this.registerController('domination_ranking', new MainRankingController({
                parent_controller: this,
                settings: {
                    el_selector: this.$el.find('.domination_ranking .ranking'),
                    ranking_data: this.getRankingData(),
                    ranking_header_row: this.getRankingHeaderRow(),
                    column_rows: this.getRankingColumnRowsToShow(0, this.getRowsPerPage()), //10 rows per page
                    total_rows: this.all_ranking_rows.length,
                    switch_page: this.switchPage.bind(this),
                    search_page: this.searchPage.bind(this),
                    my_rank_page: this.model_player.getAllianceId() ? this.getMyRankPageNumber.bind(this) : null,
                    completation_type: Filters.AUTOCOMPLETE_TYPES.ALLIANCE,
                    highlight_id: this.getMyRankId()
                }
            }));
        }
    });
});
