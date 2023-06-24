import { helperMessages } from "../sheets/helpers/helperMessages.js";
import { helperActions } from "../sheets/helpers/helperActions.js";
import { helperRolls } from "../sheets/helpers/helperRolls.js";
import { helperSheetArmor } from "../sheets/helpers/helperSheetArmor.js";
import { helperSheetMagic } from "../sheets/helpers/helperSheetMagic.js";
import { helperSocket } from "../helpers/helperSocket.js";
import { helperSheetHuman } from "../sheets/helpers/helperSheetHuman.js";
import { helperSheetCombat } from "../sheets/helpers/helperSheetCombat.js";

export class aqActions {


// --- COMBATS --- -----------------------------------------------------------------------------------------------------

    /**
     * getCurrentCombat
     */
    static getCurrentCombat() {
        const currentScene = Array.from(game.scenes).find(e => e.id === game.user.viewedScene);
        if (!currentScene) return null;
        let combat = Array.from(game.combats).find(e => 
                                ((e._source.scene === game.user.viewedScene) && (e.active)) );
        if (combat) return combat;
        return null;
    }  

    /**
     * getMyCurrentCombat
     * @param {*} actorId 
     * @returns 
     */
    static getMyCurrentCombat(actorId) {
        const combat = this.getCurrentCombat();
        if (!combat) return;

        const myCombatant = Array.from(combat.combatants).find(e => (e.actorId === actorId));
        if (!myCombatant) return;

        return combat;
    }

    /**
     * getMyCombats
     * @param {*} actorId 
     * @returns 
     */
    static getMyCombats(actorId) {
        return Array.from(game.combats).filter( e => Array.from(e.combatants)
                                                        .find(d => (d.actorId === actorId)) );
    }    

// --- ENCOUNTERS --- -----------------------------------------------------------------------------------------------------

    /**
     * getCurrentEncounter
     */
    static getCurrentEncounter() {
        const combat = this.getCurrentCombat();
        if (!combat) return;
        return game.items.filter(e => e.type === 'actionPool')
                         .find( e => e.system.combat === combat._id );               
    } 

    /**
     * getMyCurrentEncounter
     * @param {*} actorId 
     * @returns 
     */
    static getMyCurrentEncounter(actorId) {
        const myCombat = this.getMyCurrentCombat(actorId);
        if (!myCombat) return;
        return game.items.filter(e => e.type === 'actionPool')
                         .find( e => e.system.combat === myCombat._id );
    }

    /**
     * getMyEncounters
     * @param {*} actorId 
     * @returns 
     */
    static getMyEncounters(actorId) {

        const mCombats = this.getMyCombats(actorId);
        if (mCombats.length === 0) return;

        let mReturn = [];
        mCombats.forEach( combat => {
            const encounter = game.items.filter(e => e.type === 'actionPool')
                                        .find( e => e.system.combat === combat._id );
            if (!encounter) return;
            mReturn.push(encounter);
        });
        return mReturn;   
    }    

    /**
     * getCurrentEncounterSteps
     * @param {*} bNoConsumed (optional) - Only no consumed steps
     * @param {*} actorId     (optional) - Returns Null if Actor isnt in the encounter
     * @returns 
     */
    static getCurrentEncounterSteps(bNoConsumed, actorId) {
        bNoConsumed = (!bNoConsumed) ? false : bNoConsumed;
        const encounter = (actorId) ? this.getMyCurrentEncounter(actorId)
                                    : this.getCurrentEncounter();
        if ( (!encounter)
          || (!encounter.system.steps.length === 0) ) return;
        if (bNoConsumed) return encounter.system.steps.filter(e => !e.consumed); 
                    else return encounter.system.steps;          
    }

    /**
     * getCurrentStep
     */
    static getCurrentStep() {
        const mSteps = this.getCurrentEncounterSteps(true);
        if (!mSteps) return;
        return mSteps[0];
    }

