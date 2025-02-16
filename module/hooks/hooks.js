
import { HookEvents } from "./hooksEvents.js";
import { helperControls } from "../helpers/helperControls.js";
import { helperCombat } from "../helpers/helperCombat.js";
import { helperSheets } from "../helpers/helperSheets.js";
import { helperSocket } from "../helpers/helperSocket.js";
import { helperWeapon } from "../helpers/helperWeapon.js";
import { helperArmor } from "../helpers/helperArmor.js";
import { helperMagic } from "../helpers/helperMagic.js";
import { helperBackend } from "../helpers/helperBackend.js";
import { helperFolders } from "../helpers/helperFolders.js";
import { helperMessages } from "../helpers/helperMessages.js";
import { helperUtils } from "../helpers/helperUtils.js";
import { helperTour } from "../helpers/helperTour.js";
import { helperTokens } from "../helpers/helperTokens.js";


/**
 * Hooks...
 */
export class mainHooks {

    /**
     * Hooks definations...
     * @param {object} Hooks 
     */
    static init(Hooks) {

        /* INITIAL */
        Hooks.on("setup", () => this._setup());
        Hooks.on("ready", async () => this._ready());
        Hooks.on("getSceneControlButtons", this._getSceneControlButtons);
        Hooks.on("renderSceneControls", this._renderSceneControls);

        /** SHEETS */
        Hooks.on("renderActorSheet", this._renderActorSheet);

        /** ACTORS */
        Hooks.on("preCreateActor", this._preCreateActor);
        Hooks.on("createActor", this._createActor);         

        /* ITEMS */
        Hooks.on("createItem", this._createItem);
        Hooks.on("deleteItem", this._deleteItem);
        Hooks.on("renderDocumentDirectory", this._renderDocumentDirectory);
        
        /* COMBAT */
        Hooks.on("createCombat", this._createCombat);
        Hooks.on("deleteCombat", this._deleteCombat);
        Hooks.on("createCombatant", this._createCombatant);
        Hooks.on("deleteCombatant", this._deleteCombatant);
        
        /* DIALOGS */
        Hooks.on("renderDialog", this._renderDialog);
        Hooks.on("renderApplication", this._renderApplication);

        /* MESSAGES */
        Hooks.on("preCreateChatMessage", this._preCreateChatMessage);

        /* COMPENDIUM, DIRECTORIES, ... */
        Hooks.on("renderDirectoryApplication", this._renderDirectoryApplication);
        
        /* TOKENS */
        Hooks.on("refreshToken", this._refreshToken);

    }

    /**
     * _setup
     */
    static _setup() {
        helperSocket.onReceived();
    }

    /**
     * _ready
     */
    static _ready() {
        HookEvents.initialEvents();        
        $('body').addClass('_'+helperUtils.getRules());
        helperTour.initTours();

    }

    /**
     * _getSceneControlButtons
     * @param {*} mScenes 
     */
    static _getSceneControlButtons(mScenes) {
        helperControls.getSceneControlButtons(mScenes);
    }

    /**
     * _renderSceneControls
     * @param {*} controls 
     * @param {*} html 
     * @param {*} options 
     */
    static _renderSceneControls(controls, html, options) {
        helperControls.renderSceneControls(controls, html, options);
    }

    /**
     * _renderActorSheet
     */
    static _renderActorSheet(options, element, context) {
        $(element).addClass('rules_'+game.settings.get(game.system.id,'rules'));
    }

    /**
     * _preCreateActor
     * @param {*} actor 
     * @param {*} options 
     * @param {*} type 
     * @param {*} id 
     */
    static _preCreateActor(actor, options, type, id) {

    }

    /**
     * _createActor
     * @param {*} actor 
     * @param {*} options 
     * @param {*} id 
     */
    static _createActor(actor, options, id) {

        //Actor Link
        actor.prototypeToken.update({"actorLink": true}, {render: false});
    }


