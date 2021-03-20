/*global define, GameDataConstructionQueue, us, GameDataBuildings, GameDataResearches, GameData, AcademyTooltipFactory */

(function() {
	'use strict';

	var AcademyBaseView = GameViews.BaseView.extend({
		initialize: function () {
			//Don't remove it, it should call its parent
			GameViews.BaseView.prototype.initialize.apply(this, arguments);

			this.render();
		},

		render : function() {
			if (this.controller.hasAcademy()) {
				this.$el.html(us.template(this.controller.getTemplate('index'), {
					extended_world_features_enabled : this.controller.areExtendedWorldFeaturesEnabled(),
					l10n : this.controller.getl10n(),
					research_order_queue_count : this.controller.getResearchOrdersCount(),
					max_research_order_queue_count : GameDataConstructionQueue.getResearchOrdersQueueLength(),
					available_research_points : this.controller.getAvailableResearchPoints(),
					max_research_points : this.controller.getMaxResearchPoints(),
					additional_research_points : this.controller.getAdditionalResearchPoints()
				}));

				this.renderTechTree();
				this.initializeViewComponents();
			}
			else {
				this.$el.html(us.template(this.controller.getTemplate('no_building'), GameDataBuildings.getNoBuildingTemplateData('academy')));
			}
		},

		reRenderTechTree : function() {
			this.$el.off('.techtree');

			this.renderTechTree();
		},

		renderTechTree : function() {
			this.$el.find('.js-tech-tree').html(us.template(this.controller.getTemplate('techtree'), {
				researches : this.controller.getResearchesInColumns(),
				current_academy_level : this.controller.getAcademyLevel(),
				is_reseting_mode_active : this.controller.isInResetingModeActive()
			}));

			this.updatePointerPosition();
			this.registerTechTreeViewComponents();
			this.updateResearchTooltips();
			this.updateRevertTooltips();
			this.updateProgressPointerTooltip();
		},

		registerTechTreeViewComponents : function() {
			this.$el.on('click.techtree', '.btn_upgrade, .btn_downgrade', function(e) {
				var $btn = $(e.currentTarget),
					research_id = $btn.data('research_id');

				//Handled in separate controllers
				this.controller.onBtnClick(research_id);
			}.bind(this));
		},

		initializeViewComponents : function() {
			this.updateAvailableResearchPointsTooltip();
			this.updateProgressPointerTooltip();
		},

		updateQueueItemCount : function() {
			this.$el.find('.js-order-queue-count').text(this.controller.getResearchOrdersCount());
			this.$el.find('.js-max-order-queue-count').text(GameDataConstructionQueue.getResearchOrdersQueueLength());
		},

		updateProgressPointerTooltip : function() {
			var l10n = this.controller.getl10n().tooltips.research_points_bubble;
			this.$el.find('.js-progress-pointer').tooltip(l10n.part5);
		},

		updateAvailableResearchPointsTooltip : function() {
			var l10n = this.controller.getl10n().tooltips.research_points_bubble;
			var available_research_points = this.controller.getAvailableResearchPoints();
			var research_points_for_library = GameDataResearches.getResearchPointsPerLibraryLevel();
			var research_points_pro_level = GameDataResearches.getResearchPointsPerAcademyLevel();
			var max_research_points_without_library = this.controller.getMaxResearchPointsWithoutLibrary();

			var tooltip = '<h4>' + l10n.part1(available_research_points) + '</h4>';

			if (this.controller.isLibraryBeingTearingDown()) {
				tooltip += '<p>' + l10n.part2(research_points_for_library) + '</p>';
			}

			tooltip += '<p>' + l10n.part3(research_points_pro_level) + '</p>';
			tooltip += '<p>' + l10n.part4(research_points_for_library, max_research_points_without_library) + '</p>';

			this.$el.find('.js-researches-bubble-tooltip').tooltip(tooltip);
		},

		updateResearchPoints : function() {
			var available_research_points = this.controller.getAvailableResearchPoints(),
				max_research_points = this.controller.getMaxResearchPoints();

			this.$el.find('.js-research-points').html(available_research_points + '/' + max_research_points);
		},

		updatePointerPosition : function() {
			var column_size, space_between_levels, space_between_columns,
				position = 0,
				academy_level = this.controller.getAcademyLevel();

			if (!this.controller.areExtendedWorldFeaturesEnabled()) {
				column_size = 77;
			} else {	// else worlds with extended features max level 36. Other positions!
				column_size = 64;
			}

			space_between_levels = column_size / 4;//3 levels per column
			space_between_columns = Math.ceil(academy_level / 3) - 1;

			position = space_between_levels * (academy_level +  space_between_columns);

			this.$el.find('.js-progress-pointer').css({left: position});
			this.$el.find('.js-progress-bar').css({width: position});
		},

		updateRevertTooltips : function() {
			var gd_researches = GameData.researches,
				research_id,
				research,
				town_researches = this.controller.getTownResearches(),
				available_culture_points = this.controller.getAvailableCulturalPoints();

			this.$el.find('.btn_downgrade').each(function(index, el) {
				var $el = $(el), is_researched;

				research_id = $el.data('research_id');
				research = gd_researches[research_id];
				is_researched = town_researches.hasResearch(research_id);

				if (!is_researched) {
					return;
				}

				$el.tooltip(AcademyTooltipFactory.getRevertTooltip(research, available_culture_points));
			});
		},

		updateResearchTooltips : function() {
			var gd_researches = GameData.researches,
				research_id,
				research_orders = this.controller.getResearchOrders(),
				current_academy_level = this.controller.getAcademyLevel(),
				available_research_points = this.controller.getAvailableResearchPoints(),
				town_researches = this.controller.getTownResearches(),
				is_queue_full = research_orders.isResearchQueueFull();

			for (research_id in gd_researches) {
				if (gd_researches.hasOwnProperty(research_id)) {
					var research = gd_researches[research_id],
						is_researched = town_researches.hasResearch(research_id),
						in_progress = research_orders.isResearchInQueue(research_id);

					this.$el.find('.research_icon.' + GameDataResearches.getResearchCssClass(research_id)).tooltip(AcademyTooltipFactory.getResearchTooltip(
						research,
						current_academy_level,
						available_research_points,
						is_researched,
						in_progress,
						is_queue_full
					));
				}
			}
		},

		destroy : function() {

		}
	});

	window.GameViews.AcademyBaseView = AcademyBaseView;
}());
