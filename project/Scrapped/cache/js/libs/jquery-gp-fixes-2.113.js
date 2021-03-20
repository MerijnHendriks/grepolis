$.fn.extend({
	/* jquerys new implementation of removeClass isn't compatible with our jquery-ui version, and we cannot update jquery-ui.
	 * We tried and the whole game breaks
	 */
	__removeClass: $.fn._removeClass,
	removeClass: function( classNames ) {
		if (classNames) {
			return this._removeClass(classNames);
		} else {
			return this._removeClass();
		}
	},
	/* Jquerys toggleClass API has changed and is incompatible with jquery-UI outdated API, so we revert
	 */
	__toggleClass : $.fn.toggleClass,
	toggleClass : function() {
		return $.fn._toggleClass.apply(this, arguments);
	}
});
