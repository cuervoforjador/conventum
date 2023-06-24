/**
 * Helpers for Combat in Action Pools Sheet
 */

import { helperMessages } from "./helperMessages.js";
import { helperActions } from "./helperActions.js";
import { helperRolls } from "./helperRolls.js";
import { helperSheetArmor } from "./helperSheetArmor.js"
import { helperSheetMagic } from "./helperSheetMagic.js"
import { helperSocket } from "../../helpers/helperSocket.js";
import { helperSheetHuman } from "./helperSheetHuman.js";

export class helperSheetCombat {

    /**
     * getCombat
     * @param {*} context 
     */
    static getCombat(context) {
        let systemData = context.systemData;
        const sCombatID = systemData.combat;
        const oCombat = game.combats.get(sCombatID);
        if (!oCombat) return;

        let mCombatants = [];
        oCombat._source.combatants.forEach(e => {
            mCombatants.push(oCombat.combatants.get(e._id));
        });

        let mActions = [];
        mCombatants.forEach(combatant => {
            ['firstAction', 'secondAction'].map(s => {
                if (combatant.actor.system.action[s] !== '')
                mActions.push({
                    combatantId: combatant._id,
                    actorId: combatant.actor._id,
                    actionId: combatant.actor.system.action[s],
                    actionItem: combatant.actor.items.get(
                                    combatant.actor.system.action[s])
                });
            });
        });


        return {
            combatId: sCombatID,
            combatants: mCombatants,
            actions: mActions
        };
    }

    /**
     * setHandWeapon
     * @param {*} actor 
     * @param {*} itemId 
     * @param {*} sHand 
     */
    static async setHandWeapon(actor, itemId, sHand) {

        const mHands = ['inBothHands', 'inLeftHand', 'inRightHand'];
        const oWeapon = actor.items.find(e => e.id === itemId);
        const bInHand = oWeapon.system.inHands.inBothHands || 
                        oWeapon.system.inHands.inLeftHand ||
                        oWeapon.system.inHands.inRightHand;
        
        if (bInHand) {
            let mUpdates = [{ 
                _id: oWeapon.id,
                system: { inHands: { 
                    inBothHands: false,
                    inLeftHand: false,
                    inRightHand: false
                }} }];      
            await Item.updateDocuments(mUpdates, {parent: actor});
            actor.sheet.render(true);
            return;
        }

        let mUpdates = [];
        actor.items.filter(e => e.type == 'weapon').forEach( weapon => {
            let dataMod = { _id: weapon.id,
                            system: { inHands: { }} };

            if (weapon.id === itemId)
                mHands.map(s => {
                    dataMod.system.inHands[s] = (s === sHand);  });
            else {
                dataMod.system.inHands[sHand] = false;
                if (sHand === 'inBothHands') { 
                    dataMod.system.inHands.inLeftHand = false;
                    dataMod.system.inHands.inRightHand = false;
                } else
                    dataMod.system.inHands.inBothHands = false;
            } 
            mUpdates.push(dataMod);
        });
        const updated = await Item.updateDocuments(mUpdates, {parent: actor});
        actor.sheet.render(true);

        //Penalties...
        let sPenals = '';
        let sModificator = '';
        if (oWeapon.system.requeriment.primary.apply) {

            //Minimum Force weapon
            if (actor.system.characteristics.primary[
                oWeapon.system.requeriment.primary.characteristic].value 
                < oWeapon.system.requeriment.primary.minValue) {
  
              const nMinVal = 
                oWeapon.system.requeriment.primary.minValue - 
                    actor.system.characteristics.primary[
                        oWeapon.system.requeriment.primary.characteristic].value;
  
              sModificator += ' -'+nMinVal.toString();
            }

            //By Weapon
            if (oWeapon.system.penalty.initiative !== '') {
                sModificator += ' '+helperSheetMagic.penalValue(oWeapon.system.penalty.initiative);
            }
            sPenals = '<div class="_penals">'+game.i18n.localize("common.initiative")+': '+sModificator+'</div>';
          }        

       //Messaging...
        const sTxtVerb = game.i18n.localize("common.unsheath");
        const sTxtHand = game.i18n.localize("common."+sHand);
        const sBackImage = 
                '<img class="_backHand" src="systems/conventum/image/texture/'+sHand+'.png" />';

        const sContent = '<div class="_messageFrame">'+
                            sBackImage+
                            '<div class="_messageImg"><img src="'+actor.img+'"/></div>'+
                            '<div class="_vertical" style="margin-top: -50px;">'+
                                '<div class="_title">'+actor.name+'</div>'+
                                '<div class="_boxItems" style="top: 30px; left: 70px; width: calc(100% - 58px);">'+                                    
                                    '<div class="_subItem">'+
                                        '<a class="_showItem" data-itemid="'+itemId+'" data-actorid="'+actor.id+'">'+
                                            '<img src="'+oWeapon.img+'" />'+
                                        '</a>'+
                                        '<div style="display: flex; flex-direction: column; width: 100%;">'+
                                            '<div class="_caption">'+sTxtVerb+'</div>'+
                                            '<div class="_caption">'+sTxtHand+'</div>'+
                                            '<div class="_caption">'+oWeapon.name+'</div>'+
                                        '</div>'+
                                        sPenals+
                                    '</div>'+
                                '</div>'+
                            '</div>'+                            
                         '</div>';
        
        helperMessages.chatMessage(sContent, 
                                   actor, 
                                   false,
                                   actor.system.control.frame, 
                                   '140px');

    }

