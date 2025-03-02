/**
 * @extends {ItemSheet}
 */

import { helperBackend } from "../helpers/helperBackend.js";
import { helperSheets } from "../helpers/helperSheets.js";
import { helperUtils } from "../helpers/helperUtils.js";

export class extendLoreKingdom extends ItemSheet {

  /**
   * Mapping Sheets options...
   * @inheritdoc
   * @returns {object} - Sheet Options
   */
  static get defaultOptions() {

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: [game.system.id, "sheet", "loreKingdom", "golden", "_sheetDialog"],
      template: CONFIG._root+"/templates/loreKingdom.html",
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
    context.backend = await helperBackend.getBackend(context, 'loreKingdom');
    
    await helperBackend.checkKey(context);

    //Sorting...
    context.systemData.nations.sort( (a, b) => { return a.rollFrom < b.rollFrom ? -1 : 
                                                        a.rollFrom > b.rollFrom ? 1 : 0 });

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

    html.find("a.loreAdd").click(this._addLore.bind(this));
    html.find("a.loreDelete").click(this._deleteLore.bind(this));
    html.find("a._deleteCusto").click(this._deleteCusto.bind(this));
  }

  /**
   * _addLore
   * @param {*} event 
   */
  _addLore(event) {
    event.preventDefault();
    const oNew = helperSheets.addLoreProperty(event);
    if (!oNew) return;

    if (event.currentTarget?.dataset.target === 'nation') {
      if (this.item.system.nations.find(e => e.key === oNew.key)) return;
      this.item.system.nations.push(oNew);
      this.item.update({
        "system.nations": this.item.system.nations
      });
    }
  }

  /**
   * _deleteLore
   * @param {*} event 
   */
  _deleteLore(event) {
    event.preventDefault();
    const key = $(event.currentTarget).data('key');
    if (!key) return;
    this.item.update({
      "system.nations": this.item.system.nations.filter(e => e.key !== key)
    });    
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
