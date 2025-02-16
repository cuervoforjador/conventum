import { extendActor } from "./extendActor.js";
import { extendItem } from "./extendItem.js";
import { extendSheetHuman } from "./extendSheetHuman.js";
import { extendSheetItem } from "./extendSheetItem.js";
import { extendSheetSkill } from "./extendSheetSkill.js";
import { extendSheetTrait } from "./extendSheetTrait.js";
import { extendSheetAction } from "./extendSheetAction.js";
import { extendSheetWeapon } from "./extendSheetWeapon.js";
import { extendSheetArmor } from "./extendSheetArmor.js";
import { extendSheetSpell } from "./extendSheetSpell.js";
import { extendSheetBook } from "./extendSheetBook.js";
import { extendLoreKingdom } from "./extendLoreKingdom.js";
import { extendLoreNation } from "./extendLoreNation.js";
import { extendLorePosition } from "./extendLorePosition.js";
import { extendLoreProfession } from "./extendLoreProfession.js";
import { extendLoreSociety } from "./extendLoreSociety.js";
import { extendLoreStratum } from "./extendLoreStratum.js";

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
        Items.registerSheet(_system, extendSheetSkill, { types: ['skill'],
                                                        makeDefault: true });
        Items.registerSheet(_system, extendSheetTrait, { types: ['trait'],
                                                        makeDefault: true });                                                        
        Items.registerSheet(_system, extendSheetAction, { types: ['action'],
                                                        makeDefault: true });    
        Items.registerSheet(_system, extendSheetWeapon, { types: ['weapon'],
                                                        makeDefault: true });   
        Items.registerSheet(_system, extendSheetArmor, { types: ['armor'],
                                                        makeDefault: true });     
        Items.registerSheet(_system, extendSheetSpell, { types: ['spell'],
                                                        makeDefault: true });  
        Items.registerSheet(_system, extendSheetBook, { types: ['book'],
                                                        makeDefault: true });                                                                                                                                                                                                                                                                                     
        Items.registerSheet(_system, extendSheetItem, { types: ['item'],
                                                        makeDefault: true });
        Items.registerSheet(_system, extendLoreKingdom, { types: ['loreKingdom'],
                                                        makeDefault: true }); 
        Items.registerSheet(_system, extendLoreNation, { types: ['loreNation'],
                                                        makeDefault: true });                                                                                                                    
        Items.registerSheet(_system, extendLorePosition, { types: ['lorePosition'],
                                                        makeDefault: true }); 
        Items.registerSheet(_system, extendLoreProfession, { types: ['loreProfession'],
                                                        makeDefault: true });                                                                                                                    
        Items.registerSheet(_system, extendLoreSociety, { types: ['loreSociety'],
                                                        makeDefault: true }); 
        Items.registerSheet(_system, extendLoreStratum, { types: ['loreStratum'],
                                                        makeDefault: true });                                                                                                                    

    }
}