define('events/flipping_images/views/main', function(require) {
	'use strict';

	var View = window.GameViews.BaseView;
	var step_finished = true;

	return View.extend({

		initialize: function () {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);
			this.l10n = this.controller.getl10n();

			this.render();
		},

		render: function() {
			this.renderTemplate(this.$el, 'index', {
				l10n: this.l10n
			});

			this.registerComponents();
			this.displayCurrentStepInformation();
		},

		/**
		 * Register two buttons - back and forward button
		 */
		registerComponents: function() {
			this.unregisterComponent('fi_back_button');
			this.registerComponent('fi_back_button', this.$el.find('.back_button').button({
				caption: this.l10n.back_button_text,
				disabled: this.controller.getCurrentStep() === 1,
				state: this.controller.getCurrentStep() > 1
			}).on('btn:click', function () {
				if (step_finished) {
					this.displayCurrentStepInformation(-1);
				}
			}.bind(this)));

			this.unregisterComponent('fi_forward_button');
			this.registerComponent('fi_forward_button', this.$el.find('.forward_button').button({
				caption : this.l10n.forward_button_text
			}).on('btn:click', function () {
				if (step_finished) {
					this.displayCurrentStepInformation(1);
				}
			}.bind(this)));

			this.unregisterComponent('fi_close_event_button');
			this.registerComponent('fi_close_event_button', this.$el.find('.close_event_button').button({
				caption : this.l10n.close_button_text
			}).on('btn:click', function () {
				this.controller.closeWindow();
			}.bind(this)));
		},

		/**
		 * Disable back button if the first step is reached
		 * Disable forward button if the last step is reached
		 */
		updateButtonsState: function() {
			var back_button = this.getComponent('fi_back_button'),
				close_event_button = this.getComponent('fi_close_event_button'),
				forward_button = this.getComponent('fi_forward_button'),
				current_step = this.controller.getCurrentStep();

			if (current_step === 1) {
				back_button.setState(true);
				back_button.disable();
			} else {
				back_button.setState(false);
				back_button.enable();
			}

			if (current_step === this.controller.getStepsLength()) {
				forward_button.hide();
				close_event_button.show();
			} else {
				close_event_button.hide();
				forward_button.show();
			}
		},

		/**
		 * Main function to display all information about the active step (images, messages, small name boxes)
		 * @param direction - if it is back then it is a -1, for forward it will be 1
		 */
		displayCurrentStepInformation: function(direction) {
			if (!step_finished) {
				return;
			}
			step_finished = false;

			// get all information for the current step
			var current_step = this.controller.getCurrentStepInfo(),
				active_direction = current_step.active_direction,
				left_class = current_step.left_class,
				right_class = current_step.right_class,
				action = current_step.action,
				emoticon = current_step.emoticon,

				// get the next step (if it is forward it will be the +1 step, if it is back it will be the -1 step)
				next_step = this.controller.getNextStepInfo(direction),
				$left_flipping_image = this.$el.find('.left_flipping_image'),
				$right_flipping_image = this.$el.find('.right_flipping_image'),
				$emoticon_image = this.$el.find('.emoticon');

			if (next_step) {
				// set the next step to the active one, since we want to show it
				this.controller.setActiveStep(direction);
				current_step = this.controller.getCurrentStepInfo();
				// get all information for the current step
				active_direction = next_step.active_direction;
				left_class = next_step.left_class;
				right_class = next_step.right_class;
				action = next_step.action;
				emoticon = next_step.emoticon;
			}

			// update the button state because the new step will be shown
			this.updateButtonsState();

			/**
			 * There are three different cases when changing the images:
			 * First case (action = 0): the image does not change
			 * Second case (action = 1): a new image will be set - image animation for appearing
			 * Third case (action = 2): the image will be removed - image animation for disappearing
			 */
			if (action === 2) {
				var ease_out = $.support.transition ? 'ease-out' : '';
				// This step is a special case since the step is connected with the next step
				// The disappearing step should always be connected with the next appearing step
				if (active_direction === 'left') {
					if (direction === 1) {
						//class needs to be added only when going forward
						$left_flipping_image.addClass(left_class);
					}
					//call emoticon animation
					this.animateEmoticonScale();
					//flipping image disappears animation
					$left_flipping_image.transition({ x : 407 }, 250)
						.transition({ x : 0, opacity: 0}, 250, ease_out, function() {
							this.displayCurrentStepInformation(direction);
						}.bind(this));
				} else if(active_direction === 'right') {
					//call emoticon animation
					this.animateEmoticonScale();
					//flipping image disappears animation
					$right_flipping_image.transition({ x : -407 }, 250)
						.transition({ x : 0, opacity: 0}, 250, ease_out, function() {
							this.displayCurrentStepInformation(direction);
						}.bind(this));
				}
			} else {
				var ease_in = $.support.transition ? 'ease-in' : '';
				$emoticon_image.transition({scale: 0, delay: 300}, 500, function() {
					this.resetEmoticonElement();
					$emoticon_image.attr('style', 'transform: scale(0, 0)');
					$emoticon_image.addClass(emoticon);
					$emoticon_image.transition({scale: 1.2}, 100, function() {
						$emoticon_image.transition({scale: 1}, 50, function() {
							step_finished = true;
						});
					});
				}.bind(this));

				// if there is a new flipping image appearing from left show it with animation
				if (!$left_flipping_image.hasClass(left_class) || left_class === '') {
					this.resetFlippingImageElement($left_flipping_image, 'left_flipping_image', left_class);
					$left_flipping_image.transition({ x : 0 }, 250)
						.transition({ x : 407, opacity: 1}, 250, ease_in);
				}
				// if a new flipping image is appearing from right show it with animation
				if (!$right_flipping_image.hasClass(right_class) || right_class === '') {
					if (direction === -1) {
						var out = $.support.transition ? 'ease-out' : '';
						$right_flipping_image.transition({ x : -407 }, 250)
							.transition({ x : 0, opacity: 0}, 250, out, function() {
								this.resetFlippingImageElmAndEaseItIn($right_flipping_image, 'right_flipping_image', right_class);
							}.bind(this));
					} else {
						this.resetFlippingImageElmAndEaseItIn($right_flipping_image, 'right_flipping_image', right_class, ease_in);
					}
				}
			}
			// show active name box (speaker)
			this.updateActiveSmallBox(active_direction, current_step.active_name, action);
			// show message in the message box (conversation)
			this.updateTextForCurrentStep();
		},

		/**
		 * Reset image element and animate appearing of image
		 * @param $flipping_image_element
		 * @param elem_class
		 * @param new_class
		 * @param ease_in
		 */
		resetFlippingImageElmAndEaseItIn: function($flipping_image_element, elem_class, new_class, ease_in) {
			this.resetFlippingImageElement($flipping_image_element, elem_class, new_class);
			$flipping_image_element.transition({ x : 0 }, 250)
				.transition({ x : -407, opacity: 1}, 250, ease_in);
		},

		/**
		 * Scale emoticon element down
		 */
		animateEmoticonScale: function() {
			var $emoticon_image = this.$el.find('.emoticon');
			$emoticon_image.transition({scale: 1}, 10, function() {
				$emoticon_image.transition({scale: 0}, 10, function() {
					this.resetEmoticonElement();
					step_finished = true;
				}.bind(this));
			}.bind(this));
		},

		/**
		 *
		 * @param $image_element - dom element
		 * @param main_image_class_name
		 * @param new_image_class_name
		 */
		resetFlippingImageElement: function($image_element, main_image_class_name, new_image_class_name) {
			$image_element.removeAttr('style');
			$image_element.removeClass();
			$image_element.addClass(main_image_class_name);
			$image_element.addClass(new_image_class_name);
		},

		/**
		 * Remove all styles and classes from the emoticon element
		 */
		resetEmoticonElement: function() {
			var $emoticon_image = this.$el.find('.emoticon');
			$emoticon_image.removeClass();
			$emoticon_image.addClass('emoticon');
			$emoticon_image.removeAttr('style');
		},

		/**
		 * Get the current step text and add it to the message box
		 */
		updateTextForCurrentStep: function() {
			var current_step = this.controller.getCurrentStep();
			this.$el.find('.message_wrapper').html(this.l10n.dialog['step_' + current_step]);
		},

		/**
		 * Show current speaker box
		 * @param direction
		 * @param name
		 * @param action
		 */
		updateActiveSmallBox: function(direction, name, action) {
			var $small_left_box = this.$el.find('.small_box_left');
			var $small_right_box = this.$el.find('.small_box_right');

			$small_right_box.hide();
			$small_left_box.hide();

			if (action === 2) {
				return;
			}

			if (direction === 'left') {
				$small_left_box.text(name);
				$small_left_box.show();
				$small_right_box.hide();
			} else {
				$small_right_box.text(name);
				$small_right_box.show();
				$small_left_box.hide();
			}
		}
	});
});
