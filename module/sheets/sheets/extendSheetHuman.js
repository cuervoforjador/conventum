/**
 * @extends {ActorSheet}
 */
<<<<<<< HEAD
=======

import { mainBackend } from "../backend/mainBackend.js";
import { helperSheetHuman } from "../helpers/helperSheetHuman.js";

>>>>>>> 48ae91f0c39a0c8e5746703da684780f1db7deaf
export class extendSheetHuman extends ActorSheet {

  /**
   * Mapping Sheets options...
   * @inheritdoc
   * @returns {object} - Sheet Options
   */
  static get defaultOptions() {

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: [game.system.id, "sheet", "actor"],
      template: CONFIG._root+"/templates/human.html",
      width: 400,
      height: 600,
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
    context.systemData = this.actor.getRollData();
<<<<<<< HEAD
=======
    context.systemData = await helperSheetHuman.checkSystemData(context.systemData);

    context.backend = await mainBackend.getBackendForActor(context.systemData);
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
