/**
 * @extends {ItemSheet}
 */

import { mainBackend } from "../backend/mainBackend.js";
import { helperSheetItem } from "../helpers/helperSheetItem.js";

export class extendSheetProfession extends ItemSheet {

  /**
   * Mapping Sheets options...
   * @inheritdoc
   * @returns {object} - Sheet Options
   */
  static get defaultOptions() {

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: [game.system.id, "sheet", "item"],
      template: CONFIG._root+"/templates/profession.html",
      width: 600,
      height: 550,
      tabs: [
        {navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "main"}
      ],       
    });
  }

  /**
   * Context Sheet...
   * @inheritdoc
   * @returns {object} - Context
   */
   async getData() {

    const context = super.getData();
    context.systemData = this.item.getRollData();
    context.systemData = await helperSheetItem.checkSystemData(context.systemData);
    context.backend = await mainBackend.getBackendForProfession(context.systemData);

    //Society from Stratum...
    const mStratums = await game.packs.get("aquelarre.stratums").getDocuments();
    for (var sStratum in context.systemData.requirement.stratums) {
      if (context.systemData.requirement.stratums[sStratum].apply) {
        const oStratum = mStratums.find(e => e.id === sStratum);
        if (oStratum) {
          context.systemData.requirement.societies[oStratum.system.backend.society].apply = true;
        }
      }
    }

    //Mod from Skills...
    for (var sSkill in context.systemData.skills.primary) {
      if (context.systemData.skills.primary[sSkill].apply) {
        if ((!context.systemData.skills.primary[sSkill].mod) ||
            (context.systemData.skills.primary[sSkill].mod === '') ||
            (context.systemData.skills.primary[sSkill].mod < 3) )
          context.systemData.skills.primary[sSkill].mod = 3;
      } else {
          context.systemData.skills.primary[sSkill].mod = '';
      }
    }
    for (var sSkill in context.systemData.skills.secondary) {
      if (context.systemData.skills.secondary[sSkill].apply) {
        if ((!context.systemData.skills.secondary[sSkill].mod) ||
            (context.systemData.skills.secondary[sSkill].mod === ''))
          context.systemData.skills.secondary[sSkill].mod = 1;
      } else {
          context.systemData.skills.secondary[sSkill].mod = '';
      }
    }    
    for (var sLanguage in context.systemData.skills.languages) {
      if (context.systemData.skills.languages[sLanguage].apply) {
        if ((!context.systemData.skills.languages[sLanguage].mod) ||
            (context.systemData.skills.languages[sLanguage].mod === ''))
          context.systemData.skills.languages[sLanguage].mod = 1;
      } else {
          context.systemData.skills.languages[sLanguage].mod = '';
      }
    }     

    //Combat Skills by Social groups...
    for (var sGroup in context.systemData.skills.combatPrimaryGroup) {
      if (context.systemData.skills.combatPrimaryGroup[sGroup].apply) {
        const mSkills = await game.packs.get("aquelarre.skills").getDocuments();
        mSkills.map(skill => {
          if ((skill.system.group[sGroup] !== undefined) && 
              (skill.system.group[sGroup].apply))
            context.systemData.skills.combatPrimary[skill.id].apply = true;
        });
      }
    }
    for (var sGroup in context.systemData.skills.combatSecondaryGroup) {
      if (context.systemData.skills.combatSecondaryGroup[sGroup].apply) {
        const mSkills = await game.packs.get("aquelarre.skills").getDocuments();
        mSkills.map(skill => {
          if ((skill.system.group[sGroup] !== undefined) && 
              (skill.system.group[sGroup].apply))
            context.systemData.skills.combatSecondary[skill.id].apply = true;
        });
      }      
    }

    //Molding...
    helperSheetItem.molding(context);

    return context;
  }

  /**
   * Sheet events Listeners...
   * @inheritdoc
   * @param {html} html
   */
   activateListeners(html) {
    super.activateListeners(html);
    if ( !this.isEditable ) return;
  }
  
}
