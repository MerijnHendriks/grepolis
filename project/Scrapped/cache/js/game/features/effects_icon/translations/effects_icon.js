/* globals DM */

define('features/effects_icon/controllers/effects_icon', function () {
	DM.loadData({
		l10n: {
			effects_icon : {
				title: _("Active effects:"),
				active_until: _("Active until:"),
				augmentation: {
                    both_kills: {
                        title: _("Battle frenzy"),
                        description: _("Gods are especially delighted by glorious battles."),
						bonus: function (amount) {
                        	return s(_("+%1% battle points in all battles."), amount);
                        }
					},
                    att_kills: {
                        title: _("Ares' rage"),
                        description: _("Ares calls to all greeks to go to battle."),
                        bonus: function (amount) {
                            return s(_("+%1%  battle points to attackers in all battles."), amount);
                        }
                    },
                    def_kills: {
                        title: _("Athena's shield"),
                        description: _("Athena shares her shield with all greeks."),
                        bonus: function (amount) {
                            return s(_("+%1% battle points to defenders in all battles."), amount);
                        }
                    },
                    building_build_time: {
                        title: _("People's will"),
                        description: _("All Greek citizens are inspired to bring glory to the empire."),
                        bonus: function (amount) {
                            return s(_("%1% faster construction time to all buildings."), amount);
                        }
                    },
                    unit_build_time: {
                        title: _("Soldier's pride"),
                        description: _("Tales of glorious battles inspire new soldiers all over Greece."),
                        bonus: function (amount) {
                            return s(_("%1% faster recruiting time to all units."), amount);
                        }
                    }
				},
				augmentation_favor: {
					title: _("Priestess' Prayer"),
					description: _("The gods are pleased by the priestess' prayers and decide to reward them."),
					bonus: {
						title: _("Increased favor production:"),
						description: function (god_name, amount) {
							return s(_("%1: +%2% favor production"), god_name, amount);
						}
					}
				},
				augmentation_resource: {
					title: _("Gaia's wealth"),
					description: _("Gaia has blessed Greece with abundance of natural resources."),
					bonus: {
						title: _("Increased resource production:"),
						description: function (resource, amount) {
							return s(_("+%1% %2 production"), amount, resource);
						}
					}
				},
				party: {
					title: _("Festival season"),
					description: _("All citizens decide to help during the Festival season."),
					bonus: {
						title: _("Improved Festivals:"),
						duration: function (duration) {
                            return s(_("Duration: %1"), duration);
                        },
						costs: _("Costs:"),
						requirements: _("Requirements:"),
						min_academy_level: function (min_academy_level) {
							return s(_("Academy level - %1"), min_academy_level);
						}
					}
				}
			}
		}
	});
});