    /**
     * consumeCurrentStep
     */
    static consumeCurrentStep() {
        let encounter = this.getCurrentEncounter();
        let mSteps = encounter.system.steps;
        if (mSteps.filter(e => !e.consumed).length > 0) {
            let currentStep = mSteps.filter(e => !e.consumed)[0];
            currentStep.consumed = true;
            helperSocket.update(encounter, {
              system: { steps: mSteps }
            });              
        }
        helperSocket.refreshSheets();
    }

    /**
     * updateCurrentStep
     * @param {*} oData 
     */
    static updateCurrentStep(oData) {
        let encounter = this.getCurrentEncounter();
        helperSocket.update(encounter, oData); 
        helperSocket.refreshSheets();        
    }

    /**
     * getLastStep
     * @param {*} actorId 
     * @param {*} bLastAttacker 
     * @param {*} bLastDefender 
     * @returns 
     */
    static getLastStep(actorId, bLastAttacker, bLastDefender) {

        const mSteps = this.getCurrentEncounterSteps();
        if (!mSteps) return;

        const action = (actorId) ? this.getCurrentAction(actorId) : null;

        let lastStep;
        for (const step of mSteps) {
        
            const stepActor = game.actors.get(step.actor);
            const stepAction = stepActor.items.get(step.action);
        
            if ( (step.actor === actorId)
              && (bLastAttacker ? stepAction.system.type.attack : true)
              && (bLastDefender ? stepAction.system.type.defense : true)
              && (step.action === action.id)
              && (!step.consumed) ) break;
            else lastStep = step;
        }

        return lastStep;

    }

// --- ACTIONS --- -----------------------------------------------------------------------------------------------------

    /**
     * getCurrentAction
     * @param {*} actorId (optional) - Returns Null if Actor isnt in the encounter
     * @returns 
     */
    static getCurrentAction(actorId) {
        const step = this.getCurrentStep();
        if (!step) return;
        if (!actorId) return step;

        const actor = game.actors.get(actorId);
        if (!actor) return;

        return (step.actor === actorId) ? actor.items.get(step.action) : null;
    }

    /**
     * getCurrentActionSkill
     * @param {*} actorId 
     * @returns 
     */
    static async getCurrentActionSkill(actorId) {
        const action = this.getCurrentAction(actorId);
        if (!action) return null;

        await game.packs.get('conventum.skills').getDocuments();       
        return (action.system.skill.useSkill) ?
            game.packs.get('conventum.skills').get(action.system.skill.skill) :
            null;
    }

    /**
     * getActions
     * @param {*} actorId 
     * @returns 
     */
    static getActions(actorId) {
        const actor = game.actors.get(actorId);
        if (!actor) return [];

        const encounter = this.getCurrentEncounter();
        if (!encounter) return [];

        if ( (!encounter.system.steps) ||
             (encounter.system.steps.length === 0) ) return [];

        return encounter.system.steps.filter(e => e.actor === actorId);        
    }

    /**
     * getActionLocation
     * @param {*} action 
     */
    static getActionLocation(action) {
        let mLocations = [];
        for (const s in action.system.location.focusLocation) {
            if (action.system.location.focusLocation[s].apply) {
                mLocations.push(s);
            }
        }
        if (mLocations.length > 0) return mLocations[0];
        return '';
    }

    /**
     * getMaxActions
     * @param {*} actorId
     */
    static getMaxActions(actorId) {
        const actor = game.actors.get(actorId);
        if (!actor) return;        

        const sWorld = actor.system.control.world;
        const oWorld = game.packs.get('conventum.worlds').get(sWorld);        
        if (oWorld.system.config.actions.fixedNumber )
            return oWorld.system.config.actions.actionNumber;
        
        return Math.round( Number(actor.system.initiative.value) 
                         * Number(oWorld.system.config.actions.initiativePercent) );
    }

    /**
     * getActionsInfo
     * @param {*} actorId 
     */
    static getActionsInfo(actorId) {
        const mMyactions = this.getActions(actorId);

        return {
            actActions: mMyactions,
            numActions: mMyactions.length,
            maxActions: this.getMaxActions(actorId),
        };
    }

    /**
     * getActionCost
     * @param {*} action 
     */
    static getActionCost(action) {
        return ( action.system.steps.actionSteps ) ? Number(action.system.steps.actionSteps) : 1;
    }

}