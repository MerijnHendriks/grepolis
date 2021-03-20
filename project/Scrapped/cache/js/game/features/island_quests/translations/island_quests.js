/* globals DM, __ */

(function () {
    "use strict";

    DM.loadData({
        'l10n': {
            'island_quests': {
                'window_title': _('Island quest'),
                tabs: [],

                window: {
                    take_decision: _("Take A Decision"),
                    pick_up_quest: _('Decide'),
                    take_challenge: _('Challenge'),
                    view_progress: _('Show progress'),
                    quest_progress: _('Quest progress'),
                    btn_rotate: _('Rotate'),
                    btn_skip_cooldown: _('Skip quest cooldown'),
                    btn_go_to: _('Center'),
                    take_award: _('Accept reward'),
                    tooltip_effect: _('Effect'),
                    tooltip_rotate: function (cost) {
                        return s(_('You can spend %1 gold to discard the current island quest and immediately receive a new island quest.'), cost);
                    },
                    tooltip_skip: function (cost) {
                        return s(_('You can spend %1 gold to skip the island quests cooldown and immediately receive a new island quest.'), cost);
                    },
                    tooltip_goto: _('City selection'),
                    tooltip_quest_progress: _('Click here to see the details for this island quest'),
                    tooltip_quest_done: _('Click here to accept the reward for the completed quest.'),
                    tooltip_rally: _('You have to dispatch units amounting to %1 population to successfully complete the island quest.'),
                    tooltip_provoke_attack: _('You have to defend yourself against the following units to successfully complete the island quest:'),
                    tooltip_wait_time: _('You have to wait for the following amount of time to successfully complete the island quest:'),
                    tooltip_attack_npc: _('You have to defeat the following units to successfully complete the island quest:'),
                    tooltip_spend_resources: _('You must invest resources to successfully complete the island quest'),
                    tooltip_spend_resources_needed_resources: _('Required resources:'),
                    tooltip_bear_effect: _('Your city will suffer the following effect for a brief period:'),
                    tooltip_attack_player: _('You have to emerge victorious from %1 battles against other players to successfully complete this island quest.'),
                    tooltip_coins: _('You receive %1 %2'),
                    your_reward : _("Your reward"),
                    awaiting_new_island_quest : _("Awaiting new Island Quest"),
                    awaiting_description : _("New Island Quests will appear around your towns every now and then, and your job as a ruler is to decide on the fate of these events. Great rewards will come of the quests and how to solve them is your choice, just keep in mind that all decisions come with a price."),
                    wrong_island : _("Click the city selection button to choose an eligible city")
                },

                tasks: {
                    spend_resources: _("Send all needed resources"),
                    collect_units: _("Send the needed amount of units"),
                    attack_npc: _("Defeat all defending units"),
                    provoke_attack: _("Defeat all attacking units"),
                    wait_time: _("Wait until the time expires"),
                    bear_effect: _("Endure effect")
                },

                details_window: {
                    title: _('The challenge of the island quest'),
                    select_all_troops: _('Select all units'),
                    simulate: _('Add units to the simulator'),
                    defeat_enemy_troops: _('Enemy troops to be defeated'),
                    troops_rallied: _('Units stationed so far'),
                    btn_send_troops: _('Send units'),
                    btn_attack: __('verb|Attack'),
                    already_invested_wood: _('Invested wood:'),
                    already_invested_stone: _('Invested stone:'),
                    already_invested_iron: _('Invested silver coins:'),
                    send_resources: _('Send resources'),
                    provoke_attack_descr: _('The following units will attack you as soon as you provoke them:'),
                    bear_effect: _('Endure effect'),
                    bear_effect_info: [
                        _('Wait until the time expires to complete the island quest.'),
                        _('Your city will suffer the following effect for a brief period:')
                    ],
                    wait_time: _('Wait for some time'),
                    provoke_attack: _('Provoke attack'),
                    population: _('Population'),
                    wait_time_info: _('Wait until the time expires to complete the island quest.'),
                    tooltip_rally_troops: _('Hint: Supporting units will return to their home city after fulfilling their task.')
                },

                // the main quest descriptions are saved as array, because each array element is a paragraph
                main_quest_descriptions: {
                    TheLonePilgrim: [
                        _('You encounter a pilgrim in the mountains. His clothes are torn and he appears exhausted, but he has a determined look on his face. On his back he carries an old banner of war.')
                    ],
                    TheDesperateVillage: [
                        _('The elder of a nearby village approaches you. "My son has angered a group of bandits. They will soon descend upon us! Take pity and send us troops so that we may be spared of their wrath".')
                    ],
                    IntrigueOfMerchants: [
                        _('Two upset merchants seek your help. Both have lost their business and blame each other for their loss. Which of them do you wish to help, the weapons dealer or the one minting coins?')
                    ],
                    AllJustAnExploit: [
                        _('The workers of a nearby quarry seem to be able combatants as well. We can order some of their best warriors to join our army or we can invest in the expansion of the quarry.')
                    ],
                    RefugeesOrPrey: [
                        _('A group of rebels has left the city and set up camp in a valley. Some of our best troops have joined them! They are prepared to fight for their freedom, but they would also pay for it with silver coins.')
                    ],
                    RiddanceOfThePoor: [
                        _('The slums are in a terrible state. We need to improve the situation before the poor will revolt against us. Or we raze the entire area and use it as a building site for more important buildings.')
                    ],
                    CelebrationsOfARuler: [
                        _('Celebrations in your honor are being planned. However, there are rumors that a political opponent may use the festivities to harm you. Would you rather cancel the celebration?')
                    ],
                    HeroOfThePopulace: [
                        _('A young, but strong man is brought before you. He has beaten up five city guards and even slain one. However he claims that the guards are corrupt and have been bullying the people.')
                    ],
                    TheTournamentOfTheChariots: [
                        _('A village has organized a chariot race. You could demonstrate your military strength to make them join your army. You could also sponsor the next tournament to gain the favor of the people.')
                    ],
                    TheBrothel: [
                        _('We have some silver left that we could spend to improve our city. The noble quarter is lacking a good tavern. We could also spend a bit more and spruce up the city gardens instead.')
                    ],
                    TheStrandedCaptain: [
                        _('You spot the wreck of a ship by the coast. On closer inspection you find the captain, who claims that he was cursed by an evil witch. He asks you to hunt her down.')
                    ],
                    TheEpidemicPlague: [
                        _('In the last few weeks, the plaque has ravaged your city. We must decide what to do with all the bodies. We can bury them, but that would take a lot of time. Burning them would be much faster.')
                    ],
                    TearOffThePast: [
                        _('The people ask you to demolish an old barracks to make room for a shrine devoted to the gods. But you could also renovate the barracks to continue to train capable warriors in the future.')
                    ],
                    Crusade: [
                        _('A group of dissenters has emerged in our city. It tries to persuade our people that our gods are false and that we should devote ourselves to other gods. We cannot allow such sacrilege to remain unpunished!')
                    ],
                    CaravanWithoutProtection: [
                        _('You come upon a caravan that appears to be waiting at the edge of a city. The leader of the caravan asks you for an escort. But you could as well take away their horses and recruit horsemen for your army.')
                    ],
                    ChildOfTheGods: [
                        _('A child of the gods was found by a married couple. It is said that it is destined to do great deeds. Should we raise the child for our cause? You could also win the favor of the gods by helping the couple.')
                    ],
                    CampOfTheDesperate: [
                        _('You have discovered a camp of injured people, but there are not enough wagons to help all of them. It is up to you to decide who to save and who to leave to their fate.')
                    ],
                    HolyHauntedForest: [
                        _('The dryads, which live in a sacred forest, have degenerated into evil creatures and regularly haunt the residents of a nearby village. If you were to drive them out, the villagers would supply you with wood from the forest.')
                    ],
                    ThreatFromOutside: [
                        _('An enemy force is marching on your city to attack you. You can either hole up behind your walls and withstand the attack or take the offensive and strike first, to crush the aggressors before they reach the city.')
                    ],
                    TheDestroyedShrine: [
                        _('As you rest at a shrine to pray, you are shocked to discover that it has been desecrated. The statue of Zeus has been knocked over! The offenders left footprints that lead into a nearby forest.')
                    ],
                    QuestionOfMathematics: [
                        _('The plans for rebuilding your residence are complete. However, a respected mathematician suggests to rather strengthen the city walls instead.')
                    ],
                    LeonidasPlea: [
                        _('A sweaty warrior, who is accompanied by a dozen bodyguards enters your hall and gazes at you with cool eyes as he raises his voice: “Sire, I am not a man of excessive words, so hear me out. I am king Leonidas of Sparta and it is my duty to protect my people by any means necessary. A few days ago, a Persian envoy reached us... our refusal to bend the knee to his own king, and his death by my sword have announced a great war! I do not beg, but I do ask you to aid us in our time of need. We need every available man for the war and so our fields are left unattended. Would you supply us with food from your farming villages?“')
                    ],
                    ReinforcementOfSparta: [
                        _("“Many thanks for the food. The enemy will soon be upon us, therefore I must ensure that the women and children left behind in Sparta's villages are protected. If you have a heart for your Greek brothers and sisters, then please send us resources to help build up our defenses.“ Leonidas suggests a slight bow before turning to his warriors again.")
                    ],
                    BuildingTheDefenseLine: [
                        _('“We have gratefully received the materials you sent us. But I am again in need of your help. Our scouts have reported that we are in for a fight against a superior force. While we are busy fighting the Persian spawn, my villages will be left unguarded. Surely you have capable men you can send to defend our villages? I swear that I will reward you for your aid!“ Leonidas gazes upon you confidently.')
                    ],
                    FirstWave: [
                        _('“You have proven yourself a loyal ally until now. Therefore I request that you fight at our side when the first Persian fools reach the coast. You will most certainly take pleasure in the slaughter!“ A strange fire burns in his eyes. This man was born for battle, of that you are sure.')
                    ],
                    Distraction: [
                        _('Leonidas plunges his spear into the last warrior of the vanguard. A moment of stillness follows. Leonidas slowly turns to you. “Not bad for a beginning! It is unfortunate that there were so few of them. An idea has come to me how we can resist the coming superior force with minimal losses. I am going to position my men at Thermopylae and create a narrow pass for the attackers. Please distract the next enemy attack with your solidly built city to buy us some time!“')
                    ],
                    DefeatThePersians: [
                        _('When you return to the coast, Leonidas greets you with a triumphant nod. “I see you have survived the attack on your city. The remaining Persian troops are certain to arrive soon.“ With a taunting grin on his face Leonidas continues: “It is about time that we defeat these dogs. Lifting my legs over mounts of dead barbarians has exhausted my knees. Well then, prepare yourself, friend!“')
                    ],
                    CareForTheWounded: [
                        _('The battlefield is littered with the corpses of brave Persian warriors who gave their lives for a false ruler. The sun half disappears behind the horizon and brings forth the evening. Leonidas has already begun an emphatic victory speech. After his speech he approaches you: “Without you, Sparta would have been lost. That makes you a true friend of the Spartans! The day may come when you are in need of my help. Pray to the gods that it does not come too soon. For the moment, let us care for our wounded.“')
                    ],
                    PromisingMessage: [
                        _('Excited and with a smile on his face, your advisor approaches: “Sire, I bring good news for you. A woman of great beauty has asked that her arrival be greeted with a festival in her honor. The woman in question is Helen, who is commonly known to be the daughter of Zeus. Imagine it, you could win her as your ally! We should begin the festival preparations immediately.“ Your advisor turns away from you for a moment: “Fetch me some parchment and a quill!“ he calls through the hall to some servants.')
                    ],
                    LastPreparations: [
                        _('The servants bring the last of the decorations into the throne room as your adviser approaches with two young but noble woman at his side: “Helen and her entourage are sure to arrive soon. The throne room is ready but you will need a robe worthy of our guest. These women know how to make a work of art out of a ruler, so to speak. Do not fear, you will look splendid!“ You notice one of the women carefully scrutinizing you, measuring you with her eyes...')
                    ],
                    LetTheCelebrationBegin: [
                        _('Once you have been dressed in unusual clothing, you hear your people chanting the name “Helen!“ Reaching the window, you gaze onto the street and see a group of noble horses. Warriors in pompous armaments accompany the most beautiful woman in the world. Your gazes meet... She greets you with a wink and the smile of a goddess. Timid in the aura of her magical charisma, you promise a festival that will go down in history.')
                    ],
                    Avowals: [
                        _("Once the ice is broken and the festival is underway, you are afforded a few quiet minutes alone with Helen on the balcony of your palace.  The evening breeze blows through her hair and creates a moment of romance. Helen's expression, however, is troubled and it seems hard for her to speak openly: “We barely know each other, but I know you have a noble heart. Two weeks ago a friend was captured as the result of intrigue. She is still being held by the ruler of a free city near here. I lack the resources and opportunity to free her, but maybe you will allow me to request a favor. Free her, by force if necessary! Her integrity is very important to me.“ Helen looks at you determinedly.")
                    ],
                    OwingGratitude: [
                        _("As your warriors lead the last defenders of the free city away, you and Helen enter the inner-city. Once at the center, you notice a group of people who were clearly slaves in this city. Suddenly a young woman breaks from the crowd and runs towards you. Helen's face lights up and the women embrace. “I knew that you would come and save me! But tell me, who is your companion?“ Helen's friend points to you and gives you a smile. Helen gives a nod of thanks: “This is a newly won friend, who made this rescue possible.“ Helen turns to you: “I believe I owe you a debt of gratitude, but first let us settle a few matters here!“")
                    ],
                    MurderInTheSenate: [
                        _("After a long debate your advisor brings up a last issue, before the evening draws to a close: “Some confidential sources told me that an assassin has been hired to eliminate a senate member of the opposition. Presumably for personal reasons unknown to me. If you wish, I can assign a few guards to protect the life of that poor man. Or you let fate decide … and may get rid of some political troubles.“")
                    ]
                }
            }
        }// l10n
    });
}());
