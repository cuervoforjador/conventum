/**
 * Hooks...
 */

import { HookCompendium } from "./_hooksCompendium.js";
import { HookEvents } from "./_hooksEvents.js";

export class mainHooks {

    /**
     * Hooks definations...
     * @param {object} Hooks 
     */
    static init(Hooks) {

        Hooks.on("renderCompendiumDirectory", (tab, element, info) => this._renderCompendiumDirectory(tab, element, info));        
        Hooks.on("renderCompendium", (compendium, element, collection) => this._renderCompendium(compendium, element, collection));
        Hooks.on("changeSidebarTab", (tab) => this._changeSidebarTab(tab));
        Hooks.on("renderItemSheet", (sheet, element, systemData) => this._renderItemSheet(sheet, element, systemData));
    }

    static _renderCompendiumDirectory(tab, element, info) {
        HookCompendium._stylingLiCompendium(tab);
    }

    static _renderCompendium(compendium, element, collection) {
        HookCompendium._stylingCompendium(compendium);
    }

    static _changeSidebarTab(tab) {
        if ( tab.entryType === 'Compendium' ) {
            HookCompendium._stylingLiCompendium(tab);
        }
    }

    static _renderItemSheet(sheet, element, systemData) {
        HookEvents._sheetInfoEvent();
    }

}