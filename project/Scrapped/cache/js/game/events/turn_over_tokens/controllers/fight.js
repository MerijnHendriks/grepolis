/* global TM, Promise, GameData, Game */

define('events/turn_over_tokens/controllers/fight', function(require) {
    'use strict';

    var AssassinFightController;
	var GameControllers = window.GameControllers;
    var AssassinsFightView = require('events/turn_over_tokens/views/fight');
	var SubWindowQuiverEmptyController = require('events/turn_over_tokens/controllers/sub_windows/quiver_empty');
	var SubWindowRewardPresentationController = require('events/turn_over_tokens/controllers/sub_windows/reward_presentation');
	var SubWindowTutorialController =  require('events/turn_over_tokens/controllers/sub_windows/tutorial');
	var SubWindowAssassinAnimationController =  require('events/turn_over_tokens/controllers/sub_windows/assassin_animation');
	var SubWindowAllUnitsDeadAnimationController =  require('events/turn_over_tokens/controllers/sub_windows/new_targets_animation');
	var CommunityGoalsController = require('features/community_goals/controllers/community_goals');
	var GameDataAssassins = window.GameDataAssassins;
	var Tutorial = require('events/turn_over_tokens/helper/tutorial');
	var GameEvents = window.GameEvents;
	var COMPLETE_COLLECTION_HINT_TYPES = ['assassins_collection_complete_sapper', 'assassins_collection_complete_cavalry', 'assassins_collection_complete_legionary'];
	var BenefitHelper = require('helpers/benefit');
    var EventSkins = require('enums/event_skins');

	AssassinFightController = GameControllers.TabController.extend({
		view: null,

		initialize: function (options) {
			//Don't remove it, it should call its parent
			GameControllers.TabController.prototype.initialize.apply(this, arguments);
			this.last_unit_shot_at = null;
			this.enemy_down_window_data = null;
			this.shoot_animation_running = false;
			this.ready_for_point_update_promise = Promise.resolve();

			Tutorial.init();
		},

		initializeView: function () {
			this.dailyRankingController = new GameControllers.AssassinsDailyRankingController({
				el : this.$el,
				parent_controller : this
			});

			this.view = new AssassinsFightView({
				controller: this,
				el: this.$el
			});

			this.initializeCommunityGoals();
			this.showTutorial(Tutorial.steps.SELECT_TARGET);

			if (!this.assassins_ranking.isRankingEnabled()) {
				this.showTutorial(Tutorial.steps.STEP9);
			}
		},

		initializeCommunityGoals: function () {
			this.goals_controller = new CommunityGoalsController({
				el: this.$el.find('.js-community-goals'),
				parent_controller: this
			});
		},

		renderPage: function () {
			this.player_meta_data = this.getModel('assassins_player_meta_data');
			this.assassins_player_spots = this.getCollection('assassins_player_spots');
			this.player_ledger = this.getModel('player_ledger');
			this.assassins_ranking = this.getModel('assassins_ranking');
			this.player_hints = this.getCollection('player_hints');
			this.assassins_player_ranking = this.getModel('turn_over_token_player_ranking');
			this.initializeView();
			this.registerEventListeners();
			this.goals_controller.renderPage();
            this.goals_controller.checkAndTriggerGoalReachedEvent();

			this.dailyRankingController.renderPage();
			this.showActiveCompleteCollection();

			return this;
		},

		registerEventListeners: function () {
			var spotsHasChanged = function() {
				if (!this.shoot_animation_running) {
					this.view.reRenderFightSpots();
					this.checkForReset();
				}
			}.bind(this);

			var arrowQuiverHasChanged = function() {
				var current_arrows = this.player_meta_data.getArrows(),
					previouse_arrows = this.player_meta_data.previousAttributes().arrows;
				if (current_arrows === previouse_arrows + 1) {
					return;
				}
				this.view.reRenderArrowQuiver();
			}.bind(this);

			var battleTokenHasChanged = function () {
				this.waitForRightMomentToUpdatePoints()
					.then(function() {
						// delay a tad to make update fit to glow
						window.setTimeout(this.view.reRenderBattleToken.bind(this.view), 500);
					}.bind(this));
			}.bind(this);

			this.stopListening();
			this.assassins_player_spots.onSpotsChange(this, spotsHasChanged);
			this.player_meta_data.onArrowQuiverChange(this, arrowQuiverHasChanged);
			this.player_ledger.onBattleTokensChange(this, battleTokenHasChanged);

			this.player_hints.onShowHintInterstitialWindow('assassins_community_goal_reached_interstitial', this, this.openCommunityGoalReachedSubwindow.bind(this));

			this.assassins_ranking.onRankingAccessibilityChange(this, function() {
				if (!this.assassins_ranking.isRankingEnabled()) {
					this.showTutorial(Tutorial.steps.STEP9);
				}
			});

			$.Observer().unsubscribe(['assassins_fight']);
            $.Observer(GameEvents.system.midnight_signal).subscribe(['assassins_fight'], function() {
                this.refetchDataOnMidnight();
            }.bind(this));
            $.Observer(GameEvents.turn_over_tokens.ranking_evaluation).subscribe(['assassins_fight'], this.rerenderSpots.bind(this));

			this.setupAudio();
		},

		setupAudio: function() {
			if (GameData.Sounds) {
				Game.Audio.enableSoundBranch(GameData.Sounds.window.events.turn_over_tokens);
				var skin = BenefitHelper.getBenefitSkin();
				var soundToPlay =
					skin === EventSkins.SLINGERS ?
						GameData.Sounds.window.events.turn_over_tokens.shot.slingers :
						GameData.Sounds.window.events.turn_over_tokens.shot.assassins;

				this.stopObservingEvent(GameEvents.turn_over_tokens.shot);
				this.observeEvent(GameEvents.turn_over_tokens.shot, function() {
					Game.Audio.play(soundToPlay);
				});
			}

		},

		/**
		 * refetch certain data on midnight signal
		 */
		refetchDataOnMidnight : function() {
			var refetch = function() {
				this.assassins_player_spots.reFetch(this.rerenderSpots.bind(this));
				this.player_meta_data.reFetch();
			}.bind(this);

			// try again after 5 and 10 seconds
			refetch();
			TM.once('assassins_fight_midnight_refetch_5sec', 5000, refetch);
			TM.once('assassins_fight_midnight_refetch_10sec', 10000, refetch);
		},

		getTiers: function () {
			return GameDataAssassins.getTiers();
		},

		getArrowCost: function () {
			return this.getArrowBasicPrice() * this.player_meta_data.getCostFactor().arrow;
		},

		getArrowBasicPrice: function() {
			return GameDataAssassins.getArrowCost();
		},

		getSpotsResetCost: function () {
			return GameDataAssassins.getSpotsResetCost();
		},

		getArrowNum: function () {
			return GameDataAssassins.getArrowNum();
		},

		getEventEndAt: function () {
			var large_icon = this.getCollection('benefits').getFirstLargeIconOfWindowType('largeicon', 'turnovertokens');
			return large_icon.getEnd();
		},

		getPlayerSpots: function () {
			return this.assassins_player_spots.getSpots();
		},

		areSpotsDisabled: function () {
			return this.dailyRankingController.isEvaluationActive();
		},

		areAllKilled: function (element) {
			return element.getIsKilled();
		},

		checkIfOneIsKilled: function() {
			var playerSpots = this.getPlayerSpots();
			for ( var i = 0; i < playerSpots.length; i++ ) {
				if (playerSpots[i].getIsKilled() === true) {
					return true;
				}
			}
		},

		checkForReset: function () {
			var playerSpots = this.getPlayerSpots();

			if(playerSpots.every(this.areAllKilled)) {
				this.resetPlayerSpots();
			}
		},

		showActiveCompleteCollection: function() {
			for( var i = 0; i < COMPLETE_COLLECTION_HINT_TYPES.length; i++ ) {
				var current_complete_collection_hint_type = COMPLETE_COLLECTION_HINT_TYPES[i];
				if(!this.player_hints.getForType(current_complete_collection_hint_type).isHidden()) {
					this.view.showCollectionComplete(current_complete_collection_hint_type.split('_')[3]);
					return false;
				}
			}
		},

		setInactivePreviousCompleteCollection: function () {
			for( var i = 0; i < COMPLETE_COLLECTION_HINT_TYPES.length; i++ ) {
				var current_complete_collection_hint_type = COMPLETE_COLLECTION_HINT_TYPES[i];
				if(!this.player_hints.getForType(current_complete_collection_hint_type).isHidden()) {
					this.player_hints.disableHint(current_complete_collection_hint_type);
				}
			}
		},

		rerenderSpots: function () {
			this.view.reRenderFightSpots();
		},

		resetPlayerSpots: function () {
			this.assassins_player_spots.reFetch(function() {
				this.rerenderSpots();
				this.openAssassinsAllUnitsDeadSubWindow();
			}.bind(this));
		},

		setNewPlayerSpots: function () {
			this.assassins_player_spots.setNewPlayerSpots();
			this.openAssassinsAllUnitsDeadSubWindow(true);
		},

		shootSpot: function(spot_id, $target) {

			var enemyDownReward = function(data) {
					var rewards = [];
					var unit_name = data.unit_name || this.last_unit_shot_at;
					var collection_complete = data.collection_complete;
					if (data.is_trophy_dropped) {
						rewards.push({
							special_reward: { trophy: data.unit_name }
						});
					}
					if (data.is_arrow_dropped) {
						rewards.push({
							special_reward: { arrows: 1 }
						});
					}
					if (data.is_arrow_dropped || data.is_trophy_dropped) {
						//this.openEnemyDownSubwindow(unit_name, rewards);
						this.enemy_down_window_data = {
							unit_name : unit_name,
							rewards : rewards,
							collection_complete : collection_complete
						};
					}
				}.bind(this),

				showTutorialAfterShot = function(drop_anim_resolves) {

					if (!drop_anim_resolves) {
						return;
					}

					var step_4 = function() {
						var remaining_targets = this.assassins_player_spots.getNumberOfLivingUnits(),
							remaining_points_avg = this.assassins_player_spots.getRemainingPointsAverage();
						// if conditions are met return window promise otherwise return an already resolved promise
						return (remaining_targets <= 7 && remaining_points_avg <= 5) ?
							this.showTutorial(Tutorial.steps.STEP4) :
							Promise.resolve();
						}.bind(this);

					var step_5 = function(data) {
						return (data.special_reward && data.special_reward.arrows) ?
							this.showTutorial(Tutorial.steps.STEP5) :
							Promise.resolve();
					}.bind(this, drop_anim_resolves[0]);

					var step_6 = function(data) {
						return (data.special_reward && data.special_reward.trophy) ?
							this.showTutorial(Tutorial.steps.STEP6) :
							Promise.resolve();
					}.bind(this, drop_anim_resolves[0]);

					var step_8 = function() {
						var not_bought_in_shop_yet = this.getCollection('player_hints')
							.getForType('assassins_bought_item_in_shop_interstitial').isHidden();

						return (this.player_ledger.getBattleTokens() > 50 && not_bought_in_shop_yet) ?
							this.showTutorial(Tutorial.steps.STEP8) :
							Promise.resolve();
					}.bind(this);

					return Promise.all([step_4(), step_5(), step_6(), step_8()]);
				}.bind(this),

				reRenderSpots = function() {
					this.view.reRenderFightSpots(spot_id);
					this.checkForReset();
				}.bind(this),

				blockModelUpdatesForAnimations = function() {
					this.shoot_animation_running = true;
				}.bind(this),

				unBlockModelUpdateForAnimations = function() {
					this.shoot_animation_running = false;
				}.bind(this),

				highlightTrophyTabIfCollected = function() {
					// check if we got a trophy
					if (this.enemy_down_window_data &&
						this.enemy_down_window_data.rewards &&
						this.enemy_down_window_data.rewards.some(function(reward) {
							return reward.special_reward && reward.special_reward.trophy;
						})) {
						this.highlightTab(1);
					}
				}.bind(this),

				firstAnimationPart = function() {
					this.player_meta_data.setArrows();
					var points_promise = this.assassins_player_ranking.getDailyPointsChangePromise();

					this.enemy_down_window_data = null;
					this.assassins_player_spots.getSpot(spot_id).shootSpot(spot_id);
					this.last_unit_shot_at = this.getSpotType(spot_id);
					blockModelUpdatesForAnimations();

					var anim_promise = this.openAssassinAnimationSubWindow(spot_id)
						.then(this.view.setPlayerSpotToKilled.bind(this, $target));

					return Promise.all([anim_promise, points_promise])
						.then(this.player_meta_data.onTrophyOrArrowDrop(this).then(enemyDownReward, function() {}))
						.then(this.startAnimationThirdPartWithBackendData.bind(this));
				}.bind(this),

				secondAnimationPart = function() {
					return this.startAnimationFourthPart()
						.then(this.closeSubWindow.bind(this))
						.then(unBlockModelUpdateForAnimations)
						.then(this.showTutorial.bind(this, Tutorial.steps.STEP2))
						.then(this.showTutorial.bind(this, Tutorial.steps.STEP3))
						.then(this.openEnemyDownSubwindow.bind(this))
						.then(showTutorialAfterShot)
						.then(this.showCollectionComplete.bind(this))
						.then(highlightTrophyTabIfCollected)
						.then(reRenderSpots);
				}.bind(this);

			if (!this.dailyRankingController.isEvaluationActive()) {
				if (this.getArrowCount() === 0) {
					this.openQuiverEmptySubWindow();
				} else {
					this.ready_for_point_update_promise = firstAnimationPart();

					this.ready_for_point_update_promise.then(secondAnimationPart).catch(function (error) {
						this.closeSubWindow();
					}.bind(this));
				}
			}
		},

		getSpotType : function(spot_id) {
			return this.assassins_player_spots.getSpot(spot_id).getType();
		},

		refillArrows: function () {
			return this.player_meta_data.refillArrowQuiver();
		},

		getArrowCount: function () {
			return this.player_meta_data.getArrows();
		},

		getBattleTokens: function() {
			return this.getModel('player_ledger').getBattleTokens();
		},

		openQuiverEmptySubWindow: function () {
			var	controller = new SubWindowQuiverEmptyController({
					l10n : this.getl10n('sub_window_quiver_empty'),
					window_controller : this,
					templates : {
						sub_window_quiver_empty: this.getTemplate('sub_window_quiver_empty')
					},
					models : {

					},
					collections : {

					},
					cm_context : {
						main : this.getMainContext(),
						sub : 'assasins_quiver_empty_window'
					}
				}),

				openQuiverEmpty = function() {
					this.openSubWindow({
						title: this.getl10n('sub_window_quiver_empty').title,
						controller : controller,
						skin_class_names : 'classic_sub_window assassins_quiver_empty_window'
					});
				}.bind(this);

			openQuiverEmpty();
		},

		_openRewardPresentationSubwindow : function(window_type, rewards, unit_name) {
			return new Promise(function(resolve, reject) {
				var	controller = new SubWindowRewardPresentationController({
					l10n : this.getl10n('sub_window_reward_presentation'),
					window_controller : this,
					window_type : window_type,
					unit : unit_name,
					rewards : rewards,
					resolvePromise: resolve,
					templates : {
						sub_window_reward_presentation: this.getTemplate('sub_window_reward_presentation')
					},
					models : {},
					collections : {},
					cm_context : {
						main : this.getMainContext(),
						sub : 'assassins_reward_presentation'
					}
				});

				this.openSubWindow({
					title: this.getl10n('sub_window_reward_presentation')[window_type].title,
					controller : controller,
					skin_class_names : 'classic_sub_window assassins_reward_presentation'
				});

				var arrow_rewards = rewards.filter( function(reward) {
					return reward.special_reward.arrows;
				});

				if (arrow_rewards.length) {
					this.view.reRenderArrowQuiver();
				}
			}.bind(this));
		},

		openCommunityGoalReachedSubwindow : function () {
			var reward = this.goals_controller.getLastReachedCommunityGoal();
			this._openRewardPresentationSubwindow('community_goal_reached', [reward]);
			this.player_hints.disableHint('assassins_community_goal_reached_interstitial');
		},

		openEnemyDownSubwindow : function () {
			if (!this.enemy_down_window_data) {
				return;
			}
			return this._openRewardPresentationSubwindow('enemy_down', this.enemy_down_window_data.rewards, this.enemy_down_window_data.unit_name);
		},


		showLinearTutorial: function() {
			var steps = Tutorial.getTutorialOrder(),
				current_index = 0,
				showNext = function() {
					// go through all steps recursively
					if ( current_index < steps.length) {
						var currentStep =  steps[current_index];
						current_index += 1;
						this.showTutorial(currentStep, true).then(showNext);
					}
				}.bind(this);

			showNext();
		},

		showTutorial: function(tutorial_id, is_linear_tutorial) {
			return new Promise(function(resolve, reject) {
				if (!Tutorial.isStepSeen(tutorial_id) || is_linear_tutorial) {

					var	controller = new SubWindowTutorialController({
						l10n : this.getl10n('tutorial'),
						window_controller : this,
						tutorial_id : tutorial_id,
						resolvePromise: resolve,
						is_linear_tutorial: is_linear_tutorial,
						templates : {
							sub_window_tutorial: this.getTemplate('sub_window_tutorial')
						},
						models : {},
						collections : {
							player_hints: this.getModel('player_hints')
						},
						cm_context : {
							main : this.getMainContext(),
							sub : 'tutorial'
						}
					});

					this.openSubWindow({
						controller : controller,
						skin_class_names : 'empty_window'
					});

				} else {
					resolve();
				}
			}.bind(this));
		},

		showCollectionComplete: function() {
			if (this.enemy_down_window_data && this.enemy_down_window_data.collection_complete) {
				this.setInactivePreviousCompleteCollection();
				this.player_hints.enableHint('assassins_collection_complete_' + this.enemy_down_window_data.unit_name);
				this.view.showCollectionComplete(this.enemy_down_window_data.unit_name);
			}
		},

		openAssassinAnimationSubWindow : function(spot_id) {
			this.assassins_animation_controller = new SubWindowAssassinAnimationController({
				l10n : this.getl10n(),
				window_controller : this,
				spot_id : spot_id,
				templates : {
					sub_window_assassin_animation: this.getTemplate('sub_window_assassin_animation'),
					sub_window_assassin_animation_arrow: this.getTemplate('sub_window_assassin_animation_arrow'),
					sub_window_assassin_animation_points: this.getTemplate('sub_window_assassin_animation_points')
				},
				models : {},
				collections : {},
				cm_context : {
					main : this.getMainContext(),
					sub : 'assassin_animation'
				}
			});

			this.openSubWindow({
				controller : this.assassins_animation_controller,
				skin_class_names : 'empty_window'
			});

			return this.assassins_animation_controller.startAnimation();
		},

		startAnimationThirdPartWithBackendData : function() {
			return this.assassins_animation_controller.continueAnimationWithData(
				this.assassins_player_ranking.getGainedPoints()
			);
		},

		startAnimationFourthPart : function() {
			return this.assassins_animation_controller.startAnimationFourthPart();
		},

		waitForRightMomentToUpdatePoints: function() {
			return this.ready_for_point_update_promise;
		},

		openAssassinsAllUnitsDeadSubWindow: function (reset) {
			var controller = new SubWindowAllUnitsDeadAnimationController({
					l10n : reset ? this.getl10n('all_units_dead').reset : this.getl10n('all_units_dead').eliminated,
					window_controller : this,
					templates : {
						sub_window_all_units_dead_animation: this.getTemplate('sub_window_all_units_dead_animation')
					},
					models : {},
					collections : {},
					cm_context : {
						main : this.getMainContext(),
						sub : 'all_units_dead_animation'
					}
			});

			this.openSubWindow({
				controller : controller,
				skin_class_names : 'empty_window'
			});
		},

		/**
		 * for the assassin animation, we need to make the curtain visible
		 * until the animation is done
		 */
		hideSubWindowCurtainInDom : function() {
			this.$el.parent().find('.gp_window_curtain').css({ opacity: 0 });
		},

		destroy: function () {
			if (this.dailyRankingController && typeof this.dailyRankingController._destroy === 'function') {
				this.dailyRankingController._destroy();
			}
			this.dailyRankingController = null;
			$.Observer(window.GameEvents.community_goals.goal_reached).unsubscribe(['assassins_fight_controller']);
		}
	});

    return AssassinFightController;
});
