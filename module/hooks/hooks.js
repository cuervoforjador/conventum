/**
 * Hooks...
 */

import { mainConfig } from "../config/mainConfig.js";
import { HookCompendium } from "./_hooksCompendium.js";
import { HookActor } from "./_hooksActor.js";
import { HookEvents } from "./_hooksEvents.js";
import { HookHotBar } from "./_hooksHotBar.js";
import { HookMessage } from "./_hooksMessage.js";
import { HookCombat } from "./_hooksCombat.js";
import { HookTours } from "./_hooksTours.js";
import { mainMacros } from "../macros/mainMacros.js"
import { helperSocket } from "../helpers/helperSocket.js";
import { helperCusto } from "../helpers/helperCusto.js";
import { helperControls } from "../helpers/helperControls.js";
import { helperSprites } from "../helpers/helperSprites.js";
import { helperSheetArmor } from "../sheets/helpers/helperSheetArmor.js";
import { helperSheetHuman } from "../sheets/helpers/helperSheetHuman.js";


export class mainHooks {

    /**
     * Hooks definations...
     * @param {object} Hooks 
     */
    static init(Hooks) {

        Hooks.on("setup", () => this._setup());
        Hooks.on("ready", async () => this._ready());
        Hooks.on("getSceneControlButtons", (mScenes) => this._getSceneControlButtons(mScenes));
        Hooks.on("renderSceneControls", (controls, html, options) => this._renderSceneControls(controls, html, options));
        Hooks.on("renderHotbar", (element, html, options) => this._renderHotbar(element, html, options));
        Hooks.on("canvasReady", (canvas) => this._canvasReady(canvas));
        Hooks.on("renderCompendiumDirectory", (tab, element, info) => this._renderCompendiumDirectory(tab, element, info));        
        Hooks.on("renderCompendium", (compendium, element, collection) => this._renderCompendium(compendium, element, collection));
        Hooks.on("renderextendSheetHuman", (sheet, html, options) => this._renderextendSheetHuman(sheet, html, options));
        Hooks.on("changeSidebarTab", (tab) => this._changeSidebarTab(tab));
        Hooks.on("renderItemSheet", (sheet, element, systemData) => this._renderItemSheet(sheet, element, systemData));
        Hooks.on("dropActorSheetData", (actor, sheet, item) => this._dropActorSheetData(actor, sheet, item));
        Hooks.on("createItem", (item, options, sId) => this._createItem(item, options, sId));
        Hooks.on("createActor", (actor, options, sId) => this._createActor(actor, options, sId));
        Hooks.on("updateActor", (actor, stats, options, sId) => this._updateActor(actor, stats, options, sId));
        Hooks.on("renderActorSheet", (sheet, html, systemData) => this._renderActorSheet(sheet, html, systemData));
        Hooks.on("renderDialog", (dialog, element, content) => this._renderDialog(dialog, element, content));
        Hooks.on("renderApplication", (app, element, options) => this._renderApplication(app, element, options));
        Hooks.on("renderActorDirectory", (directory, element, options) => this._renderActorDirectory(directory, element, options));
        Hooks.on("getUserContextOptions", (element, content) => this._getUserContextOptions(element, content));
        Hooks.on("getCombatTrackerEntryContext", (html, options) => this._getCombatTrackerEntryContext(html, options));
        Hooks.on("createCombatant", (combatant, options, id) => this._createCombatant(combatant, options, id));
        Hooks.on("renderCombatTracker", (tracker, html, options) => this._renderCombatTracker(tracker, html, options));
        Hooks.on("createCombat", (combat, options, sId) => this._createCombat(combat, options, sId));
        Hooks.on("updateCombat", (combat, combatants, options, sId) => this._updateCombat(combat, combatants, options, sId));
        Hooks.on("updateCombatant", (combatant, initiative, options, sId) => this._updateCombatant(combatant, initiative, options, sId));
        Hooks.on("deleteCombat", (combat, render, sId) => this._deleteCombat(combat, render, sId));
        Hooks.on("preCreateItem", (oFrom, oTo, options, sId) => this._preCreateItem(oFrom, oTo, options, sId));
        Hooks.on("createToken", (document, options, sId) => this._createToken(document, options, sId));
        Hooks.on("createChatMessage", (message, options, sId) => this._createChatMessage(message, options, sId));
        Hooks.on("sightRefresh", async (layer) => this._sightRefresh(layer));
        Hooks.on("targetToken", (user, token, option) => this._targetToken(user, token, option));  
    }

    static _setup() {
        mainConfig.translateConfig();
        HookEvents.initialEvents(); 
        helperSocket.onReceived();    
    }

    static _ready() {
        HookTours.registerTours();   
        mainMacros.registerMacros();
        
        helperCusto.custoCSS();
    }

    static _getSceneControlButtons(mScenes) {
        helperControls.getSceneControlButtons(mScenes);
    }

    static _renderSceneControls(controls, html, options) {
        helperControls.renderSceneControls(controls, html, options);
    }

