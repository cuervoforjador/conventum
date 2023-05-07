/**
 * Helpers for Rolls
 */

import { mainUtils } from "../mainUtils.js";
import { helperMessages } from "./helperMessages.js";

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
     * rolls
     * @param {object} actor - Actor
     * @param {string} sPath - Path for Actor Property (Characteristic, Skill, ...)
     * @param {string} sMinValue - Min value for Success 
     * @param {string} sFormula - Roll Formula (1d100, ...)
     * @param {string} sValueMod - Bonification / Penalization
     */
    static async rolls(actor, sPath, sMinValue, sFormula, sValueMod) {
      sValueMod = (sValueMod) ? sValueMod : '+0';
      
      //Worlds
      const sWorld = actor.system.control.world,
            oWorld = await game.packs.get('conventum.worlds').get(sWorld),
            worldConfig = oWorld.system.config;

      //Rolling
      let roll = new Roll(sFormula, {});
      roll.evaluate({async: false});
      if (game.dice3d) {
          game.dice3d.showForRoll(roll);
      }

      //Result
      const success = ( (Number(sMinValue) + Number(sValueMod)) >= Number(roll.result) );

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
      const sContent = helperRolls._getMessageRoll(actor, sPath, roll, result, sValueMod);
      helperMessages.chatMessage(sContent, actor, false, '', '140px');
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
    static _getMessageRoll(actor, sPath, roll, result, sValueMod) {
      return '<div class="_messageFrame">'+
                  helperRolls._getMessageRoll_Actor(actor, sPath)+
                  '<div class="_result">'+roll.total+'</div>'+
                  helperRolls._getMessageRoll_Bonif(sValueMod)+
                  helperRolls._getMessageRoll_Result(result)+
             '</div>';
    }

    /**
     * _getMessageRoll_Actor
     * @param {*} actor
     * @param {*} sPath
     * @returns 
     */
    static _getMessageRoll_Actor(actor, sPath) {
      return  '<div class="_messageImg">'+
                  '<img src="'+actor.img+'"/>'+
              '</div>'+
              '<div class="_vertical">'+
                  '<div class="_title">'+actor.name+'</div>'+
                  helperRolls._getMessageRoll_Skill(sPath)+
              '</div>';
    }
    
    /**
     * _getMessageRoll_Skill
     * @param {*} sPath 
     * @returns 
     */
    static _getMessageRoll_Skill(sPath) {
      if ( !(sPath.split('.').length > 1) ) return '<div class="_skill"></div>';

      const skillId = sPath.split('.')[1];
      const oSkill = game.packs.get('conventum.skills').get(skillId);
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