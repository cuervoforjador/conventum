/**
 * @extends {ItemSheet}
 */

import { helperBackend } from "../helpers/helperBackend.js";
import { helperSheets } from "../helpers/helperSheets.js";
import { helperUtils } from "../helpers/helperUtils.js";

export class extendLoreNation extends ItemSheet {

  /**
   * Mapping Sheets options...
   * @inheritdoc
   * @returns {object} - Sheet Options
   */
  static get defaultOptions() {

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: [game.system.id, "sheet", "loreNation", "golden", "_sheetDialog"],
      template: CONFIG._root+"/templates/loreNation.html",
      width: 650,
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
    context.backend = await helperBackend.getBackend(context, 'loreNation');
    
    await helperBackend.checkKey(context);

    //Mods...
    ['appearance', 'renown', 'nature', 'attitude'].map(s => {
        context.systemData.mods.social[s] = helperUtils.checkDiceMod(context.systemData.mods.social[s]);
    });

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

    if (event.currentTarget?.dataset.target === 'language') {
      if (this.item.system.languages.find(e => e.key === oNew.key)) return;
      this.item.system.languages.push(oNew);
      this.item.update({
        "system.languages": this.item.system.languages
      });
    }

    if (event.currentTarget?.dataset.target === 'stratum') {
      if (this.item.system.stratums.find(e => e.key === oNew.key)) return;
      this.item.system.stratums.push(oNew);
      this.item.update({
        "system.stratums": this.item.system.stratums
      });
    }

    if (event.currentTarget?.dataset.target === 'position') {
      if (this.item.system.positions.find(e => e.key === oNew.key)) return;
      this.item.system.positions.push(oNew);
      this.item.update({
        "system.positions": this.item.system.positions
      });
    }
    
    if (event.currentTarget?.dataset.target === 'profession') {
      if (this.item.system.professions.find(e => e.key === oNew.key)) return;
      this.item.system.professions.push(oNew);
      this.item.update({
        "system.professions": this.item.system.professions
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

    if (event.currentTarget?.dataset.target === 'language') {
      this.item.update({
        "system.languages": this.item.system.languages.filter(e => e.key !== key)
      });    
    }

    if (event.currentTarget?.dataset.target === 'stratum') {
      this.item.update({
        "system.stratums": this.item.system.stratums.filter(e => e.key !== key)
      });    
    }

    if (event.currentTarget?.dataset.target === 'position') {
      this.item.update({
        "system.positions": this.item.system.positions.filter(e => e.key !== key)
      });    
    }
    
    if (event.currentTarget?.dataset.target === 'profession') {
      this.item.update({
        "system.professions": this.item.system.professions.filter(e => e.key !== key)
      });    
    }    

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
