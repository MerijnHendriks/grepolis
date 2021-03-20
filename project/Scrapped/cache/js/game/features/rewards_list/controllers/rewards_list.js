/* globals GameDataPowers */
define('features/rewards_list/controllers/rewards_list', function () {
	'use strict';

	var SubWindowController = window.GameControllers.SubWindowController,
		RewardsListSubWindowView = require('features/rewards_list/views/rewards_list'),
		default_settings = {
			show_rewards_disabled: false
		};

	return SubWindowController.extend({
		view: null,

		initialize: function (options) {
			SubWindowController.prototype.initialize.apply(this, arguments);
			this.settings = us.extend({}, default_settings, options.settings);
			this.rewards = options.rewards;
		},

		render: function ($el) {
			this.$el = $el;
			this.initializeView();
		},

		initializeView: function () {
			this.view = new RewardsListSubWindowView({
				controller: this,
				el: this.$el
			});
		},

		getRewards: function () {
			return this.rewards;
		},

		showRewardsAsDisabled: function () {
			return this.settings.show_rewards_disabled;
		},

		getEventPowerTooltip: function (power_type) {
			var type = power_type.toLowerCase(),
				l10n = this.l10n[type];

			return '<b>' + l10n.title + '</b><br /><br />' + l10n.description;
		},

		getPowerName: function (data) {
			var is_event_power = !data.hasOwnProperty('power_id'),
				result;

			if (is_event_power) {
				result = this.l10n[data.type.toLowerCase()].title;
			} else {
				result = GameDataPowers.getPowerName(data);
			}

			return result;
		},

		destroy: function () {

		}
	});
});