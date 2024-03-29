/**
 * Helpers for Rolls
 */

import { mainUtils } from "../../mainUtils.js";
import { helperActions } from "./helperActions.js";
import { helperMessages } from "./helperMessages.js";
import { helperSheetCombat } from "./helperSheetCombat.js";
import { helperSheetArmor } from "./helperSheetArmor.js";
import { helperSocket } from "../../helpers/helperSocket.js";

export class helperRolls {

    /**
     * rollChararacteristic
     * @param {*} actor 
     * @param {*} charId 
     */
    static async rollChararacteristic(actor, charId) {

      const sWorld = actor.system.control.world;
      const oWorld = await game.packs.get('aquelarre.worlds').getDocument(sWorld);

      let oButtons = {};
      ['x1', 'x2', 'x3', 'x4', 'x5'].forEach(s => {
        oButtons[s] = {
          label: s,
          callback: () => helperRolls._rollsChar(actor, charId, s)
        }
      });

      let dialog = new Dialog({
        title: game.i18n.localize("characteristic."+charId),
        content: "",
        buttons: oButtons,
        world: oWorld.id });
      dialog.options.classes.push('_charRoll');
      dialog.render(true);

    }

    /**
     * rollSecondary
     * @param {*} actor 
     * @param {*} charId 
     */
    static async rollSecondary(actor, charId) {
      helperRolls._rollsChar(actor, charId);
    }    

    /**
     * _rollsChar
     * @param {*} actor 
     * @param {*} charId 
     * @param {*} sMod 
     */
    static async _rollsChar(actor, charId, sMod) {

      const sWorld = actor.system.control.world;
      const oWorld = await game.packs.get('aquelarre.worlds').getDocument(sWorld);

      const sPath = (actor.system.characteristics.primary[charId] !== undefined) ?
                                                          'characteristics.primary.'+charId :
                  (actor.system.characteristics.secondary[charId] !== undefined) ?    
                                                          'characteristics.secondary.'+charId : null;
      if (!sPath) return;

      let charValue = (actor.system.characteristics.primary[charId] !== undefined) ?
                          actor.system.characteristics.primary[charId].value.toString() :
                      (actor.system.characteristics.secondary[charId] !== undefined) ?    
                          actor.system.characteristics.secondary[charId].value.toString() : null;
      if (!charValue) return;

      const mTraits = actor.items.filter(e => ( (e.type === 'trait') 
                                             && (e.system.mod.characteristic.apply) 
                                             && (e.system.mod.characteristic.id === charId)));
      if (mTraits.length > 0) {
        mTraits.map(trait => {
          if (eval(charValue.toString() + trait.system.mod.characteristic.bono) !== NaN )
            charValue = eval(charValue.toString() + trait.system.mod.characteristic.bono);
        });
      }

      let rollData = "";
      if (actor.system.characteristics.primary[charId])
          rollData = eval( charValue.toString() + sMod.replace('x', '*'));
      if (actor.system.characteristics.secondary[charId]) {
          if (charId === 'luck') {
            rollData = eval( actor.system.characteristics.secondary[charId].initial.toString());
          } else 
            rollData = eval( actor.system.characteristics.secondary[charId].value.toString());
      }
      
      if (oWorld.system.config.rolls.charAndLevels)
        helperRolls._dialogLevel(actor, sPath, rollData, '1d100', null, sMod);
      else 
        helperRolls.rolls(actor, sPath, rollData, '1d100',  null, '', '', sMod);
    }    

