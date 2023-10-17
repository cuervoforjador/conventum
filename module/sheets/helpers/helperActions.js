/**
 * Helpers for Actions
 */

import { helperSocket } from "../../helpers/helperSocket.js";
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
        const uniqeId = (actor.isToken) ? actor.token.id : actor.id;
        let oActions = {
            showPoster: false,
            showSkill: false,
            showMovement: false,
            showSkillValue: true,
            itsMyTurn: false,
            action: '',
            skillId: '',
            skill: null
        };

        let myActiveCombat = helperSheetCombat.myActiveCombat(actor);
        if (!myActiveCombat) return oActions;
        if (myActiveCombat.encounter.system.steps.length === 0) return oActions;

        let mStillActiveActions = myActiveCombat.encounter.system.steps.filter(e => !e.consumed);
        if (mStillActiveActions.length < 1) return oActions;

        if (mStillActiveActions[0].uniqeId === uniqeId) {
            oActions.action = actor.items.get(mStillActiveActions[0].action);
        }

        oActions.itsMyTurn = (oActions.action !== '');
        oActions.showPoster = oActions.itsMyTurn;

        //Skills
        oActions.showSkill = (oActions.action) ? oActions.action.system.skill.useSkill : false;
        if (oActions.action !== undefined) {
            
            if ((oActions.action !== '') &&
                (oActions.action.system.skill.skillAsCombat)) oActions.showSkill = false;

            oActions.skillId = (oActions.action) ? oActions.action.system.skill.skill : '';
            oActions.skill = (oActions.showSkill) ? 
                        game.packs.get('aquelarre.skills').get(oActions.action.system.skill.skill) :
                        null;

            //Movements
            if ((oActions.action) && (oActions.action !== '')) 
                oActions.showMovement = (oActions.action.system.type.movement);

            //Show Skill value
            if ((oActions.action) && (oActions.action !== '')) 
                oActions.showSkillValue = !(oActions.action.system.skill.autoSuccess);

        }

        return oActions;
    }

    /**
     * getTargets
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

            const actorId = ((target.document.actorId) &&
                             (target.document.actorId !== undefined) &&
                             (target.document.actorId != '')) ?
                                target.document.actorId : target.document._actor._id;
            const actor = game.actors.get(actorId);
            
            oTargets.targets.push({
                id: actor.id,
                name: actor.name,
                img: actor.img
            });
        });

        oTargets.showTargets = (oTargets.targets !== '');
        return oTargets;
    }

    /**
     * setLuck
     * @param {*} actor 
     */
    static async setLuck(actor) {
        const modeLuck = Array.from(await game.packs.get('aquelarre.modes'))
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
     * @param {*} bForce 
     */
    static async playMode(actor, mode, bForce) {
        if (mode.id === undefined) return;
        const bActive = (actor.system.modes.find(e => e === mode.id)) ? true : false;
        bForce = (!bForce) ? false : bForce;
        if ((bForce) && (bActive)) return;

        let mModes = [];
        if (bActive) {
            mModes = actor.system.modes.filter(e => e !== mode.id);
        } else {
            mModes = actor.system.modes;
            mModes.push(mode.id);
        }
        await helperSocket.update(actor, {system: { modes: mModes }});

        if ((!bActive) || (bForce)) this._applyActiveEffect(actor, mode);
                               else this._removeActiveEffect(actor, mode);
    }

    /**
     * removeMode
     * @param {*} actor 
     * @param {*} mode 
     * @param {*} bForce 
     */
    static async removeMode(actor, mode) {
        let mModes = actor.system.modes.filter(e => e !== mode.id);
        await helperSocket.update(actor, {system: { modes: mModes }});
        this._removeActiveEffect(actor, mode);
    }

    /**
     * modesWithoutLuck
     * @param {*} actor 
     */
    static async modesWithoutLuck(actor) {
        const modeLuck = Array.from(await game.packs.get('aquelarre.modes'))
                                .find(e => ( (e.system.control.world === actor.system.control.world)
                                          && (e.system.luck) ));
        return actor.system.modes.filter(e => e !== modeLuck.id);        
    }

    /**
     * _applyActiveEffect
     * @param {*} actor 
     * @param {*} mode 
     */
    static _applyActiveEffect(actor, mode) {
        if (!actor) return;
        let scene = Array.from(game.scenes).find(e => e.active);
        if (!scene) return;
        let token = Array.from(scene.tokens).find(e => e.actorId === actor.id);
        if (!token) return;

        actor.createEmbeddedDocuments('ActiveEffect', [{
            label: mode.name,
            icon: mode.img,
            //type: 'suppressed',
            effects: [],
            flags: {
                core: {
                    statusId: mode.system.effect
                }
            },
            transfer: false,       
            origin: token.uuid, //actor.sheet.token.uuid, //actor.uuid,
            disabled: false
        }]);

    }

    /**
     * _removeActiveEffect
     * @param {*} actor 
     * @param {*} mode 
     */
    static _removeActiveEffect(actor, mode) {
        for (let effect of Array.from(actor.effects).filter(e => e.label === mode.name)) {
            effect.delete();
        }
    }

}