    /**
     * _createItem
     * @param {*} item 
     * @param {*} options 
     * @param {*} id 
     */
    static _createItem(item, options, id) {

        //Adding new Professions... 
        if (item.type === "loreProfession" && item.parent?.type == "human")
            helperSheets.addingProfession(item);

        //Adding traits...
        if (item.type === "trait" && item.parent?.type == "human")
            helperSheets.addingTrait(item);        

        //Adding books...
        if (item.type === "book" && item.parent?.type == "human")
            helperSheets.addingBook(item);                
    }

    /**
     * _deleteItem
     * @param {*} item 
     * @param {*} options 
     * @param {*} id 
     */
    static _deleteItem(item, options, id) {
        if (item.type === 'encounter')
                helperCombat.postDeleteEncounter(item);
    }

    /**
     * _renderDocumentDirectory
     * @param {*} directory 
     * @param {*} element 
     * @param {*} options 
     */
    static _renderDocumentDirectory(directory, element, options) {
        //...
    }

    /**
     * _createCombat
     * @param {*} combat 
     * @param {*} options 
     * @param {*} id 
     */
    static _createCombat(combat, options, id) {
        helperCombat.dialogCreateCombat(combat);
    }

    /**
     * _deleteCombat
     * @param {*} combat 
     * @param {*} options 
     * @param {*} id 
     */
    static _deleteCombat(combat, options, id) {
        helperCombat.postDeleteCombat(combat);
    }

    /**
     * _createCombatant
     * @param {*} combatant 
     * @param {*} options 
     * @param {*} id 
     */
    static _createCombatant(combatant, options, id) {
        helperCombat.postCreateCombatant(combatant);
    }

    /**
     * _deleteCombatant
     * @param {*} combatant 
     * @param {*} options 
     * @param {*} id 
     */
    static _deleteCombatant(combatant, options, id) {
        helperCombat.postDeleteCombatant(combatant);
    }

    /**
     * _renderDialog
     * @param {*} dialog 
     * @param {*} element 
     * @param {*} options 
     */
    static _renderDialog(dialog, element, options) {
        if ( element.hasClass('dialogWeapon') ) helperWeapon.handler(dialog, element, options);
        if ( element.hasClass('dialogArmor') ) helperArmor.handler(dialog, element, options);
        if ( element.hasClass('dialogSpells') ) helperMagic.handler(dialog, element, options);
    }

    /**
     * _renderApplication
     * @param {*} appDocument 
     * @param {*} element 
     * @param {*} options 
     */
    static _renderApplication(appDocument, element, options) {

        //Dialogs...
        if (element.hasClass('dialog')) {

            //New elements...
            if ($(options.content).attr('id') === 'document-create') {

                let options = element.find('select[name="type"] option');

                //Changing names...
                options.each(function(i, e) {
                    $(e).text(game.i18n.localize("entity."+$(e).val()))
                }.bind(this));

                //Sorting...
                options.detach().sort(function(a, b) {
                    let at = $(a).text();
                    let bt = $(b).text();
                    return (at > bt) ? 1 : ((at < bt) ? -1 : 0);
                });
                options.appendTo('select[name="type"]');            
            }

        }

    }

    /**
     * _renderDirectoryApplication
     * @param {*} directory 
     * @param {*} html 
     * @param {*} options 
     */
    static async _renderDirectoryApplication(directory, html, options) {
        
        await helperFolders.checkTraits(directory, html, options);
    }

    /**
     * _preCreateChatMessage
     * @param {*} chatMessage 
     * @param {*} options 
     * @param {*} id 
     */
    static _preCreateChatMessage(chatMessage, content, options, id) {
        content.content = helperMessages.addFrame(content.content);
        chatMessage.content = content.content;
        chatMessage.updateSource({content: content.content});
    }

    /**
     * _refreshToken
     * @param {*} token 
     * @param {*} options 
     */
    static _refreshToken(token, options) {
        helperTokens.styleToken(token);
    }

}