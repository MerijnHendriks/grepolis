/* global Game */
(function() {
	'use strict';

	function ImageCountdown(object, start_time, end_time, css_options, css_image_options, callback) {
		var that = this;
		var tick_interval = null;
		var img = null;
		var duration = (end_time - start_time) *1000;
		var count_pictures = 64; //count of all parts

		function start(/*object, start_time, end_time, css_options, css_image_options, callback*/) {
			var div = $('<div>').addClass('image_countdown').css(css_options);
			img = $('<img>').attr('src', Game.img()+'/game/order/order_layer.png').css(css_image_options);

			object.after(div.append(img));

			if (!tick_interval){
				tick_interval = window.setInterval(that.tick, 1E3);
			}
		}

		this.tick = function() {
			var now = Date.parse(new Date());
			var already = now - start_time * 1E3;

			var percent = (already * 100)/duration;
			var picture_number = Math.round(percent * count_pictures / 100);

			//set right image
			img.css('top', (picture_number * -parseInt(css_image_options.width, 10)) + 'px');

			//countdown finished?
			if (already >= duration) {
				picture_number = count_pictures;
				that.stop();
				if (callback !== undefined && typeof callback === 'function'){
					callback();
				}
			}
		};

		this.stop = function() {
			window.clearInterval(tick_interval);
			tick_interval = null;
			start_time = 0;
			end_time = 0;
			duration = 0;
		};

		start();
	}

	window.ImageCountdown = ImageCountdown;
}());



