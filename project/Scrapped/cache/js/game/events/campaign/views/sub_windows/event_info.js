(function () {
	"use strict";

	var View = window.GameViews.BaseView;

	var Hercules2014SubWindowEventInfo =  View.extend({

		_section_counter : 0,

		initialize: function () {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);

			this.l10n = this.controller.getl10n();

			this.render();
		},

		render : function() {
			var sections = this.controller.getSections();

			this.$el.html(us.template(this.controller.getTemplate("event_info"), {
				l10n : this.l10n,
				sections: sections
			}));

			this.showSection(this._section_counter);

			this.$el.find(".arrow_next").on("click", function(event) {
				var $target = $(event.currentTarget),
					id = parseInt($target.data('id'), 10),
					sections = this.controller.getSections();

				if (id < sections.length-1 ) {
					this.hideSection(id);
					this.showSection(id + 1);
				} else {
					this.controller.window_controller.closeSubWindow();
				}
			}.bind(this));

			this.$el.find(".arrow_prev").on("click", function(event) {
				var $target = $(event.currentTarget),
					id = parseInt($target.data('id'), 10);

				if (id > 0 ) {
					this.hideSection(id);
					this.showSection(id - 1);
				}
			}.bind(this));
		},

		hideSection: function(section_id) {
			this.$el.find("#"+ section_id).hide().parent().attr("start", section_id + 1);
			this.$el.find(".section_"+  section_id + "_action").hide();
		},

		showSection: function(section_id) {
			var sections_length = this.controller.getSections().length,
				$section = this.$el.find("#" + section_id),
				$ap = $section.find(".arrow_prev"),
				$an = $section.find(".arrow_next"),
				$tp = $section.find(".text_prev"),
				$tn = $section.find(".text_next");

			$section.show().parent().attr("start", section_id + 1);

			// show all buttons
			$an.show();
			$ap.show();
			$tp.show();
			$tn.show();

			// hide the ones we don´t need
			if (section_id === 0) {
				$ap.hide();
				$tp.hide();
			}

			if (section_id === sections_length - 1) {
				$tn.html(this.l10n.close);
			}

			// if the section has some special stuff to show, show it
			this.showSectionAction(section_id);
		},

		/**
		 * show section_<id>_action html part
		 */
		showSectionAction : function(section_id) {
			this.$el.find(".section_" + section_id + "_action").show();
		},

		destroy : function() {

		}
	});

	window.GameViews.Hercules2014SubWindowEventInfo = Hercules2014SubWindowEventInfo;
}());
