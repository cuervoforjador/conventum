/**
 * @extends {ItemSheet}
 */

import { mainBackend } from "../backend/mainBackend.js";
import { helperSheetItem } from "../helpers/helperSheetItem.js";

export class extendSheetItem extends ItemSheet {

  /**
   * Mapping Sheets options...
   * @inheritdoc
   * @returns {object} - Sheet Options
   */
  static get defaultOptions() {

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: [game.system.id, "sheet", "item"],
      template: CONFIG._root+"/templates/item.html",
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
    context.backend = await mainBackend.getBackendForItem(context.systemData);

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
