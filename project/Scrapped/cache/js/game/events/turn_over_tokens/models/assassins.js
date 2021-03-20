/*global window, Promise */

define('events/turn_over_tokens/models/assassins', function(require) {
	'use strict';

	var GrepolisModel = window.GrepolisModel;
	var AssassinsPlayerMetaData = GrepolisModel.extend({
		urlRoot : 'AssassinsPlayerMetaData',

		onArrowQuiverChange : function(obj, callback) {
			obj.listenTo(this, 'change', callback);
		},

		/*
		 * Beware! instead of a callback this function returns a promise object
		 */
		onTrophyOrArrowDrop : function() {
			return new Promise(function(resolve, reject) {
				this.once('change:arrows change:trophies', function(model, value, options) {
					var changed_attributes = model.changedAttributes(),
						is_trophy_dropped = false,
						is_arrow_dropped = false,
						collection_complete = false,
						unit_name;

					if (changed_attributes.arrows) {
						if (model.get('arrows') - model.previous('arrows') === 1) {
							is_arrow_dropped = true;
						}
					}
					if (changed_attributes.trophies) {
						var prev_trophies = model.previous('trophies'),
							curr_trophies = model.get('trophies');
						if (prev_trophies.sapper < curr_trophies.sapper) {
							is_trophy_dropped = true;
							unit_name = 'sapper';
						}
						if (prev_trophies.legionary < curr_trophies.legionary) {
							is_trophy_dropped = true;
							unit_name = 'legionary';
						}
						if (prev_trophies.cavalry < curr_trophies.cavalry) {
							is_trophy_dropped = true;
							unit_name = 'cavalry';
						}
						if(curr_trophies[unit_name] === 10) {
							collection_complete = true;
						}
					}
					if (is_arrow_dropped || is_trophy_dropped) {
						resolve({
							unit_name : unit_name,
							is_trophy_dropped: is_trophy_dropped,
							is_arrow_dropped: is_arrow_dropped,
							collection_complete: collection_complete
						});

					} else {
						reject();
					}
				});
				setTimeout(reject, 3000);
			}.bind(this));
		},

		setArrows : function() {
			this.set('arrows', this.get('arrows') - 1);
		},

		refillArrowQuiver : function() {
			this.execute('buyArrows',{});
		}

	});

	GrepolisModel.addAttributeReader(AssassinsPlayerMetaData.prototype,
		'id',
		'honor_points',
		'arrows',
		'trophies', // {sapper:number, legionary:number, cavalry:number},
		'collection_awards',
		'collection_rewards',
		'cost_factor'
	);

	window.GameModels.AssassinsPlayerMetaData= AssassinsPlayerMetaData;
	return AssassinsPlayerMetaData;
});
