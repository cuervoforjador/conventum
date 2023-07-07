
import { aqActions } from "./aqActions.js";
import { aqContext } from "./aqContext.js";
import { helperSocket } from "../helpers/helperSocket.js";

export class aqCombat {

    /**
     * addAction
     * @param {*} actorId 
     * @param {*} actionId 
     */
    static async addAction(actorId, actionId) {

        await game.packs.get('conventum.worlds').getDocuments();
        await game.packs.get('conventum.locations').getDocuments();

        const actor = game.actors.get(actorId);
        if (!actor) return;

        const action = actor.items.get(actionId);
        if (!action) return;

        if (!aqActions.getMyCurrentEncounter(actorId)) {
            new Dialog({
              title: game.i18n.localize("common.actions"),
              content: game.i18n.localize("info.actionNoCombat"),
              buttons: {}
            }).render(true);
            return;
        }

        const actionLocation = aqActions.getActionLocation(action);
        const actionInfo = aqActions.getActionsInfo(actorId);
        const actionCost = aqActions.getActionCost(action);
        const nTotal = actionInfo.numActions + actionCost;
        const bAvailable = (nTotal <= actionInfo.maxActions);
        
        // Target type (Human, Horse, ...)
        let sTargetType  = '<select name="actTargetType" class="_actTargetType" disabled>';
        game.template.Actor.types.forEach(s => {
            if (actionLocation === '')
                sTargetType += '<option value="'+s+'">'+game.i18n.localize("template."+s)+'</option>';
            else if (s === action.system.location.actorType)
                sTargetType += '<option value="'+s+'" selected>'+game.i18n.localize("template."+s)+'</option>';
        });            
        sTargetType += '</select>';

        // Target Location
        let sTypeInitial = (action.system.location.actorType) ? action.system.location.actorType : 'human';
        let sTargetLocation = '<select name="actTargetLocation" class="_actTargetLocation" disabled>';
        Array.from(game.packs.get("conventum.locations")).filter(e => e.system.actorType === sTypeInitial)
             .forEach(oLocation => {
            if (actionLocation === '')
                sTargetLocation += '<option value="'+oLocation.id+'">'+oLocation.name+'</option>';
            else if (oLocation.id === actionLocation)
                sTargetLocation += '<option value="'+oLocation.id+'" selected >'+oLocation.name+'</option>';
        });
        sTargetLocation += '</select>';       

        // Content
        const content = ''+
        '<div class="_posterAction">'+
            '<img src="'+action.img+'" />'+
            '<div class="_whiteWrap"></div>'+
            '<label class="_text">'+
                '<h1>'+action.name+'</h1>'+
                action.system.description+
            '</label>'+
            '<div class="_actionSteps">'+
                '<label class="_big">'+actionCost.toString()+'</label>'+
                '<label class="_minimal">'+game.i18n.localize('common.total')+
                    '<span class="_accent '+( (bAvailable) ? '_valid' : '_invalid')+'">'+
                        nTotal.toString()+'/'+actionInfo.maxActions.toString()+
                    '</span>'+
                '</label>'+
                '<label class="_minimal2">'+game.i18n.localize('common.actionPoints')+'</label>'+
            '</div>'+
            '<label class="_minimal3">'+game.i18n.localize('common.location')+'</label>'+
            '<div class="_askingForLocation">'+
                '<hbox class="_100">'+
                    '<input type="checkbox" '+
                           'id="actApplyLocation" '+
                           'value="" '+
                            ((actionLocation !== '') ? 'checked' : '')+' '+
                            ((actionLocation !== '') ? 'disabled' : '')+' />'+
                    '<label>'+game.i18n.localize("common.applyLocation")+'</label>'+
                '</hbox>'+
                sTargetType+
                sTargetLocation+
            '</div>'
        '</div>';        

        //Dialog
        const buttons = {
            button1: {
                label: game.i18n.localize('common.cancel'),
                callback: (button, dialog) => {
                    //..
                }
            }
        };
        if (bAvailable) {
            buttons.button2 = {
                label: game.i18n.localize('common.continue'),
                enabled: bAvailable,
                callback: this._addAction.bind(this, actor, action),
                icon: '<i class="fas fa-check"></i>'
            };
        }
        new Dialog({
            title: action.name,
            content: content,
            buttons: buttons,
            default: "button1"
        }).render(true, { width: '280px',
                          height: '450px' });  

    }

