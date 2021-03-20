(function() {
	"use strict";

	var BaseView = window.GameViews.BaseView;

	var SurveyCouncilVoting = BaseView.extend({
		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);

			this.model = options.model;
			this.l10n = options.l10n;

			this.render();
		},

		render : function() {

			this.$el.html(
				us.template(this.controller.getTemplate('council_voting'), {
					model: this.model,
					l10n: this.l10n
				})
			);

			this.registerComponents();

			// Fix for GP-21909: If the link includes an anchor, remove it from url the before the google analytics id and append it to the end
			this.$('a').each(function(i, $link) {
				if ($link.href.indexOf('#') > 0) {
					$link.dataset.anchor = $link.hash;
					$link.addEventListener('click', function() {
						this.href = this.href.replace(this.dataset.anchor, '') + this.dataset.anchor;
					});
				}
			});

			return this;
		},

		registerComponents : function () {
			var _self = this,
				l10n = this.l10n;

			this.$('.poll').each(function(i, $el){
				$el = $($el);
				var id = $el.data('id');

				_self.controller.registerComponent('answer[' + id + ']', $el.radiobutton({
					template : 'tpl_rb_universal', options : [
						{value : '0', name : l10n.votes_coucil_voting.v_1},
						{value : '1', name : l10n.votes_coucil_voting.v_2}
					]
				}).addClass('radiobtn'), 'survey');

			});
		},

		destroy : function() {
		}
	});

	window.GameViews.SurveyCouncilVoting = SurveyCouncilVoting;
}());
