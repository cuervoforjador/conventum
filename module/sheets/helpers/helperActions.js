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
            action: ''
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

}