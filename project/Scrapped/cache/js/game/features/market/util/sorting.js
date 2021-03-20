/* global us, Backbone */
(function() {

	var DEFAULT_ORDER = 'asc';
	var ASC = 'asc';
	var DESC = 'desc';
	var ORDER_CHANGED = 'change:order';
	var VALUE_CHANGED = 'change:value';

	function getDefaultOrder(value, defaults) {
		return defaults && defaults[value] || DEFAULT_ORDER;
	}


	/**
	 * Class that does the bookkeeping for sortable tables.
	 * Saves which column to sort by and in which order.
	 *
	 * @param {string} [initialValue] - column to sort by initially
	 * @param {object} [defaults] - the default sort order for a given column in the form {value:order}
	 *
	 * @example
	 * // set initial value and default orders
	 * var table_sorting = new Sorting('ratio', {
	 *     ratio: Sorting.ASC,
	 *     name: Sorting.DESC
	 * });
	 *
	 * // use sortBy to handle changing values and orders automatically
	 * $name_col.click(function() {
	 *     table_sorting.sortBy('name');
	 * });
	 *
	 *
	 * @constructor
	 */
	var Sorting = function(initialValue, defaults) {

		// for external usage instead of strings
		this.ASC = ASC;
		this.DESC = DESC;

		this.initialValue = initialValue;
		this.defaults = defaults;

		this.state = {
			order: null,
			value: null
		};

		this.reset();
	};

	us.extend(Sorting.prototype, Backbone.Events, {

		reset: function() {
			if (this.initialValue) {
				this.state.value = this.initialValue;
				this.state.order = getDefaultOrder(this.initialValue, this.defaults);
			} else {
				this.state.order = null;
				this.state.value = null;
			}
		},

		sortBy : function(value) {
			if (this.state.value === value) {
				this.toggleOrder();
			} else {
				this.setValue(value);
			}
		},

			getOrder : function() {
			return this.state.order;
		},

		setOrder : function(order) {
			this.state.order = order;
			this.trigger(ORDER_CHANGED, this.state);
			return this;
		},

		toggleOrder : function() {
			return this.setOrder(this.state.order === ASC ? DESC : ASC);
		},

		getValue : function() {
			return this.state.value;
		},

		setValue : function(value) {
			this.state.value = value;
			this.state.order = getDefaultOrder(value, this.options);
			this.trigger(VALUE_CHANGED, this.state);
			return this;
		},

		setState: function(state) {
			this.state = state;
			this.trigger(VALUE_CHANGED, this.state);
		},

		getNextStateAfterSortingBy : function(value) {
			if (this.state.value === value) {
				return {
					value: value,
					order: this.state.order === ASC ? DESC : ASC
				};
			} else {
				return {
					value: value,
					order: getDefaultOrder(value, this.options)
				};
			}
		},

		onChange : function(listener, callback, context) {
			// make use of Backbone's special 'all' event that fires no matter what's been triggered
			listener.listenTo(this, 'all', callback, context);
		}

	});

	// TODO namespace
	window.Sorting = Sorting;

})();