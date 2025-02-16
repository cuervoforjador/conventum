/**
 * @extends {ItemSheet}
 */

import { helperBackend } from "../helpers/helperBackend.js";
import { helperSheets } from "../helpers/helperSheets.js";
import { helperUtils } from "../helpers/helperUtils.js";

export class extendSheetBook extends ItemSheet {

  /**
   * Mapping Sheets options...
   * @inheritdoc
   * @returns {object} - Sheet Options
   */
  static get defaultOptions() {

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: [game.system.id, "sheet", "book", "golden", "_sheetDialog"],
      template: CONFIG._root+"/templates/book.html",
      width: 800,
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
    context.assetsPath = helperUtils.assetsPath();

    context.systemData = this.item.getRollData();
    context.backend = await helperBackend.getBackend(context, 'book');
    context.fromActor = this.item.parent?.type === 'human';

    //Spells
    context.bookSpells = [];
    for (var spell of context.systemData.spells) {
      let document = await (game.packs.get(spell.pack)).getDocument(spell.id);
      context.bookSpells.push({...spell,...{
        item: document,
        hasItem: !!document
      }});
    }

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

    html.find(".addSpell").click(this._addSpell.bind(this));
    html.find(".delete").click(this._deleteSpell.bind(this));
  }

  /**
   * _addSpell
   * @param {*} event 
   */
  async _addSpell(event) {
    const target = $(event.currentTarget);
    const selected = $(target.parent()).find('select').find(":selected");
    if (selected.length === 0) return;

    this.item.system.spells.push({
      id: selected.val(),
      pack: selected.data('pack'),
      name: selected.text()
    });
    await this.item.update({"system.spells": this.item.system.spells});
  }

  /**
   * _deleteSpell
   * @param {*} event 
   */
  async _deleteSpell(event) {
    const sId = $(event.currentTarget).data('id');
    if (!sId || sId === '') return;
    await this.item.update({"system.spells": 
        this.item.system.spells.filter(e => e.id !== sId)});
  }

}
