import { helperMessages } from "../sheets/helpers/helperMessages.js";
import { helperActions } from "../sheets/helpers/helperActions.js";
import { helperRolls } from "../sheets/helpers/helperRolls.js";
import { helperSheetArmor } from "../sheets/helpers/helperSheetArmor.js";
import { helperSheetMagic } from "../sheets/helpers/helperSheetMagic.js";
import { helperSocket } from "../helpers/helperSocket.js";
import { helperSheetHuman } from "../sheets/helpers/helperSheetHuman.js";
import { helperSheetCombat } from "../sheets/helpers/helperSheetCombat.js";
import { helperCusto } from "../helpers/helperCusto.js";

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
    static getMyCurrentCombat(actorId, tokenId) {
        const combat = this.getCurrentCombat();
        if (!combat) return;

        const myCombatant = (tokenId) ?
                    Array.from(combat.combatants).find(e => ((e.actorId === actorId) &&
                                                             (e.tokenId === tokenId))) : 
                    Array.from(combat.combatants).find(e => (e.actorId === actorId));
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
    static getMyCurrentEncounter(actorId, tokenId) {
        const myCombat = this.getMyCurrentCombat(actorId, tokenId);
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
    static async consumeCurrentStep() {
        let encounter = this.getCurrentEncounter();
        let mSteps = encounter.system.steps;
        if (mSteps.filter(e => !e.consumed).length > 0) {
            let currentStep = mSteps.filter(e => !e.consumed)[0];
            currentStep.consumed = true;
            await helperSocket.update(encounter, {
              system: { steps: mSteps }
            });              
        }
        helperSocket.refreshSheets();
    }

    /**
     * getUpdatedSteps
     * @returns 
     */
    static getUpdatedSteps() {
        let encounter = this.getCurrentEncounter();
        if ((!encounter) || (encounter === undefined)) return;
        let mSteps = encounter.system.steps;
        if (mSteps.filter(e => !e.consumed).length > 0) {
            let currentStep = mSteps.filter(e => !e.consumed)[0];
            currentStep.consumed = true;
        }
        return mSteps;
    }

    /**
     * updateCurrentStep
     * @param {*} oData 
     */
    static async updateCurrentStep(oData) {
        let encounter = this.getCurrentEncounter();
        await helperSocket.update(encounter, oData); 
        helperSocket.refreshSheets();        
    }

    /**
     * getLastStep
     * @param {*} bLastAttacker 
     * @param {*} bLastDefender 
     * @returns 
     */
    static getLastStep(bLastAttacker, bLastDefender) {

        let mSteps = this.getCurrentEncounterSteps();
        if ((!mSteps) || (mSteps.length === 0)) return;
        if (mSteps.length === 1) return mSteps[0];
        
        mSteps = mSteps.filter(e => e.consumed);
        if ((!bLastAttacker) && (!bLastDefender)) return mSteps[mSteps.length - 1];

        for (let i=mSteps.length - 1; i<mSteps.length; i--) {
            const stepAction = mSteps[i];
            const actorAction = game.actors.get(stepAction.actor).items.get(stepAction.action);
            
            if ((actorAction.system.type.attack) && (bLastAttacker)) return stepAction;
            if ((actorAction.system.type.defense) && (bLastDefender)) return stepAction;
        }
        return mSteps[mSteps.length - 1];

    }

// --- ACTIONS --- -----------------------------------------------------------------------------------------------------

    /**
     * getCurrentAction
     * @param {*} actorId (optional) - Returns Null if Actor isnt in the encounter
     * @param {*} tokenId (optional)
     * @returns 
     */
    static getCurrentAction(actorId, tokenId) {
        const step = this.getCurrentStep();
        if (!step) return;
        if (!actorId) return step;

        const actor = (tokenId) ? game.scenes.active.tokens.get(tokenId).getActor()
                                : game.actors.get(actorId);       
        if (!actor) return;
        if (tokenId)
            return ((step.actor === actorId) && 
                    (step.tokenId === tokenId)) ? actor.items.get(step.action) : null;
         else
            return (step.actor === actorId) ? actor.items.get(step.action) : null;
    }

    /**
     * getCurrentActionSkill
     * @param {*} actorId 
     * @param {*} tokenId 
     * @returns 
     */
    static async getCurrentActionSkill(actorId, tokenId) {
        const action = this.getCurrentAction(actorId, tokenId);
        if (!action) return null;
      
        return (action.system.skill.useSkill) ?
            await helperCusto.getDocument('skills', action.system.skill.skill) :
            null;
    }

    /**
     * getActions
     * @param {*} actorId 
     * @returns 
     */
    static getActions(actorId, tokenId) {
        const actor = (tokenId) ? game.scenes.active.tokens.get(tokenId).getActor() :
                                  game.actors.get(actorId);
        if (!actor) return [];

        const encounter = this.getCurrentEncounter();
        if (!encounter) return [];

        if ( (!encounter.system.steps) ||
             (encounter.system.steps.length === 0) ) return [];

        if (tokenId)
          return encounter.system.steps.filter(e => ((e.actor === actorId) && 
                                                     (e.tokenId === tokenId)) );
        else
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
     * getModeLocation
     * @param {*} actor
     */
    static async getModeLocation(actor) {
        let mLocations = [];
        let sLocation = '';

        for (var i=0; i<=actor.system.modes; i++) {
            const mode = await helperCusto.getDocument('modes', actor.system.modes[i]);
            if ((!mode) || (mode === undefined) || (mode.system === undefined)) return;

            for (const s in mode.system.config.location.focusLocation) {
                if (mode.system.config.location.focusLocation[s].apply)
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
    static async getMaxActions(actorId, tokenId) {
        const actor = (tokenId) ? game.scenes.active.tokens.get(tokenId).getActor() :
                                  game.actors.get(actorId);        
        if (!actor) return;        

        const oWorld = await helperCusto.getWorld(actor.system.control.world);
        if (oWorld.system.config.actions.fixedNumber )
            return oWorld.system.config.actions.actionNumber;
        
        return Math.round( Number(actor.system.initiative.value) 
                         * Number(oWorld.system.config.actions.initiativePercent) );
    }

    /**
     * getActionsInfo
     * @param {*} actorId 
     */
    static async getActionsInfo(actorId, tokenId) {
        const mMyactions = this.getActions(actorId, tokenId);
        const actor = (tokenId) ? game.scenes.active.tokens.get(tokenId).getActor() :
                                  game.actors.get(actorId);

        let sumActions = 0;
        mMyactions.map(action => {
            const oAction = actor.items.find(e => e.id === action.action);
            if (oAction !== undefined)
                sumActions += this.getActionCost(actor, oAction);
        });

        return {
            actActions: mMyactions,
            numActions: mMyactions.length,
            maxActions: await this.getMaxActions(actorId, tokenId),
            sumActions: sumActions
        };
    }

    /**
     * getActionCost
     * @param {*} action 
     */
    static getActionCost(actor, action) {
        if ( action.system.steps.actionSteps === '' ) return 1;
        if ( Number( action.system.steps.actionSteps) === 0 ) return 0;

        let nCost = Number(action.system.steps.actionSteps);

        let nFromModes = 0;
        let noPoints = false;
        actor.system.modes.map(sMode => {
            
            //Carefull!!! No synch!!!
            const mode = game.packs.get("aquelarre.modes").get(sMode);

            if (mode.system.config.actionPoints === '')
                mode.system.config.actionPoints = 0;

            if (Number(mode.system.config.actionPoints) !== 0) {
                nFromModes += Number(mode.system.config.actionPoints);
            }
            if (mode.system.config.noActionPoints) noPoints = true;
        });
        if (nFromModes != 0) nCost = nFromModes;
        if (noPoints) nCost = 0;

        return nCost;
    }

    /**
     * actorFromUniqeId
     * @param {*} uniqeId 
     * @returns 
     */
    static actorFromUniqeId(uniqeId) {
        const tokenId = (game.scenes.active.tokens.get(uniqeId)) ? uniqeId : null;
        const actor = (tokenId) ? game.scenes.active.tokens.get(uniqeId).getActor() : game.actors.get(uniqeId);
        return actor;        
    }

    /**
     * uniqeIdFromIDS
     * @param {*} actorId 
     * @param {*} tokenId 
     * @returns 
     */
    static uniqeIdFromIDS(actorId, tokenId) {
        if (!tokenId) return actorId;
        if ((tokenId === '') || (tokenId === undefined)) return actorId;
        
        const actor = game.scenes.active.tokens.get(tokenId).getActor();
        if (actor.isToken) return actor.token.id;
                      else return actor.id;
    }    
    
}