    /**
     * getActorCombats
     * @param {*} context 
     * @param {*} actor 
     * @returns 
     */
    static getActorCombats(actor) {
        let mCombats = [];
        Array.from(game.combats).filter( e => Array.from(e.combatants)
                                                   .find(d => (d.actorId === actor._id)) )
                                                   .forEach( combat => {

            const encounter = game.items.filter(e => e.type === 'actionPool')
                                        .find( e => e.system.combat === combat._id );
            if (!encounter) return;
            mCombats.push({
                combat: game.combats.get(combat._id),
                encounter: encounter 
            });
        });
        return mCombats;
    }

    /**
     * getActorCombatBackend
     * @param {*} context 
     * @param {*} actor 
     */
    static getActorCombatBackend(context, actor) {
        let oBackend = {};
        let mCombats = context.combats;

        oBackend.activeCombat = mCombats ? mCombats.find(e => e.combat.active) : null;
        oBackend.inActiveCombat = ( oBackend.activeCombat !== null );

        return oBackend;
    }

    /**
     * myActiveCombat
     * @param {*} actor 
     * @returns 
     */
    static myActiveCombat(actor) {
        let mCombats = helperSheetCombat.getActorCombats(actor);
        return (mCombats) ? mCombats.find(e => e.combat.active) : null;
    }

    /**
     * doAction
     * @param {*} actor 
     * @param {*} actionId 
     */
    static async doAction(actor, actionId) {

        const action = actor.items.get(actionId);
        if (!action) return;

        if (!helperSheetCombat.myActiveCombat(actor)) {
            new Dialog({
              title: game.i18n.localize("common.actions"),
              content: game.i18n.localize("info.actionNoCombat"),
              buttons: {}
            }).render(true);
            return;
        }        

        const myActions = helperSheetCombat.getMyActions(actor);
        const nMaxActions = await helperSheetCombat.getMaxActionsNumber(actor);
        const nActions = myActions.length;
        const nItemActions = ( action.system.steps.actionSteps ) ? Number(action.system.steps.actionSteps) : 1;
        const nTotalActions = nActions + nItemActions;
        const bValidActions = (nTotalActions <= nMaxActions);

        //Asking for Locations

            //Focus in location
            let bFocusLocation = false;
            let sFocusLocation = '';
            for (const s in action.system.location.focusLocation) {
                if (action.system.location.focusLocation[s].apply) {
                    bFocusLocation = true;
                    sFocusLocation = s;
                }
            }

        let sAskingLocation = "";
        if ( (action.system.location.askForLocation) || (bFocusLocation) ) {
            sAskingLocation = '<label class="_minimal3">'+game.i18n.localize('common.location')+'</label>'+
                                    '<div class="_askingForLocation">';

            let forceChecked = (bFocusLocation) ? 'checked' : '';
            let forceDissabled = (bFocusLocation) ? 'disabled' : '';
            sAskingLocation += '<hbox class="_100">'+
                                    '<input type="checkbox" id="actApplyLocation" value="" '+
                                        forceChecked+' '+forceDissabled+' />'+
                                    '<label>'+game.i18n.localize("common.applyLocation")+'</label>'+
                               '</hbox>';

            const sFirst = game.template.Actor.types[0];
            sAskingLocation += '<select name="actTargetType" class="_actTargetType" disabled>';
            game.template.Actor.types.forEach(s => {
                if (!bFocusLocation)
                    sAskingLocation += '<option value="'+s+'">'+game.i18n.localize("template."+s)+'</option>';
                else if (s === action.system.location.actorType)
                    sAskingLocation += '<option value="'+s+'" selected>'+game.i18n.localize("template."+s)+'</option>';
            });
            sAskingLocation += '</select>';

            sAskingLocation += '<select name="actTargetLocation" class="_actTargetLocation" disabled>';
            Array.from(game.packs.get("conventum.locations"))
                           .filter(e => e.system.actorType === 'human')
                           .forEach(oLocation => {
                if (!bFocusLocation)
                    sAskingLocation += '<option value="'+oLocation.id+'">'+oLocation.name+'</option>';
                else if (oLocation.id === sFocusLocation)
                    sAskingLocation += '<option value="'+oLocation.id+'" selected >'+oLocation.name+'</option>';
            });
            sAskingLocation += '</select></div>';
        }

        let sContent = '<div class="_posterAction">'+
                            '<img src="'+action.img+'" />'+
                            '<div class="_whiteWrap"></div>'+
                            '<label class="_text">'+
                                '<h1>'+action.name+'</h1>'+
                                action.system.description+
                            '</label>'+
                            '<div class="_actionSteps">'+
                                '<label class="_big">'+nItemActions.toString()+'</label>'+
                                '<label class="_minimal">'+game.i18n.localize('common.total')+
                                    '<span class="_accent '+( (bValidActions) ? '_valid' : '_invalid')+'">'+
                                        nTotalActions.toString()+'/'+nMaxActions.toString()+
                                    '</span>'+
                                '</label>'+
                                '<label class="_minimal2">'+game.i18n.localize('common.actionPoints')+'</label>'+
                            '</div>'+
                            sAskingLocation+
                       '</div>';

        const buttons = {
            button1: {
                label: game.i18n.localize('common.cancel'),
                callback: (button, dialog) => {
                    //..
                }
            }
        };
        if (bValidActions) {
            buttons.button2 = {
                label: game.i18n.localize('common.continue'),
                enabled: bValidActions,
                callback: this._addAction.bind(this, actor, action),
                icon: '<i class="fas fa-check"></i>'
            };
        }
        new Dialog({
            title: action.name,
            content: sContent,
            buttons: buttons,
            default: "button1"
        }).render(true, { width: '280px',
                          height: '450px' });        

    }

