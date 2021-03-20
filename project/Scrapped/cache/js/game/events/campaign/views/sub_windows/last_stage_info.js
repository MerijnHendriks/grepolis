/* global us */

define('events/campaign/views/sub_windows/last_stage_info', function (require) {
	'use strict';

	var View = window.GameViews.BaseView;
	var TooltipFactory = window.TooltipFactory;
	var GameFeatures = require('data/features');

	var SubWindow = View.extend({
		initialize: function (options) {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);

			this.has_hero = options.has_hero;
			this.l10n = this.controller.getl10n();

			this.render();
		},

		render : function() {
			if (this.has_hero) {
				this.initializeHeroWorld();
			} else {
				this.initializeNormalWorld();
			}
			this.initializeOkButton();
			this.initializeCultureRewardTooltip();
		},

		initializeHeroWorld : function() {
			var l10n = this.l10n.sub_window_last_stage.hero_world;

			this.$el.html(us.template(this.controller.getTemplate('last_stage_info'), {
				has_hero : this.has_hero,
				title : this.l10n.sub_window_last_stage.title,
				main_text : l10n.main_text,
				hero_text : l10n.hero_text,
				culture_text : l10n.culture_text,
				reward_hero_id :  this.controller.getRewardHeroId()
			}));

			this.initializeHeroCard();
		},

		initializeNormalWorld : function() {
			var l10n = this.l10n.sub_window_last_stage.normal_world;

			this.$el.html(us.template(this.controller.getTemplate('last_stage_info'), {
				has_hero : this.has_hero,
				title : this.l10n.sub_window_last_stage.title,
				main_text : l10n.main_text,
				hero_text : null,
				culture_text : l10n.culture_text
			}));
		},

		initializeOkButton : function() {
			this.controller.registerComponent('btn_ok', this.$el.find('.btn_ok').button({
				caption: this.l10n.sub_window_last_stage.okay
			}).on('btn:click', function() {
				this.controller.onOkayButtonPressed();
			}.bind(this)));
		},

		/**
		 * bind custom tooltip for culture level reward
		 */
		initializeCultureRewardTooltip : function() {
			var $culture_element = this.$el.find('.icon.culture_level');

			$culture_element.tooltip(this.l10n.onetime_culture + '<br><br><span style="color:red">' + this.l10n.onetime_once + '</span>', {
				width : 250
			});
		},

		/**
		 * bind exclusive hero card tooltip
		 */
		initializeHeroCard : function() {
			if (GameFeatures.areHeroesEnabled() && this.controller.window_controller.hasHeroReward()) {
				var hero_id = this.controller.getRewardHeroId(),
					hero_element = '.unit_icon50x50.' + hero_id;

				this.$el.find(hero_element).tooltip(TooltipFactory.getHeroCard(hero_id, {
					show_requirements: true, l10n: {
						exclusive_hero: this.l10n.onetime_once
					}
				}), {}, false);
			}
		},

		destroy : function() {

		}
	});

	return SubWindow;
});
