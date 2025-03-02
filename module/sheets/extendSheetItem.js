/**
 * @extends {ItemSheet}
 */
import { helperBackend } from "../helpers/helperBackend.js";
import { helperSheets } from "../helpers/helperSheets.js";

export class extendSheetItem extends ItemSheet {

  /**
   * Mapping Sheets options...
   * @inheritdoc
   * @returns {object} - Sheet Options
   */
  static get defaultOptions() {

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: [game.system.id, "sheet", "item", "golden"],
      template: CONFIG._root+"/templates/item.html",
      width: 700,
      height: 500,
      tabs: [
        {navSelector: ".itemTabsBar", contentSelector: ".itemTabsContent", initial: "description"}
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
    context.isGM = game.user.isGM;
    context.backend = await helperBackend.getBackend(context, 'item');    
    context.fromActor = this.item.parent?.type === 'human';
    
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