    /**
     * _addAction
     * @param {*} actor 
     * @param {*} action 
     */
    static async _addAction(actor, action, dialog, button) {
            
        //Apply Location...
        let applyLocation = dialog.find('#actApplyLocation')[0] ? 
            {
                apply: dialog.find('#actApplyLocation')[0].checked,
                actorType: dialog.find('#actApplyLocation')[0].checked ? 
                                dialog.find('[name=actTargetType]').find(":selected").val() : null,
                location: dialog.find('#actApplyLocation')[0].checked ? 
                                dialog.find('[name=actTargetLocation]').find(":selected").val() : null
            } : {
                apply: false,
                actorType: null,
                location: null
            };

        const activeCombat = aqActions.getCurrentCombat();
        if (!activeCombat) return;
        
        if (!Array.from(activeCombat.combatants).find(e => e.actorId === actor._id))
            return;

        let encounter = game.items.filter(e => e.type === 'actionPool')
                                  .find(e => e.system.combat === activeCombat._id);
        if (!encounter) return;
        let mSteps = encounter.system.steps;

        const newStep = {
            actor: actor._id,
            action: action._id,
            consumed: false,
            applyLocation: applyLocation
        };
        if (mSteps.find(e => e.actor === actor._id)) {
            let index = mSteps.findLastIndex(e => e.actor === actor._id);
            mSteps.splice(index+1, 0, newStep);
        } else
            mSteps.unshift(newStep);

        helperSocket.update(encounter, {
            system: { steps: mSteps }
        });
        helperSocket.refreshSheets();
    }    

    /**
     * dialogTargets
     * @param {*} actorId 
     * @param {*} weaponId 
     * @returns 
     */
    static async dialogTargets(actorId, weaponId) {

        const actor = game.actors.get(actorId);
        if (!actor) return;

        const weapon = actor.items.get(weaponId);
        if (!weapon) return;

        const action = aqActions.getCurrentAction(actorId);
        if (!action) return;

        const combat = aqActions.getCurrentCombat();
        if (!combat) return;

        let mActors = [];

        //Combatants
        if (action.system.target.combatants)
            mActors = mActors.concat(combat.turns.filter(
                                    e => e.actorId !== actorId ));

        //MySelf
        if (action.system.target.myself)
            mActors = mActors.concat(combat.turns.filter(
                                    e => e.actorId === actorId ));

        //Last Played, Attacker, Defender
        if ( (action.system.target.lastPlayed) ||
             (action.system.target.lastAttacker) ||
             (action.system.target.lastDefender) ) {

            let lastStep = aqActions.getLastStep(actorId, 
                                        action.system.target.lastAttacker, 
                                        action.system.target.lastDefender);
            if (lastStep && lastStep.consumed) {
                let lastActor = game.actors.get(lastStep.actor);
                mActors = mActors.concat([{
                            actorId: lastStep.actor,
                            name: lastActor.name,
                            img: lastActor.img
                        }]);                
            }
        }
 
        //Getting actors...
        mActors.map(e => {
            e._actor = null;
            e._actor = game.actors.get(e.actorId);
        });

        //Filtering by Modes...
        for (const s in action.system.modes) {
            if (action.system.modes[s].target) {
                mActors = mActors.filter(e => 
                    e.actor.system.modes.find(s0 => s0 === s));
            }
        }

        //Creating context...
        let context = new aqContext({actorId: actorId, 
                                     weaponId: weaponId});

        //Multiple targets...
        if ((action) && 
            (action.system.target.multiple)) {
                
            let mTargets = [];
            Array.from(game.user.targets).map(target => {
                mTargets.push(target.document.actorId) });
            if (mTargets.length === 0) {
                new Dialog({
                    title: 'Info',
                    content: game.i18n.localize("info.multipleTargets"),
                    buttons: [] }).render(true);                      
            } else {
                await context.setTargets(mTargets);
                await aqCombat.playWeapon(context);                
            }  
            return;            
        }

        //Targets Dialog
        let oButtons = {};
        mActors.map(e => {
            oButtons[e.actorId] = {
                label: e.name,
                actorId: e.actorId,
                img: e.img,
                combatTarget: true,
                callback: async () => {
                    await context.setTargets([e.actorId]);
                    await aqCombat.playWeapon(context);
                }
            }
        });
        let dialog = new Dialog({
            title: game.i18n.localize("common.targets"),
            content: "",
            buttons: oButtons });        

        dialog.options.classes = ['dialog', '_targetDialogs'];
        dialog.render(true);       
    }

