/*global Timestamp, BuyForGoldWindowFactory, us, Promise */

define('events/turn_over_tokens/views/fight', function(require) {
    'use strict';

    var View = window.GameViews.BaseView;

    var AssassinsFightView = View.extend({


        initialize: function () {
            //Don't remove it, it should call its parent
            View.prototype.initialize.apply(this, arguments);
            this.l10n = this.controller.getl10n();

            this.render();
        },

        render: function () {
            // initialze main template
            this.$el.html(us.template(this.controller.getTemplate('fight'), {
                l10n : this.l10n,
				tierPoints : this.controller.getTiers()
            }));
			this.initializeFightSpots();
			this.registerKillSpotsChange();
			this.initializeArrowQuiver();
            this.initializeCountdown();
			this.initializeBattleTokens();
            this.registerEventInfoButton();
			this.initializeResetTargetsButton();
        },

        /*
         * Initialize Event Countdown
         */
        initializeCountdown: function () {
        	this.unregisterComponent('countdown');
            this.registerComponent('countdown', this.$el.find('.countdown_box .middle').countdown2({
                value : this.controller.getEventEndAt() - Timestamp.now(),
                display : 'event',
				tooltip : {title: this.l10n.tooltips.countdown}
            }));
        },

		reRenderFightSpots: function (id) {
			var $container = this.$el.find('.assassins_target_field');
			$container.empty();

			this.initializeFightSpots();
			this.registerKillSpotsChange(id);
			this.reRenderResetTargetBtn();
		},

		initializeFightSpots: function () {
			var $container = this.$el.find('.assassins_target_field');

			$container.append(us.template(this.controller.getTemplate('fight_spots'), {
				l10n : this.l10n,
				spots : this.controller.getPlayerSpots(),
				spotsDisabled : this.controller.areSpotsDisabled() ? 'disabled' : ''
			}));

			this.registerEventPlayerSpots();
			this.initializeSpotsTooltips();
		},

		initializeSpotsTooltips: function () {
			//Tooltips for player spots
			var spots = this.controller.getPlayerSpots();
			var setTooltipToSpots = function (elem) {
				this.$el.find('.assassins_target.' + elem.getType()).tooltip(function() {
					return this.controller.areSpotsDisabled() ? this.l10n.targets.disabled : this.l10n.targets[elem.getType()];
				}.bind(this));
			};
			spots.forEach(setTooltipToSpots.bind(this));
		},

		registerKillSpotsChange : function (id) {
			var setKilledState = function(that, spot) {
				that.$el.find('.target_' + spot.getSpotId()).hide().remove();
				var killed = $(that.$el.find('.tier_' + spot.getTier() + ' > .tier_point:not(.killed)')[0]);
				killed.addClass('killed');
				if(spot.getSpotId() === id) {
					killed.addClass('last_killed');
					killed.find('.icon').css({scale : 1}).transition({scale : 0.5}, 500);
				}
			};
			var last_shooted = this.$el.find('.last_killed');
			last_shooted.find('.icon').css('transform', 'none');
			var spots = this.controller.getPlayerSpots(), spot, i;
			this.$el.find('.tier_point').removeClass('killed');
			last_shooted.removeClass('last_killed');
			var lastSpot = null;
			for(i = 0; i < spots.length; i++) {
				spot = spots[i];
				if(spot.getSpotId() === id) {
					lastSpot = spot;
				}
				else if(spot.getTier() !== null) {
					setKilledState(this, spot);
				}
			}
			if(lastSpot !== null) {
				setKilledState(this, lastSpot);
			}
			this.initializeTierTooltips();
		},

		reRenderArrowQuiver: function () {
			var $container = this.$el.find('.arrow_box');
			$container.empty();

			this.controller.unregisterComponent('btn_buy_arrow');
			this.initializeArrowQuiver();
		},

		initializeArrowQuiver: function () {
			var $container = this.$el.find('.arrow_box');

			$container.append(us.template(this.controller.getTemplate('arrow'), {
				l10n : this.l10n,
				arrows : this.controller.getArrowCount()
			}));
			$container.find('.arrow_quiver').tooltip(this.l10n.tooltips.arrow_bar);

			this.initializeBuyArrowsButtons();
		},

		showCollectionComplete: function (collection_type) {
			var $container = this.$el.find('.assassins_fight'),
				$collection_complete = this.$el.find('.collection_complete_wrapper');

			if($collection_complete.length !== 0) {
				$collection_complete.remove();
			}
			$container.append(us.template(this.controller.getTemplate('collection_complete'), {
				l10n : this.l10n,
				collection_type : collection_type
			}));
			$collection_complete = this.$el.find('.collection_complete_wrapper');
			$collection_complete.fadeIn(1500);
			this.registerCollectionCompleteClick();
		},

		initializeBuyArrowsButtons: function () {
			var controller = this.controller, l10n = this.l10n;

			var onClick = function (cost, num, name, e, _btn) {
				BuyForGoldWindowFactory.openBuyAssassinsArrowsWindow(_btn, cost, num, name, controller);
			};


			var $el = this.$el.find('.btn_buy_arrow'),
				cost = controller.getArrowCost(),
				num = controller.getArrowNum(),
				basic_price = controller.getArrowBasicPrice(),
				name = l10n.btn_buy_arrow.arrows_name;

			controller.registerComponent('btn_buy_arrow', $el.button({
				template : 'tpl_simplebutton_borders',
				caption : cost,
				disabled: controller.getArrowCount() > 5,
				state: controller.getArrowCount() > 5,
				icon: true,
				icon_type: 'gold',
				icon_position: 'right',
				tooltips : [
					{
						title : l10n.btn_buy_arrow.active(cost, basic_price)
					},
					{
						title : l10n.btn_buy_arrow.inactive
					}
				]
			}).on('btn:click', onClick.bind(null, cost, num, name)));
		},

		initializeResetTargetsButton: function () {
			var controller = this.controller/*, l10n = this.l10n*/,
				l10n = this.l10n;

			/*var confirmReset = function () {
				controller.getNewTargets();
			};*/

			var onClick = function (/*cost, e, _btn*/) {
				controller.setNewPlayerSpots();
				/* Confirmation Resetting Targets Window, if it will be needed TODO remove console log, set correct onconfirm, oncancel function
				 * if this function is going to be reused please inser confirmation_assassins_buy_reset_targets.js into dependencies.js
				 */
				//ConfirmationWindowFactory.openConfirmationAssassinsResettingTargets(cost, confirmReset);
			};

			var isDisabled = function (cost) {
				return controller.getBattleTokens() < cost || !controller.checkIfOneIsKilled() || controller.areSpotsDisabled();
			};

			this.$el.find('.btn_reset_target').each(function (index, el) {
				var $el = $(el),
					cost = controller.getSpotsResetCost();

				controller.registerComponent('btn_reset_target', $el.button({
					template : 'tpl_simplebutton_borders',
					caption : cost,
					disabled: isDisabled(cost),
					state: isDisabled(cost),
					icon: true,
					icon_type: 'battle_token',
					icon_position: 'right',
					tooltips : [
						{
							title: l10n.btn_reset_target.active
						},
						{
							title: !controller.checkIfOneIsKilled() ? l10n.btn_reset_target.inactive : l10n.btn_reset_target.too_poor
						}
					]
				}).on('btn:click', onClick/*,.bind(null cost)*/));
			});
		},

		initializeTierTooltips: function () {
			var tiers = this.controller.getTiers();
			this.$el.find('.tier_point').each(function (index, el) {
					var $el = $(el),
						parent_index = $el.parent().index();
					if($el.hasClass('killed')) {
						$el.tooltip(this.l10n.tooltips['killed_'+parent_index]);
					} else {
						$el.tooltip(this.l10n.tooltips.kill(tiers[4].points, tiers[1].points));
					}
				}.bind(this)
			);
		},

		reRenderBattleToken: function () {
			this.controller.unregisterComponent('battle_tokens');
			this.initializeBattleTokens();
		},

		reRenderResetTargetBtn: function () {
			this.controller.unregisterComponent('btn_reset_target');
			this.initializeResetTargetsButton();
		},

		initializeBattleTokens: function () {
			this.$el.find('.battle_tokens')
				.text(this.controller.getBattleTokens())
				.tooltip(this.l10n.tooltips.battle_tokens);
			this.registerBattleTokenBtn();
		},

        /**
         * open event Info window
         */
        registerEventInfoButton: function () {
            this.registerComponent('btn_info_overlay', this.$el.find('.btn_info_overlay').button({
                template : 'internal'
            }).on('btn:click', this.controller.showLinearTutorial.bind(this.controller)))
			.tooltip(this.l10n.tooltips.event_explanation);
        },

		registerEventPlayerSpots: function () {
			var controller = this.controller;
			this.$el.find('.assassins_target').on('click', function (event) {
				var $target = $(event.currentTarget);
				var spot_id = $target.data('spot_id');
				if($target.hasClass('not_killed')) {
					controller.shootSpot(spot_id, $target);
				}
			}.bind(this));
		},

		setPlayerSpotToKilled: function ($target) {
			$target.removeClass('not_killed');
			$target.addClass('killed');
			return Promise.resolve();
		},

		registerBattleTokenBtn: function () {
			var controller = this.controller;
			this.$el.find('.battle_tokens').on('click', function (event) {
				controller.switchTab(2);
			}.bind(this));
		},

		registerCollectionCompleteClick: function () {
			var controller = this.controller;
			this.$el.find('.collection_complete_wrapper').on('click', function (event) {
				this.controller.setInactivePreviousCompleteCollection();
				controller.switchTab(1);
			}.bind(this));
		},

        destroy: function () {
        }
    });

    return AssassinsFightView;
});