    /**
     * rollDices
     * @param {*} actor - Actor object
     * @param {*} sPath - Path for Actor Property (Characteristic, Skill, ...)
     * @param {*} bLeveled - Asking for a leveled roll?
     * @param {*} sFormula - Formula to roll (1d100, ...)
     * @param {*} action - Playing action
     */
    static rollDices(actor, sPath, bLeveled, sFormula, actionId, skill) {
      bLeveled = (bLeveled == true);
      sFormula = (sFormula) ? sFormula : '1d100';

      // Property to roll
      let rollData = actor.system;
      sPath.split('.').map(e => { rollData = rollData[e]} );
      
      const penal = (rollData && rollData.penal) ? rollData.penal : '+0';
      const armorPenal = (skill) ? helperSheetArmor.calcPenalByArmor(actor, skill) : null;

      rollData = (rollData && rollData.value) ? rollData.value : rollData;
      if (rollData.value == 0) rollData = 0;

      rollData = eval(rollData.toString() + penal + (armorPenal ? armorPenal : '') );

      // Asking for level roll
      if (bLeveled) helperRolls._dialogLevel(actor, sPath, rollData, sFormula, actionId);
              else helperRolls.rolls(actor, sPath, rollData, sFormula, null, '', actionId);
    }

    /**
     * rollAction
     * @param {*} actor 
     * @param {*} mTargets 
     * @param {*} action 
     * @param {*} bLeveled 
     * @param {*} skill 
     * @param {*} nPercent 
     * @param {*} weapon 
     * @param {*} sDamage 
     * @param {*} mods 
     */
    static rollAction(actor, mTargets, action, bLeveled,
                      skill, nPercent, weapon, sDamage, mods, spell, history,
                      secondAttack) {

        let oRollAction = {
          actor: actor,
          targets: mTargets,
          action: action,
          skill: skill,
          percent: nPercent,
          weapon: weapon,
          damage: sDamage,
          location: null,
          mods: mods,
          history: history,
          spell: spell,
          secondAttack: secondAttack
        };

        // Asking for level roll
        if (bLeveled) helperRolls._dialogLevelForAction(oRollAction);
                 else helperRolls._rollsForAction(oRollAction, null);

    }

    /**
     * _dialogLevel
     * @param {*} actor 
     * @param {*} sPath 
     * @param {*} rollData 
     * @param {*} sFormula
     * @returns 
     */
    static async _dialogLevel(actor, sPath, rollData, sFormula, actionId, sMod2) {
      sMod2 = (!sMod2) ? '' : sMod2;

      await game.packs.get('aquelarre.worlds').getDocuments();
      const sWorld = actor.system.control.world;
      const oWorld = await game.packs.get('aquelarre.worlds').getDocument(sWorld);

      let oButtons = {};
      for (const s in oWorld.system.config.rolllevel) {
        let oConfig = oWorld.system.config.rolllevel[s];
        if (oConfig.apply)
          oButtons[s] = {
            label: oConfig.text,
            callback: () => helperRolls.rolls(actor, sPath, rollData, sFormula,  oConfig.bono, s, actionId, sMod2)
          }
      }
      let dialog = new Dialog({
        title: game.i18n.localize("common.level"),
        content: "",
        buttons: oButtons,
        world: oWorld.id });
      dialog.options.classes.push('_levelRoll');
      dialog.render(true);
    }    

    /**
     * _dialogLevelForAction
     * @param {*} oRollAction 
     */
    static async _dialogLevelForAction(oRollAction) {

      await game.packs.get('aquelarre.worlds').getDocuments();
      const sWorld = oRollAction.actor.system.control.world;
      const oWorld = await game.packs.get('aquelarre.worlds').getDocument(sWorld);

      let oButtons = {};
      for (const s in oWorld.system.config.rolllevel) {
        let oConfig = oWorld.system.config.rolllevel[s];
        if (oConfig.apply)
          oButtons[s] = {
            label: oConfig.text,
            callback: () => helperRolls._rollsForAction(oRollAction, oConfig.bono, s)
          }
      }
      let dialog = new Dialog({
        title: game.i18n.localize("common.level"),
        content: "",
        buttons: oButtons,
        world: oWorld.id });
      dialog.options.classes.push('_levelRoll');
      dialog.render(true);
    } 

