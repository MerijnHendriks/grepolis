/* global us, TooltipFactory, GameDataHercules2014, GameData */

define('events/campaign/views/sub_windows/tutorial', function(require) {
	'use strict';

	var View = window.GameViews.BaseView;
	var GameFeatures = require('data/features');
    var CampaignTutorial = require('events/campaign/data/tutorial');

	var SubWindowTutorialView = View.extend({
		initialize: function (options) {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);

			this.l10n = this.controller.getl10n();

			this.show_fight_image = options.show_fight_image;
			this.render();
		},

		render : function() {
			var tutorial_id = this.controller.getCurrentTutorialId(),
                hidden_class = 'hidden',
				show_full_tutorial = this.controller.showFullTutorial(),
				hide_prev_button = this.controller.isFirstStep() || !show_full_tutorial,
				hide_next_button = this.controller.isLastStep() || !show_full_tutorial,
				image_text = this.l10n.heal_all,
				show_image_text = tutorial_id === CampaignTutorial.steps.WOUNDED_UNITS;

			this.$el.html(us.template(this.controller.getTemplate('tutorial'), {
				l10n : this.l10n,
				tutorial_text : this.controller.getTutorialText(),
                tutorial_id: tutorial_id,
				show_fight_image: this.show_fight_image,
                prev_btn_class: hide_prev_button ? hidden_class : '',
                next_btn_class: hide_next_button ? hidden_class : '',
                close_btn_class: !this.controller.isLastStep() ? hidden_class : '',
                x_button_class: !show_full_tutorial ? hidden_class : '',
				image_text_class: !show_image_text ? hidden_class : '',
				image_text: image_text
			}));

			if ( tutorial_id === 'hero') {
				this.initializeHero();
			}

			this.registerComponents();
		},

        reRender: function () {
            this.render();
        },

		registerComponents: function () {
			this.unregisterComponents();
            this.registerCloseButton();
            this.registerNextButton();
            this.registerPrevButton();
            this.registerXButton();
		},

		registerXButton: function () {
            this.controller.registerComponent('btn_wnd_close', this.$el.find('.btn_wnd.close').button({
            }).on('btn:click', function() {
                this.controller.closeTutorial();
            }.bind(this)));
		},

		registerPrevButton: function () {
            this.controller.registerComponent('btn_prev', this.$el.find('.btn_prev').button({
                caption : this.l10n.prev
            }).on('btn:click', function() {
                var step = this.controller.getCurrentStep();
                this.controller.showTutorial(step - 1);
            }.bind(this)));
		},

		registerCloseButton: function () {
            var caption = this.controller.showFullTutorial() ? this.l10n.close : this.l10n.okay;

            this.controller.registerComponent('btn_close', this.$el.find('.btn_close').button({
                caption : caption
            }).on('btn:click', function() {
                this.controller.closeTutorial();
            }.bind(this)));
		},

		registerNextButton: function () {
            this.controller.registerComponent('btn_next', this.$el.find('.btn_next').button({
                caption : this.l10n.next
            }).on('btn:click', function() {
            	var step = this.controller.getCurrentStep();
            	this.controller.showTutorial(step + 1);
            }.bind(this)));
		},

		initializeHero: function() {
			if (GameFeatures.areHeroesEnabled() && this.controller.window_controller.hasHeroReward()) {
				var hero = GameData.heroes[GameDataHercules2014.getRewardHeroId()],
					$hero = this.$el.find('.tutorial_image');

				$hero.html(this.getTemplate('hero_box', {hero: hero}));

				$hero.find('.hero_box').tooltip(TooltipFactory.getHeroCard(hero.id, {
					show_requirements: true
				}), {}, false);
			}
		},

		destroy : function() {

		}
	});

	return SubWindowTutorialView;
});
