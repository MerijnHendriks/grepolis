define('features/grepolis_score/controllers/world_points', function() {
	'use strict';

	var GameControllers = require_legacy('GameControllers');
	var View = require('features/grepolis_score/views/world_points');

	return GameControllers.BaseController.extend({

		initialize : function(options) {
			//Don't remove it, it should call its parent
			GameControllers.BaseController.prototype.initialize.apply(this, arguments);
			this.parent_controller = options.window_controller;
		},

		registerEventListeners : function() {
			this.getModel('grepo_score').onChange(this, this.reRender.bind(this));
		},

		unregisterEventListeners : function() {
			this.stopListening();
		},

		getWorldScores: function () {
			return this.getModel('grepo_score').getWorldScores();
		},

		render: function($el) {
			this.$el = $el;

			this.view = new View({
				controller : this,
				el : this.$el
			});

			this.registerEventListeners();
		},

		reRender : function() {
			this.unregisterEventListeners();
			this.render(this.$el);
		}

	});
});

