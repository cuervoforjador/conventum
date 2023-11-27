
import { aqActions } from "./aqActions.js";
import { aqContext } from "./aqContext.js";
import { helperSocket } from "../helpers/helperSocket.js";
import { helperSheetHuman } from "../sheets/helpers/helperSheetHuman.js";
import { helperCusto } from "../helpers/helperCusto.js";

export class aqCombat {

    /**
     * addAction
     * @param {*} actorId 
     * @param {*} actionId 
     */
    static async addAction(actorId, actionId, isToken, tokenId) {

        const actor = (isToken) ? (await game.scenes.active.tokens.get(tokenId)).getActor() : 
                                  game.actors.get(actorId);
        if (!actor) return;

        const sWorldId = actor.system.control.world;
        await helperCusto.getDocumentsByWorld('locations', sWorldId);
        await helperCusto.getDocumentsByWorld('modes', sWorldId);

        const combat = aqActions.getCurrentCombat();
        let myEncounter = aqActions.getMyCurrentEncounter(actorId, tokenId);

        const action = actor.items.get(actionId);
        if (!action) return;

        if (!myEncounter) {
            new Dialog({
              title: game.i18n.localize("common.actions"),
              content: game.i18n.localize("info.actionNoCombat"),
              buttons: {}
            }).render(true);
            return;
        }

        let actionLocation = aqActions.getActionLocation(action);
        const actionInfo = await aqActions.getActionsInfo(actorId, tokenId);
        const actionCost = aqActions.getActionCost(actor, action);
        const nTotal = actionInfo.sumActions + actionCost;
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
        Array.from(game.packs.get("aquelarre.locations")).filter(e => e.system.actorType === sTypeInitial)
             .forEach(oLocation => {
            if (actionLocation === '')
                sTargetLocation += '<option value="'+oLocation.id+'">'+oLocation.name+'</option>';
            else if (oLocation.id === actionLocation)
                sTargetLocation += '<option value="'+oLocation.id+'" selected >'+oLocation.name+'</option>';
        });
        sTargetLocation += '</select>';       

        //MySelf
        const mySelf = (tokenId) ?
                            combat.turns.filter(
                                e => ((e.actorId === actorId) &&
                                      (e.tokenId === tokenId)) ) :
                            combat.turns.filter(
                                e => (e.actorId === actorId) );
        const myToken = mySelf[0].token;

        // Targets
        let mTargets0 = await this.getCombatTargets();
        let mTargets = await this.getActionTargets(action, actorId, tokenId);

        let sTargets = '<ul class="_targetsMatrix">';

        if (action.system.target.multiple) {

            mTargets0.map(tar => {

                const eActor = (tar.actor) ? tar.actor : (tar._actor) ? tar._actor : null;
                const eToken = (tar.token) ? tar.token : (eActor) ? eActor.token : null;
                const uniqeId = (eActor.isToken) ? tar.tokenId : tar.actorId;
                const distance = this.getDistance(myToken, eToken)+' '+this.getDistanceUnit();           

                const bActive = (mTargets.find(e => 
                                    ((e.actorId === tar.actorId) && (e.tokenId === tar.tokenId))) !== undefined);
                sTargets += '<li class="_selActionTarget ' + ((bActive) ? '' : '_inactive') + '">'+   

                                '<input type="checkbox" '+
                                    'name="actSelectActionToken" '+
                                    'data-actorid="'+tar.actorId+'"'+
                                    'data-tokenid="'+tar.tokenId+'"'+
                                    'value="{{'+tar.actorId+'}}" '+
                                   ((!bActive) ? 'disabled' : '')+' />'+  
                                '<div class="_selActionTargetWrap">'+
                                    '<img src="'+tar._actor.img+'">'+
                                    '<label>'+tar._actor.name+'</label>'+
                                    '<div class="_distance">'+distance+'</div>'+
                                '</div>'+
                            '<li>';
            });

        } else {

            mTargets0.map(tar => {

                const eActor = (tar.actor) ? tar.actor : (tar._actor) ? tar._actor : null;
                const eToken = (tar.token) ? tar.token : (eActor) ? eActor.token : null;
                const uniqeId = (eActor.isToken) ? tar.tokenId : tar.actorId;
                const distance = this.getDistance(myToken, eToken)+' '+this.getDistanceUnit();                   

                const bActive = (mTargets.find(e => 
                                    ((e.actorId === tar.actorId) && (e.tokenId === tar.tokenId))) !== undefined);
                sTargets += '<li class="_selActionTarget ' + ((bActive) ? '' : '_inactive') + '">'+

                                '<input type="radio" '+
                                       'name="actSelectActionToken" '+
                                       'data-actorid="'+tar.actorId+'"'+
                                       'data-tokenid="'+tar.tokenId+'"'+
                                       'value="{{'+tar.actorId+'}}" '+
                                      ((!bActive) ? 'disabled' : '')+' />'+
                                '<div class="_selActionTargetWrap">'+
                                    '<img src="'+tar._actor.img+'">'+
                                    '<label>'+tar._actor.name+'</label>'+
                                    '<div class="_distance">'+distance+'</div>'+
                                '</div>'+
                            '<li>';
            });
        }
        sTargets += '</ul>';

        // Content
        const content = ''+
        '<div class="_posterAction">'+
            //'<img src="'+action.img+'" />'+
            //'<div class="_whiteWrap"></div>'+
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
            //'<label class="_minimal3">'+game.i18n.localize('common.location')+'</label>'+
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
            '</div>'+
            sTargets+
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
                disabled: true,
                callback: this._addAction.bind(this, actor, action),
                icon: '<i class="fas fa-check"></i>'
            };
        }
        let dialog =  new Dialog({
                            title: action.name,
                            content: content,
                            buttons: buttons,
                            default: "button1"
                      });
        dialog.options.classes.push('addingActions');                      
        dialog.render(true, {
            width: 800,
            height: 600,
            minimizable: false
        });
    }
    
    /**
     * _addAction
     * @param {*} actor 
     * @param {*} action 
     */
    static async _addAction(actor, action, dialog, button) {
        
        //Targets
        let mTargets = [];
        dialog.find('ul._targetsMatrix').find("li").each(function(index, reg) {
            if ($(reg).find('input').prop("checked")) {
                const sActorId = $(reg).find('input').data('actorid');
                const sTokenId = $(reg).find('input').data('tokenid');
                const uniqeId = aqActions.uniqeIdFromIDS(sActorId, sTokenId);
                mTargets.push(uniqeId);
            }
        });        

        if (mTargets.length === 0) {
            new Dialog({
                title: 'Info',
                content: game.i18n.localize("info.noTargets2"),
                buttons: [] }).render(true); 
            return;
        }

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
        
        if (actor.isToken) {
            if (!Array.from(activeCombat.combatants).find(e => ((e.actorId === actor._id) && 
                                                                (e.tokenId === actor.token._id)) ))
                return;
        } else {
            if (!Array.from(activeCombat.combatants).find(e => e.actorId === actor._id))
                return;
        }

        let encounter = game.items.filter(e => e.type === 'actionPool')
                                  .find(e => e.system.combat === activeCombat._id);
        if (!encounter) return;
        let mSteps = encounter.system.steps;

        const myUniqeId = actor.isToken ? actor.token._id : actor._id;
        const newStep = {
            actor: actor._id,
            isToken: actor.isToken,
            tokenId: actor.isToken ? actor.token._id : null,
            uniqeId: myUniqeId,
            action: action._id,
            consumed: false,
            applyLocation: applyLocation,
            targets: mTargets
        };
        
        if (mSteps.find(e => e.uniqeId === myUniqeId)) {
            let index = mSteps.findLastIndex(e => e.uniqeId === myUniqeId);
            mSteps.splice(index+1, 0, newStep);
        } else
            mSteps.unshift(newStep);

        helperSocket.update(encounter, {
            system: { steps: mSteps }
        });
        helperSocket.refreshSheets();
    }    


    

    /**
     * getCombatTargets
     * @returns 
     */
    static async getCombatTargets() {
        const combat = aqActions.getCurrentCombat();
        if (!combat) return;
        let mActors = combat.turns;
        mActors.map(e => {
            e._actor = null;
            e._actor = (game.scenes.active.tokens.get(e.tokenId)) ? 
                                game.scenes.active.tokens.get(e.tokenId).getActor() :
                                game.actors.get(e.actorId);
        });
        return mActors;
    }

    /**
     * getActionTargets
     * @param {*} action 
     * @param {*} actorId 
     * @param {*} tokenId 
     * @returns 
     */
    static async getActionTargets(action, actorId, tokenId) {

        const combat = aqActions.getCurrentCombat();
        if (!combat) return;

        let mActors = [];

        //Combatants
        if (action.system.target.combatants)
            if (tokenId)
                mActors = mActors.concat(combat.turns.filter(e => 
                                            !((e.actorId === actorId) &&
                                            (e.tokenId === tokenId)) ));
            else
                mActors = mActors.concat(combat.turns.filter(e => 
                                            !(e.actorId === actorId) ));            

        //MySelf
        const mySelf = (tokenId) ?
                            combat.turns.filter(
                                e => ((e.actorId === actorId) &&
                                      (e.tokenId === tokenId)) ) :
                            combat.turns.filter(
                                e => (e.actorId === actorId) );
        const myToken = mySelf[0].token;

        if (action.system.target.myself)
            if (tokenId)
                mActors = mActors.concat(mySelf);
            else
                mActors = mActors.concat(mySelf);            

        //Last Played, Attacker, Defender
        if ( (action.system.target.lastPlayed) ||
             (action.system.target.lastAttacker) ||
             (action.system.target.lastDefender) ) {

            let lastStep = aqActions.getLastStep(action.system.target.lastAttacker, 
                                                 action.system.target.lastDefender);
            if (lastStep && lastStep.consumed) {
                let lastActor = (lastStep.isToken) ? game.scenes.active.tokens.get(lastStep.tokenId).getActor() : 
                                                     game.actors.get(lastStep.actor);
                
                let combatant = combat.turns.find(e => 
                                    (lastStep.tokenId !== '') ? ((e.actorId === lastStep.actor) && 
                                                                 (e.tokenId === lastStep.tokenId)) :
                                                                (e.actorId === lastStep.actor) );

                mActors = mActors.concat([combatant]); 

                /**
                mActors = mActors.concat([{
                            actorId: lastStep.actor,
                            tokenId: lastStep.tokenId,
                            name: lastActor.name,
                            img: lastActor.img
                        }]);                
                 */
            }
        }
 
        //Getting actors...
        mActors.map(e => {
            e._actor = null;
            e._actor = (game.scenes.active.tokens.get(e.tokenId)) ? 
                                game.scenes.active.tokens.get(e.tokenId).getActor() :
                                game.actors.get(e.actorId);
        });

        //Filtering by Modes...
        for (const s in action.system.modes) {
            if (action.system.modes[s].target) {
                mActors = mActors.filter(e => 
                    e.actor.system.modes.find(s0 => s0 === s));
            }
        }

        return mActors;
    }

    /**
     * prePlayWeapon
     * @param {*} uniqeId 
     * @param {*} weaponId 
     */
    static async prePlayWeapon(uniqeId, weaponId) {

        const tokenId = (game.scenes.active.tokens.get(uniqeId)) ? uniqeId : null;
        const actor = (tokenId) ? game.scenes.active.tokens.get(uniqeId).getActor() : game.actors.get(uniqeId);
        const actorId = actor.id;        
        if (!actor) return;

        const action = aqActions.getCurrentAction(actorId, tokenId);
        if (!action) return;

        const bCombatSkill = ( (action.system.skill.useSkill) && 
                               (!action.system.skill.skillAsCombat) );

        const weapon = (!bCombatSkill) ? actor.items.get(weaponId) : null;
        if ((!weapon) && (!bCombatSkill)) return;        

        const combat = aqActions.getCurrentCombat();
        if (!combat) return;

        const step = aqActions.getCurrentStep();

        //Creating context...
        let context = new aqContext({ actorId: actorId, 
                                      tokenId: tokenId,
                                      weaponId: weaponId });        
        await context.setTargets(step.targets);

        if (!bCombatSkill)  await aqCombat.playWeapon(context);     
                      else  await aqCombat.playCombatSkill(uniqeId, context);         

    }

    /**
     * dialogTargets
     * @param {*} uniqeId 
     * @param {*} weaponId 
     * @returns 
     */
    static async dialogTargets(uniqeId, weaponId) {

        const tokenId = (game.scenes.active.tokens.get(uniqeId)) ? uniqeId : null;
        const actor = (tokenId) ? game.scenes.active.tokens.get(uniqeId).getActor() : game.actors.get(uniqeId);
        const actorId = actor.id;        
        if (!actor) return;

        const action = aqActions.getCurrentAction(actorId, tokenId);
        if (!action) return;

        const bCombatSkill = ( (action.system.skill.useSkill) && 
                               (!action.system.skill.skillAsCombat) );

        const weapon = (!bCombatSkill) ? actor.items.get(weaponId) : null;
        if ((!weapon) && (!bCombatSkill)) return;        

        const combat = aqActions.getCurrentCombat();
        if (!combat) return;

        let myToken = null;
        if (actor.getActiveTokens().length > 0) {
            actor.getActiveTokens().map(e => {
                if (game.scenes.active.tokens.get(e.id) !== undefined)
                    myToken = game.scenes.active.tokens.get(e.id);
            });
        }

        let mActors = await this.getActionTargets(action, actorId, tokenId);

        //Creating context...
        let context = new aqContext({actorId: actorId, 
                                     tokenId: tokenId,
                                     weaponId: weaponId});

        //Multiple targets...
        if ((action) && 
            (action.system.target.multiple)) {
                
            let mTargets = [];
            Array.from(game.user.targets).map(target => {
                mTargets.push(target.document.id) });
            if (mTargets.length === 0) {
                new Dialog({
                    title: 'Info',
                    content: game.i18n.localize("info.multipleTargets"),
                    buttons: [] }).render(true);                      
            } else {
                await context.setTargets(mTargets);

                if (!bCombatSkill)
                    await aqCombat.playWeapon(context);     
                else 
                    await aqCombat.playCombatSkill(uniqeId);

            }  
            return;            
        }

        //Targets Dialog
        let oButtons = {};
        mActors.map(e => {
            const eActor = (e.actor) ? e.actor : (e._actor) ? e._actor : null;
            const eToken = (e.token) ? e.token : (eActor) ? eActor.token : null;
            const uniqeId = (eActor.isToken) ? e.tokenId : e.actorId;
            const distance = this.getDistance(myToken, eToken);

            oButtons[uniqeId] = {
                label: eActor.name,
                distance: distance,
                uniqeId: uniqeId,
                actorId: e.actorId,
                tokenId: (eActor.isToken) ? e.tokenId : null,
                isToken: (eActor.isToken),
                img: eActor.img,
                combatTarget: true,
                callback: async () => {
                    await context.setTargets([uniqeId]);
                    if (!bCombatSkill)
                        await aqCombat.playWeapon(context);     
                    else 
                        await aqCombat.playCombatSkill(uniqeId, context);                    
                }
            }
        });
        let content = "";
        if (mActors.length === 0) content = game.i18n.localize("info.noTargets");

        let dialog = new Dialog({
            title: game.i18n.localize("common.targets"),
            content: content,
            buttons: oButtons });        

        dialog.options.classes = ['dialog', '_targetDialogsExpress']; //_targetDialogs
        dialog.render(true);       
    }

    /**
     * dialogTargetsExpress
     * @param {*} uniqeId 
     * @param {*} weaponId 
     */
    static dialogTargetsExpress(uniqeId, weaponId) {

        const tokenId = (game.scenes.active.tokens.get(uniqeId)) ? uniqeId : null;
        const actor = (tokenId) ? game.scenes.active.tokens.get(uniqeId).getActor() : 
                                  game.actors.get(uniqeId);
        const actorId = actor.id;        
        if (!actor) return;

        let myToken = null;
        if (actor.getActiveTokens().length > 0) {
            actor.getActiveTokens().map(e => {
                if (game.scenes.active.tokens.get(e.id) !== undefined)
                    myToken = game.scenes.active.tokens.get(e.id);
            });
        }

        const weapon = actor.items.get(weaponId);
        if (!weapon) return;

        //Creating context...
        let context = new aqContext({actorId: actorId, 
                                     tokenId: tokenId,
                                    weaponId: weaponId,
                                     express: true});

        //Targets Dialog
        let mActors = Array.from(game.actors).filter( e => 
            (  (e.id !== actorId)
            && (e.system.control.visible) ) );
        let oButtons = {};
        mActors.map(target => {
            const uniqeId = (target.isToken) ? target.tokenId : target.id;
            let targetToken = null;
            if (target.getActiveTokens().length > 0) {
                target.getActiveTokens().map(e => {
                    if (game.scenes.active.tokens.get(e.id) !== undefined)
                        targetToken = game.scenes.active.tokens.get(e.id);
                });
            }
            const distance = this.getDistance(myToken, targetToken);

            oButtons[target.id] = {
                label: target.name,
                uniqeId: uniqeId,
                actorId: target.actorId,
                tokenId: (target.isToken) ? target.tokenId : null,
                isToken: (target.isToken),
                img: target.img,
                distance: distance,
                combatTarget: true,
                callback: async () => {
                    context.setExpress(true);
                    await context.setTargets([uniqeId]);
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
     *getDistance
     * @param {*} token1 
     * @param {*} token2 
     * @returns 
     */
    static getDistance(token1, token2) {
        if ((!token1) || (!token2)) return ' - ';
        let ruler = new Ruler();
        ruler._addWaypoint({x: token1.x,
                            y: token1.y});
        ruler.measure({x: token2.x,
                       y: token2.y});
        let sDistance = ruler.totalDistance;
        ruler.measure({});
        ruler.destroy();        
        return sDistance;
    }

    /**
     * getDistanceUnit
     */
    static getDistanceUnit() {
        return ( (game.scenes.active.grid.units) ?
                    game.scenes.active.grid.units :
                    game.i18n.localize("common.distanceUnit"));
    }

    /**
     * checkActionWeapon
     * @param {*} action 
     * @param {*} weapon 
     * @param {*} systemData 
     */
    static checkActionWeapon(action, weapon, oActor) {

        const actor = game.actors.get(oActor._id);
        const actorId = actor.id;
        const tokenId = null;

        const combat = aqActions.getMyCurrentCombat(actorId, tokenId);
        if (!combat) return {
            check: false,
            descr: game.i18n.localize("info.noCombats")
        };  

        const encounter = aqActions.getMyCurrentEncounter(actorId, tokenId);
        if (!encounter) return {
            check: false,
            descr: game.i18n.localize("info.noEncounter")
        };         

        const mActions = aqActions.getActions(actorId, tokenId);
        if (mActions.length === 0) return {
            check: false,
            descr: game.i18n.localize("info.noActions")
        };         

        const currentAction = aqActions.getCurrentAction(actorId, tokenId);
        if (!currentAction) return {
            check: false,
            descr: game.i18n.localize("info.noCurrentAction")
        };         

        const actionItem = action.system.item.weapon;

        //# No in the action mode
        let mModes = [];
        for (var s in action.system.modes) {
            if (action.system.modes[s].allowed)
                mModes.push(s);
        }
        if (mModes.length > 0) {
            let mNoModes = [];
            mModes.map(sMode => {
                if ( !(actor.system.modes.find(s => s === sMode)) )
                    mNoModes.push(sMode);
            });
            if (mNoModes.length > 0) {
                const sMode = game.packs.get("aquelarre.modes").get(mNoModes[0]);
                if (sMode === undefined) sMode = {name: ''};
                return {
                    check: false,
                    descr: game.i18n.localize("info.noModeWeapon").replaceAll('#1', sMode.name)
                };             
            }
        }

        //# Weapon type
        if (!actionItem.type[weapon.system.weaponType]) 
            return {
                check: false,
                descr: game.i18n.localize("info.noWeaponType")
            }

        //# Weapon Size
        const sSize = CONFIG.ExtendConfig.weaponSizes.find(e => 
                        e.id === weapon.system.size).property;
        if (!actionItem.size[sSize])
            return {
                check: false,
                descr: game.i18n.localize("info.noWeaponSize")
            };

        //# Weapon in hands
        if ( !((weapon.system.inHands.inLeftHand) || 
               (weapon.system.inHands.inRightHand) || 
               (weapon.system.inHands.inBothHands)) )
            return {
                check: false,
                descr: game.i18n.localize("info.noWeaponHands")
            };

        //# Double attack!
        let doubleAttackEval = true;
        if (action.system.skill.doubleAttack) {

           //2 weapons in Hands...
           const mHandWeapons = actor.items.filter(e => 
                                   (e.type === 'weapon') 
                                && ((e.system.inHands.inLeftHand) || (e.system.inHands.inRightHand)) );
           if (mHandWeapons.length != 2) 
                return {
                    check: false,
                    descr: game.i18n.localize("info.no2WeaponHands")
                };

           //Min 1 small weapon...
           const smallWeapon = mHandWeapons.find(e => e.system.size === '01');
           if (!smallWeapon)
                return {
                    check: false,
                    descr: game.i18n.localize("info.noSmallWeapon")
                };           

           //Worst Skill value...
           if (mHandWeapons.length == 2) {
              let skill1 = eval( actor.system.skills[mHandWeapons[0].system.combatSkill].value.toString() + '+' +
                                 this.penalValue(actor.system.skills[mHandWeapons[0].system.combatSkill].penal) + 
                                 helperSheetHuman.getHandPenal(actor, mHandWeapons[0]) );
              let skill2 = eval( actor.system.skills[mHandWeapons[1].system.combatSkill].value.toString() + '+' +
                                 this.penalValue(actor.system.skills[mHandWeapons[1].system.combatSkill].penal) + 
                                 helperSheetHuman.getHandPenal(actor, mHandWeapons[1]) );
              
              if (skill1 < 0) skill1 = 0;
              if (skill2 < 0) skill2 = 0;

              if (skill1 <= skill2) {
                 if (weapon._id !== mHandWeapons[0]._id)
                    return {
                        check: false,
                        descr: game.i18n.localize("info.noWorstWeapon")
                    };                    
              } else {
                 if (weapon._id !== mHandWeapons[1]._id)
                    return {
                        check: false,
                        descr: game.i18n.localize("info.noWorstWeapon")
                    };
              }                  
           }
        }        

        return {
            check: true,
            descr: ""
        };          
    }

    /**
     * playCombatSkill
     * @param {*} uniqeId 
     * @returns 
     */
    static async playCombatSkill(uniqeId, context) {

        const tokenId = (game.scenes.active.tokens.get(uniqeId)) ? uniqeId : null;
        const actor = (tokenId) ? game.scenes.active.tokens.get(uniqeId).getActor() : game.actors.get(uniqeId);
        const actorId = actor.id;       

        if (!context)
            context = new aqContext({actorId: actorId, 
                                     tokenId: tokenId,
                                     weaponId: null,
                                     isSkill: true});
        
        context.isSkill = true;
        await context.prepareContext();
        this.rollAction(context);
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
                                  else this._postRollAction(context);
    }

    /**
     * rollSpell
     * @param {*} context 
     */
    static rollSpell(context) {
        if (context.getAskForLevels()) this._dialogLevel(context, true);
                                  else this._postRollSpell(context);
    }

    /**
     * rollDamage
     * @param {*} context 
     */
    static async rollDamage(context) {
        await context.rollDamage();
    }

    static async rollOppo(context, message, actorId) {
        await context.rollOppo(message, actorId);
    }

    static getShield(actor) {
        return Array.from(actor.items).find(e => 
            ((e.type === 'weapon') && 
             (e.system.type.shield) && 
             (e.system.inUse)) );
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
                if (bSpell) aqCombat._postRollSpell(context);
                       else aqCombat._postRollAction(context);
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
    static async _postRollAction(context) {

        context.setRollFormula('1d100');
        if (!context.getNoRoll())
            await context.roll();
        else 
            await aqContext.postNoRoll();
        context.message();
    }

    /**
     * _postRollSpell
     * @param {*} context 
     */
    static async _postRollSpell(context) {

        context.setRollFormula('1d100');
        await context.roll();
        context.message();
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