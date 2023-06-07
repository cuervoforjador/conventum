/**
 * Helpers for Rolls
 */

import { mainUtils } from "../../mainUtils.js";
import { helperActions } from "./helperActions.js";
import { helperMessages } from "./helperMessages.js";
import { helperSheetCombat } from "./helperSheetCombat.js";

export class helperRolls {

    /**
     * rollChararacteristic
     * @param {*} actor 
     * @param {*} charId 
     */
    static async rollChararacteristic(actor, charId) {

      const sWorld = actor.system.control.world;
      const oWorld = await game.packs.get('conventum.worlds').get(sWorld);    //Still no apply...

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
      const oWorld = await game.packs.get('conventum.worlds').get(sWorld);    //Still no apply...

      const sPath = 'characteristics.primary.'+charId;      

      let rollData = "";
      if (actor.system.characteristics.primary[charId])
          rollData = eval( actor.system.characteristics.primary[charId].value.toString() 
                                                                              + sMod.replace('x', '*'));
      if (actor.system.characteristics.secondary[charId])
          rollData = eval( actor.system.characteristics.secondary[charId].value.toString());                                                                            
      
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
    static rollDices(actor, sPath, bLeveled, sFormula, actionId) {
      bLeveled = (bLeveled == true);
      sFormula = (sFormula) ? sFormula : '1d100';

      // Property to roll
      let rollData = actor.system;
      sPath.split('.').map(e => { rollData = rollData[e]} );
      rollData = (rollData && rollData.value) ? rollData.value : rollData;        
      
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
                      skill, nPercent, weapon, sDamage, mods) {

        let oRollAction = {
          actor: actor,
          targets: mTargets,
          action: action,
          skill: skill,
          percent: nPercent,
          weapon: weapon,
          damage: sDamage,
          location: null,
          mods: mods
        }

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
      const sWorld = actor.system.control.world;
      const oWorld = await game.packs.get('conventum.worlds').get(sWorld);

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

      const sWorld = oRollAction.actor.system.control.world;
      const oWorld = await game.packs.get('conventum.worlds').get(sWorld);

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
            oWorld = await game.packs.get('conventum.worlds').get(sWorld),
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

      //Luck
      const luck = await this.checkImLucky(actor, nPass, Number(roll.result));
      if (luck > 0) success = true;

      //Criticals
      const dec = Math.trunc(Number(sMinValue) / Number(worldConfig.rolls.skillRange), 0);
      const rest = ( Number(sMinValue) % Number(worldConfig.rolls.skillRange) > 0) ? 1 : 0 ;
      let cFailureLow = Number(worldConfig.rolls.failureRange) +
                 (dec + rest) * Number(worldConfig.rolls.criticalFailureStep);
        cFailureLow = (cFailureLow >= Number(worldConfig.rolls.failureMin) ) ? Number(worldConfig.rolls.failureMin) : cFailureLow;
      let cSuccessHigh = (dec + rest) * Number(worldConfig.rolls.criticalSuccessStep);
      
      const bCritSuccess = ( Number(roll.result) <= Number(cSuccessHigh) ),
            bCritFailure = ( Number(roll.result) >= Number(cFailureLow) );

      const result = {  
                        success: success,
                        critSuccess: bCritSuccess,
                        critFailure: bCritFailure 
                     };

      //Chat Message
      const sContent = helperRolls._getMessageRoll(actor, sPath, roll, result, sValueMod, oLevel, sMod2);
      helperMessages.chatMessage(sContent, actor, false, '', '140px');

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

      //Worlds
      const sWorld = oRollAction.actor.system.control.world,
            oWorld = await game.packs.get('conventum.worlds').get(sWorld),
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
      oRollAction.location = oStep.applyLocation;

      //Rolling
      sValueMod = (sValueMod) ? sValueMod : '+0';
      const sFormula = '1d100';
      let roll = new Roll(sFormula, {});
      roll.evaluate({async: false});
      if (game.dice3d) {
        await game.dice3d.showForRoll(roll, game.user, true);
      }         

      //Result
      const nPass = Number(oRollAction.percent) + Number(sValueMod);
      let success = ( nPass >= Number(roll.result) );

      //Luck
      const luck = await this.checkImLucky(actor, nPass, Number(roll.result));
      if (luck > 0) success = true;

      //Criticals
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
                        critSuccess: bCritSuccess,
                        critFailure: bCritFailure 
                     };

      //Chat Message
      const sContent = helperRolls._getMessageRollForAction(oRollAction, roll, result, sValueMod, oLevel);
      helperMessages.chatMessage(sContent, oRollAction.actor, false, '', '200px');

      //Consuming action
      oStep.consumed = true;
      oEncounter.update({
        system: { steps: mSteps }
      });

      if (oRollAction.actor.sheet.rendered)
          oRollAction.actor.sheet.render(true);

    }