    /**
     * getMyActions
     * @param {*} actor 
     */
    static getMyActions(actor) {

        const myCombat = helperSheetCombat.myActiveCombat(actor);
        if (!myCombat) return [];

        if ( (!myCombat.encounter.system.steps) ||
             (myCombat.encounter.system.steps.length === 0) ) return [];

        return myCombat.encounter.system.steps.filter(e => e.actor === actor.id);
    } 

    /**
     * getMaxActionsNumber
     * @param {*} actor 
     */
    static async getMaxActionsNumber(actor) {

        const sWorld = actor.system.control.world;
        const oWorld = await game.packs.get('conventum.worlds').get(sWorld);        
        if (oWorld.system.config.actions.fixedNumber )
            return oWorld.system.config.actions.actionNumber;
        
        return Math.round( Number(actor.system.initiative.value) 
                         * Number(oWorld.system.config.actions.initiativePercent) );
    }   

    /**
     * playAction
     * @param {*} actorId 
     * @param {*} actionId 
     */
    static async playAction(actorId, actionId) {

        let actor = game.actors.get(actorId);
        if (!actor) return;
        let item = actor.items.get(actionId);
        if (!item) return;

        await actor.update({
            system: { action: { action: actionId } }
        });
        
        let sContent = '';
        sContent =  '<div class="_messageFrame">'+
                        '<div class="_messageImg">'+
                            '<img src="'+actor.img+'"/>'+
                        '</div>'+
                        '<div class="_vertical">'+
                            '<div class="_title">'+actor.name+'</div>'+
                            '<a class="_showItem" data-itemid="'+item.id+'" data-actorid="'+actor.id+'">'+
                                '<div class="_Img"><img src="'+item.img+'"/></div>'+
                            '</a>'+
                            '<div class="_skill">'+item.name+'</div>'+
                        '</div>'+ 
                        '<div class="_messageText">'+
                            game.i18n.localize("common.playingAction")+
                        '</div>'+
                    '</div>';        
        helperMessages.chatMessage(sContent, actor, false, '', '140px');
    }

    /**
     * selectTargetsAndPlayWeapon
     * @param {*} actor 
     * @param {*} action 
     * @param {*} weaponId 
     * @returns 
     */
    static selectTargetsAndPlayWeapon(actor, action, weaponId) {
        const myAction = helperActions.getActions(actor);
        if ( (!myAction.action) || (myAction.action === '') ) return;
        
        const activeCombat = helperSheetCombat.myActiveCombat(actor);
        let mActors = [];

        //Targets...
        const context = myAction.action.system.target;

            //Combatants
            if (context.combatants) {
                mActors = 
                    mActors.concat(activeCombat.combat.turns.filter(
                                        e => e.actorId !== actor.id ));
            }

            //Myself
            if (context.myself) {
                mActors = 
                    mActors.concat(activeCombat.combat.turns.filter(
                                        e => e.actorId === actor.id ));
            }

            //Last Played, Attacker, Defender
            if ( (context.lastPlayed) ||
                 (context.lastAttacker) ||
                 (context.lastDefender) ) {

                //Last step in the encounter
                let lastStep;
                for (const step of activeCombat.encounter.system.steps) {

                    const actor2 = game.actors.get(step.actor);
                    const action2 = actor2.items.get(step.action);

                    if ( (step.actor === actor.id)
                    && (context.lastAttacker ? action2.system.type.attack : true)
                    && (context.lastDefender ? action2.system.type.defense : true)
                    && (step.action === myAction.action.id)
                    && (!step.consumed) ) break;
                    else lastStep = step;
                }
                let actionActor;
                if (lastStep && lastStep.consumed) {                  
                    let aActor = game.actors.get(lastStep.actor);
                    mActors = 
                        mActors.concat([{
                            actorId: lastStep.actor,
                            name: aActor.name,
                            img: aActor.img
                        }]);     
                }           
            }
        
        //Getting actors...
        mActors.map(e => {
            e._actor = null;
            e._actor = game.actors.get(e.actorId);
        });

        //Filtering by Modes...
        if (myAction.action) {
            for (const s in myAction.action.system.modes) {
                if (myAction.action.system.modes[s].target) {
                    mActors = mActors.filter(e => 
                        e.actor.system.modes.find(s0 => s0 === s)
                    );
                }
            }
        }

        //Targets Dialog
        let oButtons = {};
        mActors.map(e => {
            oButtons[e.actorId] = {
                label: e.name,
                actorId: e.actorId,
                img: e.img,
                combatTarget: true,
                callback: () => helperSheetCombat.setTargetPlayWeapon(actor, e.actorId, action, weaponId)
              }
        });
        let dialog = new Dialog({
            title: game.i18n.localize("common.targets"),
            content: "",
            buttons: oButtons });
        
        //Adding status and mounts...
        /**
        $(dialog).find("button.dialog-button").each(function(i,e) {
            const mClass = $(e).attr("class").split(/\s+/);
            const actor = game.actors.get(mClass[mClass.length - 1]);
            const mount = helperSheetCombat.getMount(actor);
            if (mount) $(e).append('<img class="_mount" src="'+mount.img+'"/>');
        }.bind(this));
        */

        dialog.options.classes = ['dialog', '_targetDialogs'];
        dialog.render(true);       
    }

