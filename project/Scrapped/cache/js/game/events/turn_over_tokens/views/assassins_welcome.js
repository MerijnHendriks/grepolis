/* global us */

(function() {
	'use strict';

	var GameViews = window.GameViews;

	var LONG_SLIDE_DURATION = 6000;
	var SHORT_SLIDE_DURATION = 1;
	var SLIDES = 3;

	var AssassinsWelcomeInterstitialView = GameViews.BaseView.extend({

		initialize: function (options) {
			GameViews.BaseView.prototype.initialize.apply(this, arguments);
			this.render();
		},

		render: function() {
			this.$el.html(us.template(this.controller.getTemplate('welcome_screen'), {
				l10n : this.controller.getl10n(),
				event_type_css_class : this.controller.getEventName(),
				controller: this.controller,
				skin: this.controller.getBenefitSkin()
			}));
			this.slideShow = this.$el.find('.slideshow');
			this.initializeSlideShow();
			this.slideShowElement = SLIDES;
			this.setNewText();
			this.setDuration(LONG_SLIDE_DURATION);
			this.showSlideTimeout = null;
			this.fadeOutEffect = null;
			this.setNewSlide();
			this.$el.find('.yellowBox').includeTemplate('generic_box');
			this.registerViewComponents();

			return this;
		},

		initializeSlideShow: function () {
			this.slideShow.append(us.template(this.controller.getTemplate('animated_welcome'), {
				l10n : this.l10n,
				slideNumber : SLIDES - 1 // because the count of the array starts with 0
			}));
		},

		registerViewComponents: function () {
			this.controller.registerComponent('btn_start', this.$el.find('.btn_start').button({
				caption : this.controller.getBtnStartCaption()
			}).on('btn:click', this.controller.handleOnButtonClick.bind(this.controller)));
			this.slideShow.on('click', this.skipToNextSlide.bind(this));
		},

		getCurrentSlide: function() {
			var childNodes = this.$el.find('.slideshow').children('.slideshow_slide');
			return $(childNodes[this.slideShowElement]);
		},

		setNewSlide: function () {
			this.slideShowElement--;
			this.doSlideAction();
		},

		doSlideAction: function () {
			this.showSlideTimeout = setTimeout(this.fadeOutSlide.bind(this), this.duration);
		},

		fadeOutSlide: function () {
			clearTimeout(this.showSlideTimeout);
			this.showSlideTimeout = null;
			var current;
			var paper_text = this.$el.find('.paper_text');
			if(this.slideShowElement === 0) {
				current = this.slideShow;
			} else {
				current = this.getCurrentSlide();
			}
			this.fadeOutEffect = setInterval(function () {
				if(!current.css('opacity')) {
					current.css('opacity', 1);
					paper_text.css('opacity', 1);
				}
				if(current.css('opacity') < 0.1) {
					current.css('opacity', 0);
					paper_text.css('opacity', 0);
					clearInterval(this.fadeOutEffect);
					this.fadeOutEffect = null;
					if(this.slideShowElement === 0) {
						this.stopSlideShow();
					} else {
						this.setNewText();
						this.setDuration(LONG_SLIDE_DURATION);
						this.setNewSlide();
					}
				} else {
					var opa = current.css('opacity') - 0.1;
					current.css('opacity', opa);
					paper_text.css('opacity', opa);
				}
			}.bind(this), 100);
		},

		setNewText: function () {
			this.$el.find('.slideshow .paper_text').text(this.controller.getl10n().animation_text['slide_'+(SLIDES - this.slideShowElement)]);
			var paper_text = this.$el.find('.paper_text');
			paper_text.transit({
				 opacity : 1
			}, 500);
		},

		skipToNextSlide: function () {
			clearTimeout(this.showSlideTimeout);
			this.showSlideTimeout = null;
			clearInterval(this.fadeOutEffect);
			this.fadeOutEffect = null;
			this.setDuration(SHORT_SLIDE_DURATION);
			this.doSlideAction();
		},

		setDuration: function (duration) {
			this.duration = duration;
		},

		stopSlideShow: function () {
			this.slideShow.hide();
			this.controller.disableSlideShow();
		},

		destroy : function() {

		}
	});

	window.GameViews.AssassinsWelcomeInterstitialView = AssassinsWelcomeInterstitialView;
}());
