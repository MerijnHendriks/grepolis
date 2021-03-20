/* global Game */
/**
 * Handles web notification setup. (http://www.w3.org/TR/notifications)
 */
define('features/web_notifications/web_notifications', function() {
	'use strict';

	var InternalMarketsHelper = require('helpers/internal_markets');

	return {

		/**
		 * Shows a web notification with given content.
		 * @param {string} title
		 * @param {string} body
		 * @param {string} tag - identify notification type to override it if happening again
		 * @param {function} [onclick] - function that is executed when user clicks notification
		 * @param {function} [data] - 	optional data that can be accessed later in the onclick handler
		 * 								via the first parameter (event.notification.data)
		 * @returns {Notification}
		 */
		createBrowserNotification: function(title, body, tag, onclick, data) {
			var options = {body: body, tag: tag, data: data};
			options.icon = '/images/game/notification_logo.png';

			var notification = new Notification(title, options);
			notification.onclick = onclick;

			return notification;
		},

		/**
		 * Check if notifications are possible and enabled
		 *
		 * The automated test market (vv) is disabled because web notifications break the automated test runs.
		 * for example: GP1681
		 *
		 * @return {boolean}
		 */
		notificationsEnabled: function() {
			var isNotificationsAvailable = typeof Notification !== 'undefined',
				isInternalMarket = InternalMarketsHelper.isInternalMarket(Game.market_id) || Game.market_id === 'zz',
				isNotTestingMarket = Game.market_id !== 'vv';

			return isNotificationsAvailable && isInternalMarket && isNotTestingMarket;
		}
	};

});
