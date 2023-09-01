import { mainUtils } from "../mainUtils.js";
import { HookCombat } from "../hooks/_hooksCombat.js";
import { aqActions } from "../actions/aqActions.js";
import { aqCombat } from "../actions/aqCombat.js";
import { aqContext } from "../actions/aqContext.js";

export class helperControls {

    /**
     * getSceneControlButtons
     * @param {*} mScenes 
     */
    static getSceneControlButtons(mScenes) {
        canvas.aqLayer = new PlaceablesLayer();
        mScenes.push({
            name: 'aqMenu',
            title: 'common.menuLayer',
            layer: 'aqLayer',
            icon: 'game-icon iconMenuAQ',
            tools: [
                {
                    icon: 'game-icon iconMenuCombat',
                    name: 'aqMenu_Combat',
                    title: 'common.menuCombat',
                    onClick: async () => await helperControls.playCombat()
                },              
                {
                    icon: 'game-icon iconMenuActions',
                    name: 'aqMenu_Actions',
                    title: 'common.menuActions',
                    onClick: async () => await helperControls.playActions()
                },              
                {
                    icon: 'game-icon iconMenuEncounter',
                    name: 'aqMenu_Encounter',
                    title: 'common.menuEncounter',
                    onClick: async () => await helperControls.playEncounter()
                },                     
                /*
                {
                    icon: 'game-icon iconMenuSelectCharacter',
                    name: 'aqMenu_SelectCharacter',
                    title: 'common.menuSelectCharacter',
                    onClick: async () => await helperControls.changeCharacter()
                },                
                {
                    icon: 'game-icon iconMenuSkills',
                    name: 'aqMenu_Skills',
                    title: 'common.menuSkills',
                    onClick: async () => await helperControls.playSkills()
                },              
                {
                    icon: 'game-icon iconMenuActions',
                    name: 'aqMenu_Actions',
                    title: 'common.menuActions',
                    onClick: async () => await helperControls.playActions()
                },
                {
                    icon: 'game-icon iconMenuSpells',
                    name: 'aqMenu_Spells',
                    title: 'common.menuSpells',
                    onClick: async () => await helperControls.playSpells()
                }        
                */                                                        
            ]         
        });
    }

    /**
     * renderSceneControls
     * @param {*} controls 
     * @param {*} html 
     * @param {*} options 
     */
    static renderSceneControls(controls, html, options) {

        //Icons
        html.find('.iconMenuAQ').parent().addClass('gameIconRaven');
        html.find('.iconMenuCombat').parent().addClass('gameIconCombat');
        html.find('.iconMenuActions').parent().addClass('gameIconActions');
        html.find('.iconMenuEncounter').parent().addClass('gameIconEncounter');

        html.find('.iconMenuSelectCharacter').parent().addClass('gameIconCowled');
        html.find('.iconMenuSkills').parent().addClass('gameIconD10');
        html.find('.iconMenuSpells').parent().addClass('gameIconSpells');

        //Visibility
        if (!game.user.isGM) {
            html.find('.iconMenuSelectCharacter').parent().hide();
            html.find('.iconMenuCombat').parent().hide();
        }

        //No combat
        const combat = aqActions.getCurrentCombat();
        if (!combat) {
            html.find('.iconMenuCombat').parent().append('<div class="_red"></div>');
            html.find('.iconMenuActions').parent().hide();
            html.find('.iconMenuEncounter').parent().hide();
        }

    }

    /**
     * playSkills
     */
    static async playSkills() {

    }

