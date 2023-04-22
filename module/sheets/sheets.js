import { extendActor } from "./extendActor.js";
import { extendItem } from "./extendItem.js";
import { extendSheetHuman } from "./sheets/extendSheetHuman.js";
import { extendSheetWorld } from "./sheets/extendSheetWorld.js";
import { extendSheetKingdom } from "./sheets/extendSheetKingdom.js";
import { extendSheetSkill } from "./sheets/extendSheetSkill.js";
export class mainGameSheets {

    /**
     * registerSheets
     * @param {*} Actors 
     * @param {*} Items 
     */
    static registerSheets(Actors, Items) {

        const _system = game.system.id;

        //Actors
        CONFIG.Actor.documentClass = extendActor;
        Actors.unregisterSheet("core", ActorSheet);
        Actors.registerSheet(_system, extendSheetHuman, { types: ['human'], 
                                                          makeDefault: true });

        //Items
        CONFIG.Item.documentClass = extendItem;
        Items.unregisterSheet("core", ItemSheet);
        Items.registerSheet(_system, extendSheetWorld, { types: ['world'], 
                                                         makeDefault: true });
        Items.registerSheet(_system, extendSheetKingdom, { types: ['kingdom'], 
                                                         makeDefault: true });                                                                
        Items.registerSheet(_system, extendSheetSkill, { types: ['skill'], 
                                                         makeDefault: true });        

    }
}