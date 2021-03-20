/* global Timestamp, DateHelper, readableUnixTimestamp */

define('feature/commands/views/commands_menu', function() {
	'use strict';

	var BaseView = window.GameViews.BaseView;

	var FIXED_LIST_ELEMENT_HEIGHT = 47;
	var MAX_ELEMENTS_IN_VIEW = 5;

	var COMMANDS_TYPES = {
        REVOLT_RUNNING: 'revolt_running',
    	REVOLT_ARISING: 'revolt_arising',
    	CONQUEROR: 'conqueror',
		COLONIZATION: 'colonization'
	};

	var MyView = BaseView.extend({
		initialize: function (options) {
			BaseView.prototype.initialize.apply(this, arguments);
			this.l10n = this.controller.getl10n();

			this.renderContainer();
			this.registerEventListeners();

			// Booleans to allow for lazy rendering operations
			// and avoid unneeded re-renders
			this.view_dirty = true;
			this.view_shown = false;
		},

		registerEventListeners : function() {
			var $commands_button = $('.toolbar_activities .activity.commands');

            $commands_button.on('mouseover', function() {
				if (this.view_dirty) {
					this.render();
				}

                var $content = $('#toolbar_activity_commands_list .content>div');

				this.$commands_list.show();
				this.view_shown = true;
				this.refreshVisibleNodes();

				$commands_button.off('mouseleave');
                $commands_button.on('mouseleave', function ($ev) {
                	if (this.$commands_list.has($ev.relatedTarget).length === 0) {
                        this.hideView();
                    }
                }.bind(this));

                this.$commands_list.off('mouseleave');
                this.$commands_list.on('mouseleave', function ($ev) {
                    if ($commands_button.has($ev.relatedTarget).length === 0) {
                        this.hideView();
                    }
                }.bind(this));

				$content.off();
                $content.on('click', function($ev) {
                    var $element = $ev.currentTarget,
                        $target = $($ev.target),
                        model_id = $element.id.split('_')[1];

                    if (model_id) {
                        if ($target.hasClass('js-delete')) {
                            this.controller.cancelMovement(model_id);
                        }

                        if ($target.hasClass('icon')) {
                            this.controller.openMovementWindow(model_id);
                        }
                    }

                    this.hideView();
                }.bind(this));

                $content.on('mouseover', function($ev) {
                    var $element = $ev.currentTarget,
                        $target = $($ev.target),
                        model_id = $element.id.split('_')[1];

                    if ($target.hasClass('icon')) {
                        this.showTooltip($target, model_id);
                    }
                }.bind(this));
			}.bind(this));

			this.$list_container.on('scroll', function($ev) {
				var el = $ev.target,
				 	elms_count = el.childElementCount,
					elms = el.children,
					first = Math.floor(el.scrollTop / FIXED_LIST_ELEMENT_HEIGHT),
					count_max = Math.min(first + MAX_ELEMENTS_IN_VIEW, elms_count),
					i;

				for (i=first; i<count_max; i++) {
					$(elms[i]).addClass('visible');
				}
			});

		},

		hideView : function() {
			this.$commands_list.off();
			this.$commands_list.hide();
			this.view_shown = false;
            this.$commands_list.find('.visible').removeClass('visible');
		},

		/**
		 * render the 'dropdown' list-container to be consistent with the existing style
		 */
		renderContainer : function() {
			$('.js-dropdown-list').parent().append('<div id="toolbar_activity_commands_list" class="fast dropdown-list">');

			this.renderTemplate($('#toolbar_activity_commands_list'),'list_commands', {});
			this.$commands_list = $('#toolbar_activity_commands_list');
			this.$list_container = $('#toolbar_activity_commands_list').find('.js-dropdown-item-list');

			$('.js-dropdown-list').removeClass('dropdown-list');

			var no_results_template = this._getTemplate('item_no_results');
			this.$list_container.parent().append(no_results_template({
				l10n: this.l10n
			}));
			var processing_commands = document.createElement('div');
			processing_commands.innerHTML = this._getTemplate('item_processing_movements')({
				l10n: this.l10n
			});
			this.$list_container.parent()[0].insertBefore(processing_commands.children[0], this.$list_container[0]);
		},

		/**
		 * renders the complete list based on the sorting bookkeeping done in the controller
		 */
		renderList : function() {
			var frag = document.createDocumentFragment();

			var compiled_template = this._getTemplate('generic_command');

			/**
			 * during fast town switching we may run out of sync in the cache for some bizarre reasons
			 * so we check the cache once before using it.
			 * 
			 * This is a brute force approach to cache invalidation issue.
			 */
			if (this.controller.getArrivedCommandsCount()) {
				this.showProcessingMovements();
			}

			// for now render with insertNode
			this.controller.sort_index.forEach(function(timestamp) {
				this.controller.sort_models[timestamp].forEach(function(model_id) {
					var model = this.controller.getModelFromAnyMovementCollection(model_id);
					if (model) {
						this._insertNode(frag, compiled_template, model);
					}
				}.bind(this));
			}.bind(this));

			// insert fragment html
			this.$list_container.append(frag);
		},


		render : function() {

			if (this.view_dirty) {
				this.destroyItems();
				this.renderList();
				this.refreshVisibleNodes();
			}

			// keep the view dirty if we expect data soon
			if (this.controller.isIncomingDataExpected()) {
				this.showNoResults(); // 'loading...' would be a better option
			} else {
				this.view_dirty = false;
			}
		},


		/**
		 * triggers a scroll Event on the list_container, which unhides the nodes in view
		 * causes a Layout / in the browser and is expensive
		 */
		refreshVisibleNodes : function() {
			if (this.view_shown) {
				this.$list_container.trigger('scroll');
				this.updateTimers();
			}
		},

		/**
		 * insert a Model into the Dom
		 * This code is optimized for performance and avoids jQuery
		 * and does some micro-optimisations
		 *
		 */
		_insertNode : function($parent_node, template, model, $next_node) {

			var timestamp = this.controller.getModelArrivalTime(model);

			if (Math.max(0, timestamp - Timestamp.now()) === 0) {
				return;
			}

			var $new_node = document.createElement('div');
			$new_node.setAttribute('data-timestamp', timestamp);
            $new_node.setAttribute('data-cancelable', model.isReturning() ? -1 : model.getCancelableUntil());
            $new_node.setAttribute('data-commandtype', model.getGroupId());
			$new_node.id = 'movement_' + model.getId();

			$new_node.innerHTML = template({
				model : model
			}, {variable : 'model'});

			if (!$next_node) {
				$parent_node.appendChild($new_node);
			} else {
				$parent_node.insertBefore($new_node, $next_node);
			}
		},

		addNode : function(model) {
			if (this.view_dirty) {
				this.render();
			} else {
				var compiled_template = this._getTemplate('generic_command');
				var next_timestamp = this.controller.getNextTimeFor(this.controller.getModelArrivalTime(model));

				if (next_timestamp === -1) {
					this._insertNode(this.$list_container[0], compiled_template, model);
				} else {
					var next_node = this.$list_container[0].querySelector('[data-timestamp="'+ next_timestamp + '"]');
					this._insertNode(this.$list_container[0], compiled_template, model, next_node);
				}

				this.refreshVisibleNodes();
			}
		},

		removeNode : function(model) {
			if (this.view_dirty) {
				this.render();
			} else {
				var node = document.getElementById('movement_' + model.getId());
				if (node) {
					node.parentNode.removeChild(node);
					this.refreshVisibleNodes();
				}
			}
		},

		updateCommandsCounter : function(count) {
			this.getComponent('btn_commands').setCaption(count);
		},

		invalidateView : function() {
			this.view_dirty = true;
			if (this.view_shown) {
				this.destroyItems();
				this.hideView();
			}
		},

		destroyItems : function() {
			this.$list_container.empty();
		},

		bulkUpdateDone : function() {

			if (this.view_shown) {
				this.render();
			}

			if (!this.controller.isListEmpty()) {
				this.hideNoResults();
			} else {
				this.showNoResults();
			}
		},

		updateTimersUsingFragments : function() {
			var $list = this.$list_container.clone(),
				$parent = this.$list_container.parent(),
				$item_no_result = this.$list_container.parent().find('.no_results');

			if ($list[0].children.length === 0 || !this.view_shown) {
				return;
			}

			var frag = document.createDocumentFragment();
			frag.appendChild($list[0]);

			Object.keys($list[0].children).forEach(function(key) {

				var element = $list[0].children[key];
				if (!element) {
					return;
				}
				var timestamp = parseInt(element.getAttribute('data-timestamp'), 10),
					time_left = Math.max(0, timestamp - Timestamp.now()),
					cancelable = parseInt(element.getAttribute('data-cancelable'), 10),
					can_cancel = Math.max(0, (cancelable - Timestamp.now()) > 0);

				if (!timestamp || time_left === 0) {
					frag.children[0].removeChild(element);
					return;
				}

				element.querySelector('.time').innerHTML = DateHelper.readableSeconds(time_left);
				var remove_button = element.querySelector('.js-delete');

				if (can_cancel) {
					if (remove_button.className.indexOf('cancelable') === -1) {
						remove_button.className = remove_button.className + ' cancelable';
					}
				} else {
					remove_button.className = remove_button.className.replace(/\bcancelable\b/,'');
				}

			});

			this.$list_container.remove();
			$parent[0].insertBefore(frag, $item_no_result[0]);
			this.$list_container = $('#toolbar_activity_commands_list').find('.js-dropdown-item-list');
			this.registerEventListeners();
			this.showProcessingMovements();
			this.$list_container.trigger('scroll');
		},

		updateTimersWithoutUsingFragments : function() {
			var $visible_elements = this.$list_container.find('.visible');

			$visible_elements.each(function(indx, element) {
				var timestamp = parseInt(element.getAttribute('data-timestamp'), 10),
					time_left = Math.max(0, timestamp - Timestamp.now()),
					cancelable = parseInt(element.getAttribute('data-cancelable'), 10),
					can_cancel = Math.max(0, (cancelable - Timestamp.now()) > 0);

				if (!timestamp) {
					return;
				}

				if (time_left === 0) {
					$(element).addClass('arrived');
				}

				element.querySelector('.time').innerHTML = DateHelper.readableSeconds(time_left);
				var remove_button = element.querySelector('.js-delete');

				if (!can_cancel) {
					remove_button.className = remove_button.className.replace(/\bcancelable\b/,'');
				} else {
					if (remove_button.className.indexOf('cancelable') === -1) {
						remove_button.className = remove_button.className + ' cancelable';
					}
				}
			});
		},

		/**
		 * called every timer tick for all visible elements.
		 * Updates the clock & shows and hides the cancel button
		 */
		updateTimers : function() {
			if (!this.view_shown) {
				return;
			}
			if (this.$list_container.find('.arrived').length) {
				this.updateTimersUsingFragments();
			} else {
				this.updateTimersWithoutUsingFragments();
			}
		},

		showTooltip : function($target, model_id) {
			var model = this.controller.getModelFromAnyMovementCollection(model_id),
				finished_time;

			if (model) {
				switch (model.getType()) {
					case COMMANDS_TYPES.REVOLT_RUNNING:
						finished_time = model.getFinishedAt();
						break;
					case COMMANDS_TYPES.REVOLT_ARISING:
						finished_time = model.getStartedAt();
						break;
					case COMMANDS_TYPES.CONQUEROR:
						finished_time = model.getConquestFinishedAt();
						break;
					case COMMANDS_TYPES.COLONIZATION:
						finished_time = model.getCommandFinishTimestamp();
						break;
					default:
                        finished_time = model.getArrivalAt();
                        break;
				}

				$target.tooltip(this.controller.getCommandName(model) + ': ' + readableUnixTimestamp(finished_time, 'player_timezone'));
				// show the tooltip immediately because we only add it on first mouseover
				$target.showTooltip();
			}
		},

		showNoResults : function() {
			this.$list_container.parent().find('.no_results').show();
		},

		hideNoResults : function() {
			this.$list_container.parent().find('.no_results').hide();
		},

		showProcessingMovements : function() {
			var processing_mvmnts = this.$list_container.parent().find('.processing_movements');
			processing_mvmnts.find('.amount')[0].innerText = '(' + this.controller.getArrivedCommandsCount() + ')';
			processing_mvmnts.addClass('show');
		},

		hideProcessingMovements : function() {
			var processing_mvmnts = this.$list_container.parent().find('.processing_movements');
			processing_mvmnts.removeClass('show');
			processing_mvmnts.find('.amount')[0].innerText = '';
		}

	});

	window.GameViews.MyView = MyView;

	return MyView;

});
