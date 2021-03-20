/* globals DateHelper, DM */
define('features/olympus/controllers/ranking', function () {
	'use strict';

	var BaseRankingControllers = require('features/ranking/controllers/base_ranking'),
		RankingView = require('features/olympus/views/ranking'),
		AllianceLinkHelper = require('helpers/alliance_link'),
		AllianceFlagHelper = require('helpers/alliance_flag'),
		MainRankingController = require('features/ranking/controllers/ranking');


	return BaseRankingControllers.extend({
		view: null,

		initialize: function (options) {
			BaseRankingControllers.prototype.initialize.apply(this, arguments);
		},

		registerEventListeners: function () {
			this.stopListening();
			this.custom_colors.onColorChange(this, function () {
				this.view.renderWinnerPedestal();
			}.bind(this));
		},

		getFlagForAlliance: function (alliance_rank) {
			var ranking_data = this.getRankingData(),
				ranking_data_keys = Object.keys(ranking_data),
				key = ranking_data_keys[alliance_rank],
				alliance_flag_type = (ranking_data[key] && ranking_data[key].alliance_flag_type) ?
					ranking_data[key].alliance_flag_type : 0;

			return AllianceFlagHelper.getCdnFlagImageUrl(alliance_flag_type);
		},

		getFlagColorForAlliance: function (alliance_rank) {
			var ranking_data = this.getRankingData(),
				ranking_data_keys = Object.keys(ranking_data),
				key = ranking_data_keys[alliance_rank],
				alliance_id = (ranking_data[key] && ranking_data[key].alliance_id) ?
					ranking_data[key].alliance_id : null;

			return AllianceFlagHelper.getFlagColorForAlliance(alliance_id, this.custom_colors);
		},

		renderPage: function () {
			var active_page = this.window_model.getActivePage();

			if (active_page.isHidden()) {
				active_page.show();
			}

			this.olympus_ranking = this.getModel('olympus_ranking');
			this.custom_colors = this.getCollection('custom_colors');
			BaseRankingControllers.prototype.getAllGeneralModels.apply(this, arguments);

			if (this.l10n.hasOwnProperty('error')) {
				this.l10n = DM.getl10n('olympus_temple_info');
			}

			this.initializeView();
		},

		initializeView: function () {
			this.view = new RankingView({
				controller: this,

				el: this.$el
			});
			this.registerEventListeners();
		},

		getRankingData: function () {
			return this.getModel('olympus_ranking').getRanking();
		},

		getRankingHeaderRow: function () {
			var ranking_data = this.getRankingData(),
				first_object_properties = Object.assign({rank: 1}, ranking_data[Object.keys(ranking_data)[0]]);
			delete first_object_properties.alliance_flag_type;
			delete first_object_properties.alliance_id;
			delete first_object_properties.is_current_holder;

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
					columns_to_ignore = ['alliance_id', 'alliance_flag_type', 'is_current_holder'];
				data.push(i + 1);
				alliance_id = ranking_data[key].alliance_id;
				Object.keys(ranking_data[key]).forEach(function (data_key) {
					if (columns_to_ignore.indexOf(data_key) === -1) {
						var final_data = ranking_data[key][data_key];
						if (data_key === 'alliance_name') {
							alliance_name = final_data;
							if (alliance_name !== null) {
								final_data = AllianceLinkHelper.getAllianceLink(alliance_id, alliance_name);
							} else {
								final_data = this.getl10n().ranking.dissolved_alliance;
							}
						} else if (data_key === 'seconds_held') {
							final_data = DateHelper.readableSeconds(ranking_data[key].seconds_held, true);
						}
						data.push(final_data);
					}
				}.bind(this));

				var column_data = {
					alliance_id: alliance_id,
					alliance_name: alliance_name,
					data: data,
					row_id: i,
					highlight_row: ranking_data[key].is_current_holder
				};
				column_rows.push(column_data);
				i++;
			}.bind(this));
			return column_rows;
		},

		getRowsPerPage: function () {
			return 7; //7 rows per page for this ranking
		},

		registerRanking: function () {
			this.unregisterController('olympus_ranking');
			this.registerController('olympus_ranking', new MainRankingController({
				parent_controller: this,
				settings: {
					el_selector: this.$el.find('.ranking'),
					main_css_class: 'purple_header',
					rows_per_page: this.getRowsPerPage(),
					ranking_data: this.getRankingData(),
					ranking_header_row: this.getRankingHeaderRow(),
					column_rows: this.getRankingColumnRowsToShow(0, this.getRowsPerPage()), //7 rows per page
					total_rows: this.all_ranking_rows.length,
					switch_page: this.switchPage.bind(this),
					search_page: this.searchPage.bind(this),
					my_rank_page: this.model_player.getAllianceId() ? this.getMyRankPageNumber.bind(this) : null,
					completation_type: 'game_alliance',
					highlight_id: this.getMyRankId()
				}
			}));
		}
	});
});
