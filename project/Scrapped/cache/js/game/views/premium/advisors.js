/* globals GameDataPremium, GameViews */

(function() {
	'use strict';

	var BaseView = GameViews.BaseView;

	var PremiumAdvisorsView = BaseView.extend({
		initialize: function (options) {
			//Don't remove it, it should call its parent
			BaseView.prototype.initialize.apply(this, arguments);

			this.render();
			//this.registerEventListeners();
		},

		rerender : function() {
			this.unregisterComponents();
			this.render();
		},

		render : function() {
			this.renderTemplate(this.$el, 'advisors', {
				l10n: this.controller.getl10n()
			});

			this.controller.getAdvisorsData().forEach(this.renderAdvisor.bind(this));
		},

		renderAdvisor: function (advisor_data) {
			var $advisors_box = this.$el.find('.advisors_box'),
				$advisor_box,
				advisor_id = advisor_data.id;

			$advisors_box.append(this.getTemplate('advisor', {
				advisor_name: GameDataPremium.getAdvisorName(advisor_id),
				advisor_data: advisor_data,
				l10n: this.controller.getl10n()
			}));

			$advisor_box = $advisors_box.find('.advisor_box[data-advisor_id="' + advisor_id + '"]');

            this.renderAdvisorAdvantages($advisor_box, advisor_data);
			this.registerViewComponents($advisor_box, advisor_data);
		},

        renderAdvisorAdvantages: function ($advisor_box, advisor_data) {
            var advantages_data = this.controller.getAdvisorAdvantages(advisor_data.id),
                $advantages = $advisor_box.find('.advantages');


			advantages_data.forEach(function (advantage) {
                $advantages.append(this.getTemplate('advisor_advantages', {
					icon: advantage.icon,
					caption_size: advantage.caption_size,
					caption: advantage.caption
                }));
			}.bind(this));
		},

		registerViewComponents : function($advisor_box, advisor_data) {
			var l10n = this.controller.getl10n(),
				$checkbox = $advisor_box.find('.cbx_extend_advisor'),
				$button = $advisor_box.find('.js-extend-button'),
				$image = $advisor_box.find('.js-advisor-image'),
                advisor_id = advisor_data.id,
				checked = this.controller.isExtendingAdvisorEnabled(advisor_id),
				is_active = $button.data('is_active'),
				caption = $button.data('caption');

			//Checkbox
			this.registerComponent('cbx_extend_advisor_' + advisor_id, $checkbox.checkbox({
				checked : checked,
				caption : ''
			}).on('cbx:check', function(advisor_id, e, _cbx, checked) {
				this._setCheckboxTooltip(_cbx, checked);

				this.controller.onCheckboxClick(advisor_id);
			}.bind(this, advisor_id)));

			this._setCheckboxTooltip($checkbox, checked);

			//Button
			this.registerComponent('btn_extend_advisor_' + advisor_id, $button.button({
				caption : caption,
				template : 'internal'
			}).on('btn:click', function(advisor_id, is_active, e, _btn) {
				this.controller.onButtonClick(_btn, advisor_id, is_active);
			}.bind(this, advisor_id, is_active)));

			//Tooltips
			$image.tooltip(this.getTemplate('advisor_popup', {
				description : advisor_data.description,
				bonuses : advisor_data.bonus,
				duration : this.controller.getAdvisorDuration(advisor_id),
				cost : this.controller.getAdvisorCost(advisor_id),
				l10n : l10n,
				expiration : this.controller.getAdvisorExpirationTranslation(advisor_id)
			}));

            $image.on('click', function(e) {
                this.controller.onAdvisorImageClick(advisor_id);
            }.bind(this));
		},

		_setCheckboxTooltip : function($el, checked) {
			var l10n = this.controller.getl10n();

			$el.tooltip(checked ? l10n.autoextension_active : l10n.autoextension_not_active);
		},

		destroy : function() {

		}
	});

	window.GameViews.PremiumAdvisorsView = PremiumAdvisorsView;
}());
