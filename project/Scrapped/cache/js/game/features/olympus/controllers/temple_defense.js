define('features/olympus/controllers/temple_defense', function () {
	'use strict';

	var GameControllers = require_legacy('GameControllers'),
		TempleDefenseView = require('features/olympus/views/temple_defense'),
		ConfirmationWindowFactory = require('factories/windows/dialog/confirmation_window_factory'),
		GameEvents = require_legacy('GameEvents'),
		TempleInfoHelper = require('features/olympus/helpers/temple_info');


	return GameControllers.TabController.extend({
		view: null,

		initialize: function (options) {
			GameControllers.TabController.prototype.initialize.apply(this, arguments);
		},

		renderPage: function () {
			this.temple_info = this.getModel('temple_info');
			this.temple = this.getCollection('temples').getTempleById(this.temple_info.getId());

			this.view = new TempleDefenseView({
				el: this.$el,
				controller: this
			});

			this.registerEventListeners();
			TempleInfoHelper.registerTempleInfoRefetchTimer(this.temple_info);
		},

		registerEventListeners: function () {
			var context = 'temple_defense';
			this.stopListening();

			this.temple_info.onUnitsChange(this, this.view.render.bind(this.view));
			this.temple.onAllianceIdChange(this, this.view.render.bind(this.view));

			$.Observer().unsubscribe(context);
			Object.keys(GameEvents.alliance).forEach(function (value) {
				$.Observer(GameEvents.alliance[value]).subscribe(context, this.view.render.bind(this.view));
			}.bind(this));
		},

		getAllUnits: function () {
			var units = this.temple_info.getUnits();
			return units.all_units;
		},

		getSupportingUnits: function () {
			var units = this.temple_info.getUnits();
			return units.support_array;
		},

		getSendBackCallback: function () {
			return {
				success: function () {
						this.temple_info.reFetch(this.hideLoading.bind(this), {
							target_id: this.temple_info.getId()
						});
						TempleInfoHelper.registerTempleInfoRefetchTimer(this.temple_info);
					}.bind(this),
				error: this.hideLoading.bind(this)
			};
		},

		sendBack: function (units_id) {
			var on_confirm = function () {
				this.showLoading();
				this.temple_info.sendBack(units_id, this.getSendBackCallback());
			}.bind(this);

			ConfirmationWindowFactory.openConfirmationReturnAllUnitsFromTown(on_confirm, null, false);
		},

		sendBackPart: function (units_id, units) {
			this.showLoading();
			this.temple_info.sendBackPart(units_id, units,  this.getSendBackCallback());
		},

		sendBackAllUnits: function () {
			var on_confirm = function () {
				this.showLoading();
				this.temple_info.sendBackAllUnits(this.getSendBackCallback());
			}.bind(this);

			ConfirmationWindowFactory.openConfirmationReturnAllUnits(on_confirm, null, false);
		},

		destroy: function () {
			TempleInfoHelper.unregisterTempleInfoRefetchTimer();
		}
	});
});