/**
 * @extends {ItemSheet}
 */

import { mainBackend } from "../backend/mainBackend.js";
import { helperSheetItem } from "../helpers/helperSheetItem.js";

export class extendSheetLocation extends ItemSheet {

  /**
   * Mapping Sheets options...
   * @inheritdoc
   * @returns {object} - Sheet Options
   */
  static get defaultOptions() {

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: [game.system.id, "sheet", "item"],
      template: CONFIG._root+"/templates/location.html",
      width: 520,
      height: 480
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
    context.backend = await mainBackend.getBackendForLocation();

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
