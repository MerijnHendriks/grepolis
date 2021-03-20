/*globals window, $, WF, GameEvents, WM, Timestamp, TM, GPWindowMgr, MM, CM */

define('features/benefits/large_icon', function() {
	'use strict';

	/**
	 * @constuctor
	 */
	var LargeIcon = function() {};

	/**
	 * Initialize the large icon in the current happening
	 *
	 */
	LargeIcon.prototype.initLargeIcon = function () {
		if (MM.getCollections().Benefit.length !== 1) {
			throw 'There has to be exactly one benefits collection after bootstrap initialization!';
			// during the initialization an at least an empty one will be created
			// after the game is done loading, there are never two different kind of benefit collections, because they are global
		}

		$('div.happening_large_icon_container').append($('script#tpl_happening_large_icon').html());

		this.benefits = MM.getCollections().Benefit[0];

		this.benefits.onImportantChangesForLargeIcon(this.updateLargeIcon, this);
		this.updateLargeIcon();

		var element = this.getElement();

		element.on('click', function() {
			// activate the wiggling, and deactivate if done
			element.addClass('active');

			TM.unregister('remove_active_class_from_large_icon');
			TM.register('remove_active_class_from_large_icon', 1500, function(){
				element.removeClass('active');
			}, {max: 1});

			this.openHappeningWindow();
		}.bind(this));
	};

	LargeIcon.prototype.updateLargeIcon = function() {
		var large_icon_benefits = this.benefits.getBenefitsOfType('largeicon'),
			benefit_index, benefits_length = large_icon_benefits.length, large_icon_benefit;

		this.currently_open_benefit = null;

		for (benefit_index = 0; benefit_index < benefits_length; ++benefit_index) {
			large_icon_benefit = large_icon_benefits[benefit_index];

			if (large_icon_benefit.isRunning()) {
				this._displayLargeIcon(large_icon_benefit);
				this._manageLargeIconCountdown(large_icon_benefit);
			}
			else {
				this.removeLargeIcon(undefined, large_icon_benefit);

				if (!large_icon_benefit.hasEnded()) {
					large_icon_benefit.on('started', this._displayLargeIcon, this);
				}
			}
		}
	};


	LargeIcon.prototype._manageLargeIconCountdown = function(large_icon_benefit) {
		var $el = this.getElement(),
			context = {main : 'new_ui', sub : 'large_icon'};

		$el.removeClass('with_countdown');

		if (!large_icon_benefit.hasLargeIconCountdown()) {
			return;
		}

		var countdown_start = large_icon_benefit.CountdownStartTimestamp(),
			countdown_end = large_icon_benefit.CountdownEndTimestamp(),
			timestamp_now = Timestamp.now();

		//Show countdown only in specific time range
		if (countdown_start <= timestamp_now && countdown_end >= timestamp_now) {
			$el.addClass('with_countdown');

			CM.unregister(context, 'large_icon_timer');
			CM.register(context, 'large_icon_timer', $el.parent().find('.timer_box .js-timer').countdown2({
				display : 'day_hr_min_sec',
				timestamp_end : large_icon_benefit.CountdownEndTimestamp(),
				only_non_zero: true
			}).on('cd:finish', function() {
				$el.removeClass('with_countdown');
			}));

			//Tick time till countdown should be removed, and then rerender
			if (countdown_end >= timestamp_now) {
				TM.once('large_icon_countdown', (countdown_end - timestamp_now) * 1000, this.updateLargeIcon.bind(this));
			}
		}
		//Wait till time when countdown should start
		else if (countdown_start > timestamp_now) {
			TM.once('large_icon_countdown', (countdown_start - timestamp_now) * 1000, this.updateLargeIcon.bind(this));
		}
	};

	/**
	 * this method will add the right class to the large icon element
	 */
	LargeIcon.prototype._displayLargeIcon = function (large_icon_benefit) {
		var $el = this.getElement(),
			happening = large_icon_benefit.getLargeIconData();

		large_icon_benefit.off('started', null, this);
		large_icon_benefit.on('ended', function() {
			this.removeLargeIcon(undefined, large_icon_benefit);
			this.updateLargeIcon();
		}, this);

		//Default for all happenings
		if (!this.currently_open_benefit) {
			this.currently_open_benefit = large_icon_benefit;
            $el.addClass(happening.css_class);
			var large_icon_params = large_icon_benefit.get('params');
			if (large_icon_params && large_icon_params.skin) {
				$el.addClass(large_icon_params.skin);
			}
		}

		if (happening.mouseover_innerHTML) {
			$el.tooltip(happening.mouseover_innerHTML);
		}

		$el.show();

		this._manageLargeIconCountdown(large_icon_benefit);

		if (happening) {
			$.Observer(GameEvents.happenings.icon.initialize).publish(happening);
		}
	};

	/**
	 * Remove large icon and close it's window if one exists
	 */
	LargeIcon.prototype.removeLargeIcon = function (with_window, benefit_arg) {
		var $el = this.getElement(),
			benefit = benefit_arg || this.currently_open_benefit,
			happening, wnd_type, params;

		if (!benefit) {
			return;
		}

		if (benefit.hasEnded()) {
			benefit.off('ended', null, this);
		}

		happening = benefit.getLargeIconData();
        params = benefit.get('params');
		wnd_type = happening.window_type;

		if (!$el.hasClass(happening.css_class)) {
			// only remove the icon, if it belongs to the benefit currently of interest
			return;
		}

		if (typeof with_window === 'undefined') {
			with_window = true;
		}

        if (happening.css_class) {
            $el.removeClass(happening.css_class);
   		}

        if (params && params.skin) {
            $el.removeClass(params.skin);
        }

		if (with_window) {
			if (new RegExp('TYPE_').test(wnd_type)) {
				//Old window type
				if(GPWindowMgr.is_open(GPWindowMgr[wnd_type])) {
					GPWindowMgr.getOpenFirst(GPWindowMgr[wnd_type]).close();
				}
			}
			else {
				//New window type
				WM.closeWindow(WM.getWindowByType(wnd_type)[0]);
			}
		}
	};

	LargeIcon.prototype.getScreenNameFromWindowType = function(happening) {
		if (happening.window_type === 'advent') {
			return 'wheel_main_event_screen';
		} else {
			return happening.window_type;
		}
	};

	/**
	 * Opens happening window when user clicks on the Large Icon
	 */
	LargeIcon.prototype.openHappeningWindow = function() {
		var happening = this.currently_open_benefit.getLargeIconData(),
			wnd_type = happening.window_type,
			additional_data = happening.additional_data || {},
			large_icon_skin = this.currently_open_benefit.getParam('skin');

		if (wnd_type === '') {
			return;
		} else if (new RegExp('TYPE_').test(wnd_type)) {
			//Old window type
			GPWindowMgr.Create(GPWindowMgr[wnd_type], happening.window_title, additional_data.UIopts);
		} else {
			//New window type
			WF.open(wnd_type,
				{ args:
					{
						window_skin: large_icon_skin ? large_icon_skin : ''
					}

				}
			);
		}

		$.Observer(GameEvents.happenings.window.opened).publish(happening);

		var definition_id = require('enums/json_tracking').EVENT_SCREEN;
		window.eventTracking.logJsonEvent(definition_id, {
			'screen_name': this.getScreenNameFromWindowType(happening),
			'action': 'open',
			'ingame_event_name': this.currently_open_benefit.getHappeningName()
		});
	};

	/**
	 * Returns the jquery element of the Large Icon
	 *
	 * @return jQuery Object
	 */
	LargeIcon.prototype.getElement = function () {
		return $('#happening_large_icon');
	};

	return LargeIcon;
});
