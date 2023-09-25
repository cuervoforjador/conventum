/**
 * @extends {ItemSheet}
 */

import { mainBackend } from "../backend/mainBackend.js";
import { helperSheetItem } from "../helpers/helperSheetItem.js";

export class extendSheetComponent extends ItemSheet {

  /**
   * Mapping Sheets options...
   * @inheritdoc
   * @returns {object} - Sheet Options
   */
  static get defaultOptions() {

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: [game.system.id, "sheet", "item"],
      template: CONFIG._root+"/templates/component.html",
      width: 700,
      height: 480,
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
    context.backend = await mainBackend.getBackendForComponent(context.systemData);

    //Mechanics...
    let systemData = context.systemData;

    let o1 = CONFIG.ExtendConfig.componentUtility.find(e => e.id === systemData.utility );
    if (!o1) o1 = {mod: '', witchcraft: ''};
    let o2 = CONFIG.ExtendConfig.componentLocation.find(e => e.id === systemData.location );
    if (!o2) o2 = {mod: '', witchcraft: ''};
    let o3 = CONFIG.ExtendConfig.componentPotential.find(e => e.id === systemData.potential );
    if (!o3) o3 = {mod: '', witchcraft: ''};
    let o4 = CONFIG.ExtendConfig.componentPlace.find(e => e.id === systemData.place );
    if (!o4) o4 = {mod: '', witchcraft: ''};


    systemData.witchcraft = eval( '1'+ o1.witchcraft + o2.witchcraft + o3.witchcraft + o4.witchcraft 
                                                + systemData.witchcraft0 );
    systemData.witchcraft = '*' + systemData.witchcraft.toString();
    
    systemData.mod = eval( '0'+ o1.mod + o2.mod + o3.mod + o4.mod 
                                           + systemData.mod0 );
    if (systemData.mod >= 0) systemData.mod = '+' + systemData.mod.toString();
    if (systemData.mod < 0) systemData.mod = systemData.mod.toString();

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