    /**
     * rolls
     * @param {object} actor - Actor
     * @param {string} sPath - Path for Actor Property (Characteristic, Skill, ...)
     * @param {string} sMinValue - Min value for Success 
     * @param {string} sFormula - Roll Formula (1d100, ...)
     * @param {string} sValueMod - Bonification / Penalization
     * @param {string} sLevel - String (Level)
     * @param {string} actionId - Action
     */
    static async rolls(actor, sPath, sMinValue, sFormula, sValueMod, sLevel, actionId, sMod2) {
      sMod2 = (!sMod2) ? '' : sMod2;
      sValueMod = (sValueMod) ? sValueMod : '+0';
      
      //Worlds
      const sWorld = actor.system.control.world,
            oWorld = await game.packs.get('aquelarre.worlds').getDocument(sWorld),
            worldConfig = oWorld.system.config;

      //Config Level
      const oLevel = (sLevel) ? oWorld.system.config.rolllevel[sLevel] : '';

      //Action
      let action = ((actionId) && (actionId !== '')) ? 
                                      actor.items.get(actionId) : null;

      //Rolling
      let roll = new Roll(sFormula, {});
      roll.evaluate({async: false});
      if (game.dice3d) {
          await game.dice3d.showForRoll(roll, game.user, true);
      }

      //Result
      const nPass = Number(sMinValue) + Number(sValueMod);
      let success = ( nPass >= Number(roll.result) );
      
      //Experienced
      if ((success) && (sPath.split('.')[0] === 'skills')) {
        const skillID = sPath.split('.')[1];
        let updateData = {system: { skills: {}}};
        updateData.system.skills[skillID] = {experienced: true};
        await helperSocket.update(actor, updateData);
      }

      //Luck
      const luck = await this.checkImLucky(actor, nPass, Number(roll.result));
      if (luck > 0) success = true;

      //Criticals
      const dec = Math.trunc(Number(nPass) / Number(worldConfig.rolls.skillRange), 0);
      const rest = ( Number(nPass) % Number(worldConfig.rolls.skillRange) > 0) ? 1 : 0 ;
      let cFailureLow = Number(worldConfig.rolls.failureRange) +
                 (dec + rest) * Number(worldConfig.rolls.criticalFailureStep);
        cFailureLow = (cFailureLow >= Number(worldConfig.rolls.failureMin) ) ? Number(worldConfig.rolls.failureMin) : cFailureLow;
      let cSuccessHigh = (dec + rest) * Number(worldConfig.rolls.criticalSuccessStep);
      
      let bCritSuccess = ( Number(roll.result) <= Number(cSuccessHigh) ),
          bCritFailure = ( Number(roll.result) >= Number(cFailureLow) );

      //fixed!! always and so until the end... 
      bCritSuccess = !bCritSuccess ? (roll._total === 1) : bCritSuccess;
      bCritFailure = !bCritFailure ? ((roll._total === 100) || (roll._total === 0)) : bCritFailure;
      success = !success ? (roll._total <= 5) : success;
      success = success ? (roll._total <= 95) : success;

      const result = {  
                        success: success,
                        percent: nPass.toString(),
                        critSuccess: bCritSuccess,
                        critFailure: bCritFailure 
                     };

      //Chat Message
      const sContent = helperRolls._getMessageRoll(actor, sPath, roll, result, sValueMod, oLevel, sMod2);
      helperMessages.chatMessage(sContent, actor, false, '', '154px');

      //Consuming action
      if (action) {
        let myStep = helperSheetCombat.consumeMyStep(actor);
      }      

      if (actor.sheet.rendered)
          actor.sheet.render(true);      
    }

