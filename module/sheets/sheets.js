import { extendActor } from "./extendActor.js";
import { extendItem } from "./extendItem.js";
import { extendSheetHuman } from "./sheets/extendSheetHuman.js";
import { extendSheetWorld } from "./sheets/extendSheetWorld.js";
import { extendSheetSociety } from "./sheets/extendSheetSociety.js";
import { extendSheetKingdom } from "./sheets/extendSheetKingdom.js";
import { extendSheetLanguage } from "./sheets/extendSheetLanguage.js";
import { extendSheetCulture } from "./sheets/extendSheetCulture.js";
import { extendSheetStratum } from "./sheets/extendSheetStratum.js";
import { extendSheetStatus } from "./sheets/extendSheetStatus.js";
import { extendSheetSkill } from "./sheets/extendSheetSkill.js";
import { extendSheetTrait } from "./sheets/extendSheetTrait.js";
import { extendSheetLocation } from "./sheets/extendSheetLocation.js";
import { extendSheetMode } from "./sheets/extendSheetMode.js";
import { extendSheetArmor } from "./sheets/extendSheetArmor.js";
import { extendSheetWeapon } from "./sheets/extendSheetWeapon.js";
import { extendSheetSpell } from "./sheets/extendSheetSpell.js";
import { extendSheetRitual } from "./sheets/extendSheetRitual.js";
import { extendSheetComponent } from "./sheets/extendSheetComponent.js";
import { extendSheetAction } from "./sheets/extendSheetAction.js";
import { extendSheetActionPool } from "./sheets/extendSheetActionPool.js";
import { extendSheetItem } from "./sheets/extendSheetItem.js";
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
        Actors.registerSheet(_system, extendSheetHuman, { types: [
                                                                "human",
                                                                "horse",
                                                                "humanoid",
                                                                "quadruped",
                                                                "birds",
                                                                "arachnid",
                                                                "snakes",
                                                                "arboreal",
                                                                "wingedHumanoid",
                                                                "wingedQuadruped",
                                                                "blemys",
                                                                "bafometo",
                                                                "sciopodo",
                                                                "snakeHumanoid",
                                                                "basilisk"
                                                            ], 
                                                            makeDefault: true });


        //Items
        CONFIG.Item.documentClass = extendItem;
        Items.unregisterSheet("core", ItemSheet);
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
        Items.registerSheet(_system, extendSheetStratum, { types: ['stratum'],
                                                         makeDefault: true });                                                                                                       
        Items.registerSheet(_system, extendSheetStatus, { types: ['status'],
                                                         makeDefault: true });        
        Items.registerSheet(_system, extendSheetSkill, { types: ['skill'],
                                                         makeDefault: true });
        Items.registerSheet(_system, extendSheetTrait, { types: ['trait'],
                                                         makeDefault: true });
        Items.registerSheet(_system, extendSheetLocation, { types: ['location'],
                                                         makeDefault: true });
        Items.registerSheet(_system, extendSheetMode, { types: ['mode'],
                                                         makeDefault: true });                                                             
        Items.registerSheet(_system, extendSheetArmor, { types: ['armor'],
                                                         makeDefault: true });
        Items.registerSheet(_system, extendSheetWeapon, { types: ['weapon'],
                                                         makeDefault: true });
        Items.registerSheet(_system, extendSheetSpell, { types: ['spell'],
                                                         makeDefault: true });   
        Items.registerSheet(_system, extendSheetRitual, { types: ['ritual'],
                                                         makeDefault: true });                                                           
        Items.registerSheet(_system, extendSheetComponent, { types: ['component'],
                                                         makeDefault: true });                                                                                                                  
        Items.registerSheet(_system, extendSheetAction, { types: ['action'],
                                                         makeDefault: true });       
        Items.registerSheet(_system, extendSheetActionPool, { types: ['actionPool'],
                                                         makeDefault: true });    
        Items.registerSheet(_system, extendSheetItem, { types: ['item'],
                                                         makeDefault: true });                                                                                                                                                                     
    }
}