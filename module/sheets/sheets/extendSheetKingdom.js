/**
 * @extends {ItemSheet}
 */
<<<<<<< HEAD
=======

import { mainBackend } from "../backend/mainBackend.js";

>>>>>>> 48ae91f0c39a0c8e5746703da684780f1db7deaf
export class extendSheetKingdom extends ItemSheet {

  /**
   * Mapping Sheets options...
   * @inheritdoc
   * @returns {object} - Sheet Options
   */
  static get defaultOptions() {

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: [game.system.id, "sheet", "item"],
      template: CONFIG._root+"/templates/kingdom.html",
      width: 520,
      height: 480
    });
  }

  /**
   * Context Sheet...
   * @inheritdoc
   * @returns {object} - Context
   */
<<<<<<< HEAD
   getData() {
    const context = super.getData();
    context.systemData = this.item.getRollData();

=======
   async getData() {
    
    const context = super.getData();
    context.systemData = this.item.getRollData();

    context.backend = await mainBackend.getBackendForKingdom();

>>>>>>> 48ae91f0c39a0c8e5746703da684780f1db7deaf
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