    /**
     * _rollsForAction
     * @param {*} oRollAction 
     * @param {*} sValueMod 
     */
    static async _rollsForAction(oRollAction, sValueMod, sLevel) {

      await game.packs.get('aquelarre.worlds').getDocuments();

      //Worlds
      const sWorld = oRollAction.actor.system.control.world,
            oWorld = await game.packs.get('aquelarre.worlds').getDocument(sWorld),
            worldConfig = oWorld.system.config;

      //Config Level
      const oLevel = (sLevel) ? oWorld.system.config.rolllevel[sLevel] : '';

      //Encounter Step 
      const myCombat = helperSheetCombat.myActiveCombat(oRollAction.actor);
      if (!myCombat) return;
      if ( (!myCombat.encounter.system.steps) ||
           (myCombat.encounter.system.steps.length === 0) ) return;

      let oEncounter = game.items.get(myCombat.encounter.id);
      let mSteps = oEncounter.system.steps;
      let oStep = mSteps.find(e => (e.actor === oRollAction.actor.id)
                                && (!e.consumed));

      //Aplying location
      oRollAction.location = (oStep) ? oStep.applyLocation : '';

      //Rolling
      sValueMod = (sValueMod) ? sValueMod : '+0';
      const sFormula = '1d100';
      let roll = new Roll(sFormula, {});
      roll.evaluate({async: false});
      if (game.dice3d) {
        await game.dice3d.showForRoll(roll, game.user, true);
      }         

      //--- RESULT ---
      const nPass = Number(oRollAction.percent) + Number(sValueMod);
      let success = ( nPass >= Number(roll.result) );

      oRollAction.history.push(' --- '+game.i18n.localize("common.roll")+' '+sFormula+' --- ');
      oRollAction.history.push(game.i18n.localize("common.rollResult")+': '+roll.result.toString());
      if (oLevel !== '') {
        oRollAction.history.push(oLevel.text+': '+sValueMod.toString());
      }
      if (sValueMod) {
        oRollAction.history.push(game.i18n.localize("common.total")+': '+(roll.result - Number(sValueMod)).toString());
      }
      if (success) oRollAction.history.push(game.i18n.localize("common.success"));
              else oRollAction.history.push(game.i18n.localize("common.failed"));

      //--- LUCK ---
      const luck = await this.checkImLucky(oRollAction.actor, nPass, Number(roll.result), oRollAction.history);
      if (luck > 0) success = true;

      //--- CRITICALS ---
      const dec = Math.trunc(Number(oRollAction.percent) / Number(worldConfig.rolls.skillRange), 0);
      const rest = ( Number(oRollAction.percent) % Number(worldConfig.rolls.skillRange) > 0) ? 1 : 0 ;
      let cFailureLow = Number(worldConfig.rolls.failureRange) +
                 (dec + rest) * Number(worldConfig.rolls.criticalFailureStep);
        cFailureLow = (cFailureLow >= Number(worldConfig.rolls.failureMin) ) ? Number(worldConfig.rolls.failureMin) : cFailureLow;
      let cSuccessHigh = (dec + rest) * Number(worldConfig.rolls.criticalSuccessStep);
      
      const bCritSuccess = ( Number(roll.result) <= Number(cSuccessHigh) ),
            bCritFailure = ( Number(roll.result) >= Number(cFailureLow) );

      const result = {  
                        success: success,
                        percent: nPass,
                        critSuccess: bCritSuccess,
                        critFailure: bCritFailure 
                     };

      if (bCritSuccess) oRollAction.history.push(game.i18n.localize("common.rollCriticalSuccess"));
      if (bCritFailure) oRollAction.history.push(game.i18n.localize("common.rollCriticalFailure"));

      //Chat Message
      const sContent = helperRolls._getMessageRollForAction(oRollAction, roll, result, sValueMod, oLevel);
      helperMessages.chatMessage(sContent, oRollAction.actor, false, '', '200px');

      //Double attack!
      if ((oRollAction.action.system.skill.doubleAttack) &&
          (result.success)) {

        if (oRollAction.secondAttack) {         
          const oRollAction2 = {
              actor: oRollAction.actor,
              targets: oRollAction.targets,
              action: oRollAction.action,
              skill: oRollAction.skill,
              percent: oRollAction.nPercent,
              weapon: oRollAction.secondAttack.weapon,
              damage: oRollAction.secondAttack.damage,
              location: oRollAction.location,
              mods: oRollAction.mods,
              history: oRollAction.secondAttack.history,
              spell: oRollAction.spell
          };
          const sContent2 = helperRolls._getMessageRollForAction(oRollAction2, roll, result, sValueMod, oLevel);
          helperMessages.chatMessage(sContent2, oRollAction2.actor, false, '', '200px');
        }
      }

      //Consuming action
      if (oStep) {
        oStep.consumed = true;
        //oEncounter.update({
        //  system: { steps: mSteps }
        //});
        await helperSocket.update(oEncounter, {
          system: { steps: mSteps }
        });        

      }

      if (oRollAction.actor.sheet.rendered)
          oRollAction.actor.sheet.render(true);
      
      helperSocket.refreshSheets();
    }