    /**
     * setTargetPlayWeapon
     * @param {*} actor 
     * @param {*} targetActorId 
     * @param {*} action 
     * @param {*} weaponId 
     */
    static async setTargetPlayWeapon(actor, targetActorId, action, weaponId) {
        let oActor = game.actors.get(targetActorId);
        let tokenId = oActor.getActiveTokens()[0].id;   
        let encounter = helperSheetCombat.myActiveCombat(actor).encounter;
        let actualStep = encounter.system.steps.filter(e => !e.consumed)[0];
        actualStep.targets = [oActor.id];
        actualStep.targetsToken = [tokenId];
        
        //await encounter.update({system: {steps: encounter.system.steps}});
        helperSocket.update(encounter, {
            system: {steps: encounter.system.steps}
        });

        await game.user.updateTokenTargets([tokenId]);

        helperSheetCombat.playWeapon(actor, weaponId);
        if (actor.sheet.rendered) actor.sheet.render(true);
    }

    /**
     * playWeapon
     * @param {*} actor 
     * @param {*} weaponId 
     */
    static async playWeapon(actor, weaponId) {
        const weaponItem = actor.items.get(weaponId);
        if (!weaponItem) return;
        
        const actorActions = helperActions.getActions(actor);
        const actorTargets = helperActions.getTargets(actor);
        
        //No actions...
        if (!actorActions.showPoster) {
            ui.notifications.warn(game.i18n.localize("info.noAction"));
            return;
        }
        const actionItem = (actorActions.action !== '') ? actorActions.action : null;

        let combatSkill = game.packs.get('conventum.skills').get(weaponItem.system.combatSkill);
        if (!combatSkill) return;

        //Double attack
        let weaponItem2 = null;
        if (actionItem.system.skill.doubleAttack) {
            const mHandWeapons = actor.items.filter(e => (e.type === 'weapon') 
                                    && ((e.system.inHands.inLeftHand) || (e.system.inHands.inRightHand)) );
            if (mHandWeapons.length == 2)
                weaponItem2 = mHandWeapons.filter(e => e.id !== weaponItem.id)[0];
        }
          
        //Replacing skill
        if ((actionItem) && (actionItem.system.skill.skillAsCombat) &&
            (actionItem.system.skill.skill !== '')) {
            
            combatSkill = game.packs.get('conventum.skills').get(actionItem.system.skill.skill);
        }

        const actorSkill = actor.system.skills[weaponItem.system.combatSkill];
        if (!actorSkill) return;
        
        let mods = {
            skill: '',
            skillMult: 1,
            damage: ''
        };
        let mods2 = {
            skill: '',
            skillMult: 1,
            damage: ''            
        }
        let history = [];
        let history2 = [];

        //--- SKILL ---
        history.push(' --- '+combatSkill.name+' --- ');
        history.push(game.i18n.localize("common.basePercent")+': '+actorSkill.value+'%');

        actorSkill.penal = this.penalValue(actorSkill.penal);
        if (actorSkill.penal !== '-0')
            history.push(game.i18n.localize("common.penal")+': '+actorSkill.penal);
        
        //Hand Penalty...
        if ( helperSheetHuman.getHandPenal(actor, weaponItem) !== '-0') {
            let sPenal = helperSheetHuman.getHandPenal(actor, weaponItem);
            actorSkill.penal = this.penalValue(eval(actorSkill.penal+' '+sPenal));
            history.push(game.i18n.localize("common.clumsyHand")+': '+sPenal+'%');
        }

        helperSheetCombat._modActionCombatSkill(actor, combatSkill, actionItem, weaponItem, mods, history);

            //Minimum Force
            let sByMinimunMod = "";
            if (weaponItem.system.requeriment.primary.apply) {
                if (actor.system.characteristics.primary[weaponItem.system.requeriment.primary.characteristic].value < 
                        weaponItem.system.requeriment.primary.minValue) {

                    history.push(game.i18n.localize("common.weaponRequirement1")+': '+
                            game.i18n.localize("characteristic."+weaponItem.system.requeriment.primary.characteristic) +
                            ' > ' + weaponItem.system.requeriment.primary.minValue);

                    const nMinVal = weaponItem.system.requeriment.primary.minValue - 
                        actor.system.characteristics.primary[weaponItem.system.requeriment.primary.characteristic].value;
                    
                        sByMinimunMod = '-' + (nMinVal*5).toString();
                    history.push(game.i18n.localize("common.penal")+': '+sByMinimunMod);
                }
            }        

        let finalPercent = Number(eval( (actorSkill.value.toString()+
                                         this.penalValue(mods.skill)+
                                         ' '+sByMinimunMod+
                                         actorSkill.penal) ) * Number(mods.skillMult));
        history.push(game.i18n.localize("common.finalPercent")+': '+finalPercent.toString());


        //--- DAMAGE ---
        history.push(' --- '+game.i18n.localize("common.damage")+' --- ');
        history.push(weaponItem.name+': '+weaponItem.system.damage);


// AQUI !!!!

        helperSheetCombat._modActionCombatDamage(actor, actionItem, weaponItem, mods, history);
        let sDamageMod = helperSheetHuman.calcDamageMod(actor, weaponItem, history, actionItem);

            if ((actionItem) && (actionItem.system.damage.mod.noDamageBon)) {
                sDamageMod = '';
                history.push(actionItem.name+': '+game.i18n.localize("common.noDamageBon"));
            } else
            history.push(game.i18n.localize("common.damageMod")+': '+sDamageMod);
                        
            //Minimum Force
            let sDamageForceMod = helperSheetHuman.calcDamageForceMod(actor, weaponItem, history);

        let finalDamage = weaponItem.system.damage + mods.damage + sDamageMod + sDamageForceMod;
        history.push(game.i18n.localize("common.finalDamage")+': '+finalDamage.toString());

        let secondAttack = null;
        if (weaponItem2) {
            helperSheetCombat._modActionCombatSkill(actor, combatSkill, actionItem, weaponItem2, mods2, history2);
            helperSheetCombat._modActionCombatDamage(actor, actionItem, weaponItem2, mods2, history2);        
            let sDamageMod2 = helperSheetHuman.calcDamageMod(actor, weaponItem2, history2, actionItem);            
            let sDamageForceMod2 = helperSheetHuman.calcDamageForceMod(actor, weaponItem2, history2);  
            let finalDamage2 = weaponItem2.system.damage + mods2.damage + sDamageMod2 + sDamageForceMod2;          
            secondAttack = {
                weapon: weaponItem2,
                history: history2,
                damage: finalDamage2
            };
        }

        //Damage Multiplicator
        if (actionItem.system.damage.mod.multDamage === null)
                actionItem.system.damage.mod.multDamage = 1;
        if (actionItem.system.damage.mod.multDamage !== 1) {
            let multDamage = (actionItem.system.damage.mod.multDamage) ?
                                actionItem.system.damage.mod.multDamage.toString() : '1';
            if (multDamage !== '1') {
                finalDamage = '(' + finalDamage + ') *'+multDamage;
                history.push(game.i18n.localize("common.multDamage")+': '+multDamage);
            }
        }

        //Leveled Rolls
        let bLeveled = actionItem.system.rolls.leveled;
        helperRolls.rollAction(actor, actorTargets, actionItem, bLeveled,
                               combatSkill, finalPercent,
                               weaponItem, finalDamage,
                               mods, null, history, secondAttack);
    }

