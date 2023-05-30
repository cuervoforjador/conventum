/**
 * Helpers for Rolls
 */

import { mainUtils } from "../../mainUtils.js";
import { helperMessages } from "./helperMessages.js";
import { helperSheetCombat } from "./helperSheetCombat.js";

export class helperRolls {

    /**
     * rollDices
     * @param {*} actor - Actor object
     * @param {*} sPath - Path for Actor Property (Characteristic, Skill, ...)
     * @param {*} bLeveled - Asking for a leveled roll?
     * @param {*} sFormula - Formula to roll (1d100, ...)
     */
    static rollDices(actor, sPath, bLeveled, sFormula) {
      bLeveled = (bLeveled == true);
      sFormula = (sFormula) ? sFormula : '1d100';

      // Property to roll
      let rollData = actor.system;
      sPath.split('.').map(e => { rollData = rollData[e]} );
      rollData = (rollData && rollData.value) ? rollData.value : rollData;        
      
      // Asking for level roll
      if (bLeveled) helperRolls._dialogLevel(actor, sPath, rollData, sFormula);
              else helperRolls.rolls(actor, sPath, rollData, sFormula, null);
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
    static async _dialogLevel(actor, sPath, rollData, sFormula) {

      const sWorld = actor.system.control.world;
      const oWorld = await game.packs.get('conventum.worlds').get(sWorld);

      let oButtons = {};
      for (const s in oWorld.system.config.rolllevel) {
        let oConfig = oWorld.system.config.rolllevel[s];
        if (oConfig.apply)
          oButtons[s] = {
            label: oConfig.text,
            callback: () => helperRolls.rolls(actor, sPath, rollData, sFormula,  oConfig.bono)
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
            callback: () => helperRolls._rollsForAction(oRollAction, oConfig.bono)
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
     */
    static rolls(actor, sPath, sMinValue, sFormula, sValueMod) {
      sValueMod = (sValueMod) ? sValueMod : '+0';
      
      //Rolling
      let roll = new Roll(sFormula, {});
      roll.evaluate({async: false});
      if (game.dice3d) {
          game.dice3d.showForRoll(roll);
      }

      //Result
      const success = ( (Number(sMinValue) + Number(sValueMod)) >= Number(roll.result) );

      //Chat Message
      const sContent = helperRolls._getMessageRoll(actor, sPath, roll, success, sValueMod);
      helperMessages.chatMessage(sContent, actor, false, '', '140px');
    }

    /**
     * _rollsForAction
     * @param {*} oRollAction 
     * @param {*} sValueMod 
     */
    static _rollsForAction(oRollAction, sValueMod) {

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
          game.dice3d.showForRoll(roll);
      }         

      //Result
      const success = ( (Number(oRollAction.percent) + Number(sValueMod)) >= Number(roll.result) );

      //Chat Message
      const sContent = helperRolls._getMessageRollForAction(oRollAction, roll, success, sValueMod);
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
     * _getMessageRoll
     * @param {*} actor 
     * @param {*} sPath 
     * @param {*} roll 
     * @param {*} success 
     * @param {*} sValueMod 
     * @returns 
     */
    static _getMessageRoll(actor, sPath, roll, success, sValueMod) {
      return '<div class="_messageFrame">'+
                  helperRolls._getMessageRoll_Actor(actor, sPath)+
                  '<div class="_result">'+roll.total+'</div>'+
                  helperRolls._getMessageRoll_Bonif(sValueMod)+
                  helperRolls._getMessageRoll_Result(success)+
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
    static _getMessageRollForAction(oRollAction, roll, success, sValueMod) {
      return '<div class="_messageFrame">'+
                  helperRolls._getMessageRoll_Actor(oRollAction.actor, '', oRollAction.skill)+
                  '<div class="_result">'+roll.total+'</div>'+
                  helperRolls._getMessageRoll_Bonif(sValueMod)+
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

      return '<div class="_messageDamage">'+
                '<a class="_rollDamage" data-weaponid="'+weapon.id+'" '+
                                      ' data-actorid="'+actor.id+'" '+
                                      ' data-targets="'+sTargets+'" '+
                                      ' data-locationid="'+oRollAction.location.location+'" '+
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
                  '<li>'+game.i18n.localize("common.attack")+': '+mods.attack+'</li>'+
                  '<li>'+game.i18n.localize("common.defense")+': '+mods.defense+'</li>'+
                  '<li>'+game.i18n.localize("common.damage")+': '+mods.damage+'</li>'+
                  '<li>'+game.i18n.localize("common.skill")+': '+mods.percent+'</li>'+
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
    static _getMessageRoll_Actor(actor, sPath, skill) {
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
    static _getMessageRoll_Bonif(sValueMod) {

      let sClass = '';
      if (sValueMod != '') {
          if (sValueMod == '+75') sClass = 'rollDif1';
          if (sValueMod == '+50') sClass = 'rollDif2';
          if (sValueMod == '+25') sClass = 'rollDif3';
          if (sValueMod == '-25') sClass = 'rollDif5';
          if (sValueMod == '-50') sClass = 'rollDif6';
          if (sValueMod == '-75') sClass = 'rollDif7';
      }
      return '<div class="_bonif '+sClass+'">'+sValueMod+'</div>'     
    }

    /**
     * _getMessageRoll_Result
     * @param {*} success 
     * @returns 
     */
    static _getMessageRoll_Result(success) {
      if (success) 
          return '<div class="_success">'+game.i18n.localize("common.success")+'</div>';
      else
          return '<div class="_failed">'+game.i18n.localize("common.failed")+'</div>';
    }    

}