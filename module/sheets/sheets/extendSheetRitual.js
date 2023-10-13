/**
 * @extends {ItemSheet}
 */

import { mainBackend } from "../backend/mainBackend.js";
import { helperSheetItem } from "../helpers/helperSheetItem.js";

export class extendSheetRitual extends ItemSheet {

  /**
   * Mapping Sheets options...
   * @inheritdoc
   * @returns {object} - Sheet Options
   */
  static get defaultOptions() {

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: [game.system.id, "sheet", "item"],
      template: CONFIG._root+"/templates/ritual.html",
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
    context.backend = await mainBackend.getBackendForRitual(context.systemData);

    //Mechanics...
    let systemData = context.systemData;
    if (systemData.ordo ===1) {
        systemData.ptf = 10;
        systemData.sPenal = '0';
    }
    if (systemData.ordo ===2) {
      systemData.ptf = 13;
      systemData.sPenal = '-20';
    }
    if (systemData.ordo ===3) {
      systemData.ptf = 15;
      systemData.sPenal = '-40';
    }      
    if (systemData.ordo ===4) {
      systemData.ptf = 18;
      systemData.sPenal = '-60';
    }      
    if (systemData.ordo ===5) {
      systemData.ptf = 20;
      systemData.sPenal = '-80';
    }      
    if (systemData.ordo ===6) {
      systemData.ptf = 20;
      systemData.sPenal = '-100';
    }           
    if (systemData.ordo > 6) {
      systemData.ptf = 20;
      systemData.sPenal = '-' + (( systemData.ordo - 4)*50 ).toString();
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
