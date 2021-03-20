(function() {
	"use strict";

	var SoundCategoryCollection = window.GameCollections.SoundCategory;

	var SoundCategory = Backbone.Model.extend({
		defaults: {
			name: null,
			volume: 1,
			collection: null
		},

		initialize: function() {
			this.set('collection', new SoundCategoryCollection());
			/*if ($.cookie('sound:category:'+this.get('name'))) {
				this.set('volume', parseFloat($.cookie('sound:category:'+this.get('name'))));
			}*/

			var self = this;
			/*this.on('change:volume', function(event) {
				$.cookie('sound:category:'+this.get('name'), event.get('volume'));
			});*/

			this.on('update_volume', function(event) {
				this.get('collection').forEach(function(item) {
					item.trigger('update_volume', {global: event.global, category: self.get('volume')});
				});
			});
			if (window.gui) {
				window.gui.add(this.attributes, 'volume', 0, 1).name('Volume - c '+ this.get('name')).onChange(function(v) {
					self.set('volume', v);
				});
			}
		}
	});

	window.GameModels.SoundCategory = SoundCategory;
}());