    /**
     * rollDamage
     * @param {*} weaponId 
     * @param {*} actorId 
     * @param {*} sTargets 
     * @param {*} sDamage 
     */
    static async rollDamage(weaponId, spellId, actorId, actionId, 
                            sTargets, sDamage, messageId, locationId, 
                            critSuccess, critFailure) {

        let history = [];

        const actor = game.actors.get(actorId);
        if (!actor) return;
        const weapon = actor.items.get(weaponId);
        const spell = actor.items.get(spellId);

        if ((!weapon) && (!spell)) return;
        const action = (actionId) ? actor.items.get(actionId) : null;
        const mTargets = sTargets.split('.');

        //--- ROLLING DAMAGE ---
        let roll = new Roll(sDamage, {});
        roll.evaluate({async: false});
        if (game.dice3d) {
            game.dice3d.showForRoll(roll);
        }        
        const damage = (critSuccess) ? 
                            eval( sDamage.replaceAll('d','*').replaceAll('D','*') ) : roll.total;

        history.push(' --- '+game.i18n.localize("common.damage")+' --- ');
        history.push(game.i18n.localize("common.roll")+': '+sDamage);
        if (critSuccess) 
            history.push(game.i18n.localize("common.critSuccess"));
        history.push(game.i18n.localize("common.rollResult")+': '+damage.toString());

        //Damage in message...
        let message = game.messages.get(messageId);

        let sToFind = $(message.content).find('._rollDamage ._name').parent().parent().html();
        const sToReplace = '<div class="_name _finalDamage">'+damage.toString()+'</div>'+
                           '<div class="_damagePoints">'+game.i18n.localize("common.damagePoints")+'</div>';
        let newContent = message.content.replace(sToFind, sToReplace);

        sToFind = sToFind.replace('.png">', '.png" />');
        sToFind = sToFind.replaceAll('=""', '');
        newContent = message.content.replace(sToFind, sToReplace);

        message.update({
            content: newContent });

        //Applying damage to each target...
        for (var i=0; i<mTargets.length; i++) {
            await helperSheetCombat.applyDamage(mTargets[i], damage, locationId, actor, action, spell, history);
        }

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

        const activeCombat = Array.from(game.combats).find(e => e.active);
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

        /**
        await encounter.update({
            system: { steps: mSteps }
        });
        */ 
        helperSocket.update(encounter, {
            system: { steps: mSteps }
        });

        helperSocket.refreshSheets();
    }

