define('events/missions/views/sub_windows/mission_result', function() {
	'use strict';

	var Views = require_legacy('GameViews'),
		MISSION_SUCCESS_STATE = require('events/missions/enums/mission_success');

	return Views.BaseView.extend({
		initialize: function (options) {
			Views.BaseView.prototype.initialize.apply(this, arguments);
			this.l10n = this.controller.getl10n('mission_result_subwindow');
			this.skin = options.skin;
			this.mission_result = options.mission_result;
			this.rewards = options.rewards;
			this.render();
		},

		render : function () {
			this.renderTemplate(this.$el, 'mission_result', {
				l10n: this.l10n,
				skin: this.skin,
				mission_result: this.mission_result,
				result_text: this.mission_result === MISSION_SUCCESS_STATE.SUCCESS ? this.l10n.result_success : this.l10n.result_failure,
				rewards: this.rewards
			});

			this.registerTooltips();
			this.registerCloseButton();
		},

		registerTooltips: function () {
			this.$el.find('.reward.ranking_points .reward_icon').tooltip(this.l10n.result_reward_2);
		},

		registerCloseButton: function () {
			this.unregisterComponent('btn_close');
			this.registerComponent('btn_close', this.$el.find('.btn_close').button({
				caption: this.l10n.close_button_text
			}).on('btn:click', function () {
				this.controller.close();
            }.bind(this)));
		}
	});
});
