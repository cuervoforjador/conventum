/**
 * ACTOR
 */

import { mainUtils } from "../mainUtils.js";
import { mainBackend } from "../sheets/backend/mainBackend.js";

export class HookActor {

    /**
     * setCustoConfig       NO ASYNC !!!!
     */
    static setCustoConfig() {
        const myActors = Array.from(game.actors).filter(e => e.ownership[game.user.id] === 3);
        let myCustoConfig = {
            myFirstActorId: (myActors.length > 0) ? myActors[0].id : null,
            myFrame: ((myActors.length > 0) && (myActors[0].system.control.frame !== '')) ?
                "/systems/conventum/image/frame/"+myActors[0].system.control.frame+"/macro.png" :
                "/systems/conventum/image/frame/standard/macro.png"
        };
        CONFIG.custo = myCustoConfig;
    }

    /**
     * Adding Trait to Character
     * @param {*} item 
     * @param {*} actor 
     * @param {*} sheet 
     */
    static async checkAddTrait(actor) {
        
        //Characters playing not yet
        if (actor.system.control.initial) {
            ui.notifications.warn(game.i18n.localize('info.traitActorInitial'));
        }        
    }


}