    /**
     * applyDamage
     * @param {*} actorId 
     * @param {*} nDamage 
     */
    static async applyDamage(actorId, nDamage, locationId, actorFrom, action, spell, history) {

        await game.packs.get('conventum.locations').getDocuments();
        await game.packs.get('conventum.worlds').getDocuments();

        let actor = game.actors.get(actorId);

        if ((action) && (action.system.damage.target.mount)) {
            actor = helperSheetCombat.getMount(actor);
        }

        if (!actor) return;
        const sWorld = actor.system.control.world;
        const oWorld = await game.packs.get('conventum.worlds').get(sWorld);  
        
        let activeCombat = helperSheetCombat.myActiveCombat(actorFrom);
        let steps = activeCombat.encounter.system.steps
                                          .filter(e => e.actor === actorFrom.id);


        let finalDamage = 0;
        let armorDamage = 0;

        //Getting locations...
        const pLocations = await game.packs.get('conventum.locations');
        const dLocations = await pLocations.getDocuments();
        const mLocations = dLocations.filter(e => (e.system.control.world === sWorld) 
                                               && (e.system.actorType === actor.type));

        history.push(' --- '+game.i18n.localize("common.location")+' --- ');

        let location;
        if ((locationId === '') || (!locationId)) {

            //Rolling Location...
            const sDice = '1d10';
            let roll = new Roll(sDice, {});
            roll.evaluate({async: false});
            if (game.dice3d) {
                game.dice3d.showForRoll(roll);
            }        
            location = mLocations.find(e => (e.system.range.low <= roll.total) 
                                         && (e.system.range.high >= roll.total));   
            
            history.push(game.i18n.localize("common.locationRoll")+': '+roll.total);
            history.push(location.name);

        } else {
            location = mLocations.find(e => e.id === locationId);

            history.push(game.i18n.localize("common.locationRoll")+': '+roll.total);
            history.push(location.name);
        }
        
        //Armor Protection
        let armorProtection = (actor.system.armor[location.id]) ?
                                    Number(actor.system.armor[location.id].protection) : 0;
        
        let noByTarget = false;
        let modProtection = '+0';

        if (action) {
            modProtection = (action) ? action.system.armor.mod.protection : '+0';
            for (const step of steps) {
                const oAction = actorFrom.items.get(step.action);
                if ((oAction.system.armor.mod.stack) && (oAction.id !== action.id)) {
                    modProtection = modProtection.toString()+ oAction.system.armor.mod.protection;
                }
                if ((step.targets) && 
                    (step.targets.find(e => e === actorFrom.id))
                    && (oAction.system.armor.mod.targetProtection !== '') ) {
                        if (oAction.system.armor.targetNoProtection) noByTarget = true;
                        modProtection = modProtection.toString()+ oAction.system.armor.mod.targetProtection;
                    }
            }
            history.push(action.name);
            history.push(game.i18n.localize("common.modProtection")+': '+modProtection);
        }

        armorProtection = (armorProtection != 0) ? eval(armorProtection.toString() + modProtection) : 0;
        if (action) {
            if ((action.system.armor.noProtection) || (noByTarget)) {
                armorProtection = 0;
                history.push(action.name);
                history.push(game.i18n.localize("common.noProtection"));                
            }
        }
        if (spell) {
            if ((spell.system.damage.noArmor) || (noByTarget)) {
                armorProtection = 0;
                history.push(spell.name);
                history.push(game.i18n.localize("common.noProtection"));                
            }
        }

        if (armorProtection >= nDamage) { 
            finalDamage = 0;
            armorDamage = nDamage;
        } else {
            finalDamage = (nDamage - armorProtection) * Number(location.system.modDamage);
            armorDamage = nDamage; //???
        }
        finalDamage = Math.round(finalDamage);
        history.push(game.i18n.localize("common.finalDamage")+ ': ' + finalDamage.toString());

        //Apply Damage
        const nHp = actor.system.characteristics.secondary.hp.value - finalDamage;
        history.push(game.i18n.localize("common.hitPoints")+ ': ' + 
                    actor.system.characteristics.secondary.hp.value.toString()+ ' -> '+
                    nHp.toString());

        let nArmor = (actor.system.armor[location.id]) ? 
                        actor.system.armor[location.id].value - armorDamage :
                        0;

        let armorModif = {};
        if (actor.system.armor[location.id])
            armorModif[location.id] = {value: nArmor};
        history.push(game.i18n.localize("common.armorHit")+ ': ' + nArmor.toString());

        //Concentration penalization
        let sPenalConc = (Number(actor.system.magic.penal.concentration) - finalDamage*10).toString();
        history.push(game.i18n.localize("common.penalConc")+ ': ' + (finalDamage*10).toString());
        history.push(game.i18n.localize("common.concentration")+ ': ' + sPenalConc);
      
        // actor.update({
        //    system: {
        //        characteristics: { secondary: { hp: { value: nHp }}},
        //        armor: armorModif,
        //        magic: { penal: { concentration: sPenalConc }}
        //    }
        // });
        helperSocket.update(actor, {
            system: {
                characteristics: { secondary: { hp: { value: nHp }}},
                armor: armorModif,
                magic: { penal: { concentration: sPenalConc }}
            }
        });

        //Armor damage... (Endurance)
        if ( (actor.system.armor[location.id])
          && (actor.system.armor[location.id].itemID)
          && (actor.system.armor[location.id].itemID !== '') ) {

            let armorItem = actor.items.get(actor.system.armor[location.id].itemID);

            let noByTarget = false;
            let armorEndurance = armorItem.system.enduranceCurrent;
            let modEndurance = (action) ? action.system.armor.mod.endurance : '+0';
            for (const step of steps) {
                const oAction = actorFrom.items.get(step.action);
                if ((oAction.system.armor.mod.stack) && (oAction.id !== action.id))
                modEndurance = modEndurance.toString()+ oAction.system.armor.mod.endurance;
                if ((step.targets) && 
                    (step.targets.find(e => e === actorFrom.id))
                    && (oAction.system.armor.mod.targetEndurance !== '') ) {
                        if (oAction.system.armor.noEndurance) noByTarget = true;
                        modEndurance = modEndurance.toString()+ oAction.system.armor.mod.targetEndurance;
                }
            }            
            armorEndurance = (armorEndurance != 0) ? eval(armorEndurance.toString() + modEndurance) : 0;
            
            if (action) {
                if ((action.system.armor.noEndurance) || (noByTarget)) armorDamage = 0;
            }
            if (spell) {
                if (noByTarget) armorDamage = 0;
            }

            // armorItem.update({
            //     system: {
            //         enduranceCurrent: armorEndurance - armorDamage
            //     }
            // });
            helperSocket.update(armorItem, {
                system: {
                    enduranceCurrent: armorEndurance - armorDamage
                }
            });     
            history.push(game.i18n.localize("common.armorEnduranceLg"+ ': ' + (armorEndurance - armorDamage).toString() ));

            if ( ((action) && (action.system.armor.breakArmor)) ||
                 ((armorEndurance - armorDamage) <= 0) ) {
                    helperSheetArmor.destroyArmor(actor, armorItem.id);
                    history.push(game.i18n.localize("common.brokeArmor"));
            }

        }

        //Bubble message
        if (actor.getActiveTokens()[0]) {
            let bubble = new ChatBubbles();
            bubble.broadcast(
                actor.getActiveTokens()[0],
                '<div class="_damageBubble">'+finalDamage.toString()+'</div>',
                {
                    defaultSelected: true,
                    selected: true
                }
            );
        }

        //Chat message
        let sContent = '<div class="_msgDamLocation">'+location.name+'</div>'+
                       '<ul class="_msgDamInfo">'+
                          '<li>'+game.i18n.localize("common.damage")+': '+nDamage.toString()+'</li>'+
                          '<li>'+game.i18n.localize("common.armor")+': -'+armorProtection.toString()+'</li>'+
                          '<li>'+game.i18n.localize("common.location")+': * '+location.system.modDamage.toString()+'</li>'+
                       '</ul>'+
                       helperRolls._getMessageHelpTab(history)+
                       '<div class="_msgDamTotal">'+finalDamage.toString()+'</div>'+
                       '<div class="_hitPoints">'+game.i18n.localize("common.hp")+'</div>'
        helperMessages.chatMessage(sContent, actor, true);
    }