    /**
     * playCombat
     */
    static playCombat() {

        //Buttons
        const buttonActions = '<a class="combatWizardActionsButton buttonAction" data-tooltip="common.menuActions">'+
                                    '<div class="_wrapWButton wButtonAction"></div>'+
                                    '<div class="gameIconActions _gameIcon"></div></a>';
        const buttonEncounter = '<a class="combatWizardEncounterButton buttonAction" data-tooltip="common.menuEncounter">'+
                                    '<div class="_wrapWButton wButtonAction"></div>'+
                                    '<div class="gameIconEncounter _gameIcon"></div></a>';

        //No Combat
        const combat = aqActions.getCurrentCombat();
        const encounter = aqActions.getCurrentEncounter();

        if (!combat) {

            new Dialog({
                title: game.i18n.localize("common.wizard"),
                content: game.i18n.localize("info.noCombat"),
                buttons: { }
              }).render(true);

        } else {

            let content = '<h2>'+game.i18n.localize("title.combatGuide")+'</h2>';
            content += '<div class="_wizardCombat">';
            const sBad = '<div class="_bad"></div>';
            const sGood = '<div class="_good"></div>';
            const sExp = '<div class="_exp"></div>';

            //Combatants
            let sTitle = '<h2>'+game.i18n.localize('title.combatants')+'</h2>';
            if (Array.from(combat.combatants).length === 0) {
                content += '<div> <hbox class="_showMore">'+sBad+sTitle+'</hbox>';
                content += '<div class="_wInfo"><p>'+game.i18n.localize("info.noCombatant")+'</p></div> </div>';
            } else {
                content += '<hbox class="_showNoMore">'+sGood+sTitle+'</hbox>';
            }    
            
            //Initiative
            sTitle = '<h2>'+game.i18n.localize('title.initiative')+'</h2>';
            if ( (Array.from(combat.combatants).length === 0) || 
                 (Array.from(combat.combatants).find(e => !e.initiative)) ) {
                content += '<div> <hbox class="_showMore">'+sBad+sTitle+'</hbox>';
                content += '<div class="_wInfo"><p>'+game.i18n.localize("info.noInitiative")+'</p></div> </div>';
            } else {
                content += '<hbox class="_showNoMore">'+sGood+sTitle+'</hbox>';
            }            
                 
            //Declaring Actions
            sTitle = '<h2>'+game.i18n.localize('title.actions')+'</h2>';
            let noActionsChars = '';
            Array.from(combat.combatants).map(combatant => {
                const tokenId = combatant.actor.isToken ? combatant.actor.token.id : null;
                const mActions = aqActions.getActions(combatant.actor.id, tokenId);
                if (mActions.length === 0) {
                    if (noActionsChars === '') noActionsChars = combatant.actor.name;
                                          else noActionsChars += ', '+combatant.actor.name;
                }
            });
            if ( (noActionsChars !== '') || 
                 (Array.from(combat.combatants).length === 0) ) {
                content += '<div> <hbox class="_showMore">'+sBad+sTitle+'</hbox>';
                content += '<div class="_wInfo"><p>'+game.i18n.localize("info.noActions1")+
                                '<b>'+noActionsChars+'</b><br/><br/>'+
                                game.i18n.localize("info.noActions2")+'</p>'+
                                buttonActions+'</div> </div>';
            } else {
                content += '<hbox class="_showNoMore">'+sGood+sTitle+'</hbox>';
            }

            //Sorting Actions
            sTitle = '<h2>'+game.i18n.localize('title.actionsSort')+'</h2>';
                content += '<div> <hbox class="_showMore">'+sExp+sTitle+'</hbox>';
                content += '<div class="_wInfo"><p>'+game.i18n.localize("info.orderActions1")+'</p>'+
                                buttonEncounter+
                                '<p>'+game.i18n.localize("info.orderActions2")+'</p>'+
                                '</div> </div>';
        
            //Playing actions
            sTitle = '<h2>'+game.i18n.localize('title.actionsPlay')+'</h2>';

            if ( (Array.from(combat.combatants).length === 0) ||
                 (noActionsChars !== '') || 
                 ((encounter) && 
                  (encounter.system.steps.find(e => !e.consumed))) ) {
                content += '<div> <hbox class="_showMore">'+sBad+sTitle+'</hbox>';
                content += '<div class="_wInfo"><p>'+game.i18n.localize("info.noActionsPlayed")+'</p></div> </div>';
            } else {
                content += '<hbox class="_showNoMore">'+sGood+sTitle+'</hbox>';
            }            

            //Conclusion
            sTitle = '<h2>'+game.i18n.localize('title.conclusion')+'</h2>';
            if ( sTitle !== 'a' ) {
                content += '<div> <hbox class="_showMore">'+sBad+sTitle+'</hbox>';
                content += '<div class="_wInfo">'+game.i18n.localize("info.noInitiative")+'</div> </div>';
            } else {
                content += '<hbox class="_showNoMore">'+sGood+sTitle+'</hbox>';
            }
            content += '</div>';

            let dialog = new Dialog({
                title: game.i18n.localize("common.wizard"),
                content: content,
                buttons: { 
                    encounter: {
                        label: game.i18n.localize("common.encounterView"),
                        callback: async (html, button) => {
                            HookCombat.onAQAction();
                        }
                    }
                }
             });
             dialog.options.classes = ['dialog', '_autoHeight'];
             dialog.render(true, {top: 30, left: 115});

        }
    }

