/*global define */

define('no_gold_dialog/controllers/no_gold', function() {
	'use strict';

	var controllers = window.GameControllers,
		PremiumWindowFactory = window.PremiumWindowFactory,
		NoGoldIndexView = require('no_gold_dialog/views/no_gold'),
		eventTracking = window.eventTracking,
		WINDOW_POPUP = require('enums/json_tracking').WINDOW_POPUP,
		windows = require('game/windows/ids');

	return controllers.TabController.extend({

		initialize : function(options) {
			//Don't remove it, it should call its parent
			controllers.TabController.prototype.initialize.apply(this, arguments);

			this.confirmation_data = this.getWindowModel().getArguments().confirmation_data;
			this.attemted_feature = this.getWindowModel().getArguments().attempted_feature;
			if (typeof this.attemted_feature === 'undefined') {
				this.attemted_feature = '';
			}
			this.setCloseingBehavior();

			var tracking_data = {
				'name' : windows.NO_GOLD_DIALOG,
				'action' : 'open',
				'element' : this.attemted_feature
			};
			eventTracking.logJsonEvent(WINDOW_POPUP, tracking_data);
		},

		setCloseingBehavior : function() {
			var window_model = this.getWindowModel();

			window_model.setOnAfterClose(function() {
				// In case the window closes, this counts as canceling the dialog (and reactivates the button)
				if (this.confirmation_data && this.confirmation_data.props) {
					var cancel_callback = this.confirmation_data.props.onCancel;

					if (cancel_callback && typeof cancel_callback === 'function') {
						this.confirmation_data.props.onCancel();
					}

					var tracking_data = {
						'name' : windows.NO_GOLD_DIALOG,
						'action' : 'cancel',
						'element' : this.attemted_feature
					};
					eventTracking.logJsonEvent(WINDOW_POPUP, tracking_data);
				}
			}.bind(this));
		},

		renderPage : function(data) {
			this.getWindowModel().hideLoading();
			this.initializeView();
		},

		reRender: function() {
			this.renderPage();
		},

		initializeView : function() {
			this.view = new NoGoldIndexView({
				controller : this,
				el : this.$el
			});
		},

		openShop : function() {
			PremiumWindowFactory.openBuyGoldWindow();
			var tracking_data = {
				'name' : windows.NO_GOLD_DIALOG,
				'action' : 'buy',
				'element' : this.attemted_feature
			};
			eventTracking.logJsonEvent(WINDOW_POPUP, tracking_data);
			this.closeWindow();
		},

		destroy : function() {

		}
	});
});
