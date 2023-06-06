/**
 * Helpers for Actions
 */

import { mainUtils } from "../../mainUtils.js";
import { helperMessages } from "./helperMessages.js";
import { helperSheetCombat } from "./helperSheetCombat.js"

export class helperActions {

    /**
     * getActions
     * @param {*} actor 
     * @returns 
     */
    static getActions(actor) {
        let oActions = {
            showPoster: false,
            showSkill: false,
            action: '',
            skillId: '',
            skill: null
        };

        let myActiveCombat = helperSheetCombat.myActiveCombat(actor);
        if (!myActiveCombat) return oActions;
        if (myActiveCombat.encounter.system.steps.length === 0) return oActions;

        let mStillActiveActions = myActiveCombat.encounter.system.steps.filter(e => !e.consumed);
        if (mStillActiveActions.length < 1) return oActions;

        if (mStillActiveActions[0].actor === actor.id) {
            oActions.action = actor.items.get(mStillActiveActions[0].action);
        }

        oActions.showPoster = (oActions.action !== '');

        //Skills
        oActions.showSkill = (oActions.action) ? oActions.action.system.skill.useSkill : false;
        oActions.skillId = (oActions.action) ? oActions.action.system.skill.skill : '';
        oActions.skill = (oActions.showSkill) ? 
                    game.packs.get('conventum.skills').get(oActions.action.system.skill.skill) :
                    null;

        return oActions;
    }

    /**
     * getActions
     * @param {*} actor 
     * @returns 
     */
    static getTargets(actor) {
        let oTargets = {
            showTargets: false,
            targets: ''
        };

        const mTargets = Array.from(game.user.targets);
        if (mTargets.length === 0) return oTargets;

        oTargets.targets = [];
        mTargets.forEach(target => {
            oTargets.targets.push({
                id: target.document._actor._id,
                name: target.document._actor.name,
                img: target.document._actor.img
            });
        });

        oTargets.showTargets = (oTargets.targets !== '');
        return oTargets;
    }

    /**
     * playMode
     * @param {*} actor 
     * @param {*} mode 
     */
    static playMode(actor, mode) {

        //--- LUCK ---
        if (mode.system.luck) {
            this.playLuck(actor, mode);
            return;
        }

        this.playMode(actor, mode);
        return;
    }

    /**
     * setLuck
     * @param {*} actor 
     */
    static async setLuck(actor) {
        const modeLuck = Array.from(await game.packs.get('conventum.modes'))
                                .find(e => ( (e.system.control.world === actor.system.control.world)
                                          && (e.system.luck) ));
        if (!modeLuck) return;
        this.playMode(actor, modeLuck);
    }

    /**
     * playLuck
     * @param {*} actor 
     * @param {*} mode 
     */
    static async playLuck(actor, mode) {
        this.playMode(actor, mode);
    }

    /**
     * playMode
     * @param {*} actor 
     * @param {*} mode 
     */
    static async playMode(actor, mode) {
        const bActive = (actor.system.modes.find(e => e === mode.id)) ? true : false;
        
        let mModes = [];
        if (bActive) {
            mModes = actor.system.modes.filter(e => e !== mode.id);
        } else {
            mModes = actor.system.modes;
            mModes.push(mode.id);
        }
        await actor.update({system: { modes: mModes }});
        actor.sheet.render(true);
    }    

}