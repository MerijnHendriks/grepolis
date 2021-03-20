/*globals Timestamp, gpAjax*/
(function() {
	'use strict';

	var Conquest = {
		conqueror_units_id: null,
		conquest_finished_at: null,

		startCountdown: function() {
			if (this.conquest_finished_at > Timestamp.server() ) {
				var conquest = $('#conquest');
				conquest.countdown(this.conquest_finished_at, {});

				// Reload on finish
				conquest.bind('finish', function() {
					window.location.href = window.url('index');
				});
			}
		},

		publish: function() {
			// send ajax request
			gpAjax.ajaxPost('conquest_info', 'publish', {command_id: this.conqueror_units_id}, true, function (data) {
				if (data.public_id) {
					$('.publish_conquest_public_id_wrap').css('display', 'block');
					$('#publish_conquest_public_id').val('[conquest]' + data.public_id + '[/conquest]');
					$('.publish_btn').css('display', 'none');
					$('.conquest_info_wrapper').css('height', '202px');
				}
			});
		},

		unpublish: function() {
			// send ajax request
			gpAjax.ajaxPost('conquest_info', 'unpublish', {command_id: this.conqueror_units_id}, true, function (data) {
				$('.publish_conquest_public_id_wrap').css('display', 'none');
				$('#publish_conquest_public_id').val('');
				$('.publish_btn').css('display', 'block');
				$('.conquest_info_wrapper').css('height', '235px');
			});
		}
	};

	window.Conquest = Conquest;
}());

