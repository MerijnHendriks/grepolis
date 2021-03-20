/* global Backbone */
/**
 * This file is a thin wrapper around the visibility API to compensate Browser differences.
 * You can ask if the document is hidden and get notified if that changes.
 */
define('features/web_notifications/visibility', function() {
	'use strict';

	// Set the name of the hidden property and the change event for visibility
	var hidden, visibilityChange;
	if (typeof document.hidden !== 'undefined') { // Opera 12.10 and Firefox 18 and later support
		hidden = 'hidden';
		visibilityChange = 'visibilitychange';
	} else if (typeof document.mozHidden !== 'undefined') {
		hidden = 'mozHidden';
		visibilityChange = 'mozvisibilitychange';
	} else if (typeof document.msHidden !== 'undefined') {
		hidden = 'msHidden';
		visibilityChange = 'msvisibilitychange';
	} else if (typeof document.webkitHidden !== 'undefined') {
		hidden = 'webkitHidden';
		visibilityChange = 'webkitvisibilitychange';
	}

	var VisibilityWrapper = {
		isHidden: function() {
			return document[hidden];
		},
		onVisibilityChange: function(obj, callback) {
			obj.listenTo(VisibilityWrapper, 'visibilityChange', callback);
		}
	};

	var handleVisibilityChange = function() {
		VisibilityWrapper.trigger('visibilityChange');
	};

	document.addEventListener(visibilityChange, handleVisibilityChange, false);

	us.extend(VisibilityWrapper, Backbone.Events);
	return VisibilityWrapper;

});