/* global us, Backbone */
(function() {

	var Sorting = window.Sorting;

	var ORDER_ASC_CLASS = 'order_asc';
	var ORDER_DESC_CLASS = 'order_desc';
	var DATA_ATTRIBUTE = 'id';
	var HEADER_SELECTOR = 'th[data-' + DATA_ATTRIBUTE + ']';

	function fromIdToElement(headers, el) {
		var id = $(el).data('id');
		headers[id] = $(el);
		return headers;
	}


	/**
	 *
	 * @param {DOM} table -
	 *		the table's DOM element
	 *
	 * @param {function(value, order, callback):void} sortFunction -
	 *		the function used to do sorting(e.g. Ajax Request) with a callback for when it's done
	 *
	 * @param [initialValue] - the column to set the arrow to initially
	 * @constructor
	 */
	var SortableTable = function(table, sortFunction, initialValue, initialDirection) {
		var self = this;

		this.order_classes = {
			asc: ORDER_ASC_CLASS,
			desc: ORDER_DESC_CLASS
		};

		this.$table = $(table);
		this.sortFunction = sortFunction;
		this.initialValue = initialValue;
		this.initialDirection = initialDirection;

		var $headers = this.$table.find(HEADER_SELECTOR);
		// map from data-id to $th element for caching
		this.header_map = $headers.toArray().reduce(fromIdToElement, {});

		var default_order = {};
		default_order[initialValue] = initialDirection;
		this.sorting = new Sorting(initialValue, default_order);

		this._addArrowToHeader();

		// redraw on sorting change
		this.sorting.onChange(this, this._addArrowToHeader, this);

		$headers.click(function(e) {
			var id = $(e.target).data(DATA_ATTRIBUTE);
			self.sortBy(id);
		}.bind(this));

	};

	us.extend(SortableTable.prototype, Backbone.Events, {

		_addArrowToHeader: function() {
			Object.keys(this.header_map).forEach(function(id) {

				var $el = this.header_map[id];

				this._removeArrow($el);
				// add correct arrow according to given sorting
				if ( id === this.sorting.getValue() ) {
					this._addArrowTo($el, this.sorting.getOrder());
				}

			}.bind(this));
		},

		_addArrowTo: function($el, order) {
			$el.addClass(this.order_classes[order]);
		},

		_removeArrow: function($el) {
			$el.removeClass(this.order_classes.asc).removeClass(this.order_classes.desc);
		},

		sortBy: function(id, direction) {
			var new_sorting = this.sorting.getNextStateAfterSortingBy(id),
				setSorted = function() {
					this.sorting.setState(new_sorting);
					this.trigger('change');
				}.bind(this);

			this.sortFunction(new_sorting.value, direction || new_sorting.order, setSorted);
		},

		getSortKey: function() {
			return this.sorting.getValue();
		},

		getOrder: function() {
			return this.sorting.getOrder();
		},

		reset: function() {
			Object.keys(this.header_map).forEach(function(id) {

				var $el = this.header_map[id];

				this._removeArrow($el);
			}.bind(this));
			this.sorting.setState({
				value : this.initialValue,
				order: this.initialDirection
			});
		},

		onChange: function(listener, callback, context) {
			listener.listenTo(this, 'change', callback, context);
		}

	});

	// TODO namespace
	window.SortableTable = SortableTable;

})();
