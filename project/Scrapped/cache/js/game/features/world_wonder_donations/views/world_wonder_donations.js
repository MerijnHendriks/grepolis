define('features/world_wonder_donations/views/world_wonder_donations', function() {
	'use strict';

	var Views = require_legacy('GameViews');

	return Views.BaseView.extend({
		initialize: function (options) {
			Views.BaseView.prototype.initialize.apply(this, arguments);
			this.l10n = this.controller.getl10n();
			this.render(options.wonder_type);
			this.scrollToCurrentPlayer();
		},

		render: function(current_wonder_type ) {
			var in_alliance_donations_for_wonder_type = this.controller.getInAllianceDonationsForWonderType(current_wonder_type);

			this.renderTemplate(this.$el, 'index', {
				l10n : this.l10n,
				rows: in_alliance_donations_for_wonder_type,
				wonder_types: this.controller.getWonderTypes(),
				total_donation_count: this.controller.getCollection('wonder_participations').getTotalDonationAmount(current_wonder_type),
				in_alliance_donation_count: in_alliance_donations_for_wonder_type.reduce(function(sum, donation) {
					return sum + donation.getTotal();
				}, 0)
			});
			this.registerScrollbar();
			this.registerWonderTypeDropdown(current_wonder_type);
			this.registerPlayerSearch(in_alliance_donations_for_wonder_type);
			this.registerTooltips();
		},

		reRender: function() {
			var wonder_type = this.getComponent('wonder_type_filter').getValue();
			this.render(wonder_type);
		},

		registerScrollbar: function() {
			this.unregisterComponent('scrollbar');
			this.registerComponent('scrollbar', this.$el.find('.js-scrollbar-viewport').skinableScrollbar({
				orientation: 'vertical',
				template: 'tpl_skinable_scrollbar',
				skin: 'blue',
				disabled: false,
				elements_to_scroll: this.$el.find('.js-scrollbar-content'),
				element_viewport: this.$el.find('.js-scrollbar-viewport'),
				scroll_position: 0,
				min_slider_size : 16
			}));
		},

		registerWonderTypeDropdown: function(wonder_type) {
			var options =  this.controller.getWonderTypes()
				.map(function(wonder) {
					return {
						value: wonder,
						name: this.l10n[wonder] || wonder
					};
				}.bind(this));

			options.unshift({
					value: this.controller.ALL,
					name: this.l10n.all
				}
			);

			this.unregisterComponent('wonder_type_filter');
			this.registerComponent('wonder_type_filter', this.$el.find('.wonder_type_filter').dropdown({
				list_pos : 'left',
				value : wonder_type || this.controller.ALL,
				options : options
			}).on('dd:change:value', function(e, new_val, old_val) {
				this.render(new_val);
				this.scrollToCurrentPlayer();
			}.bind(this)));
		},

		registerPlayerSearch: function(alliance_players) {
			var auto_completion_data = [];
			alliance_players.forEach(function (model) {
				auto_completion_data.push(model.getName());
			});


			this.unregisterComponent('player_search_input');
			this.registerComponent('player_search_input', this.$el.find('.player_search_input').textbox({
				type: 'text',
				value : this.controller.playerFilterName,
				focus: true,
				autocomplete_data: auto_completion_data,
				autocompletion : true,
				autocompletion_min_chars : 1,
				autocompletion_format_output: function textboxAutocomplete(row) {
					this.controller.filterByPlayerName(row.value);
				}.bind(this)
			}));

			this.unregisterComponent('player_search_clear_button');
			if (this.controller.playerFilterName.length > 0) {
				this.registerComponent('player_search_clear_button', this.$el.find('.player_search_clear_button').button({
					icon: true,
					icon_type: 'cross'
				}).on('btn:click', function () {
					var playerFilterName = '';
					this.controller.filterByPlayerName(playerFilterName);
				}.bind(this)));
			}

			this.unregisterComponent('player_search_button');
			this.registerComponent('player_search_button', this.$el.find('.player_search_button').button({
				caption: this.l10n.search_player_button_label
			}).on('btn:click', function () {
				var playerFilterName = this.$el.find('.player_search_input input').val();
				this.controller.filterByPlayerName(playerFilterName);
			}.bind(this)));

		},

		registerTooltips: function() {
			this.$el.find('.donation_title').tooltip(this.l10n.total_donations_title);
			this.$el.find('.total_donation_box').tooltip(
				'<b>' + this.l10n.total_donations_count_title + '</b><br>' + this.l10n.total_donations_count_description
			);
		},

		scrollToCurrentPlayer : function() {
			var $el = this.$el.find('.highlight'),
				offset = $el.length ? $el.position().top : 0;

			this.getComponent('scrollbar').scrollTo(offset, true);
		}

	});
});
