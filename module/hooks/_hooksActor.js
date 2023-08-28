/**
 * ACTOR
 */

import { helperSocket } from "../helpers/helperSocket.js";
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
            prototypeToken: {actorLink: !actor.system.control.criature}
        });
    }

    /**
     * dragOverMount    
     * @param {*} sActor1Id 
     * @param {*} sActor2Id 
     */
    static dragOverMount(sActor1Id, sActor2Id) {
        const result = this._riderMount(sActor1Id, sActor2Id);
        return (result !== false);
    }

    /**
     * mount
     * @param {*} actor1 
     * @param {*} actor2 
     */
    static async mount(actor1, actor2) {
        const result = this._riderMount(actor2.id, actor1.id);
        if (!result) return;

        let mNoMount = Array.from(game.actors).filter(e => e.system.equipment.mount === result.mount.id);
        if (mNoMount.length > 0 ) {
            for (let o of mNoMount) {
                await o.update({ 
                    system: { equipment: { mount: '' }}
                });
            }
        }
        await result.rider.update({
            system: {equipment: { mount: result.mount.id }}
        });        
        helperSocket.refreshSheets();
        helperSocket.refreshActorsDirectory();
    }

    /**
     * _riderMount
     * @param {*} sActor1Id 
     * @param {*} sActor2Id 
     * @returns 
     */
    static _riderMount(sActor1Id, sActor2Id) {
        const actor1 = game.actors.get(sActor1Id);
        if (!actor1) return false;
        const actor2 = game.actors.get(sActor2Id);
        if (!actor2) return false;        

        let rider = null;
        let mount = null;
        if (actor2.system.control.mount) mount = actor2;
        if (!actor1.system.control.mount) rider = actor1;
        if ((!mount) || (!rider)) return false;
        return {
            rider: rider,
            mount: mount
        };
    }    

    /**
     *renderActorDirectory
     * @param {*} element 
     */
    static renderActorDirectory(element) {
        $(element).find('li.actor').each(function (i,e) {
            const actorId = $(e).data('documentId');
            const actor = game.actors.get(actorId);
            if ((actor) && (actor.system.equipment.mount !== '')) {
                const mount = game.actors.get(actor.system.equipment.mount);
                $(e).append('<div class="_mountedCircle">'+
                                '<img src="'+mount.img+'" />'+
                            '</div>');
            } else {
                $(e).remove('._mountedCircle');
            }
            
        });
    }

}