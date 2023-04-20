/**
 * Hooks...
 */

import { HookCompendium } from "./_hooksCompendium.js";

export class mainHooks {

    /**
     * Hooks definations...
     * @param {object} Hooks 
     */
    static init(Hooks) {

        /* COMPENDIUMS */
        Hooks.on("renderCompendiumDirectory", (tab, element, info) => this._renderCompendiumDirectory(tab, element, info));        
        Hooks.on("renderCompendium", (compendium, element, collection) => this._renderCompendium(compendium, element, collection));
        Hooks.on("changeSidebarTab", (tab) => this._changeSidebarTab(tab));
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

}