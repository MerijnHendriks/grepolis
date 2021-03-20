define('features/crm_campaign/views/crm_screen', function () {
	'use strict';

	var GameViews = require_legacy('GameViews'),
		countdown_options = {
			'3h_countdown': 10800,
			'24h_countdown': 86400
		};


	return GameViews.BaseView.extend({
		initialize: function () {
			//Don't remove it, it should call its parent
			GameViews.BaseView.prototype.initialize.apply(this, arguments);
			this.render();
		},

		render: function() {
			var background_decoration = this.controller.getBackgroundDecoration(),
				countdown_value = this.controller.getCountdownValue(),
				has_countdown = countdown_value !== null;

			this.$el.addClass(this.controller.getBackground());

			this.renderTemplate(this.$el, 'screen_content', {
				character: this.controller.getCharacter(),
				title_text: this.controller.getTitleText(),
				tag_banner_text: this.controller.getTagBannerText(),
				tag_banner_color: this.controller.getTagBannerColor(),
				main_image_url: this.controller.getMainImageUrl(),
				headline_text: this.controller.getHeadlineText(),
				content_text: this.controller.getContentText(),
				price_tag_background: this.controller.getPriceTagBackground(),
				price_tag_strikethrough_text: this.controller.getPriceTagStrikethroughText(),
				price_tag_text: this.controller.getPriceTagText(),
				has_countdown: has_countdown
			});

			if (background_decoration) {
				this.$el.parent().prepend('<div class="' + background_decoration + '"></div>');
			}

			if (has_countdown) {
				this.registerCountdown(countdown_value);
			}

			this.registerConfirmButton();
		},

		registerCountdown: function (countdown_value) {
			this.unregisterComponent('offer_countdown');
			this.registerComponent('offer_countdown', this.$el.find('.countdown').countdown2({
				value: countdown_options[countdown_value],
				display: 'readable_seconds'
			}).on('cd:finish', function() {
				this.controller.closeWindow();
			}.bind(this)));
		},

		registerConfirmButton: function () {
			this.unregisterComponent('btn_confirm');
			this.registerComponent('btn_confirm', this.$el.find('.btn_confirm').button({
				template: 'tpl_emptybutton',
				caption: this.controller.getConfirmButtonText()
			}).on('btn:click', this.controller.onClickEvent.bind(this.controller)));
		}
	});
});