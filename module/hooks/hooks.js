/**
 * Hooks...
 */

import { mainConfig } from "../config/mainConfig.js";
import { HookCompendium } from "./_hooksCompendium.js";
import { HookActor } from "./_hooksActor.js";
import { HookEvents } from "./_hooksEvents.js";
import { HookMessage } from "./_hooksMessage.js";
import { HookCombat } from "./_hooksCombat.js";
import { HookTours } from "./_hooksTours.js";
import { helperSocket } from "../helpers/helperSocket.js";


export class mainHooks {

    /**
     * Hooks definations...
     * @param {object} Hooks 
     */
    static init(Hooks) {

        Hooks.on("setup", () => this._setup());
        Hooks.on("renderCompendiumDirectory", (tab, element, info) => this._renderCompendiumDirectory(tab, element, info));        
        Hooks.on("renderCompendium", (compendium, element, collection) => this._renderCompendium(compendium, element, collection));
        Hooks.on("changeSidebarTab", (tab) => this._changeSidebarTab(tab));
        Hooks.on("renderItemSheet", (sheet, element, systemData) => this._renderItemSheet(sheet, element, systemData));
        Hooks.on("dropActorSheetData", (actor, sheet, item) => this._dropActorSheetData(actor, sheet, item));
        Hooks.on("renderDialog", (dialog, element, content) => this._renderDialog(dialog, element, content));
        Hooks.on("renderApplication", (options, element, content) => this._renderApplication(options, element, content));
        Hooks.on("getUserContextOptions", (element, content) => this._getUserContextOptions(element, content));
        Hooks.on("getCombatTrackerEntryContext", (html, options) => this._getCombatTrackerEntryContext(html, options));
        Hooks.on("renderCombatTracker", (tracker, html, options) => this._renderCombatTracker(tracker, html, options));
        Hooks.on("deleteCombat", (combat, render, sId) => this._deleteCombat (combat, render, sId));
        Hooks.on("preCreateItem", (oFrom, oTo, options, sId) => this._preCreateItem(oFrom, oTo, options, sId));
    }

    static _setup() {
        mainConfig.translateConfig();
        HookEvents.initialEvents();
        HookTours.initTour();    
        helperSocket.onReceived();    
    }

    static _renderCompendiumDirectory(tab, element, info) {
        HookCompendium._stylingLiCompendium(tab);
    }

    static _renderCompendium(compendium, element, collection) {
        HookCompendium._stylingCompendium(compendium);
        HookEvents.compendiumEvent();
    }

    static _changeSidebarTab(tab) {
        if ( tab.entryType === 'Compendium' ) {
            HookCompendium._stylingLiCompendium(tab);
            HookEvents.compendiumEvent();
        }
        if ( tab.tabName === 'combat' ) {
            HookCombat.changeCombatTabHtml(tab._element);
        }
    }

    static _renderItemSheet(sheet, element, systemData) {
        HookEvents.sheetInfoEvent();
        HookEvents.sheetPanelEvent();
    }

    static async _dropActorSheetData(actor, sheet, item) {
        if (item.type === 'Item') {
            const mO = item.uuid.split('.');
            const sType = mO[mO.length-2];
            
            //No Human Items...
            if (CONFIG.ExtendConfig.noHumanItems.find(e => e === sType)) {
                new Dialog({
                    title: game.i18n.localize("common.config"),
                    content: game.i18n.localize("info.noHumanAction"),
                    buttons: {}
                  }).render(true);                
                return;
            }

            if (sType === 'trait')
                await HookActor.addTrait(oItem, actor, sheet);
        }
    }

    static async _renderDialog(dialog, element, content) {

        //Creating
        if ( $(element).find('section form#document-create select[name="type"]').length > 0 )
            HookMessage.translateTypes(element);    

        //Rolling Message
            HookMessage.changeColorButton(element, dialog.data.world);

        //Targets Dialog
        if (element.hasClass('_targetDialogs'))
            HookCombat.targetDialogs(dialog, element, content);
    }

    static async _renderApplication(options, element, content) {
        //...
    }

    static async _getUserContextOptions(element, content) {
        HookCompendium.initCompendiums();
    }    

    static _getCombatTrackerEntryContext(html, options) {
        HookCombat.changeCombatTabHtml(html);
    }    

    static _renderCombatTracker(tracker, html, options) {
        HookCombat.changeCombatTabHtml(html);
    }

    static _deleteCombat(combat, render, sId) {
        HookCombat.deleteEncounter(combat.id);
    }

    static async _preCreateItem(oFrom, oTo, options, sId) {
        //...
    }
}