    /**
     * checkImLucky
     * @param {*} actor 
     * @param {*} nPass 
     * @param {*} nResult 
     */
    static async checkImLucky(actor, nPass, nResult, history) {
      const modeLuck = Array.from(await game.packs.get("aquelarre.modes")).find(e =>
                        ((e.system.control.world === actor.system.control.world)
                          && (e.system.luck)) );
      if (!modeLuck) return 0;
      if (actor.system.modes.find(e => e === modeLuck.id)) {

        const nDiff = (nResult - nPass) > 0 ? nResult - nPass : 1;
        const myLuck = actor.system.characteristics.secondary.luck.value;
        const myFinalLuck = (myLuck >= nDiff) ? myLuck - nDiff 
                                              : 0;
        await helperSocket.update(actor, {
          system: {
            characteristics: {secondary: {luck: {value: myFinalLuck}}},
            modes: helperActions.modesWithoutLuck(actor)
          }
        });
        //await helperActions.setLuck(actor);

        if (history) {
          history.push(' --- '+game.i18n.localize("common.luck")+' --- ');
          history.push(game.i18n.localize("common.luckLost")+': '+nDiff.toString());
          history.push(game.i18n.localize("common.luckChange")+': '+myLuck.toString()+' -> '+myFinalLuck.toString());
        }

        return (myLuck >= nDiff) ? nDiff : 0;

      } else
        return 0;    
    }

    /**
     * _getMessageRoll
     * @param {*} actor 
     * @param {*} sPath 
     * @param {*} roll 
     * @param {*} success 
     * @param {*} sValueMod 
     * @returns 
     */
    static _getMessageRoll(actor, sPath, roll, result, sValueMod, oLevel, sMod2) {
      sMod2 = (!sMod2) ? '' : sMod2;
      return '<div class="_messageFrame">'+
                  helperRolls._getMessageRoll_Actor(actor, sPath, null, sMod2)+
                  '<div class="_result">'+roll.total+'</div>'+
                  '<div class="_resultOver">'+result.percent.toString()+'</div>'+
                  helperRolls._getMessageRoll_Bonif(sValueMod, oLevel)+
                  helperRolls._getMessageRoll_Result(result)+
             '</div>';
    }

    /**
     * _getMessageRollForAction
     * @param {*} oRollAction 
     * @param {*} roll 
     * @param {*} success 
     * @param {*} sValueMod 
     * @returns 
     */
    static _getMessageRollForAction(oRollAction, roll, result, sValueMod, oLevel) {
      return '<div class="_messageFrame">'+
                  helperRolls._getMessageRoll_Actor(oRollAction.actor, '', oRollAction.skill, '', oRollAction.spell)+
                  '<div class="_result">'+roll.total+'</div>'+
                  '<div class="_resultOver">'+result.percent.toString()+'</div>'+
                  helperRolls._getMessageSpell(oRollAction.actor, oRollAction.spell)+
                  helperRolls._getMessageRoll_Bonif(sValueMod, oLevel)+
                  helperRolls._getMessageRoll_Result(result)+
                  helperRolls._getMessageAction(oRollAction.actor, oRollAction.action, oRollAction.spell)+
                  helperRolls._getMessageWeapon(oRollAction.actor, oRollAction.weapon)+
                  helperRolls._getMessageDamage(oRollAction, result)+
                  helperRolls._getMessageHelpTab(oRollAction.history)+
                  helperRolls._getMessageTargets(oRollAction.targets)+
             '</div>';
    }

