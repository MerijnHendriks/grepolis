define('features/attack_spots/models/player_attack_spot', function(require) {
    'use strict';

    var GrepolisModel = require_legacy('GrepolisModel');
	var Timestamp = require('misc/timestamp');

	var PlayerAttackSpot = GrepolisModel.extend({
		urlRoot : 'PlayerAttackSpot',
		refreshUnitRuntimes: function() {
			this.execute('getUnitRuntimes', {}, function(data) {
				this.set('unit_runtimes', data);
			}.bind(this));
		},
		attack : function(units, callback) {
			this.execute('attack', units, callback);
		},
		onChange : function(obj, callback) {
			obj.listenTo(this, 'change', callback);
		},
		onDestroy: function(obj, callback) {
			obj.listenTo(this, 'destroy', callback);
		},
		onRewardStateChanged: function(obj, callback) {
			obj.listenTo(this, 'change:reward_available', callback);
		},
		hasCooldown: function() {
			return this.getCooldownDuration() > 0;
		},
		getCooldownDuration : function() {
			return this.getCooldownAt() - Timestamp.now();
		},
		getUnitRuntimes: function() {
			return this.get('unit_runtimes');
		},
		hasReward : function() {
			return this.getRewardAvailable();
		},
		use: function(callbacks) {
			this.execute('useReward', {}, callbacks);
		},
		stash: function(callbacks) {
			this.execute('stashReward', {}, callbacks);
		},
		trash: function(callbacks) {
			this.execute('trashReward', {}, callbacks);
		},
		onUnitRuntimesChange: function(obj, callbacks) {
			obj.listenTo(this, 'change:unit_runtimes', callbacks);
		}
	});

	GrepolisModel.addAttributeReader(PlayerAttackSpot.prototype,
		 'id',
		 'absolute_coordinates',
		 'level',
		 'cooldown_at',
		 'island_id',
		 'reward',
		 'reward_available',
		 'units',
		 'battle_points',
		 'town_id',
		 'first_attack_spot_runtimes'
	);

	window.GameModels.PlayerAttackSpot = PlayerAttackSpot;

	return PlayerAttackSpot;
});
