/**
 * @extends {ItemSheet}
 */

import { mainBackend } from "../backend/mainBackend.js";

export class extendSheetSociety extends ItemSheet {

  /**
   * Mapping Sheets options...
   * @inheritdoc
   * @returns {object} - Sheet Options
   */
  static get defaultOptions() {

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: [game.system.id, "sheet", "item"],
      template: CONFIG._root+"/templates/society.html",
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

    context.backend = await mainBackend.getBackendForSociety();

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