    /**
     * dialogTargetsExpress
     * @param {*} actorId 
     * @param {*} weaponId 
     */
    static dialogTargetsExpress(actorId, weaponId) {

        const actor = game.actors.get(actorId);
        if (!actor) return;

        const weapon = actor.items.get(weaponId);
        if (!weapon) return;

        //Creating context...
        let context = new aqContext({actorId: actorId, 
                                    weaponId: weaponId,
                                     express: true});

        //Targets Dialog
        let mActors = Array.from(game.actors).filter( e => 
            (  (e.id !== actorId)
            && (e.system.control.visible) ) );
        let oButtons = {};
        mActors.map(e => {
            oButtons[e.id] = {
                label: e.name,
                actorId: e.id,
                img: e.img,
                combatTarget: true,
                callback: async () => {
                    context.setExpress(true);
                    await context.setTargets([e.id]);
                    await aqCombat.playWeapon(context);
                }
            }
        });
        let dialog = new Dialog({
            title: game.i18n.localize("common.targets"),
            content: "",
            buttons: oButtons });        

        dialog.options.classes = ['dialog', '_targetDialogsExpress'];
        dialog.render(true);       
    }

    /**
     * playWeapon
     * @param {*} context 
     */
    static async playWeapon(context) {
        await context.prepareContext();
        this.rollAction(context);
    }

    /**
     * playSpell
     * @param {*} context 
     */
    static async playSpell(context) {
        await context.prepareContext();
        this.rollSpell(context);
    }    

    /**
     * rollAction
     * @param {*} context 
     */
    static rollAction(context) {
        if (context.getAskForLevels()) this._dialogLevel(context, false);
                                  else this._rollAction(context);
    }

    /**
     * rollSpell
     * @param {*} context 
     */
    static rollSpell(context) {
        if (context.getAskForLevels()) this._dialogLevel(context, true);
                                  else this._rollSpell(context);
    }

    /**
     * rollDamage
     * @param {*} context 
     */
    static async rollDamage(context) {
        await context.rollDamage();
    }

    /**
     * _dialogLevel
     * @param {*} context 
     */
    static async _dialogLevel(context, bSpell) {
        bSpell = (!bSpell) ? false : bSpell;

        const worldConfig = context.getWorldConfig();
        let oButtons = {};
        for (const s in worldConfig.rolllevel) {
          let oConfig = worldConfig.rolllevel[s];
          if (oConfig.apply)
            oButtons[s] = {
              label: oConfig.text,
              callback: () => {
                context.setRollBono(oConfig.bono);
                context.setRollLevel(s);
                if (bSpell) aqCombat._rollSpell(context);
                       else aqCombat._rollAction(context);
              }
            }
        }
        let dialog = new Dialog({
          title: game.i18n.localize("common.level"),
          content: "",
          buttons: oButtons,
          world: context.getWorldId() });
        dialog.options.classes.push('_levelRoll');
        dialog.render(true);

    }

    /**
     * _rollAction
     * @param {*} context 
     */
    static async _rollAction(context) {

        context.setRollFormula('1d100');
        await context.roll();
        context.message();
        
        if (!context.getExpress()) {
            context.consumeStep();   
            aqActions.updateCurrentStep({
                system: { context: context }
            });
        }
    }

    /**
     * _rollSpell
     * @param {*} context 
     */
    static async _rollSpell(context) {

        context.setRollFormula('1d100');
        await context.roll();
        context.message();
    }    

}