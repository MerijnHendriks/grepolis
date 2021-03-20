/* globals DM, Timestamp, hCommon, GPWindowMgr, PremiumWindowFactory, GameData, GameDataPowers */

define('events/grepolympia/views/grepolympia_info', function(require) {
	'use strict';

	var EVENT_SKINS = require('enums/event_skins');
	var DateHelper = require('helpers/date');
	var View = window.GameViews.BaseView,
		l10n = {
			premium : DM.getl10n('COMMON', 'premium'),
			gui : DM.getl10n('COMMON', 'gui'),
			time : DM.getl10n('COMMON', 'time')
		};

	var GrepolympiaInfoView = View.extend({

		initialize: function () {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);
			this.l10n = this.controller.getl10n();

			this.render();
		},

		render : function() {
			var controller = this.controller;
			this.previous_best_score = controller.getCurrentRankingScore();
			this.renderTemplate(this.$el, 'page_info', {
				l10n: this.l10n,
				discipline : controller.getActiveGrepolympiaDiscipline()
			});

			this.renderSubTemplates();

			controller.fetchPage(this.renderAllianceScoreTemplate.bind(this));

			this.registerComponents();
			this.updateParticipationUI();
		},

		renderSubTemplates : function() {
			this.renderCurrentRankingTemplate();
			this.renderRewardsTemplate();
			this.renderAwardsTemplate();
		},

		renderCurrentRankingTemplate : function() {
            var window_args = this.controller.getWindowModel().getArguments();
            var skin = window_args.window_skin ? window_args.window_skin : '';
			var $current_best_score = this.$el.find('.current_best_score');
			$current_best_score.html('');
			var current_ranking_score = this.controller.getCurrentRankingScore(),
				score = current_ranking_score !== 0 ? current_ranking_score : 0,
				controller = this.controller;

			this.renderTemplate($current_best_score, 'current_ranking', {
				l10n: this.l10n,
				score: score + ' ' + controller.getScoreUnit()
			});

			if (skin === EVENT_SKINS.GREPOLYMPIA_WORLDCUP) {
				var current_discipline = this.controller.getActiveGrepolympiaDiscipline(),
					team_name = this.l10n.page_matches.opponent_team_names[current_discipline],
					team_town = this.l10n.page_matches.opponent_team_town[current_discipline],
					team = team_town + " " + team_name;
                $current_best_score.tooltip(this.l10n.page_info.current_best_tooltip_test(team));
			}
		},

		renderAwardsTemplate : function() {
			var $award_wrapper = this.$el.find('.award_wrapper');
			$award_wrapper.html('');
			var awards = this.controller.getDisciplineAwards();

			this.renderTemplate($award_wrapper, 'awards', {
				l10n: this.l10n,
				awards: awards
			});
		},

		renderRewardsTemplate : function() {
			var $reward_wrapper = this.$el.find('.reward_wrapper');
			$reward_wrapper.html('');
			var top_alliance_number = this.controller.getNumberOfTopAlliances();
			var reward_id = this.controller.getDisciplineRewardId();
            var window_args = this.controller.getWindowModel().getArguments();
            var skin = window_args.window_skin ? window_args.window_skin : '';

			this.renderTemplate($reward_wrapper, 'rewards', {
				reward_title : this.l10n.page_info.reward_title(top_alliance_number),
				discipline_reward_id : reward_id,
				skin : skin
			});
		},

		renderAllianceScoreTemplate : function() {
			var $alliance_score_wrapper = this.$el.find('.alliance_score_wrapper');
			$alliance_score_wrapper.html('');

			var rows = this.controller.getRows(),
				score_unit = this.controller.getScoreUnit();
				score_unit = score_unit === 'm' ? this.l10n.page_ranking.meters : score_unit;

			this.renderTemplate($alliance_score_wrapper, 'alliance_score', {
				l10n: this.l10n,
				rows : rows,
				score_unit: score_unit
			});
		},

		registerComponents : function() {
			this.registerEventCountdown();
			this.registerLaurelAmountBox();
			this.registerAttemptButton();
			this.registerTooltips();
			this.registerInfoButton();
		},

		registerTooltips : function() {
			this.$el.find('.alliance_score_wrapper').tooltip(this.l10n.page_info.ally_ranking);

			this.$el.find('.award_wrapper .award').each(function(index, elem) {
				var award_num = index + 1;
				$(elem).tooltip(this.l10n.page_info['award_' + award_num]);
			}.bind(this));

			this.$el.find('.icon_reward').tooltip(this._constructRenderedRewardTooltip());

			var logo_tooltip_text = this.controller.getDisciplineDescription();
			this.$el.find('.team_logo').tooltip(logo_tooltip_text);
		},

		registerAttemptButton: function() {
			var controller = this.controller,
				l10n = this.l10n,
				_self = this,
				button_attend_text = controller.hasFreeAttempt() ? l10n.page_info.attend : l10n.page_info.attend_immediately(controller.getExtraAttemptCost()),
				button_attend_tooltip_text = l10n.page_info.attend_btn_tooltip(controller.getParticipationIntervalDurationHours());

			this.unregisterComponent('btn_attend');
			this.registerComponent('btn_attend', this.$el.find('.btn_attend').button({
				caption : button_attend_text,
				tooltips : [
					{title : button_attend_tooltip_text, styles : {width : 400}}
				],
				icon : !controller.hasFreeAttempt()
			}).on('btn:click', function () {
				controller.participate(_self._attemptCallback.bind(_self));
			}));
		},

		registerEventCountdown : function() {
			var controller = this.controller;
			//Timer
			this.unregisterComponent('grepolympia_countdown');
			this.registerComponent('grepolympia_countdown', this.$el.find("#grepolympia_countdown").countdown2({
				value : controller.getDisciplineEndsAt() - Timestamp.now(),
				display : 'day_hr_min_sec',
				tooltip: { title: this.l10n.page_athlete.tooltip_countdown, style : {width: 400}}
			}));
		},

		registerInfoButton : function() {
			var controller = this.controller;

			this.unregisterComponent('grepolympia_tutorial_info_btn');
			this.registerComponent('grepolympia_tutorial_info_btn', this.$el.find('.btn_info_overlay').button({
				template: 'internal'
			}).on('btn:click', controller.openTutorialWindow.bind(controller)));
		},

		registerParticipationCountdown : function() {
			var _self = this,
				controller = this.controller,
				ts_now = Timestamp.now();

			this.$el.find('.attend_again').show();

			//Timer
			this.unregisterComponent('attend_again_countdown');
			this.registerComponent('attend_again_countdown', this.$el.find("#attend_again_countdown").countdown2({
				value : controller.getNextFreeParticipationAt() - ts_now, // set attend_again timeout
				display : 'day_hr_min_sec'
			}).on('cd:finish', function() {
				_self.updateParticipationUI();
			}));
		},

		registerLaurelAmountBox : function() {
			var laurel_box = this.$el.find('.laurel_box'),
				laurel_amount = this.controller.getCurrency('laurels');

			this.unregisterComponent('laurel_amount_box');
			this.registerComponent('laurel_amount_box', laurel_box.find('.amount').numberChangeIndicator({
				caption : laurel_amount
			}));
			laurel_box.tooltip(this.l10n.laurels_competition_screen);
		},

		setNewLaurelAmountToLaurelBox : function() {
			var laurel_box = this.getComponent('laurel_amount_box');
			if (laurel_box) {
				laurel_box.setCaption(this.controller.getCurrency('laurels'));
			}
		},

		openAttendInfoPopup : function(data) {
			var _self = this;

			var $info_attend_popup = $('<div />', {"class": 'info_popup'});

			this.renderTemplate($info_attend_popup, 'attend_info_popup', {
				l10n : this.l10n.attend_info_popup,
				discipline : _self.controller.getActiveGrepolympiaDiscipline(),
				score_unit: _self.controller.getScoreUnit(),
				score : data.score,
				rank : data.rank,
				laurels : data.laurels,
				previous_best_score : this.previous_best_score
			});

			if (data.score > this.previous_best_score) {
				this.previous_best_score = data.score;
			}

			this.$el.find('.go_info').append($info_attend_popup);

			this.unregisterComponent('btn_close_attend_info_popup');
			this.registerComponent('btn_close_attend_info_popup', this.$el.find('.btn_close_attend_info_popup').button({
				caption : this.l10n.page_info.close_ranking_popup}).on('btn:click', function() {
				_self.closeAttendInfoPopup();
			}));
		},

		closeAttendInfoPopup : function() {
			this.unregisterComponent('btn_close_attend_info_popup');

			this.$el.find('.popup_background').remove();
			this.$el.find('.attend_info_popup').remove();
		},

		updateParticipationUI : function() {
			var controller = this.controller,
				btn_attend = this.getComponent('btn_attend');

			//Unregister old countdown (it will do nothing when its not registered yet)
			this.unregisterComponent('attend_again_countdown');

			if (!controller.hasFreeAttempt()) {
				this.registerParticipationCountdown();

				//Button
				btn_attend.enableIcon().setCaption(this.l10n.page_info.attend_immediately(controller.getExtraAttemptCost()));
			}
			else {
				this.$el.find('.attend_again').hide();
				btn_attend.disableIcon().setCaption(this.l10n.page_info.attend);
			}
		},

		showBuyGoldPopup : function() {
			var wnd_confirm,
				not_enough_gold_extra_attempt = this.l10n.page_info.not_enough_gold_extra_attempt;

			wnd_confirm = hCommon.openWindow(GPWindowMgr.TYPE_CONFIRMATION, l10n.premium.not_enough_gold_window_title, {
				type : 'buy_gold',
				template : 'tpl_window_not_enough_gold',
				modal: true,
				lang : {
					header : l10n.premium.not_enough_gold_message,
					description : not_enough_gold_extra_attempt,
					btn_caption : l10n.premium.not_enough_gold_button_caption
				},

				onConfirm : function () {
					PremiumWindowFactory.openBuyGoldWindow();
					wnd_confirm.close();
				}
			});
		},

		_attemptCallback : function(data) {
			this.updateParticipationUI();
			this.openAttendInfoPopup(data);
		},

		_constructRenderedRewardTooltip : function() {
			var info_l10n = this.l10n.page_info,
				power_id = this.controller.getDisciplineRewardId(),
				power = GameData.powers[power_id],
				percentage_range = this.controller.isHighPercentagePower(power) ? '10-40' : '5-20',
				effect_duration_formatted = DateHelper.readableSecondsWithLabels(this.controller.getRewardEffectDuration()),
				window_args = this.controller.getWindowModel().getArguments(),
				skin = window_args.window_skin ? window_args.window_skin : false,
				reindexed_effect_text = GameDataPowers.getReindexEffectString(power, skin),
				reward_effect_text = s(reindexed_effect_text, percentage_range, effect_duration_formatted);

			return us.template(this.getTemplate('reward_tooltip', {
				reward_effect : reward_effect_text,
				table_title : info_l10n.reward_table_title,
				rank_table_header: info_l10n.rank_table_header,
				effect_strength_table_header : info_l10n.effect_strength_table_header,
				alliance_reward_explanation : info_l10n.alliance_reward_explanation,
				power_name : power.name.type ? power.name.type[skin] : power.name,
				power_percentage : power.meta_defaults.percent
			}));
		}
	});

	return GrepolympiaInfoView;
});
