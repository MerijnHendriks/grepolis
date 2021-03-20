(function() {
	"use strict";

	var BaseView = window.GameViews.BaseView;

	var SurveyPoll = BaseView.extend({
		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);

			this.model = options.model;
			this.l10n = options.l10n;

			this.model.on('change:has_results', this.reRender, this);

			this.render();
		},

		render : function() {
			if (this.model.hasResults()) {
				this.$el.html(
					us.template(this.controller.getTemplate('poll_results'), {
						model: this.model,
						l10n: this.l10n
					})
				);
			} else {
				this.$el.html(
					us.template(this.controller.getTemplate('poll_questions'), {
						model: this.model,
						l10n: this.l10n
					})
				);

				this.registerComponents();
			}

			return this;
		},

		reRender: function () {
			if (this.model.hasResults()) {
				 this.controller.reRenderPage();
			}
		},

		registerComponents : function () {
			var _self = this,
				l10n = this.l10n;

			this.$('.poll').each(function(i, $el){
				$el = $($el);
				var id = $el.data('id');

				_self.controller.registerComponent('answer[' + id + ']', $el.radiobutton({
					template : 'tpl_rb_universal', options : [
						{value : '0', name: l10n.votes.v_0},
						{value : '1', name: l10n.votes.v_1},
						{value : '2', name: l10n.votes.v_2},
						{value : '3', name: l10n.votes.v_3},
						{value : '4', name: l10n.votes.v_4},
						{value : '5', name: l10n.votes.v_5}
					]
				}).addClass('radiobtn'), 'survey');

			});

		},

		destroy : function() {
		}
	});

	window.GameViews.SurveyPoll = SurveyPoll;
}());
