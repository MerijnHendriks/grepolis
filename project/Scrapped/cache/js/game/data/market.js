/* global Game */

window.GameDataMarket = (function() {
	var current_filters;

	return {
		isNewMarketEnabled : function() {
			return true;
		},

		/**
		 * setter / getter to keep filter data persistent over tab switches in the market
		 */
		getCurrentFilters : function() {
			return current_filters;
		},

		setCurrentFilters: function(filters) {
			current_filters = filters;
		},

		resetFilters : function() {
			current_filters = undefined;
		},

		getMaxExchangeRatio : function() {
			return Game.constants.market.max_exchange_ratio;
		},

		getMaxResourcesFroTradeAmount : function() {
			return Game.constants.market.max_resources_for_trade;
		},

		getMarketLevelForTrade : function() {
			return Game.constants.market.min_market_level_for_trade;
		},

		getMinTradingSum : function() {
			return Game.constants.market.min_trading_sum;
		}
	};

}());
