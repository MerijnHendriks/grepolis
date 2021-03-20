/*global GameDataHercules2014, Timestamp, TM, Hercules2014WindowFactory, us, HelperHercules2014, NotificationLoader, LocalStore, DM, GameDataHeroes */

define('events/campaign/controllers/campaign', function(require) {

	'use strict';

	var GameControllers = window.GameControllers;
	var GameViews = window.GameViews;
	var AttackWindowController = require('events/campaign/controllers/sub_windows/attack');
	var SubWindowStageInfo = require('events/campaign/controllers/sub_windows/stage_info');
	var SubWindowLastStageInfo = require('events/campaign/controllers/sub_windows/last_stage_info');
	var SubWindowFightResultController = require('events/campaign/controllers/sub_windows/fight_result');
	var SubWindowFightAnimation = require('events/campaign/controllers/sub_windows/fight_animation');
	var SubWindowTutorial = require('events/campaign/controllers/sub_windows/tutorial');
	var CampaignTutorial = require('events/campaign/data/tutorial');
	var Features = require('data/features');

	var INITIAL_MAP_POSITION = { x: 0, y: 0 };
	var TUTORIAL_COLLECT_TROOPS_STAGE = 3;
	var TUTORIAL_HERO_STAGE = 2;

	var has_hero_reward = false;

	var CampaignController = GameControllers.TabController.extend({
		view : null,
		stage_collection : null,

		initialize : function(options) {
			//Don't remove it, it should call its parent
			GameControllers.TabController.prototype.initialize.apply(this, arguments);
			var window_args = this.getWindowModel().getArguments();
			has_hero_reward = (window_args && window_args.has_hero_reward) ? window_args.has_hero_reward : false;
		},

		initializeView : function() {
			this.view = new GameViews.Hercules2014View({
				controller : this,
				el : this.$el
			});

			this.rankingController = new GameControllers.CampaignRankingController({
				el : this.$el,
				parent_controller : this
			});

			HelperHercules2014.resetAmountBadge();
		},

		renderPage : function() {
			this.stage_collection = this.getCollection('campaign_player_stages');

			CampaignTutorial.init(this.getCollection('player_hints'));
			this.initializeView();
			this.registerEventListeners();
			this.registerReloadOnDayChange();

			this.showTutorial(CampaignTutorial.steps.BATTLEGROUND);

			this.rankingController.renderPage();
			
			return this;
		},

		registerEventListeners : function() {
			var armyHasChanged = function() {
				this.view.reRenderMercenariesArea();
				this.view.reRenderDroppedUnits();
			}.bind(this);

			this.getModel('campaign_player_army').onArmyChange(this, armyHasChanged);

			this.stage_collection.onFightResultChange(this, function(stage_model) {
				// hide fight animation
				this.closeSubWindow();
				this.triggerNextFightStep(stage_model.getId());
			}.bind(this));

			// re-render the map when the stages change in the models
			this.stage_collection.onStageChange(this, function() {
				this.view.reRenderMap();
			}.bind(this));
		},

		/**
		 * to refresh the window, it has to reload after the current 'day' is over.
		 */
		registerReloadOnDayChange : function() {
			var onDayChange = function() {
				this.reloadWindow();
				HelperHercules2014.resetAmountBadge();
			}.bind(this);
			var next_midnight = this.getModel('campaign').getNextMidnight();
			var now = Timestamp.now();

			if (next_midnight > now) {
				this.unregisterReloadOnDayChange();
                TM.register('reload_campaign_window', (next_midnight - now) * 1000, onDayChange, {max: 1});
			} else {
				onDayChange();
			}
		},

		/**
		 * register timer if not needed anymore
		 */
		unregisterReloadOnDayChange : function() {
			TM.unregister('reload_campaign_window');
		},

		/**
		 * this method is used to 'refresh' the page when the next day starts while the window is open
		 *
		 * @method reloadWindow
		 */
		reloadWindow : function() {
			this.closeWindow();
			Hercules2014WindowFactory.openWindow();
		},

		/**
		 * trigger the fight result or the tutorial for the stage
		 * @param {number} stage_id
		 */
		triggerNextFightStep : function(stage_id) {
			var stage = this.stage_collection.getStage(stage_id),
				fight_result = stage.getFightResult(),
				current_level = stage.getCurrentLevel();

			if (this.stageHasTutorial(stage_id) && fight_result && fight_result.has_attacker_won && current_level === 2) {
				if (this.stageIsLastStage(stage_id) && fight_result && fight_result.has_attacker_won && current_level === 2) {
					this.openLastStageInfoWindow(stage_id);
				} else {
					var tutorial_id = this._getStageStaticData(stage_id).story_id;
					this.openTutorialSubWindow([tutorial_id], this.openLastFightResult.bind(this, stage_id, true));
				}
			} else {
				this.openLastFightResult(stage_id, true);
			}
		},

		/**
		 * Returns timestamp which indicates end of the event
		 *
		 * @returns {*}
		 */
		getEventEndAt : function() {
			return this.getModel('campaign').getEventEndAt();
		},

		getArmy : function() {
			return this.getModel('campaign_player_army').getArmy();
		},

		/**
		 * given a type of mercenary unit, return the amounts the player has in his army or 0s
		 * Backend does not guarantee to deliver always all units, so 0-ing them is needed.
		 *
		 * @param {String} mercenary_type
		 * @return {Object}
		 */
		getArmyAmountsFor : function(mercenary_type) {
			var mercenary = this.getMercenary(mercenary_type);

			if (!mercenary) {
				return {
					total: 0,
					healthy: 0,
					damaged: 0
				};
			}

			return {
				total: mercenary.amount_total,
				healthy: mercenary.amount_healthy,
				damaged: mercenary.amount_damaged
			};
		},

		/**
		 * given a mercenary unit returns the amount of this units collected today
		 * or 0
		 */
		getCollectedTodayAmountsFor : function(mercenary_type) {
			var army = this.getModel('campaign_player_army'),
				units_amount_collected = army.getUnitsTotalDaily()[mercenary_type];

			if (!units_amount_collected) {
				return {
					total: 0,
					healthy: 0,
					damaged: 0
				};
			}

			return {
				total: units_amount_collected,
				healthy: 0,
				damaged: 0
			};
		},

		/**
		 * return the fight modifier for a mercenary
		 *
		 * @param {String} mercenary_type
		 * @return {Number}
		 */
		getFightModifier : function(mercenary_type) {
			var army = this.getArmy();

			return army[mercenary_type].fight_modifier;
		},

		/**
		 * return the amount of mercenaries for given stage and mercenary_type
		 *
		 * @param {Number} stage_id
		 * @param {String} mercenary_type
		 */
		getEnemyArmyUnitAmount : function(stage_id, mercenary_type) {

			var stage_static_data = this._getStageStaticData(stage_id),
				stages_collection = this.stage_collection,
				stage = stages_collection.getStage(stage_id);

			// player has already made progress in this stage, so return this progress
			if (stage) {
				//TODO: check that healthy are really used
				return { healthy : stage.getEnemyUnitAmount(mercenary_type).amount_healthy };
			}

			// no progress, return default data (not all units may be there)
			if (stage_static_data.units[mercenary_type]) {
				return {
					healthy: stage_static_data.units[mercenary_type]
				};
			}

			return { healthy: 0 };
		},

		/**
		 * returns all static unit data from GameData
		 */
		getAllBaseUnits : function() {
			return GameDataHercules2014.getAllUnits();
		},

		getMercenary : function(mercenary_type) {
			var mercenaries = this.getArmy();
			return mercenaries[mercenary_type];
		},

		getMercenaryCost : function(mercenary_type) {
			return this.getModel('campaign_player_army').getMercenaryCost(mercenary_type);
		},

		getMercenaryName : function(mercenary_type) {
			return GameDataHercules2014.getUnitName(mercenary_type);
		},

		getHealerTimestamp : function() {
			return this.getModel('campaign_player_army').getHealerTimestamp();
		},

		getHealerCost : function() {
			return this.getModel('campaign_player_army').getHealerCost();
		},

		getHealerTooltip : function () {
            return us.template(this.getTemplate('healer_tooltip'), {
                tooltip_text : this.l10n.tooltips.healing_bar(hours_minutes_seconds(GameDataHercules2014.getHealerCooldownDuration()))
            });
		},

		getHeroCost : function() {
			return this.getModel('campaign_player_army').getHeroCost();
		},

		areArmyUnitsWounded :function() {
			var mercenaries = this.getArmy();
			for (var mercenary_id in mercenaries) {
				if (mercenaries.hasOwnProperty(mercenary_id)) {
					var mercenary = mercenaries[mercenary_id];
					if (mercenary.amount_damaged > 0) {
						return true;
					}
				}
			}
			return false;
		},

		buyMercenaryForGold : function(mercenary_type) {
			this.getModel('campaign_player_army').buyMercenary(mercenary_type);
		},

		buyHealerForGold : function() {
			this.getModel('campaign_player_army').buyHealer();
		},

		healHerculesForGold : function() {
			this.getModel('campaign_player_army').buyhealInstantHero();
		},

		getHerculesCooldownTime : function() {
			return this.getModel('campaign_player_army').getHeroTimestamp();
		},

		/**
		 * return all stages from static data to make sure all stages are returned
		 * returns {GameData.campaignStages}
		 */
		getAllStages : function() {
			return GameDataHercules2014.getAllStages();
		},

		_getStageStaticData : function(stage_id) {
			return GameDataHercules2014.getStage(stage_id);
		},

		/**
		 * returns the Stage name
		 */
		getStageName : function(stage_id) {
			return this._getStageStaticData(stage_id).name;
		},

		/**
		 * return a luck value from a stages fight result or 0
		 */
		getLuckValue : function(stage_id) {
			var stage = this.stage_collection.getStage(stage_id);
			return stage.getLuckValue();
		},

		/**
		 * return a hero bonus value from a stages fight result or 0
		 */
		getHeroValue : function(stage_id) {
			return this.stage_collection.getStage(stage_id).getHeroValue();
		},

		/**
		 * return a stage current level (number of won fights -1)
		 */
		getStageLevel : function(stage_id) {
			return this.stage_collection.getStage(stage_id).getCurrentLevel();
		},

		/**
		 * a stage is unlocked, if it either has no previous stage OR any previous stage is 'won'
		 *
		 * @param {Number} stage_id
		 * @returns {Boolean}
		 */
		isStageUnlocked : function(stage_id) {
			var stage_collection = this.stage_collection,
				previous_stage_ids = GameDataHercules2014.getPreviousStageIds(stage_id),
				toModel = stage_collection.getStage.bind(stage_collection),
				hasAlreadyBeenWon = function(stage) {
					return stage && stage.isWonMoreThanOnce();
				};

			return previous_stage_ids.map(toModel).some(hasAlreadyBeenWon);
		},

		/**
		 * returns true if the stage is on cooldown
		 * @return {Boolean}
		 */
		isStageOnCooldown : function(stage_id) {
			var stage = this.stage_collection.getStage(stage_id);
			return stage.hasCooldown();
		},

		/**
		 * given a stage id returns the state teh stage is in as a String - used as CSS class
		 * @param stage_id
		 * @return {String}
		 */
		getStageCSSClass : function(stage_id) {
			var stage = this.stage_collection.getStage(stage_id);

			if (stage.hasReward() && stage.isStageWon()) {
				return 'badge_collect_reward';
			}

			if (!stage.hasReward() && stage.hasCooldown()) {
				return 'badge_cooldown';
			}

			if (this.isStageUnlocked(stage_id) && !stage.isWonMoreThanOnce() ) {
				return 'badge_attack1';
			}

			if (this.isStageUnlocked(stage_id) && stage.isWonMoreThanOnce() ) {
				return 'badge_attack2';
			}

			if (stage_id === 1) {
				return (stage.isWonMoreThanOnce()) ? 'badge_attack2' : 'badge_attack1';
			}

			return 'badge_locked';
		},

		/**
		 * return reward-Object for the stage reward as an array of length 1
		 */
		getStageReward : function(stage_id) {
			var stage_collection = this.stage_collection;
			return [stage_collection.getStageReward(stage_id)];
		},

		/**
		 * return one-time the stage reward as an array
		 */
		getStageOnetimeReward : function(stage_id) {
			var stage_collection = this.stage_collection,
				stage = stage_collection.getStage(stage_id);

			return stage.getOnetimeRewards();
		},

		_rewardActionCallback : function() {
			this.sub_window.close();
		},

		useReward : function(stage_id) {
			var stage = this.stage_collection.getStage(stage_id);
			stage.useReward(stage_id, {
				success: this._rewardActionCallback.bind(this)
			});
		},

		stashReward : function(stage_id) {
			var stage = this.stage_collection.getStage(stage_id);
			stage.stashReward(stage_id, {
				success: this._rewardActionCallback.bind(this)
			});
		},

		trashReward : function(stage_id) {
			var stage = this.stage_collection.getStage(stage_id);
			stage.trashReward(stage_id, {
				success: this._rewardActionCallback.bind(this)
			});
		},
		/**
		 * return rendered html for reward container
		 */
		getStageRewardHtml : function(title, rewards) {
			return us.template(this.getTemplate('reward_container'), {
				title : title,
				rewards: rewards
			});
		},

		/**
		 * render Tooltips for stage
		 *
		 * @param {String} stage_id
		 * @param {boolean} in_window - should be true if rendered in subwindow (needs different CM id)
		 * @returns {String} html for .tooltip
		 */
		getStageTooltip : function(stage_id, in_window) {
			var stage_static_data = this._getStageStaticData(stage_id),
				stage = this.stage_collection.getStage(stage_id),
				component_name = 'stage_cooldown_' + stage_id + (in_window ? '_window' : '');

			var $tooltip = $(us.template(this.getTemplate('stage_tooltip'), {
				l10n : this.l10n,
				stage: {
					id: stage_id,
					name: stage_static_data.name
				}
			}));

			$tooltip.find('.reward_container').append(this.getStageRewardHtml(this.l10n.reward, this.getStageReward(stage_id)));

			var func = HelperHercules2014.flipTotalAndHealthyAmountsDecorator(this.getEnemyArmyUnitAmount.bind(this, stage_id));
			$tooltip.find('.mercenaries_box').append(this.getMercenariesBoxHtml(func, true));

			var $progressbar = $tooltip.find('.pb_stage_cooldown');

			if (stage.hasCooldown()) {
				$tooltip.find('.cooldown_container').show();
				this.unregisterComponent(component_name, 'stage_cooldowns');
				this.registerComponent(component_name, $progressbar.singleProgressbar({
					value : stage.getCooldown() - Timestamp.now(),
					max : GameDataHercules2014.getStageCooldownDuration(),
					liveprogress : true,
					type : 'time',
					countdown : true,
					template : 'tpl_pb_single_nomax',
					reverse_progress : true
				}).on('pb:cd:finish', function() {
					NotificationLoader.resetNotificationRequestTimeout(100);
				}.bind(this)), 'stage_cooldowns');
			}

			if (stage.hasOnetimeRewards()) {
				var title = GameDataHeroes.areHeroesEnabled() ? this.l10n.onetime_rewards : this.l10n.onetime_reward;

				$tooltip.find('.onetime_reward_container').append(this.getStageRewardHtml(title, this.getStageOnetimeReward(stage_id)));

				// if stage is on level > 1, set them to disabled
				if (stage.getCurrentLevel() > 1) {
					$tooltip.find('.hero, .culture_level').addClass('disabled');
				}
			}

			return $tooltip;
		},

		/**
		 * render tooltip for mercenaries
		 *
		 * @param {String} mercenary_type
		 * @param {boolean} [enemy_army]
		 * @returns {String} html for .tooltip
		 */
		getMercenaryTooltip : function(mercenary_type, enemy_army) {
			var mercenary_static = GameDataHercules2014.getUnit(mercenary_type);

			return us.template(this.getTemplate('mercenary_tooltip'), {
				l10n : this.l10n,
				mercenary : {
					army_data: this.getArmyAmountsFor(mercenary_type),
					static_data: mercenary_static
				},
				primary_bonus : {
					text: this.l10n.unit_bonus(50),
					unit: mercenary_static.bonus1
				},
				secondary_bonus : {
					text: this.l10n.unit_bonus(25),
					unit: mercenary_static.bonus2
				},
				amounts: this.getArmyAmountsFor(mercenary_type),
				enemy_army: enemy_army,
				fight_modifier : (enemy_army) ? 0 : this.getFightModifier(mercenary_type)
			});
		},

		/**
		 * get HTML from parent controller
		 * @param {Function} getAmountFunc
		 * @param {boolean} [enemy]
		 */
		getMercenariesBoxHtml : function(getAmountFunc, enemy) {
			var mercenaries = this.getAllBaseUnits(),
				html = '';

			for (var i = 0, l = mercenaries.length; i < l; i++) {
				var mercenary = mercenaries[i];

				html += us.template(this.getTemplate('mercenary'), {
					l10n : this.l10n,
					mercenary : mercenary,
					amounts: getAmountFunc(mercenary.type),
					enemy: enemy
				});
			}

			return html;
		},

		/**
		 * if the stage has a reward to pick and is not in cooldown,
		 * open the StageAttackwindow, else open last fight report
		 */
		openStageWindow : function(stage_id, event) {
			var status = this.getStageCSSClass(stage_id);

			if (status === 'badge_collect_reward') {
				this.openLastFightResult(stage_id);
				return;
			}

			if (status === 'badge_locked' || status === 'badge_cooldown') {
				this.openStageInfoWindow(stage_id);
				return;
			}

			this.openStageAttackWindow(stage_id, event);
		},

		/**
		 * create stage attack window and show it
		 */
		openStageAttackWindow : function(stage_id) {
			var stage_name = this.getStageName(stage_id),
				openSubWindow = function() {
					this.openSubWindow({
						title: this.l10n.stage + ' ' + stage_id + ': ' + stage_name,
						controller : this.stage_window_controller,
						skin_class_names : 'classic_sub_window'
					});
				}.bind(this),
				showTutorialOnAttackOpen = function(cb) {
					return function() {
						if (stage_id === TUTORIAL_COLLECT_TROOPS_STAGE) {
							this.showTutorial(CampaignTutorial.steps.COLLECT_TROOPS, cb);
							CampaignTutorial.markAsFinishedInBackend();
						} else {
							cb();
						}
					}.bind(this);
				}.bind(this);

			this.stage_window_controller = new AttackWindowController({
				stage_id : stage_id,
				l10n : this.l10n,
				window_controller : this,
				templates : {
					sub_window_attack: this.getTemplate('sub_window_attack'),
					mercenary: this.getTemplate('mercenary'),
					hercules_tooltip: this.getTemplate('hercules_tooltip'),
					attack_unit: this.getTemplate('attack_unit')
				},
				collections : {
					campaign_player_stages: this.stage_collection
				},
				models: {
					campaign_player_army: this.getModel('campaign_player_army')
				},
				cm_context : {
					main : this.getMainContext(),
					sub : 'campaign_attack_window'
				},
				has_hero_reward: has_hero_reward
			});

			this.showTutorial(CampaignTutorial.steps.ATTACKING, showTutorialOnAttackOpen(openSubWindow));
		},

		/**
		 * close all current subwindows and open Stage Attack window again
		 */
		reFightStage : function(stage_id) {
			this.closeSubWindow();
			this.openStageAttackWindow(stage_id, null);
		},

		/**
		 * open the stage tooltip as a subwindow to allow hovering of the reward and units
		 */
		openStageInfoWindow : function(stage_id) {
			var stage_name = this.getStageName(stage_id);

			var controller = new SubWindowStageInfo({
				l10n : this.l10n,
				window_controller : this,
				templates : {
					stage_tooltip: this.getTemplate('stage_tooltip')
				},
				collections : {
					campaign_player_stages : this.stage_collection
				},
				stage_id : stage_id,
				stage_name : this.getStageName(stage_id),
				cm_context : {
					main : this.getMainContext(),
					sub : 'campaign_sub_window_stage_info'
				}
			});

			this.openSubWindow({
				title : this.isStageOnCooldown(stage_id) ? this.l10n.stage_window_title_cooldown : this.l10n.stage + ' ' + stage_id + ': ' + stage_name,
				controller : controller,
				skin_class_names : 'classic_sub_window'
			});
		},

		stageIsLastStage : function(stage_id) {
			return us.last(this.stage_collection.models).getStageId() === stage_id;
		},

		/**
		 * open the info window you receive when defeating the last stage
		 */
		openLastStageInfoWindow : function(stage_id) {
			var controller = new SubWindowLastStageInfo({
				stage_id : stage_id,
				l10n : this.l10n,
				window_controller : this,
				templates : {
					last_stage_info: this.getTemplate('sub_window_last_stage_info')
				},
				collections : {
					campaign_player_stages : this.getCollection('campaign_player_stages')
				},
				cm_context : {
					main : this.getMainContext(),
					sub : 'campaign_sub_window_last_stage_info'
				}
			});

			var sub_window = this.openSubWindow({
				title : this.l10n.sub_window_last_stage.title,
				controller : controller,
				skin_class_names : 'classic_sub_window campaign_sub_window_last_stage_info'
			});

			// bind the next action in chain to the close button of the subwindow
			sub_window.setOnAfterClose(this.openLastFightResult.bind(this, stage_id, true));
		},

		/**
		 *
		 * @param {number} stage_id
		 * @param {boolean} show_honr_points - indicates that this is being called directly after a fight
		 */
		openLastFightResult : function(stage_id, show_honor_points) {
			var stage = this.getCollection('campaign_player_stages').getStage(stage_id),
				fight_result = stage.getFightResult();

			this.closeSubWindow();
			if (fight_result.has_attacker_won) {
				this.openVictoryWindow(stage_id, fight_result, show_honor_points);
			} else {
				this.openDefeatWindow(stage_id, fight_result);
			}
		},

		/**
		 * close sub window and open attack window
		 *
		 * @param {string} stage_id
		 */
		switchToAttackWindow : function(stage_id) {
			this.closeSubWindow();
			this.openStageAttackWindow(stage_id);
		},

		openVictoryWindow : function(stage_id, fight_result, show_honor_points) {
			this.openFightResultWindow(stage_id, 'victory', fight_result, show_honor_points);
		},

		openDefeatWindow : function(stage_id, fight_result) {
			var openFightResult = this.openFightResultWindow.bind(this, stage_id, 'defeat', fight_result),
				showWoundedUnitsEvent = this.showTutorial.bind(this, CampaignTutorial.steps.WOUNDED_UNITS, openFightResult);

			this.showTutorial(CampaignTutorial.steps.ATTACK_AGAIN, showWoundedUnitsEvent);
		},

		hasHeroReward: function() {
			return has_hero_reward;
		},

		openFightResultWindow : function(stage_id, fight_result_type, fight_result, show_honor_points) {
			var stage_name = this.getStageName(stage_id),
				controller = new SubWindowFightResultController({
					l10n : this.getl10n('sub_window_fight_result'),
					window_controller : this,
					templates : {
						sub_window_fight_result: this.getTemplate('sub_window_fight_result')
					},
					models : {
						campaign_player_army: this.getModel('campaign_player_army'),
						campaign_ranking: this.getModel('campaign_ranking')
					},
					collections : {

					},
					stage_id : stage_id,
					cm_context : {
						main : this.getMainContext(),
						sub : 'campaign_sub_window_' + fight_result_type
					},
					fight_result : fight_result,
					fight_result_type : fight_result_type
				}),

				showRanking = function() {
					this.showTutorial(CampaignTutorial.steps.RANKING);
				}.bind(this),

				showHeroAndRankingTutorial = function() {
					if (stage_id === TUTORIAL_HERO_STAGE && fight_result.has_attacker_won) {
						this.showTutorial(CampaignTutorial.steps.HERO, showRanking);
					}
				}.bind(this),

				openFigthResult = function() {
					this.openSubWindow({
						title: this.l10n.stage + ' ' + stage_id + ': ' + stage_name,
						controller : controller,
						skin_class_names : 'classic_sub_window campaign_fight_result'
					}).setOnAfterClose(showHeroAndRankingTutorial);

					if (fight_result.has_attacker_won && show_honor_points) {
						setTimeout(controller.view.showHonorPointAnimation.bind(controller.view), 1000);
					}
				}.bind(this);

			if (fight_result.has_attacker_won)  {
				this.showTutorial(CampaignTutorial.steps.YOU_WON, this.showTutorial.bind(this, CampaignTutorial.steps.HONOR_POINTS, openFigthResult));
			} else {
				openFigthResult();
			}
		},

		getLastSavedMapViewPosition : function() {
			var stored_position = INITIAL_MAP_POSITION;
			LocalStore.get('hercules2014:map_view_position', function(success, data) {
				if (success && data) {
					stored_position = data;
				}
			});
			return stored_position;
		},

		/**
		 *
		 * @param {array} pos - [x,y]
		 */
		saveMapViewPosition : function(pos) {
			LocalStore.set('hercules2014:map_view_position', pos);
		},

		getDroppedUnitsSum : function() {
			var army = this.getModel('campaign_player_army');
			return army.getCollectedAmount();
		},

		showFightAnimation : function(stage_id) {
			this.closeSubWindow();

			var controller = new SubWindowFightAnimation({
				l10n : DM.getl10n('tutorial'),
				window_controller : this,
				templates : {
					'fight_animation': this.getTemplate('fight_animation')
				},
				collections : {
				},
				stage_id : stage_id,
				cm_context : {
					main : this.getMainContext(),
					sub : 'campaign_sub_window_fight_animation'
				}
			});

			this.openSubWindow({
				controller : controller,
				skin_class_names : 'empty_window'
			});
		},

		/**
		 * true if the stage has a tutorial to show
		 */
		stageHasTutorial : function(stage_id) {
			var stage_static_data = this._getStageStaticData(stage_id);
			return stage_static_data.story_id;
		},

        /**
		 * Show tutorial sub-window for the wanted tutorial ids
		 *
         * @param {array} tutorial_ids - contains the ids for the tutorial
         * @param {function} on_close - callback when closing the sub window
         * @param {boolean} show_full_tutorial - used to display additional control elements when showing all tutorials
         */
		openTutorialSubWindow : function(tutorial_ids, on_close, show_full_tutorial) {
			// make sure subwindows are closed
			this.closeSubWindow();

			var controller = new SubWindowTutorial({
				l10n : DM.getl10n('tutorial'),
				window_controller : this,
				templates : {
					'tutorial': this.getTemplate('tutorial'),
					'hero_box': this.getTemplate('hero_box')
				},
				collections : {
				},
                tutorial_ids : tutorial_ids,
				on_close: on_close,
                show_full_tutorial: show_full_tutorial,
				cm_context : {
					main : this.getMainContext(),
					sub : 'campaign_sub_window_tutorial'
				}
			});

			this.openSubWindow({
				controller : controller,
				skin_class_names : 'empty_window'
			});

		},

		/**
		 * hide the tutorial
		 */
		hideTutorial : function() {
			this.closeSubWindow();
		},

		/**
		 * Used to show a single tutorial overlay if it has not yet been shown
		 * @param tutorial_id
		 * @param {function} [cb] - callback called:
		 * 							* after ok has been clicked on tutorial step
		 * 							* immediately if step has been seen before
		 */
		showTutorial : function(tutorial_id, cb) {
			var exit = function() {
					if (cb) { cb();	}
				},
				save_step = function(tutorial_id) {
					CampaignTutorial.saveStepAsSeen(tutorial_id);
                    exit();
				},
                tutorial_ids = [tutorial_id];

			CampaignTutorial.isStepSeen(tutorial_id).then(function(isStepSeen) {
				if ( !isStepSeen && !(tutorial_id === CampaignTutorial.steps.HERO && !Features.areHeroesEnabled()) ) {
					this.openTutorialSubWindow(tutorial_ids, save_step.bind(this, tutorial_id));
				} else {
					exit();
				}
			}.bind(this), function() {
				this.openTutorialSubWindow(tutorial_ids, exit());
			}.bind(this));
		},

		/**
		 * Show all tutorial steps in a row
		 */
		showLinearTutorial : function() {
			var has_hero_reward = this.hasHeroReward();
			var steps = CampaignTutorial.getTutorialOrder(has_hero_reward);
			this.openTutorialSubWindow(steps, null, true);
		},

		hideRanking: function() {
			this.rankingController.view.slideOut();
		},

		showRanking: function() {
			this.rankingController.view.slideIn();
		},

		getHighestUnlockedStageId: function () {
            var stages_count = this.stage_collection.getStagesCount(),
                stage = this.stage_collection.getStage(stages_count - 1),
                result = stages_count,
                previous_stage_ids = [];

            while (stage && !stage.isStageWon()) {
                result = stage.getStageId();
                previous_stage_ids = GameDataHercules2014.getPreviousStageIds(result);
                stage = this.stage_collection.getStage(previous_stage_ids[0]);
            }

			return result;
		},

		destroy : function() {
			this.unregisterReloadOnDayChange();
		}
	});

	return CampaignController;
});
