/*global MM */
(function() {
	'use strict';

	var GameControllers = require_legacy('GameControllers');

	var CrmIconController = GameControllers.BaseController.extend({
		view : null,

		initialize : function(options) {
			GameControllers.BaseController.prototype.initialize.apply(this, arguments);

			this.icon_model = this.getModel('interstitial_model');

			this.initializeView();
		},

		registerEventListeners : function() {
			this.icon_model.onChange(this, this.updateModel);
		},

		updateModel : function(model) {
			this.unregisterComponents();
			this.icon_model = model;
			this.view.reRender();
		},

		initializeView : function() {
			this.view = new window.GameViews.CrmIconView({
				controller : this,
				el : this.$el
			});
			this.registerEventListeners();
		},

		iconClicked : function() {
			this.icon_model.getOpenFunction()();
		},

		getModelId : function() {
			return this.icon_model.getId();
		},

		getTooltip : function() {
			return this.icon_model.getTooltip();
		},

		hasTimer : function() {
			return this.icon_model.hasTimer();
		},

		getTimerEndTime : function() {
			return this.icon_model.getTimer();
		},

		getIconType: function() {
			return this.icon_model.getIconType();
		},

		getTabId: function () {
        	return this.icon_model.getTabId();
		},

		removeIcon: function() {
			MM.getOnlyCollectionByName('CrmIcon').remove(this.icon_model);
			if (this.icon_model) {
				this.icon_model.unregisterFromModelManager();
			}
		},

		destroy : function() {

		}
	});

	window.GameControllers.CrmIconController = CrmIconController;
}());

