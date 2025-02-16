/**
 * @extends {ItemTrait}
 */

import { helperBackend } from "../helpers/helperBackend.js";
import { helperSheets } from "../helpers/helperSheets.js";

export class extendSheetTrait extends ItemSheet {

  /**
   * Mapping Sheets options...
   * @inheritdoc
   * @returns {object} - Sheet Options
   */
  static get defaultOptions() {

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: [game.system.id, "sheet", "trait", "golden", "_sheetDialog"],
      template: CONFIG._root+"/templates/trait.html",
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

    context.systemData = this.item.getRollData();
    context.backend = await helperBackend.getBackend(context, 'trait');
    context.fromActor = this.item.parent?.type === 'human';
    context.record = this._getRecord(context.systemData.record);    
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

    html.find("._add").click(this._addStr.bind(this));
    html.find("._deleteItem").click(this._deleteMe.bind(this));
    html.find("#cFrom").change(this._changeFrom.bind(this));
    html.find("#cPride").change(this._changeType.bind(this));
    html.find("#cShame").change(this._changeType.bind(this));
    html.find("#cSequel").change(this._changeType.bind(this));
  }

  /**
   * _getRecord
   */
  _getRecord(sRecord) {
    let mRecord = [];
    if (!sRecord || sRecord === '') return [];
    const oData = JSON.parse(sRecord);
    for (var s in oData) {
      mRecord.push(oData[s]);
    }
    return mRecord;
  }

  /**
   * _deleteMe
   * @param {*} event 
   */
  async _deleteMe(event) {
    await this.item.delete();
  }

  /**
   * _addStr
   * @param {*} event 
   */
  async _addStr(event) {
    let str = this.item.system.strMods;
    try { str = str.split(']')[0].split('[')[1].trim(); } 
    catch(e) { str = ''; }
    
    const sId = $(event.currentTarget).data('id');
    const sPath = $(event.currentTarget).data('path');
    const bAll = $(event.currentTarget).data('all') || $(event.currentTarget).data('all') === 'true';
    const control = $(event.currentTarget).parent().find('#'+sId);
    const controlI = $(event.currentTarget).parent().find('._mod');
    
    if (str !== '') str += ', ';
    if (bAll) {      
      let str2 = '';
      control.find('option').each(function(i,e) {
        if (str2 === '') str2 += '"' + sPath+$(e).val() + '": "' + controlI.val();
                    else str2 += ', "' + sPath+$(e).val() + '": "' + controlI.val() + '"';
      });
      str += str2;

    } else
      str += '"' + sPath+control.val() + '": "' + controlI.val() + '"';
    str = '[' + str + ']';

    this.item.update({
      "system.strMods": str
    });
  }

  /**
   * _changeFrom
   * @param {*} event 
   */
  _changeFrom(event) {
    const target = $(event.currentTarget);
    target.parent().find('#cTo').val(target.val());

  }

  /**
   * _changeType
   * @param {*} event 
   */
  _changeType(event) {
    const target = $(event.currentTarget);
    target.parent().find('input[type="checkbox"]').each(function(i,e) {
      if ($(e).attr('id') !== $(target).attr('id')) $(e).prop('checked', false);
    });
  }

}