    /**
     * consumeMyStep
     * @param {*} actor 
     * @returns 
     */
    static consumeMyStep(actor) {

        //Encounter Step 
        const myCombat = helperSheetCombat.myActiveCombat(actor);
        if (!myCombat) return;
        if ( (!myCombat.encounter.system.steps) ||
            (myCombat.encounter.system.steps.length === 0) ) return;

        let oEncounter = game.items.get(myCombat.encounter.id);
        let mSteps = oEncounter.system.steps;
        let oStep = mSteps.find(e => (e.actor === actor.id)
                                    && (!e.consumed));

        //Consuming action
        oStep.consumed = true;
        oEncounter.update({
            system: { steps: mSteps }
        });        
    }

    /**
     * _modActionCombatSkill
     * @param {*} actor 
     * @param {*} action 
     * @param {*} weapon 
     */
    static _modActionCombatSkill(actor, combatSkill, action, weapon, mods, history) {
        if (!actor || !action || !weapon) return;
        
        mods.skill = "";

        //By Action
        mods.skill += this.penalValue(action.system.skill.mod.combatSkill);
        if (this.penalValue(action.system.skill.mod.combatSkill) !== '-0')
            history.push('['+action.name+']</br>'+
                game.i18n.localize("common.modCombatSkill")+': '+
                    this.penalValue(action.system.skill.mod.combatSkill));        

        //Skill multiplicator
        mods.skillMult = action.system.skill.mod.multSkill;
            history.push('['+action.name+']</br>'+
                game.i18n.localize("common.modSkillMult")+': '+
                    action.system.skill.mod.multSkill.toString());            

        //By Weapon
        if (weapon.system.penalty.skills[weapon.system.combatSkill]) {
            mods.skill += this.penalValue(weapon.system.penalty.skills[weapon.system.combatSkill]);
            history.push('['+combatSkill.name+']</br>'+
                game.i18n.localize("common.modificator")+': '+
                    this.penalValue(weapon.system.penalty.skills[weapon.system.combatSkill]));              
        }

        //Total Modificator
        mods.skill = this.penalValue(eval(mods.skill));

        let myActiveCombat = helperSheetCombat.myActiveCombat(actor);
        let mSteps = myActiveCombat.encounter.system.steps
                                             .filter(e => e.actor !== actor.id);

        let penalSkillAsTarget = '';
        let multSkillAsTarget = '';
        let sAction = '';
        for (const step of mSteps) {
            const oActor = game.actors.get(step.actor);
            const oAction = oActor.items.get(step.action);
            if ((oAction.system.skill.mod.stack) && (oAction.id !== action.id)) {
                mods.skill += oAction.system.skill.mod.combatSkill;
                history.push('['+oAction.name+']</br>'+
                    game.i18n.localize("common.modCombatSkill")+': '+
                        oAction.system.skill.mod.combatSkill);
            }
            if ((step.targets) && 
                (step.targets.find(e => e === actor.id))
                && ( (oAction.system.skill.mod.targetCombatSkill !== '') ||
                     (oAction.system.skill.mod.multSkillTarget !== 0) ) ) {
                    
                    if (oAction.system.skill.mod.multSkillTarget === null)
                            oAction.system.skill.mod.multSkillTarget = 1;

                    penalSkillAsTarget = this.penalValue(oAction.system.skill.mod.targetCombatSkill);
                    multSkillAsTarget = oAction.system.skill.mod.multSkillTarget;
                    sAction = oAction.name;
            }
        }
        if (penalSkillAsTarget !== '') {
            mods.skill += penalSkillAsTarget; 
            mods.skill = this.penalValue(eval(mods.skill));
            history.push('['+sAction+']</br>'+
                game.i18n.localize("common.modTargetCombatSkill")+': '+
                    penalSkillAsTarget);            
        }
        if ((Number(multSkillAsTarget) !== 0) &&
            (Number(multSkillAsTarget) !== 1)) {
            mods.skillMult = Number(mods.skillMult) * Number(multSkillAsTarget);
            history.push('['+sAction+']</br>'+
                game.i18n.localize("common.modSkillMultTarget")+': '+
                    multSkillAsTarget);                    
        }


    }

