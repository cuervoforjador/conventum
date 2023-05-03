/**
 * Hooks...
 */

import { HookCompendium } from "./_hooksCompendium.js";
import { HookActor } from "./_hooksActor.js";
import { HookEvents } from "./_hooksEvents.js";
import { HookMessage } from "./_hooksMessage.js";
import { HookTours } from "./_hooksTours.js";

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
        
    }

    static _setup() {
        HookEvents.initialEvents();
        HookTours.initTour();
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
    }

    static _renderItemSheet(sheet, element, systemData) {
        HookEvents.sheetInfoEvent();
        HookEvents.sheetPanelEvent();
    }

    static async _dropActorSheetData(actor, sheet, item) {
        if (item.type === 'Item') {
            let oItem = game.items.get(item.uuid.split('.')[1]);
            if (oItem.type === 'trait')
                await HookActor.addTrait(oItem, actor, sheet);
        }
    }

    static async _renderDialog(dialog, element, content) {
        HookMessage.changeColorButton(element, dialog.data.world);
    }

}