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

    /**
     * onFirePage
     * @param {*} sheet 
     */
    static onFirePage(sheet) {
        $('#'+sheet.element[0].id+" .window-content").prepend('<div class="_imOnFire"></div>');
        $('#'+sheet.element[0].id+" form.codex").css({'z-index': 1,
                                                      'background-image': 'none'});
        $('#'+sheet.element[0].id+" ._humanAction").css({'transition': '0s'});
        $('#'+sheet.element[0].id+" ._humanAction").addClass('_reduce');      
        $('#'+sheet.element[0].id+" ._humanTargets").css({'transition': '0s'});
        $('#'+sheet.element[0].id+" ._humanTargets").addClass('_reduce');
    }

    /**
     * outFirePage
     * @param {*} sheet 
     */
    static outFirePage(sheet) {
        const sFrame = 'systems/conventum/image/frame/'+sheet.actor.system.control.frame+'/paper.png';
        $('#'+sheet.element[0].id+" .window-content ._imOnFire").remove();   
        $('#'+sheet.element[0].id+" form.codex").css({'background': 'url('+sFrame+')',
                                                      'z-index': 'initial'});            
        $('#'+sheet.element[0].id+" ._humanAction").css({'transition': '0.6s'});
        $('#'+sheet.element[0].id+" ._humanAction").removeClass('_reduce');
        $('#'+sheet.element[0].id+" ._humanTargets").css({'transition': '0.6s'});
        $('#'+sheet.element[0].id+" ._humanTargets").removeClass('_reduce');         
    }

    /**
     * setPrototypeToken
     * @param {*} actor 
     */
    static setPrototypeToken(actor) {
        actor.update({
            prototypeToken: {actorLink: true}
        });
    }

}