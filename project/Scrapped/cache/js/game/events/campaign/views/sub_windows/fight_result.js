/*global us,GameDataHercules2014 */

define('events/campaign/views/sub_windows/fight_result', function(require) {
	'use strict';

	var View = window.GameViews.BaseView;
	var TooltipFactory = window.TooltipFactory;
	var GameFeatures = require('data/features');
    var ContextMenuHelper = require('helpers/context_menu');

	var SubWindowFightResultView = View.extend({
		initialize: function (options) {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);

			this.l10n = this.controller.getl10n();

			this.render();
			window.campaign_res = this;
		},

		render : function() {
			this.$el.html(us.template(this.controller.getTemplate('sub_window_fight_result'), {
				l10n : this.l10n,
				luck : this.controller.getLuck(),
				hercules_strength : this.controller.getHeroValue(),
				my_army_html : this.getMyArmyHtml(),
				enemy_army_html : this.getEnemyArmyHtml(),
				fight_result_type : this.controller.getFightResultType(),
				rewards: this.controller.getRewards()
			}));

			this.initializeComponents();
			this.initializeMercenaryTooltip();
			this.initializeHeroRewardTooltip();
			this.initializeCultureRewardTooltip();
		},

		initializeComponents : function() {
			var $btn_reward = this.$el.find('.btn_reward');

			this.controller.registerComponent('btn_retry', this.$el.find('.btn_retry').button({
				caption : this.l10n.btn_retry
			}).on('btn:click', function() {
				this.controller.retryButtonClicked();
			}.bind(this)));

			if (this.controller.getFightResultType() === 'victory') {
                this.unregisterComponent('rwd_reward');
                this.registerComponent('rwd_reward', $btn_reward.reward({
                    reward: this.controller.getReward()
                }).on('rwd:click', function (event, reward, position) {
                    ContextMenuHelper.showRewardContextMenu(event, reward, position);
                }));
			}
		},

		showHonorPointAnimation: function() {
			var $animation = this.$el.find('.honor_point_animation'),
				$scroll_middle = $animation.find('.scroll_middle'),
				$glow = $animation.find('.glow'),
				$points = $animation.find('.honor_points');

			// reset
			$points.css({ translate: [0,0] });
			$scroll_middle.css({ width: 40 });

			// set honor points
			$points.find('.value').text(this.controller.getLastHonorPoints());

			$animation.show();
			$animation.transition({opacity:1}, function() {
				// scroll middle width
				$scroll_middle.transition({width: 140}, 300, function() {
					// fade in glow and points
					$glow.transition({opacity: 1}, 500);
					$points.transition({opacity: 1}, function() {
						// fade out glow
						$glow.transition({opacity: 0}, function() {
							// move points up + fade out
							$points.transition({
								opacity: 0,
								translate: [0,-20]
							}, 500, function() {
								// fade out scroll
								$animation.transition({opacity: 0});
								$animation.hide();
							});
						});
					});
				});
			});
		},

		/**
		 * bind custom tooltip for special hero
		 */
		initializeHeroRewardTooltip : function() {
			if (GameFeatures.areHeroesEnabled() && this.controller.window_controller.hasHeroReward()) {
				var $el = this.$el.find('.reward.hero');

				$el.tooltip(TooltipFactory.getHeroCard(GameDataHercules2014.getRewardHeroId(), {
					show_requirements: true, l10n: {
						exclusive_hero: this.l10n.onetime_once
					}
				}), {}, false);
			}
		},

		/**
		 * bind custom tooltip for culture level reward
		 */
		initializeCultureRewardTooltip : function() {
			var $el = this.$el.find('.reward.culture_level');

			$el.tooltip(this.l10n.onetime_culture + '<br><br><span style="color:red">' + this.l10n.onetime_once + '</span>', {
				width : 250
			});
		},

		initializeMercenaryTooltip : function() {
			var controller = this.controller;

			this.$el.find('.mercenary .mercenary_image').each(function(idx, val) {
				var $el = $(val),
					type = $el.data('type');

				this.$el.find('.box_my_army .mercenary .' + type).tooltip(controller.getMercenaryTooltip(type), {}, false);
				this.$el.find('.box_enemy_army .mercenary .' + type).tooltip(controller.getMercenaryTooltip(type, true), {}, false);
			}.bind(this));
		},

		getMyArmyHtml : function() {
			var my_army_amount_func = this.controller.getMyArmyUnitAmount.bind(this.controller);
			return this.controller.getMercenariesBoxHtml(my_army_amount_func);
		},

		getEnemyArmyHtml : function() {
			var enemy_army_amount_func = this.controller.getEnemyArmyUnitAmount.bind(this.controller);
			return this.controller.getMercenariesBoxHtml(enemy_army_amount_func, true);
		},

		destroy : function() {

		}
	});

	return SubWindowFightResultView;
});
