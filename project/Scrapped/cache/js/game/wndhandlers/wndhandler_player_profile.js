/* global Game, CM, MM, WndHandlerDefault, Timestamp, GPWindowMgr, DM */

(function() {
	'use strict';

	function WndHandlerPlayerProfile(wndhandle) {
		this.wnd = wndhandle;
		this.elmnts = {};
		this.player_id = 0;
	}
	WndHandlerPlayerProfile.inherits(WndHandlerDefault);

	WndHandlerPlayerProfile.prototype.getDefaultWindowOptions = function () {
		// JQuery UI Dialog Optiosn Object.
		var ret = {position: ['center', 'center'],
			height: 509,
			width: 800,
			resizable: false,
			title: 'Untitled Window'
		};

		return ret;
	};

	WndHandlerPlayerProfile.prototype.onInit = function (title, UIopts) {
		this.player_id = UIopts.player_id;
		this.wnd.requestContentGet('player', 'get_profile_html', {player_id: this.player_id});
		return true;
	};

	WndHandlerPlayerProfile.prototype.registerEventListeners = function() {
		this.grepo_score_model.onChange(this, this.updateGrepoScore);
	};

	WndHandlerPlayerProfile.prototype.onRcvData = function (data, controller, action, params) {
		this.wnd.setContent2(data.html);
		if (data.awards) {
			this.initAwards(data.awards);
			$('#awards div.expansion').tooltip(_('Display awards from other worlds'));
		}

        // this.player_id == 0 seems to indicate the own profile (see ajax request below)
		if (params.player_id) {
			this.player_id = params.player_id;
		}

		// Own profile when either no player_id or our own player_id is send
		var is_own_profile = this.player_id === 0 || this.player_id === Game.player_id;

		var el = this.wnd.getJQElement();

		var context = this.wnd.getContext();
		CM.unregister(context);

		var $txt_bb_code = CM.register(context, 'grepo_score_textbox', el.find('.txt_grepolis_score_bb_code').textbox({
			value: '[score]' + Game.player_name + '[/score]',
			visible: false,
			read_only: true
		}));

		var l10n = DM.getl10n('grepolis_score');

		this.btn_grepolis_score = CM.register(context, 'btn_grepolis_score', el.find('.btn_grepolis_score').button({
			disabled: !is_own_profile,
			state: !is_own_profile,
			icon: 'grepolis_score',
			icon_position : 'left',
			icon_type : 'grepolis_score',
			tooltips: [{
				title: l10n.bb_code_tooltip
			}, {
				title: l10n.earned_score
			}]
		}).on('btn:click', function() {
			$txt_bb_code.toggleVisibility();
			if ($txt_bb_code.isVisible()) {
				$txt_bb_code.selectAll();
			}
		}));

		this.grepo_score_model = MM.getModelByNameAndPlayerId('GrepoScore');

		this.updateGrepoScore();

		this.registerEventListeners();
	};

	WndHandlerPlayerProfile.prototype.updateGrepoScore = function() {
		var is_own_profile = this.player_id === 0 || this.player_id === Game.player_id,
			score = this.grepo_score_model.getTotalScore(),
			$score_box = this.wnd.getJQElement().find('.grepolis_score_container .grepolis_score_box'),
			$score = this.wnd.getJQElement().find('.grepolis_score_container .grepolis_score'),
			l10n = DM.getl10n('grepolis_score');

		$score_box.tooltip(l10n.earned_score);
		if (is_own_profile) {
			$score.text(score);
		}
	};


	WndHandlerPlayerProfile.prototype.inviteIntoAlliance = function (player_name) {
		this.wnd.ajaxRequestPost('alliance', 'invite', {player_name : player_name}, function (_wnd, data) {});
	};

	WndHandlerPlayerProfile.prototype.initAwards = function (data) {
		var awardlist_width = 0;

		this.elmnts.awardlist = $('#awards');

		this.initializeAwardTooltips();

		$('#awards li').each(function (idx, el) {
			awardlist_width += ($(el).outerWidth(true));
		});

		awardlist_width += ($('#awards div.expansion').outerWidth(true));
		this.elmnts.awardlist.css({width: awardlist_width + 'px'});

		//this.elmnts.awardlist.draggable({axis: 'x'});

		var $document = $(document), $scrollpane = $('#scrollpane'), $awards = $('#awards'),
			w_viewport = $scrollpane.outerWidth(), w_awards = $awards.outerWidth(),
			isiOS = Game.isiOs();

		//When awards from the differet worlds are loaded, its possible that there will not be any
		//so in this case there will be empty gap in the end of the list
//	$awards.css({left : Math.max(Math.min(0, $awards.position().left), w_viewport - w_awards)});
		$awards.css({left : Math.min(Math.max(w_viewport - w_awards, $awards.position().left), 0)});

		var onStartEventName = (isiOS ? 'touchstart' : 'mousedown') + '.awards',
			onMoveEventName = (isiOS ? 'touchmove' : 'mousemove') + '.awards',
			onStopEventName = (isiOS ? 'touchend' : 'mouseup') + '.awards';

		var dragDropHandler = function(e) {
			e.preventDefault();

			e = e.type === 'touchstart' ? e.originalEvent.touches[0] : e;

			var
				w_offset = $awards.position(),
				dx,
				sx = e.clientX;

			$document.on(onMoveEventName, function(e) {
				e = e.type === 'touchmove' ? e.originalEvent.touches[0] : e;

				dx = w_offset.left + (e.clientX - sx);

				//Limit movement to size of the main_area container
				dx = Math.max(Math.min(0, dx), w_viewport - w_awards);

				$awards.css({
					left : dx,
					top : 0,
					right : 'auto',
					bottom : 'auto'
				});
			});

			$document.on(onStopEventName, function(e) {
				$document.off(onMoveEventName + ' ' + onStopEventName);
			});
		};

		$scrollpane.off(onStartEventName).on(onStartEventName, '.award', dragDropHandler);
	};

	/**
	 * initialize award tooltips
	 */
	WndHandlerPlayerProfile.prototype.initializeAwardTooltips = function () {
		$('#awards li.award').on('mouseover', function(e) {
			var $el = $(e.currentTarget),
				el_data = $el.data(),
				name = el_data.name,
				description = el_data.description,
				awarded_at = el_data.awarded_at;

			if (name && description && awarded_at) {
				$el.tooltip('<b>' + name + '</b> (' + Timestamp.toDate(awarded_at + Timestamp.localeGMTOffset()).toShortString() + ')<br />' + description).showTooltip(e);
			}
		});
	};

	WndHandlerPlayerProfile.prototype.loadMasterAwards = function () {
		var that = this;

		$('#awards div.expansion').hide();

		this.wnd.ajaxRequestGet('player', 'get_master_awards', {player_id : this.player_id || Game.player_id}, function (_wnd, data) {
			$('#awards').append(data.html);
			that.initAwards(data.awards);
		});
	};


	GPWindowMgr.addWndType('PLAYER_PROFILE', 'b_profile', WndHandlerPlayerProfile, 1);

	window.WndHandlerPlayerProfile = WndHandlerPlayerProfile;
}());
