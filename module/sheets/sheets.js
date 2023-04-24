import { extendActor } from "./extendActor.js";
import { extendItem } from "./extendItem.js";
import { extendSheetHuman } from "./sheets/extendSheetHuman.js";
import { extendSheetWorld } from "./sheets/extendSheetWorld.js";
<<<<<<< HEAD
import { extendSheetKingdom } from "./sheets/extendSheetKingdom.js";
=======
import { extendSheetSociety } from "./sheets/extendSheetSociety.js";
import { extendSheetKingdom } from "./sheets/extendSheetKingdom.js";
import { extendSheetLanguage } from "./sheets/extendSheetLanguage.js";
import { extendSheetCulture } from "./sheets/extendSheetCulture.js";
>>>>>>> 48ae91f0c39a0c8e5746703da684780f1db7deaf
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
<<<<<<< HEAD
        Items.registerSheet(_system, extendSheetWorld, { types: ['world'], 
                                                         makeDefault: true });
        Items.registerSheet(_system, extendSheetKingdom, { types: ['kingdom'], 
                                                         makeDefault: true });                                                                
        Items.registerSheet(_system, extendSheetSkill, { types: ['skill'], 
                                                         makeDefault: true });        
=======
        Items.registerSheet(_system, extendSheetWorld, { types: ['world'],
                                                         makeDefault: true });
        Items.registerSheet(_system, extendSheetSociety, { types: ['society'],
                                                         makeDefault: true });
        Items.registerSheet(_system, extendSheetKingdom, { types: ['kingdom'],
                                                         makeDefault: true });
        Items.registerSheet(_system, extendSheetLanguage, { types: ['language'],
                                                         makeDefault: true });
        Items.registerSheet(_system, extendSheetCulture, { types: ['culture'],
                                                         makeDefault: true });                                                    
        Items.registerSheet(_system, extendSheetSkill, { types: ['skill'],
                                                         makeDefault: true });
>>>>>>> 48ae91f0c39a0c8e5746703da684780f1db7deaf

    }
}