    /**
     * playActions
     */
    static async playActions() {
        if (Array.from(game.combats).length === 0) return;

        const combat = aqActions.getCurrentCombat();
        let oButtons = {};
        Array.from(combat.combatants).map(combatant => {
            const uniqeId = combatant.actor.isToken ? combatant.actor.token.id : combatant.actor.id;
            const tokenId = combatant.actor.isToken ? combatant.actor.token.id : null;
            const mActions = aqActions.getActions(combatant.actor.id, tokenId);
            oButtons[uniqeId] = {
                label: combatant.actor.name,
                actions: mActions,
                img: combatant.actor.img,
                callback: async (html, button) => {
                    const uniqeId = button.currentTarget.classList[1];
                    const actor = (game.scenes.active.tokens.get(uniqeId)) ? 
                                    game.scenes.active.tokens.get(uniqeId).getActor() :
                                    game.actors.get(uniqeId);
                    actor.sheet._tabs[0].active = 'combat';
                    actor.sheet._tabs[2].active = 'combatActions';
                    actor.sheet.render(true);                                        
                }
            };
        });
        oButtons.final = {
            label: game.i18n.localize("common.encounterView"),
            callback: async (html, button) => {
                HookCombat.onAQAction();
            }
        };
        let dialog = new Dialog({
            title: game.i18n.localize("common.wizard"),
            content: "",
            buttons: oButtons }); 
        dialog.options.classes = ['dialog', '_actionsDialogsExpress'];
        await dialog.render(true);     
    }

    /**
     * targetActionsExpress
     * @param {*} dialog 
     * @param {*} element 
     * @param {*} content 
     */
    static targetActionsExpress(dialog, element, content) {
        const mButtons = dialog.data.buttons;
        for (const s in mButtons) {
            let actor = (game.scenes.active.tokens.get(s)) ? game.scenes.active.tokens.get(s).getActor()
                                                           : game.actors.get(s);


            const oButton = dialog.getData().buttons[s];
            if (s === 'final') {
                $(element).find('button[data-button="final"]').addClass('_finalButton');
            } else {
                const uniqeId = (actor.isToken) ? actor.token.id : actor.id;
                let button = $(element).find('button[data-button="'+uniqeId+'"]');                
                let sActions = '';
                oButton.actions.map(e => {
                    const action = actor.items.get(e.action);
                    sActions += '<li>'+action.name+'</li>';
                });          
                sActions = '<ul class="_action">'+sActions+'</ul>';  
                button.html('<vbox><hbox><img src="'+actor.img+'"/><label>'+actor.name+'</label></hbox>'+sActions+'</vbox>');
            }
        }
    }

    /**
     * playEncounter
     */
    static async playEncounter() {
        HookCombat.onAQAction();
    }    

}