    /**
     * _getMessageAction
     * @param {*} action 
     */
    static _getMessageAction(actor, action, spell) {
      if (spell) return '<div class="_messageAction">'+
                '<a class="_showItem" data-itemid="'+spell.id+'" data-actorid="'+actor.id+'">'+
                  '<img src="'+spell.img+'"/>'+
                '</a>'+
                '<div class="_name">'+spell.name+'</div>'+   
             '</div>';
      return '<div class="_messageAction">'+
                '<a class="_showItem" data-itemid="'+action.id+'" data-actorid="'+actor.id+'">'+
                  '<img src="'+action.img+'"/>'+
                '</a>'+
                '<div class="_name">'+action.name+'</div>'+   
             '</div>';
    }

    /**
     * _getMessageSpell
     * @param {*} spell 
     */
    static _getMessageSpell(actor, spell) {
      if (!spell) return '';
      return '<div class="_messageSpell">'+
                '<a class="_showItem" data-itemid="'+spell.id+'" data-actorid="'+actor.id+'">'+
                  '<div class="_name">'+spell.name+'</div>'+ 
                '</a>'+        
             '</div>';
    }

    /**
     * _getMessageWeapon
     * @param {*} weapon 
     */
    static _getMessageWeapon(actor, weapon) {
      if (!weapon) return '';
      return '<div class="_messageWeapon">'+
                '<a class="_showItem" data-itemid="'+weapon.id+'" data-actorid="'+actor.id+'">'+
                  '<div class="_name">'+weapon.name+'</div>'+ 
                '</a>'+        
             '</div>';      
    }

    /**
     * _getMessageDamage
     * @param {*} oAction 
     */
    static _getMessageDamage(oRollAction, result) {
      
      if ((!result) || (!result.success)) 
        return '<div class="_messageDamage"></div>';

      let weapon = oRollAction.weapon;
      let spell = oRollAction.spell;
      if ((!weapon) && (!spell)) return '';
      let actor = oRollAction.actor;
      if (!actor) return '';

      let sTargets = '';
      if ( !(!oRollAction.targets || !oRollAction.targets.showTargets) ) {
        oRollAction.targets.targets.map(e => {
          if (sTargets === '') sTargets = e.id;
                          else sTargets += '.'+e.id;
        });
      }

      if ((spell) && (!spell.system.damage.apply)) return '';

      const sLocationID = (oRollAction.location) ? oRollAction.location.location : '';

      if ( (!oRollAction.damage) || (oRollAction.damage === '') ) 
        return '<div class="_messageDamage"></div>';

      return '<div class="_messageDamage">'+
                '<a class="_rollDamage" data-weaponid="'+((weapon)? weapon.id : '')+'" '+
                                      ' data-spellid="'+((spell)? spell.id : '')+'" '+
                                      ' data-actorid="'+actor.id+'" '+
                                      ' data-targets="'+sTargets+'" '+
                                      ' data-critsuccess="'+result.critSuccess+'" '+
                                      ' data-critfailure="'+result.critFailure+'" '+
                                      ' data-locationid="'+sLocationID+'" '+
                                      ' data-actionid="'+ ((oRollAction.action) ? oRollAction.action.id : '')+'" '+
                                      ' data-damage="'+oRollAction.damage+'">'+
                   '<img src="/systems/aquelarre/image/texture/dice.png">'+
                   '<div class="_name">'+oRollAction.damage+'</div>'+
                '</a>'+         
             '</div>';  
    }

    /**
     * _getMessageHelpTab
     * @param {*} mods 
     */
    static _getMessageHelpTab(history) {
      let sReturn = '<div class="_showMods">'+
                      '<div class="_infoMods">i</div>'+
                        '<ul class="_messageMods">';
      history.map(s => sReturn += '<li>'+s+'</li>');
      sReturn += '</ul>'+
             '</div>';
      return sReturn;
    }
    
