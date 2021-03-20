define('views/layout/layout_grepo_score', function(require) {
	'use strict';

	var Views = require_legacy('GameViews');

	return Views.BaseView.extend({
		initialize: function (options) {
			Views.BaseView.prototype.initialize.apply(this, arguments);
			this.l10n = this.controller.getl10n();
			this.render();
		},

		render : function() {
			this.registerViewComponents();
			this.renderScore();
			this.registerTooltips();
			this.renderNewAwardsHint();
		},

		registerViewComponents : function() {
			this.initializeButtonGrepoScore();
		},

		renderScore : function() {
			this.$el.find('.grepo_score').text(this.controller.getGrepoScore());
		},

		renderNewAwardsHint : function() {
			var indicator = this.$el.find('.indicator');
			if (!this.controller.hasNewAwardsInAnyCategory()) {
				indicator.hide().off('click');
				return;
			}

			indicator.show().on('click', this.controller.openGrepoScoreWindow.bind(this));
		},

		initializeButtonGrepoScore : function() {
			this.unregisterComponent('btn_grepo_score');
			this.registerComponent('btn_grepo_score', this.$el.find('.btn_grepo_score').button({
				template : 'empty',
				tooltips : [
					{title : this.l10n.main_ui.tooltip_button}
				]
			}).on('btn:click', function() {
				this.controller.openGrepoScoreWindow();
			}.bind(this)));
		},

		registerTooltips: function() {
			this.$el.find('.grepo_score_container').tooltip(this.l10n.main_ui.tooltip_score);
		}
	});
});