    static _renderHotbar(element, html, options) {
        HookActor.setCustoConfig();
        HookHotBar.custoHotBar(element, html, options);
    }

    static _canvasReady(canvas) {
        HookActor.setCustoConfig();
    }

    static _renderCompendiumDirectory(tab, element, info) {
        HookCompendium._stylingLiCompendium(tab);
    }

    static _renderCompendium(compendium, element, collection) {
        HookCompendium._stylingCompendium(compendium);
        HookEvents.compendiumEvent();
    }

    static _renderextendSheetHuman(sheet, html, options) {
        const bExpand = sheet.object.system.control.expand;
        if (!bExpand) {
            sheet.setPosition({width: 400, height: 650});
            sheet.element.find('.window-resizable-handle').hide();
            sheet.element.find('.window-content').addClass('_shrink');
        } else {
            if (sheet.position.width < 400)
                sheet.setPosition({width: 400});
            if (sheet.position.height < 600)
                sheet.setPosition({height: 600});
            
            sheet.element.find('.window-content').removeClass('_shrink');
            sheet.element.find('.window-resizable-handle').show();
        }
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
            const sType = (mO[0] === 'Compendium') ?
                                mO[mO.length-3] :
                                mO[mO.length-2];
            
            //No Human Items...
            if (CONFIG.ExtendConfig.noHumanItems.find(e => e === sType)) {

                //Exceptions: Skills in Shrink mode
                if ((!actor.system.control.expand) && (sType === 'skills')) return;

                new Dialog({
                    title: game.i18n.localize("common.config"),
                    content: game.i18n.localize("info.noHumanAction"),
                    buttons: {}
                  }).render(true);                
                return;
            }

            if (sType === 'trait')
                await HookActor.checkAddTrait(oItem, actor, sheet);
        }
    }

    static async _createItem(item, options, sId) {
        if (item.type === 'armor')
            await helperSheetArmor.addArmor(item);
        //if (item.type === 'trait')
            //...
        if ( (item.type === 'profession') &&
             ((item.parent) && (item.parent.type === 'human')) ) {
            
            await item.parent.sheet.close();
            await helperSheetHuman.addProfession(item, sId);      
            await item.parent.sheet.render(true);        
        }
            
    }

    static async _createActor(actor, options, sId) {
        HookActor.setPrototypeToken(actor);
    }

    static async _updateActor(actor, stats, options, sId) {
        //...
    }

    static _renderActorSheet(sheet, html, systemData) {
        
        //QuickBar
        if (systemData.systemData.quickBarPosition) {
            let hSheet = $('.app.window-app.conventum.sheet.actor');
            if (hSheet.length === 0) return;
            let posX = systemData.systemData.quickBarPosition.x - hSheet.position().left;
            let posY = systemData.systemData.quickBarPosition.y - hSheet.position().top;
            $('._quickBar').css({
            left: posX,
            top: posY
            });
        }

        //ImOnFire...
        const sBook = '';
        if ($(html).find('.tab.magic.active').length === 1) 
                HookActor.onFirePage(sheet);
           else HookActor.outFirePage(sheet);

        //Lens...
        if (game.settings.get('conventum', 'lens')) {
            sheet.setPosition({scale: 1.4});
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
        if (element.hasClass('_targetDialogsExpress'))
            HookCombat.targetDialogsExpress(dialog, element, content);      
        if (element.hasClass('_actionsDialogsExpress'))
            helperControls.targetActionsExpress(dialog, element, content);               
    }

    static async _renderApplication(app, element, options) {
        
    }

    static _renderActorDirectory(directory, element, options) {
        HookActor.renderActorDirectory(element);
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

    static _createCombat(combat, options, sId) {
        HookCombat.createEncounter();
    }

    static async _updateCombat(combat, combatants, options, sId) {
        HookCombat.createEncounter();
        await HookCombat.updateCombat(combat);
    }

    static async _createCombatant(combatant, options, id) {
        //await HookCombat.createEncounter();
    }

    static async _updateCombatant(combatant, initiative, options, sId) {
        if (!initiative.initiative)
            await HookCombat.resetInitiativeMod(combatant.actorId);
    }    

    static _deleteCombat(combat, render, sId) {
        HookCombat.deleteEncounter(combat.id);
    }

    static async _preCreateItem(oFrom, oTo, options, sId) {
        //...
    }

    static _createToken(document, options, sId) {
        if (document._source.actorId) {
            if (game.actors.get(document._source.actorId).system.control.criature) {
                document._source.actorLink = false;
            } else {
                document._source.actorLink = true;
            }
        }
    }

    static _createChatMessage(message, options, sId) {
        HookMessage.createChatMessage(message, options, sId);
    }

    static _sightRefresh(layer) {
        helperSprites.sightRefresh(layer);
    }

    static _targetToken(user, token, option) {
        if (!option) return;
        
        helperSprites.stylingToken(token);
    }

}