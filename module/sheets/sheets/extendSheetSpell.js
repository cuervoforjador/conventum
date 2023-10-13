/**
 * @extends {ItemSheet}
 */

import { mainBackend } from "../backend/mainBackend.js";
import { helperSheetItem } from "../helpers/helperSheetItem.js";

export class extendSheetSpell extends ItemSheet {

  /**
   * Mapping Sheets options...
   * @inheritdoc
   * @returns {object} - Sheet Options
   */
  static get defaultOptions() {

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: [game.system.id, "sheet", "item"],
      template: CONFIG._root+"/templates/spell.html",
      width: 760,
      height: 460,
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
    context.backend = await mainBackend.getBackendForSpell(context.systemData);

    //Mechanics...
    let systemData = context.systemData;
    if (systemData.vis ===1) {
        systemData.ptc = 1;
        systemData.sPenal = '0';
    }
    if (systemData.vis ===2) {
      systemData.ptc = 1;
      systemData.sPenal = '-15';
    }
    if (systemData.vis ===3) {
      systemData.ptc = 2;
      systemData.sPenal = '-35';
    }      
    if (systemData.vis ===4) {
      systemData.ptc = 3;
      systemData.sPenal = '-50';
    }      
    if (systemData.vis ===5) {
      systemData.ptc = 5;
      systemData.sPenal = '-75';
    }      
    if (systemData.vis ===6) {
      systemData.ptc = 5;
      systemData.sPenal = '-100';
    }      
    if (systemData.vis ===7) {
      systemData.ptc = 10;
      systemData.sPenal = '-150';
    }      
    if (systemData.vis > 7) {
      systemData.ptc = 10 + (( systemData.vis - 7)*5 );
      systemData.sPenal = '-' + (( systemData.vis - 4)*50 ).toString();
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
