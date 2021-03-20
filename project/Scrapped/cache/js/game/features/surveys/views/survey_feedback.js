(function() {
	"use strict";

	var BaseView = window.GameViews.BaseView;

	var SurveyFeedback = BaseView.extend({
		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);

			this.model = options.model;
			this.l10n = options.l10n;

			this.render();
		},

		render : function() {

			this.$el.html(
				us.template(this.controller.getTemplate('feedback_main'), {
					model: this.model,
					l10n: this.l10n
				})
			);

			this.registerComponents();

			return this;
		},

		registerComponents : function () {
			var _self = this;
			this.$('.poll').each(function(i, $el){
				$el = $($el);
				var id = $el.data('id');

				_self.controller.registerComponent('answer[' + id + ']', $el.radiobutton({
					template : 'tpl_rb_universal', options : [
						{value : '1'},
						{value : '2'},
						{value : '3'},
						{value : '4'},
						{value : '5'}
					]
				}).addClass('radiobtn'), 'survey');

			});

			this.controller.registerComponent('feedback', this.$('.txt_feedback').textarea(), 'survey');
		},

		destroy : function() {
		}
	});

	window.GameViews.SurveyFeedback = SurveyFeedback;
}());
