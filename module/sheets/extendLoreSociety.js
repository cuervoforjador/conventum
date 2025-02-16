/**
 * @extends {ItemSheet}
 */

import { helperBackend } from "../helpers/helperBackend.js";
import { helperSheets } from "../helpers/helperSheets.js";

export class extendLoreSociety extends ItemSheet {

  /**
   * Mapping Sheets options...
   * @inheritdoc
   * @returns {object} - Sheet Options
   */
  static get defaultOptions() {

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: [game.system.id, "sheet", "loreSociety", "golden", "_sheetDialog"],
      template: CONFIG._root+"/templates/loreSociety.html",
      width: 600,
      height: 650,
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
    context.isGM = game.user.isGM;

    context.systemData = this.item.getRollData();
    context.backend = await helperBackend.getBackend(context, 'loreSociety');
    
    await helperBackend.checkKey(context);

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

    html.find("a._deleteCusto").click(this._deleteCusto.bind(this));
  }
  
  /**
   * _deleteCusto
   * @param {*} event 
   */
  async _deleteCusto(event) {
    event.preventDefault();
    const key = $(event.currentTarget).data('edit');
    const img = $(event.currentTarget).parent().find('img._custoImg');
    if (!key) return;
    img.prop('src', '');
    await this.item.update({
      [key]: ''
    });
  }  

}
