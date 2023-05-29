/**
 * Helpers for Combat in Action Pools Sheet
 */

import { helperMessages } from "./helperMessages.js";
import { helperActions } from "./helperActions.js";
import { helperRolls } from "./helperRolls.js";

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
        const nItemActions = ( action.system.steps.actionSteps ) ? action.system.steps.actionSteps : 1;
        const nTotalActions = nActions + nItemActions;
        const bValidActions = (nTotalActions <= nMaxActions);

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
        let mActors = activeCombat.combat.turns.filter(
                                                  e => e.actorId !== actor.id );

        //Defending...
        if (myAction.action.system.defense.targetAttack) {

            //Last step in the encounter
            let lastStep;
            for (const step of activeCombat.encounter.system.steps) {
                if ( (step.actor === actor.id)
                  && (step.action === myAction.action.id)
                  && (!step.consumed) ) break;
                else lastStep = step;
            }

            //Next action Actor is target
            let actionActor;
            Array.from(game.messages).map(message => {
                let messAction = $(message.content).find('._messageAction a._showItem');
                if (!messAction) return;
                if ( (lastStep) &&
                     (messAction.data('itemid') === lastStep.action) )
                     actionActor = messAction.data('actorid');
            });            
            let aActor = game.actors.get(actionActor);
            mActors = [{
                actorId: actionActor,
                name: aActor.name,
                img: aActor.img
            }];
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

        //Using only Weapons or Shields...
        if (actorActions.showPoster) {
          if ((actorActions.action.system.attack.onlyWeapons) && 
                (weaponItem.system.type.shield)) {
                ui.notifications.warn(game.i18n.localize("info.actionNotShield"));
                return; }
          if ((actorActions.action.system.defense.onlyShields) && 
                (!weaponItem.system.type.shield)) {
                ui.notifications.warn(game.i18n.localize("info.actionNotWeapon"));
                return; }                
        }

        const combatSkill = game.packs.get('conventum.skills').get(weaponItem.system.combatSkill);
        if (!combatSkill) return;
        const actorSkill = actor.system.skills[weaponItem.system.combatSkill];
        if (!actorSkill) return;

        const actionItem = (actorActions.action !== '') ? actorActions.action : null;
        let mods = {
            attack: '',
            defense: '',
            damage: '',
            percent: ''
        };

        //Percents Mods
        helperSheetCombat._modActionWeaponPercent(actor, actionItem, weaponItem, mods);
        let finalPercent = Number(eval(actorSkill.value.toString()+mods.percent));

        //Damage Mods
        helperSheetCombat._modActionWeaponDamage(actor, actionItem, weaponItem, mods);
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
    static async rollDamage(weaponId, actorId, sTargets, sDamage, messageId) {
        const actor = game.actors.get(actorId);
        if (!actor) return;
        const weapon = actor.items.get(weaponId);
        if (!weapon) return;
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
            await helperSheetCombat.applyDamage(mTargets[i], damage, '');
        }

    }

    /**
     * _addAction
     * @param {*} actor 
     * @param {*} action 
     */
    static async _addAction(actor, action, button, dialog) {
        
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
            consumed: false
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
    static async applyDamage(actorId, nDamage, locationId) {
        let actor = game.actors.get(actorId);
        if (!actor) return;
        const sWorld = actor.system.control.world;
        const oWorld = await game.packs.get('conventum.worlds').get(sWorld);  
        
        let finalDamage = 0;
        let armorDamage = 0;

        //Getting locations...
        const pLocations = await game.packs.get('conventum.locations');
        const dLocations = await pLocations.getDocuments();
        const mLocations = dLocations.filter(e => (e.system.control.world === sWorld) 
                                               && (e.system.actorType === actor.type));

        let location;
        if (locationId === '') {

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
        
        //Armor
        const armorProtection = (actor.system.armor[location.id]) ?
                                    Number(actor.system.armor[location.id].protection) : 0;
        
        if (armorProtection >= nDamage) { 
            finalDamage = 0;
            armorDamage = nDamage;
        } else {
            finalDamage = (nDamage - armorProtection) * Number(location.system.modDamage);
            armorDamage = nDamage; //???
        }
        finalDamage = Math.round(finalDamage);

        //Damage
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

        //Armor damage...
        if ( actor.system.armor[location.id].itemID 
          && (actor.system.armor[location.id].itemID !== '') ) {

            let armorItem = actor.items.get(actor.system.armor[location.id].itemID);            
            armorItem.update({
                system: {
                    enduranceCurrent: armorItem.system.enduranceCurrent - armorDamage
                }
            });
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
     * _modActionWeaponPercent
     * @param {*} actor 
     * @param {*} action 
     * @param {*} weapon 
     */
    static _modActionWeaponPercent(actor, action, weapon, mods) {
        if (!actor || !action || !weapon) return;
        
        let sMod = '';
        if (action.system.type.attack) {
            sMod = action.system.attack.mod;
            mods.attack = sMod;
        }

        if (action.system.type.defense) {
            sMod = action.system.defense.mod;
            mods.defense = sMod;
        }        
        mods.percent = sMod;
    }

    /**
     * _modActionWeaponDamage
     * @param {*} actor 
     * @param {*} action 
     * @param {*} weapon 
     */
    static _modActionWeaponDamage(actor, action, weapon, mods) {
        if (!actor || !action || !weapon) return;
        
        let sMod = '';
        sMod = action.system.damage.mod;
        
        mods.damage = sMod;
    }    

}