    /**
     * checkImLucky
     * @param {*} actor 
     * @param {*} nPass 
     * @param {*} nResult 
     */
    static async checkImLucky(actor, nPass, nResult) {
      const modeLuck = Array.from(await game.packs.get("conventum.modes")).find(e =>
                        ((e.system.control.world === actor.system.control.world)
                          && (e.system.luck)) );
      if (!modeLuck) return 0;
      if (actor.system.modes.find(e => e === modeLuck.id)) {

        const nDiff = (nResult - nPass) > 0 ? nResult - nPass : 1;
        const myLuck = actor.system.characteristics.secondary.luck.value;
        const myFinalLuck = (myLuck >= nDiff) ? myLuck - nDiff 
                                              : 0;
        await actor.update({
          system: {
            characteristics: {secondary: {luck: {value: myFinalLuck}}}
          }
        });
        await helperActions.setLuck(actor);
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
    static _getMessageRollForAction(oRollAction, roll, success, sValueMod, oLevel) {
      return '<div class="_messageFrame">'+
                  helperRolls._getMessageRoll_Actor(oRollAction.actor, '', oRollAction.skill)+
                  '<div class="_result">'+roll.total+'</div>'+
                  helperRolls._getMessageRoll_Bonif(sValueMod, oLevel)+
                  helperRolls._getMessageRoll_Result(success)+
                  helperRolls._getMessageAction(oRollAction.actor, oRollAction.action)+
                  helperRolls._getMessageWeapon(oRollAction.actor, oRollAction.weapon)+
                  helperRolls._getMessageDamage(oRollAction, success)+
                  helperRolls._getMessageMods(oRollAction.mods)+
                  helperRolls._getMessageTargets(oRollAction.targets)+
             '</div>';
    }

    /**
     * _getMessageAction
     * @param {*} action 
     */
    static _getMessageAction(actor, action) {
      return '<div class="_messageAction">'+
                '<a class="_showItem" data-itemid="'+action.id+'" data-actorid="'+actor.id+'">'+
                  '<img src="'+action.img+'"/>'+
                '</a>'+
                '<div class="_name">'+action.name+'</div>'+   
             '</div>';
    }

    /**
     * _getMessageWeapon
     * @param {*} weapon 
     */
    static _getMessageWeapon(actor, weapon) {
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
    static _getMessageDamage(oRollAction, success) {
      
      if (!success) return '';

      let weapon = oRollAction.weapon;
      if (!weapon) return '';
      let actor = oRollAction.actor;
      if (!actor) return '';

      let sTargets = '';
      if ( !(!oRollAction.targets || !oRollAction.targets.showTargets) ) {
        oRollAction.targets.targets.map(e => {
          if (sTargets === '') sTargets = e.id;
                          else sTargets += '.'+e.id;
        });
      }

      const sLocationID = (oRollAction.location) ? oRollAction.location.location : '';
      return '<div class="_messageDamage">'+
                '<a class="_rollDamage" data-weaponid="'+weapon.id+'" '+
                                      ' data-actorid="'+actor.id+'" '+
                                      ' data-targets="'+sTargets+'" '+
                                      ' data-locationid="'+sLocationID+'" '+
                                      ' data-actionid="'+oRollAction.action.id+'" '+
                                      ' data-damage="'+oRollAction.damage+'">'+
                   '<img src="/systems/conventum/image/texture/dice.png">'+
                   '<div class="_name">'+oRollAction.damage+'</div>'+
                '</a>'+         
             '</div>';  
    }

    /**
     * _getMessageMods
     * @param {*} mods 
     */
    static _getMessageMods(mods) {
      return '<div class="_showMods">'+
              '<div class="_infoMods">i</div>'+
              '<ul class="_messageMods">'+
                  '<li>'+game.i18n.localize("common.skill")+': '+mods.skill+'</li>'+
                  '<li>'+game.i18n.localize("common.skill")+': '+mods.skillTxt+'</li>'+
                  '<li>'+game.i18n.localize("common.damage")+': '+mods.damage+'</li>'+
                  '<li>'+game.i18n.localize("common.damage")+': '+mods.damageTxt+'</li>'+
              '</ul>'+
             '</div>';
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
    static _getMessageRoll_Actor(actor, sPath, skill, sMod2) {
      sMod2 = (!sMod2) ? '' : sMod2;
      if (!skill) {
        if ( !(sPath.split('.').length > 1) ) return '<div class="_skill"></div>';
        const skillId = sPath.split('.')[1];
        skill = game.packs.get('conventum.skills').get(skillId);
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
      
      let oSkill;
      if (sPath !== '') {
        if ( !(sPath.split('.').length > 1) ) return '<div class="_skill"></div>';
        const skillId = sPath.split('.')[1];
        oSkill = game.packs.get('conventum.skills').get(skillId);
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

      sReturn += (result.critSuccess) ?
                        '<div class="_critSuccess">'+game.i18n.localize("common.rollCriticalSuccess")+'</div>' : '';
      sReturn += (result.critFailure) ?
                        '<div class="_critFailure">'+game.i18n.localize("common.rollCriticalFailure")+'</div>' : '';

      return sReturn;
    }    

}