/**
 * @extends {ItemSheet}
 */

import { mainBackend } from "../backend/mainBackend.js";
import { helperSheetItem } from "../helpers/helperSheetItem.js";

export class extendSheetWeapon extends ItemSheet {

  /**
   * Mapping Sheets options...
   * @inheritdoc
   * @returns {object} - Sheet Options
   */
  static get defaultOptions() {

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: [game.system.id, "sheet", "item"],
      template: CONFIG._root+"/templates/weapon.html",
      width: 700,
      height: 400,
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
    context.backend = await mainBackend.getBackendForWeapon(context.systemData);

    //Mechanics...
    let systemData = context.systemData;
    if (!systemData.requirement.primary.apply) {
      systemData.requirement.primary.characteristic = '';
      systemData.requirement.primary.minValue = 0;
    }
    if (!systemData.requirement.secondary.apply) {
      systemData.requirement.secondary.characteristic = '';
      systemData.requirement.secondary.minValue = 0;
    }    
    if (!systemData.poison.apply) {
      systemData.poison.damage = '';
    }    
    if (!systemData.range.byCharacteristic) {
      systemData.range.characteristic = '';
    }   
    if (!systemData.type.range) {
      systemData.recharge = 0;
      systemData.range.byCharacteristic = false;
      systemData.range.characteristic = '';
      systemData.range.lowRange = '';
      systemData.range.mediumRange = '';
      systemData.range.largeRange = '';
    }  

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
