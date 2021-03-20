/*global AdventWheelOfFortune, GameEvents, GameDataAdvent, TM, Timestamp, Game, GameData, GameControllers */

(function() {
	'use strict';

	var AdventController = {
		main_view : null,
		wheel : null,
		//Determinates whether the animation is running or not
		animation_in_progress : false,
		shards_before_spinning : 0,

		renderPage : function(data) {
			this.wheel = new AdventWheelOfFortune();
			this.advent_model = this.getModel('advent');

				this.main_view = new window.GameViews.Advent({
				controller : this,
				el : this.$el
			});

			this.setupAudio();

            this.registerRefetchOnDayChange();

			$.Observer(GameEvents.active_happening.reward.use).subscribe('advent', this.useReward.bind(this));
			$.Observer(GameEvents.active_happening.reward.stash).subscribe('advent', this.stashReward.bind(this));
			$.Observer(GameEvents.active_happening.reward.trash).subscribe('advent', this.trashReward.bind(this));

			return this;
		},

		setupAudio: function() {
			if (GameData.Sounds) {
				Game.Audio.enableSoundBranch(GameData.Sounds.window.events.advent);

				$.Observer(GameEvents.advent.advisors_received).subscribe('advent', function() {
					Game.Audio.play(GameData.Sounds.window.events.advent.advisors_received);
				});

				$.Observer(GameEvents.advent.shard_collected).subscribe('advent', function() {
					Game.Audio.play(GameData.Sounds.window.events.advent.shard_collected);
				});
			}

		},

		/**
		 * Returns true if the last shard was collected
		 *
		 * @param (Integer) old_shards
		 * @param (Integer) new_shards
		 */
		didCollectShard : function() {
			var old_shards = this.shards_before_spinning,
				new_shards = this.getCollectedShardsCount();

			return old_shards !== new_shards;
		},

		/**
		 * registers timer to start a refetch on midnight to update the view
		 */
		registerRefetchOnDayChange : function() {
			var last_known_spot = this.getSpotsCollection().last();
			var is_last_spot = last_known_spot.getIsLast();
			var timeout = 1000 * (last_known_spot.getEnd() - Timestamp.now());

			if (!is_last_spot && timeout > 0) {
				this.unregisterRefetchOnDayChange();
				TM.register('refetch_advent_data', timeout, this.refetchDataOnMidnight.bind(this), {max: 1});
			}
		},

        /**
         * unregister timer to refetch data on midnight
         */
        unregisterRefetchOnDayChange : function() {
            TM.unregister('refetch_advent_data');
        },

		/**
		 * Returns information whether the spinning animation is in progress or not
		 *
		 * @return {Boolean}
		 */
		isAnimationInProgress : function() {
			return this.animation_in_progress;
		},

		/**
		 * Sets 'animation in progress' to true or false
		 *
		 * @param {Boolean} value
		 */
		setAnimationInProgress : function(value) {
			this.animation_in_progress = value;
		},

		/**
		 * Shows wheel to the player
		 *
		 * @param {Integer} spot_index
		 */
		showWheel : function(spot_index) {
			var spot = this.getSpot(spot_index);

			this.wheel.updateCurrentSpotData(spot);

			this.main_view.showWheel();
		},

		/**
		 * Returns instance of the wheel
		 *
		 * @return {AdventWheelOfFortune}
		 */
		getWheel : function() {
			return this.wheel;
		},

		/**
		 * Returns spots from collection
		 *
		 * @return {GameModels.AdventSpot}
		 */
		getSpotsCollection : function() {
			return this.getCollection('advent_spots');
		},

		/**
		 * Returns spot model on specific index
		 *
		 * @param {Integer} index
		 *
		 * @return {GameModels.AdventSpot}
		 */
		getSpot : function(spot_index) {
			return this.getCollection('advent_spots').getSpot(spot_index);
		},

		/**
		 * Returns spot model which is currently displayed on the wheel,
		 * when any wheel was opened before, the result will be null
		 *
		 * @return {GameModels.AdventSpot}
		 */
		getCurrentSpot : function() {
			return this.getWheel().getCurrentSpotData();
		},

		/**
		 * Get the rolled reward position for a spin
		 *
		 * @return {Integer|null}
		 */
		getRewardPositionForTheSpin : function() {
			var reward = this.getCurrentSpot().getRewardToTake();
			if (reward) {
				return reward.position;
			}

			return null;
		},

		/**
		 * Starts spinning
		 */
		startSpinning : function() {
			this.shards_before_spinning = this.getCollectedShardsCount();

			this.wheel.getCurrentSpotData().spin(function() {
				this.main_view.onStartSpinning();
				this.main_view.initializeSpinner({});
			}.bind(this));
		},

		/**
		 * Slows down spinning
		 */
		slowDownSpinning : function() {
			var _self = this;

			//Change step
			this.wheel.setNextStep();

			//Reinitialize animation
			this.main_view.initializeSpinner({
				ended_callback : function() {
					_self.stopSpinning();
				},
				max : this.wheel.getTicksInCurrentStep()
			});
		},

		/**
		 * Stops spinning
		 */
		stopSpinning : function() {
			var wheel = this.wheel,
				pos, reward_pos, new_pos, skips;

			//If there are predefined animations, do them
			if (!wheel.isLastStep()) {
				wheel.setNextStep();

				this.main_view.initializeSpinner({
					ended_callback : function() {
						if (this.wheel.getTicksInCurrentStep() > 0) {
							this.stopSpinning();
						}
					}.bind(this),
					max : wheel.getTicksInCurrentStep()
				});
			}
			else {
				//When last predefined animation ends create
				//a animation which will stop on the awards chosen by the backend
				pos = wheel.getIndicatorPosition();
				reward_pos = this.getRewardPositionForTheSpin();
				new_pos = Math.max(reward_pos - pos, 6 + (reward_pos - pos));
				skips = this.getCurrentSpot().numberCollectedRewardsInRange(pos, new_pos);

				new_pos -= skips;

				this.main_view.initializeSpinner({
					ended_callback : this.onVeryEndOfTheSpinAnimation.bind(this),
					max : new_pos
				});
			}
		},

		/**
		 * Callback which is executed on very end of the spinning animation
		 */
		onVeryEndOfTheSpinAnimation : function() {
			var current_spot_number = this.getCurrentSpot().getNumber(),
				$animated_shard = this.getRewardPositionForTheSpin() === 2 ? this.main_view.$animated_shard : this.main_view.$animated_shard_4,
				showAdvisorsIfAllCollected = function() {
					if (this.didCollectShard() && this.hasCollectedAllShards()) {
						$.Observer(GameEvents.advent.advisors_received).publish('advent');
						this.main_view.showAdvisorsOverlay();
					}
				}.bind(this),
				animateShard = function() {
					if (this.didCollectShard()) {
						$.Observer(GameEvents.advent.shard_collected).publish('advent');
						return this.main_view.animateShard(this.getCollectedShardsCount()-1, $animated_shard);
					}
				}.bind(this),
				reRenderAdvisorsBox = this.main_view.rerenderAdvisors.bind(this.main_view);

			//Very end of the animation
			this.wheel.reset();

			this.setAnimationInProgress(false);

			this.main_view.updateSpotStates();
			this.main_view.showDecoration(current_spot_number);

			this.main_view
				.moveRewardToTheMiddle()
				.then(this.main_view.onStopSpinning.bind(this.main_view))
				.then(animateShard)
				.then(reRenderAdvisorsBox)
				.then(showAdvisorsIfAllCollected);
		},

		/**
		 * Returns timestamp which indicates end of the event
		 *
		 * @returns {*}
		 */
		getEventEndAt : function() {
			return this.advent_model.getEventEndAt();
		},

		hasCollectedAllShards : function() {
			return this.getCollectedShardsCount() === GameDataAdvent.getMaxAmountOfShards();
		},

		/**
		 * Callback which is executed when user click on the button which has to stop the animation
		 */
		onStopSpinningButtonClick : function() {
			this.main_view.onStopSpinning();
			this.wheel.setStepToLast();
			this.stopSpinning();
		},

		/**
		 * Returns tooltip object for 'Spin' button which is accepted by the Button jQuery Component
		 *
		 * @return {Array}
		 */
		getButtonSpinTooltips : function() {
			return [
				{title : '<b>' + this.l10n.buttons.btn_spin_part1 + '</b><div style="margin-top:7px;">' + this.l10n.buttons.btn_spin_part2 +'</div>'}
			];
		},

		/**
		 * Returns tooltip object for 'Stop' button which is accepted by the Button jQuery Component
		 *
		 * @return {Array}
		 */
		getButtonStopTooltips : function() {
			return [
				{title : this.l10n.buttons.btn_stop}
			];
		},

		/**
		 * Returns tooltip object for 'Spin for Gold' button which is accepted by the Button jQuery Component
		 *
		 * @return {Array}
		 */
		getButtonSpinForGoldTooltips : function() {
			var current_spot = this.getCurrentSpot();

			return [
				{
					title : '<b>' + this.l10n.buttons.btn_spin_for_gold_part1 + '</b><div style="margin-top:7px;">' + this.l10n.buttons.btn_spin_for_gold_part2(current_spot.getPriceForSpin()) +'</div>'
				}
			];
		},

		/**
		 * Activates reward directly on the current town
		 */
		useReward : function() {
			var reward = this.getWheel().getCollectableReward();

			reward.use(this.onAfterRadialMenuUse.bind(this), 'advent2014');
		},

		/**
		 * Stashes reward in the inventory
		 */
		stashReward : function() {
			var reward = this.getWheel().getCollectableReward();

			reward.stash(this.onAfterRadialMenuUse.bind(this), 'advent2014');
		},

		/**
		 * Trashes reward
		 */
		trashReward : function() {
			var reward = this.getWheel().getCollectableReward();

			reward.trash(this.onAfterRadialMenuUse.bind(this), 'advent2014');
		},

		/**
		 * Function which is called after radial menu option is used
		 */
		onAfterRadialMenuUse : function() {
			this.main_view.removeRewardFromTheMiddle();
			this.main_view.rerenderWheel();
			this.main_view.updateSpotStates();
		},

		/**
		 * Returns number of shards which has been collected by user
		 *
		 * @return {Integer}
		 */
		getCollectedShardsCount : function() {
			var model_tree = this.getModel('advent_tree');

			return model_tree.getShardsCollected();
		},

		/**
		 * return cost for refill
		 * @returns {number} cost
		 */
		getRefillCost : function() {
			if (this.getFreeRefillPowerActive() && !this.getFreeRefillAlreadyUsed()) {
				return 0;
			}

			var model_tree = this.getModel('advent_tree'),
				base_cost = model_tree.getRefillBaseCosts(),
				modifier = this.getCollection('advent_cost_modifiers').getCostModifierForTypeAndSubtype('advent', 'refill');

			if (modifier) {
				base_cost *= modifier.getModifier();
			}

			return base_cost;
		},

		/**
		 */
		getRefillButtonStateAndTooltips : function() {
			var current_spot = this.getCurrentSpot(),
				state = false,
				tooltips = [
					{title : this.l10n.tooltips.refill},
					{title : this.l10n.tooltips.remaining}
				];

			if (current_spot.getRewardToTake() !== undefined) {
				tooltips[1] = {title : this.l10n.tooltips.blocked};
				state = true;
			}

			if (current_spot.getNotCollectedRewardsCount() === 6) {
				state = true;
			}

			return { state: state, tooltips: tooltips };
		},

		/**
		 * true if reward should be a hero, false for advisors
		 * @return boolean
		 */
		isHeroRewardEnabled : function() {
			return this.advent_model.isHeroRewardType();
		},

		getHeroName : function() {
			var hero_id = this.advent_model.getHeroName();
			return this.isHeroRewardEnabled() ? GameData.heroes[hero_id].name : '';
		},

		getEventSkin : function() {
            return this.getArgument('window_skin');
		},

		getFreeRefillPowerActive : function () {
			return this.advent_model.getFreeRefillPowerActive();
		},

		getFreeRefillPowerConfiguration : function () {
			return this.advent_model.getFreeRefillPowerConfiguration();
		},

		getFreeRefillAlreadyUsed : function () {
			var current_spot = this.getCurrentSpot();
			return current_spot.getFreeRefillAlreadyUsed();
		},

		refetchDataOnMidnight : function() {
            this.getSpotsCollection().reFetch(function () {
            	this.main_view.reRender();
            	this.registerRefetchOnDayChange();
            }.bind(this));
        },

		destroy : function() {
			$.Observer().unsubscribe('advent');

			this.unregisterRefetchOnDayChange();

			this.main_view.destroy();
			this.main_view = null;

			this.wheel.destroy();
			this.wheel = null;
		}
	};

	window.GameControllers.AdventController = GameControllers.TabController.extend(AdventController);
}());
