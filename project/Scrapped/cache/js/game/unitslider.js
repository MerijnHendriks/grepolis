/*globals TM, Slider */
/** Slider for small input boxes */

(function() {
	"use strict";

	function UnitSlider() {}

	UnitSlider.prototype.initialize = function(id, minval, maxval, callback, onclick) {
		this.id = id;
		maxval = parseInt(maxval, 10);
		minval = parseInt(minval, 10);
		callback = callback || function(){};

//		var timer;
		//slider container has to be prev element of input(id/name)
		this.input = $('input#' + id);

		if (typeof onclick === 'function') {
			this.input.click(onclick);
		}

		if (this.input.length < 1) {
			this.input = $("input[name='" + id + "']");
		}

		this.button = this.input.parent().find('div.unit_slider_toggle');
		this.container = this.button.prev();

		//remove old handlers
		this.container.unbind();
		this.button.unbind();

		var sldr = this.container.children('div.unit_slider');

		this.unit_sldr = new Slider({
			elementInput: this.input,
			elementSlider: sldr,
			elementDown: sldr.prev(),
			elementUp: sldr.next(),
			min: minval,
			max: maxval,
			max_overwrite: true,
			callback: callback,
			onmousedown : onclick
		});

		this.button.bind('click', {msg: id}, function() {
			this.showSlider();

			if (onclick) {
				onclick();
			}
		}.bind(this));

		//trigger 'change'-event
		this.unit_sldr.bind('slidestop', {msg: this}, function() {
			this.input.change();
			$.trigger('uslider:slidstop');
		}.bind(this));
	};

	UnitSlider.prototype.setValue = function(value) {
		this.unit_sldr.setValue(value);
	};

	UnitSlider.prototype.setMax = function(max) {
		this.unit_sldr.setValue(Math.min(max, this.input.val() || 0));
		this.unit_sldr.setMax(max);
	};

	UnitSlider.prototype.getMax = function() {
		return this.unit_sldr.getMax();
	};

	UnitSlider.prototype.getValue = function() {
		return this.unit_sldr.getValue();
	};

	UnitSlider.prototype.showSlider = function() {
		this.hideAllSliders();

		//get input field, its parent and the slider container
		var input = this.container.next(input),
			parent = input.parent();

		if (this.container.is(':visible') || this.container.css('display') !== 'none') {
			this.hideAllSliders();
		} else {
			parent.addClass('active');
			this.container.fadeIn();
		}

		//bind event handlers
		this.container.bind('mouseover',function() {
			$(this).focus();
		}.bind(this));

		this.container.bind('mouseleave',function() {
			this.hideAllSliders();
			$(this).unbind('mouseover mouseleave');
		}.bind(this));
	};

	UnitSlider.prototype.hideAllSliders = function() {
		this.input.change();

		var unit_containers = $('div.unit_container'),
			timer_id = 'hideAllSliders_' + this.id;

		$('.active div.unit_slider_container').fadeOut('fast');

		unit_containers.each(function() {
			$(this).removeClass('active');
		}.bind(this));

		if (TM.exists(timer_id)) {
			TM.update(timer_id, 500);
		} else {
			TM.unregister(timer_id);
			TM.register(timer_id, 500, function() {
				$('div.unit_slider_container').each(function() {
					var $el = $(this);

					if (!$el.parent().is('.active') && $el.attr('style') !== null ) {
						$el.removeAttr('style');
					}
				}.bind(this));
			}.bind(this), {max: 1});
		}
	};

	window.UnitSlider = UnitSlider;
}());
