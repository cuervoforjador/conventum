/**
 * ACTOR
 */

import { mainUtils } from "../mainUtils.js";
import { mainBackend } from "../sheets/backend/mainBackend.js";

export class HookActor {

    /**
     * Adding Trait to Character
     * @param {*} item 
     * @param {*} actor 
     * @param {*} sheet 
     */
    static async addTrait(item, actor, sheet) {
        
        //Characters playing not yet
        if (actor.system.control.initial) {
            ui.notifications.warn(game.i18n.localize('info.traitActorInitial'));
        }

        //Combat Skills
        if (item.system.mod.combatSkill.apply) {
            let combatSkills = (await mainBackend._getDocuments('skills', item.system.control.world))
                                                .filter(e => e.system.combat.combat);
            var a = 1;
        }
        
    }


}