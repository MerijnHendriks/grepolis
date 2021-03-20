(function() {
	'use strict';

	var GameControllers = window.GameControllers;
	var GameViews = window.GameViews;

	var Hercules2014SubWindowEventInfo = GameControllers.BaseController.extend({
		stage_id : null,
		fight_result_type : null,

		initialize : function(options) {
			//Don't remove it, it should call its parent
			GameControllers.BaseController.prototype.initialize.apply(this, arguments);

			this.window_controller = options.window_controller;
			this.section_texts = options.sections;

			this.initializeSections();
		},

		render : function($content_node) {
			this.$el = $content_node;

			this.view = new GameViews.Hercules2014SubWindowEventInfo({
				el : this.$el,
				controller : this
			});

			return this;
		},

		/**
		 * create an array of objects with infos about each explanation step for the view
		 */
		initializeSections : function() {
			this.sections = [];

			for (var i = 0, l = this.section_texts.length; i < l; i++) {
				var text =  this.section_texts[i];
				this.sections.push({
					img: null,		// TODO
					text: text
				});
			}
		},

		/**
		 * return sections
		 * @returns {Object}
		 */
		getSections : function() {
			return this.sections;
		},

		destroy : function() {

		}
	});

	window.GameControllers.Hercules2014SubWindowEventInfo = Hercules2014SubWindowEventInfo;
}());