    /**
     * _modActionCombatDamage
     * @param {*} actor 
     * @param {*} action 
     * @param {*} weapon 
     */
    static _modActionCombatDamage(actor, action, weapon, mods, history) {
        if (!actor || !action || !weapon) return;
        
        mods.damage = "";

        //By Action
        mods.damage += action.system.damage.mod.damage;
        if (action.system.damage.mod.damage !== '')
            history.push('['+action.name+']</br>'+
                game.i18n.localize("common.modDamage")+': '+
                    action.system.damage.mod.damage); 

        let myActiveCombat = helperSheetCombat.myActiveCombat(actor);
        let mSteps = myActiveCombat.encounter.system.steps
                                             .filter(e => e.actor !== actor.id);
        
        let damageAsTarget = '';
        let sAction = '';
        for (const step of mSteps) {
            const oActor = game.actors.get(step.actor);
            const oAction = oActor.items.get(step.action);
            if ((oAction.system.damage.mod.stack) && (oAction.id !== action.id)) {
                mods.damage += oAction.system.damage.mod.damage;
                history.push('['+oAction.name+']</br>'+
                    game.i18n.localize("common.modDamage")+': '+
                        oAction.system.damage.mod.damage);
            }
            if ((step.targets) && 
                (step.targets.find(e => e === actor.id))
                && (oAction.system.damage.mod.targetDamage !== '') ) {
                    damageAsTarget = oAction.system.damage.mod.targetDamage;
                    sAction = oAction.name;                   
            }
        }
        if (damageAsTarget !== '') {
            mods.damage += damageAsTarget;
            history.push('['+sAction+']</br>'+
                game.i18n.localize("common.modTargetDamage")+': '+
                    damageAsTarget);            
        }
    }    

    /**
     * getMount
     * @param {*} actor 
     * @returns 
     */
    static getMount(actor) {
        if (actor.system.equipment.mount !== '') {
            return game.actors.get(actor.system.equipment.mount);
        } else {
            return null;
        }
    }

    /**
     * _penalValue
     * @param {*} sPenal 
     */
    static penalValue(sPenal) {
        if (!sPenal) return '-0';
        if (Number(sPenal) === NaN) return '-0';
        if (sPenal === '-0') return '-0';
        if (Number(sPenal) >= 0) return '+'+Number(sPenal).toString();
                            else return Number(sPenal).toString();
    }    

}