    /**
     * _getMessageTargets
     * @param {*} targets 
     */
    static _getMessageTargets(targets) {
      let sContent = '';
      if (!targets || !targets.showTargets) return '';
      targets.targets.forEach(target => {
        sContent += '<li style="background-image: url('+"'"+target.img+"'"+')">'+
                        '<label class="_targetName">'+target.name+'</label>'+
                    '</li>';
      });
      return '<ul class="_messageTargets">'+sContent+'</ul>';      
    }    

    /**
     * _getMessageRoll_Actor
     * @param {*} actor 
     * @param {*} sPath 
     * @param {*} skill 
     * @returns 
     */
    static _getMessageRoll_Actor(actor, sPath, skill, sMod2, spell) {
      sMod2 = (!sMod2) ? '' : sMod2;
      if (!skill && !spell) {
        if ( !(sPath.split('.').length > 1) ) return '<div class="_skill"></div>';
        const skillId = sPath.split('.')[1];

        if (sPath.split('.')[0] === 'languages')
          skill = game.packs.get('aquelarre.languages').get(skillId);
        else
          skill = game.packs.get('aquelarre.skills').get(skillId);
      }
      if (sPath.includes('characteristic')) {
        const sChar = sPath.split('.')[2];
        skill = {
          characteristic: true,
          title: game.i18n.localize('characteristic.'+sChar),
          mod: sMod2
        }
      }
      return  '<div class="_messageImg">'+
                  '<img src="'+actor.img+'"/>'+
              '</div>'+
              '<div class="_vertical">'+
                  '<div class="_title">'+actor.name+'</div>'+
                  helperRolls._getMessageRoll_Skill('', skill)+
              '</div>';
    }
    
    /**
     * _getMessageRoll_Skill
     * @param {*} sPath 
     * @returns 
     */
    static _getMessageRoll_Skill(sPath, skill) {
      if ((sPath === '') && (!skill)) return'<div class="_skill"></div>';

      let oSkill;
      if (sPath !== '') {
        if ( !(sPath.split('.').length > 1) ) return '<div class="_skill"></div>';
        const skillId = sPath.split('.')[1];
        oSkill = game.packs.get('aquelarre.skills').get(skillId);
      }
      if (skill.characteristic) {
        return '<div class="_skill _characteristic">'+skill.title+' '+skill.mod+'</div>';
      }
      if (skill) oSkill = skill;
      if (!oSkill) return '<div class="_skill"></div>';

      return  '<a class="_infoSkill" data-itemId="'+oSkill.id+'">'+
                   '<div class="_Img"><img src="'+oSkill.img+'"/></div>'+
               '</a>'+
              '<div class="_skill">'+oSkill.name+'</div>';
    }    

    /**
     * _getMessageRoll_Bonif
     * @param {*} sValueMod 
     * @returns 
     */
    static _getMessageRoll_Bonif(sValueMod, oLevel) {

      let sClass = '';
      if (sValueMod != '') {
          if (sValueMod == '+75') sClass = 'rollDif1';
          if (sValueMod == '+50') sClass = 'rollDif2';
          if (sValueMod == '+25') sClass = 'rollDif3';
          if (sValueMod == '-25') sClass = 'rollDif5';
          if (sValueMod == '-50') sClass = 'rollDif6';
          if (sValueMod == '-75') sClass = 'rollDif7';
      }
      let sText = (oLevel) ? oLevel.text : '';
      return '<div class="_bonif '+sClass+'">'+
                  '<span class="_bonifText">'+sText+'</span>'+
                              sValueMod+'</div>';  
    }

    /**
     * _getMessageRoll_Result
     * @param {*} result 
     * @returns 
     */
    static _getMessageRoll_Result(result) {

      let sReturn = (result.success) ? 
                        '<div class="_success">'+game.i18n.localize("common.success")+'</div>' :
                        '<div class="_failed">'+game.i18n.localize("common.failed")+'</div>' ;

      if (result.critSuccess)
        return '<div class="_successCrit">'+game.i18n.localize("common.rollCriticalSuccess")+'</div>' ;                        
      if (result.critFailure)
        return '<div class="_failedCrit">'+game.i18n.localize("common.rollCriticalFailure")+'</div>' ;

      return sReturn;
    }    

}