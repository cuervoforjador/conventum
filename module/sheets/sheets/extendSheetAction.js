/**
 * @extends {ItemSheet}
 */

import { mainBackend } from "../backend/mainBackend.js";
import { helperSheetItem } from "../helpers/helperSheetItem.js";

export class extendSheetAction extends ItemSheet {

  /**
   * Mapping Sheets options...
   * @inheritdoc
   * @returns {object} - Sheet Options
   */
  static get defaultOptions() {

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: [game.system.id, "sheet", "item"],
      template: CONFIG._root+"/templates/action.html",
      width: 900,
      height: 640,
      tabs: [
        {navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "type"}
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
    context.backend = await mainBackend.getBackendForAction(context.systemData);

    //Mechanics...
    let systemData = context.systemData;
    if ( (!systemData.type.attack) && (!systemData.type.defense) )
      systemData.type.attack = true;

    if ( (!systemData.type.step1) && (!systemData.type.step2) )
      systemData.type.step1 = true;


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

    html.find("a.showInfo").click(this._showInfo.bind(this));

  }

  // _showInfo
  _showInfo(event) {
    event.preventDefault();
    const s18n = event.currentTarget?.dataset.i18n;
    new Dialog({
      title: 'Info',
      content: game.i18n.localize(s18n),
      buttons: [] }).render(true);        
  }  
  
}
