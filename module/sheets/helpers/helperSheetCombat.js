/**
 * Helpers for Combat in Action Pools Sheet
 */

import { helperMessages } from "./helperMessages.js";
import { helperActions } from "./helperActions.js";
import { helperRolls } from "./helperRolls.js";
import { helperSheetArmor } from "./helperSheetArmor.js"

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
                            '<img src="'+action.img+'">'+
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
            

        //Targets Dialog
        let oButtons = {};
        mActors.map(e => {
            oButtons[e.actorId] = {
                label: e.name,
                actorId: e.actorId,
                img: e.img,
                callback: () => helperSheetCombat.setTargetPlayWeapon(actor, e.actorId, action, weaponId)
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
     * setTargetPlayWeapon
     * @param {*} actor 
     * @param {*} actorTokenId 
     * @param {*} action 
     * @param {*} weaponId 
     */
    static async setTargetPlayWeapon(actor, actorTokenId, action, weaponId) {
        let oActor = game.actors.get(actorTokenId);
        let tokenId = oActor.getActiveTokens()[0].id;   
        let encounter = helperSheetCombat.myActiveCombat(actor).encounter;
        let actualStep = encounter.system.steps.filter(e => !e.consumed)[0];
        actualStep.targets = [tokenId];
        await encounter.update({system: {steps: encounter.system.steps}});
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

        const combatSkill = game.packs.get('conventum.skills').get(weaponItem.system.combatSkill);
        if (!combatSkill) return;
        const actorSkill = actor.system.skills[weaponItem.system.combatSkill];
        if (!actorSkill) return;

        const actionItem = (actorActions.action !== '') ? actorActions.action : null;
        let mods = {
            skill: '',
            skillTxt: '',
            damage: '',
            damageTxt: ''
        };

        //CombatSkill
        helperSheetCombat._modActionCombatSkill(actor, actionItem, weaponItem, mods);
        let finalPercent = Number(eval(actorSkill.value.toString()+mods.skill));

        //Damage
        helperSheetCombat._modActionCombatDamage(actor, actionItem, weaponItem, mods);
        let finalDamage = weaponItem.system.damage+mods.damage;

        //Leveled Rolls
        let bLeveled = actionItem.system.rolls.leveled;

        helperRolls.rollAction(actor, actorTargets, actionItem, bLeveled,
                               combatSkill, finalPercent,
                               weaponItem, finalDamage,
                               mods);
    }

    /**
     * rollDamage
     * @param {*} weaponId 
     * @param {*} actorId 
     * @param {*} sTargets 
     * @param {*} sDamage 
     */
    static async rollDamage(weaponId, actorId, actionId, sTargets, sDamage, messageId, locationId) {
        const actor = game.actors.get(actorId);
        if (!actor) return;
        const weapon = actor.items.get(weaponId);
        if (!weapon) return;
        const action = (actionId) ? actor.items.get(actionId) : null;
        const mTargets = sTargets.split('.');

        //Rolling Damage...
        let roll = new Roll(sDamage, {});
        roll.evaluate({async: false});
        if (game.dice3d) {
            game.dice3d.showForRoll(roll);
        }        
        const damage = roll.total;

        //Damage in message...
        let message = game.messages.get(messageId);

        let sToFind = $(message.content).find('._rollDamage ._name').parent().parent().html();
        const sToReplace = '<div class="_name _finalDamage">'+damage.toString()+'</div>';
        let newContent = message.content.replace(sToFind, sToReplace);

        sToFind = sToFind.replace('.png">', '.png" />');
        sToFind = sToFind.replaceAll('=""', '');
        newContent = message.content.replace(sToFind, sToReplace);

        message.update({
            content: newContent });

        //Applying damage to each target...
        for (var i=0; i<mTargets.length; i++) {
            await helperSheetCombat.applyDamage(mTargets[i], damage, locationId, actor, action);
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

        mSteps.push({
            actor: actor._id,
            action: action._id,
            consumed: false,
            applyLocation: applyLocation
        });

        await encounter.update({
            system: { steps: mSteps }
        }); 
    }

    /**
     * applyDamage
     * @param {*} actorId 
     * @param {*} nDamage 
     */
    static async applyDamage(actorId, nDamage, locationId, actorFrom, action) {
        let actor = game.actors.get(actorId);
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
        } else
            location = mLocations.find(e => e.id === locationId);
        
        //Armor Protection
        let armorProtection = (actor.system.armor[location.id]) ?
                                    Number(actor.system.armor[location.id].protection) : 0;
        
        let noByTarget = false;
        let modProtection = (action) ? action.system.armor.mod.protection : '+0';
        for (const step of steps) {
            const oAction = actorFrom.items.get(step.action);
            if ((oAction.system.armor.mod.stack) && (oAction.id !== action.id))
                modProtection = modProtection.toString()+ oAction.system.armor.mod.protection;
            if ((step.targets) && 
                (step.targets.find(e => e === actorFrom.id))
                && (oAction.system.armor.mod.targetProtection !== '') ) {
                    if (oAction.system.armor.targetNoProtection) noByTarget = true;
                    modProtection = modProtection.toString()+ oAction.system.armor.mod.targetProtection;
                }
        }
        armorProtection = (armorProtection != 0) ? eval(armorProtection.toString() + modProtection) : 0;
        if ((action.system.armor.noProtection) || (noByTarget)) armorProtection = 0;

        if (armorProtection >= nDamage) { 
            finalDamage = 0;
            armorDamage = nDamage;
        } else {
            finalDamage = (nDamage - armorProtection) * Number(location.system.modDamage);
            armorDamage = nDamage; //???
        }
        finalDamage = Math.round(finalDamage);

        //Apply Damage
        const nHp = actor.system.characteristics.secondary.hp.value - finalDamage;
        const nArmor = actor.system.armor[location.id].value - armorDamage;
        let armorModif = {};
            armorModif[location.id] = {value: nArmor};

        actor.update({
            system: {
                characteristics: { secondary: { hp: { value: nHp }}},
                armor: armorModif
            }
        });

        //Armor damage... (Endurance)
        if ( actor.system.armor[location.id].itemID 
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
            if ((action.system.armor.noEndurance) || (noByTarget)) armorDamage = 0;

            armorItem.update({
                system: {
                    enduranceCurrent: armorEndurance - armorDamage
                }
            });

            if ( (action.system.armor.breakArmor) ||
                 ((armorEndurance - armorDamage) <= 0) ) {
                    helperSheetArmor.destroyArmor(actor, armorItem.id);
            }
        }

        //Bubble message
        let bubble = new ChatBubbles();
        bubble.broadcast(
            actor.getActiveTokens()[0],
            '<div class="_damageBubble">'+finalDamage.toString()+'</div>',
            {
                defaultSelected: true,
                selected: true
            }
        );

        //Chat message
        let sContent = '<div class="_msgDamLocation">'+location.name+'</div>'+
                       '<ul class="_msgDamInfo">'+
                          '<li>'+game.i18n.localize("common.damage")+': '+nDamage.toString()+'</li>'+
                          '<li>'+game.i18n.localize("common.armor")+': -'+armorProtection.toString()+'</li>'+
                          '<li>'+game.i18n.localize("common.location")+': * '+location.system.modDamage.toString()+'</li>'+
                       '</ul>'+
                       '<div class="_msgDamTotal">'+finalDamage.toString()+'</div>';
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
    static _modActionCombatSkill(actor, action, weapon, mods) {
        if (!actor || !action || !weapon) return;
        
        mods.skill = action.system.skill.mod.combatSkill;
        mods.skillTxt = "";

        let myActiveCombat = helperSheetCombat.myActiveCombat(actor);
        let mySteps = myActiveCombat.encounter.system.steps
                                              .filter(e => e.actor === actor.id);
        for (const step of mySteps) {
            const oAction = actor.items.get(step.action);
            if ((oAction.system.skill.mod.stack) && (oAction.id !== action.id)) {
                mods.skill += oAction.system.skill.mod.combatSkill;
                mods.skillTxt += "/stack";
            }
            if ((step.targets) && 
                (step.targets.find(e => e === actor.id))
                && (oAction.system.skill.mod.targetCombatSkill !== '') ) {
                    mods.skill += oAction.system.skill.mod.targetCombatSkill;
                    mods.skillTxt += "/byTarget";
            }
        }
    }

    /**
     * _modActionCombatDamage
     * @param {*} actor 
     * @param {*} action 
     * @param {*} weapon 
     */
    static _modActionCombatDamage(actor, action, weapon, mods) {
        if (!actor || !action || !weapon) return;
        
        mods.damage = action.system.damage.mod.damage;
        mods.damageTxt = "";

        let myActiveCombat = helperSheetCombat.myActiveCombat(actor);
        let mySteps = myActiveCombat.encounter.system.steps
                                              .filter(e => e.actor === actor.id);
        for (const step of mySteps) {
            const oAction = actor.items.get(step.action);
            if ((oAction.system.damage.mod.stack) && (oAction.id !== action.id)) {
                mods.damage += oAction.system.damage.mod.damage;
                mods.damageTxt += "/stack";
            }
            if ((step.targets) && 
                (step.targets.find(e => e === actor.id))
                && (oAction.system.damage.mod.targetDamage !== '') ) {
                    mods.damage += oAction.system.damage.mod.targetDamage;
                    mods.damageTxt += "/byTarget";
            }
        }        

    }    

}