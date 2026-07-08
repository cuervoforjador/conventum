import { SYSTEM_ID } from "../config/uiConstants.js"
import { configRULES } from "../config/rules.js";
import sheetHandler from "./handler.js"
import helperSheets from "../helper/helperSheets.js"
import helperContext from "../helper/helperContext.js";
import helperRolls from "../helper/helperRolls.js";
import helperDialog from "../helper/helperDialog.js";

const { HandlebarsApplicationMixin } = foundry.applications.api
export default class extendActorSheet 
             extends HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {

  //Constants...
  static SHEET_MODES = { 
    EDIT: 0, 
    PLAY: 1
  }

  //Attributes...
  _sheetMode = this.constructor.SHEET_MODES.PLAY
  _firstTimeStep = '01' 

  /**
   * constructor
   * @param {*} options 
   */
  constructor(options = {}) {
    super(options)
  }

  /**
   * DEFAULT_OPTIONS
   * @override 
   */
  static DEFAULT_OPTIONS = {
    classes: ["_extend", "_actor"],
    position: { 
      width: "600", 
      height: "600" 
    },
    form: {  submitOnChange: true },
    window: {  
      resizable: true
    },
    actions: {
      _edit:          this.#onEditSheet,
      _play:          this.#onPlaySheet,
      _rules:         this.#onChangeRules,
      _textsize:      this.#onChangeTextSize,
      _readKey:       this.#onReadKey,
      _showItem:      this.#onShowItem,
      _showDescr:     this.#onShowDescr,
      _checkButton:   this.#onBooleanField,
      _addRow:        this.#onAddRow,
      _deleteRow:     this.#onDeleteRow,
      _roll:          this.#onRoll,
      _deleteItem:    this.#onDeleteItem,
      _updateItem:    this.#onUpdateItem,
    }
  }

  /** gettings... */
  get isPlayMode() { return this._sheetMode === this.constructor.SHEET_MODES.PLAY }
  get isEditMode() { return this._sheetMode === this.constructor.SHEET_MODES.EDIT }

  static #onEditSheet(_event, target) {
    this._sheetMode = this.constructor.SHEET_MODES.EDIT
    this.document.sheet.render(true)
  }

  static #onPlaySheet(_event, target) {
    this._sheetMode = this.constructor.SHEET_MODES.PLAY
    this.document.sheet.render(true)
  }

  static #onChangeRules(_event, target) {
    helperSheets.changeRules(this.document)
  }

  static #onChangeTextSize(_event, target) {
    helperSheets.changeTextSize(this.document)
  }

  static async #onReadKey(_event, target) {
    const sTarget = $(event.currentTarget).parent().find('input[name="name"]')
    let sKey = sTarget.val().replaceAll(' ', '_').toLowerCase()
    let mDocs = await helperContext.getFromCompendium(this.document.system.rules)
    if (mDocs.find(e => e.system.key === sKey)) sKey = ''
    await this.document.update({"system.key": sKey})
  }

  static async #onShowItem(_event, target) {
    _event.stopPropagation()
    const sId = $(target).data('id')
    const item = this.document.items.get(sId)
    if (!item) return
    item.sheet.render(true)
  }

  static async #onShowDescr(_event, target) {
    _event.stopPropagation()
    const sId = $(target).data('id')
    const item = this.document.items.get(sId) 
    if (!item) return
    helperDialog.dialogDescription(item)
  }

  static async #onBooleanField(_event, target) {
    const path = $(target).data('path')
    let property = this.document;
    path.split('.').map(s => { property = property[s] })
    this.document.update({[path]: !property})
    this.document.sheet.render(true)
  }

  static async #onAddRow(_event, target) {
    const path = $(target).parents('._table').data('path')
    let mRows = this._access(this.document, path)

    let row = {}
    $(target).parent().parent().find('[data-field]').each((i,e) => {
      const field = $(e).data('field')
      row[field] = $(e).val()
    })    
    const index = mRows.findIndex(e => e.key === row.key)
    if (index >= 0) mRows[index] = row
               else mRows.push(row)
    await this.document.update({[path]: mRows})
  }  

  static async #onDeleteRow(_event, target) {
    const path = $(target).parents('._table').data('path')
    let mItems = this._access(this.document, path)
    const index = mItems.findIndex(e => e.key === $(target).parents('tr').data('key'))
    mItems.splice(index, 1)
    await this.document.update({[path]: mItems})
  }  

  static async #onRoll(_event, target) {
      helperRolls.roll({
        actor: this.document,
        target: $(target).data('target'),
        item: this.document.items.get($(target).data('item')),
        path: $(target).data('path'),
        formula: $(target).data('formula'),
        mod: $(target).data('mod') ? $(target).data('mod') : null,
        mods: $(target).data('mods') ? $(target).data('mods').split(',') : null,
        useLuck: $(target).data('useluck') ? $(target).data('useluck') : true
      })
  }

  static async #onDeleteItem(_event, target) {
    _event.stopPropagation()
    const item = this.document.items.get($(target).data('id'))
    if (item.type === 'competencia') {
      const answer = await helperDialog.dialogConfirm(this.document.system.rules, item.name, game.i18n.localize("info.confirmBorrarItem"))
      if (answer) await item.delete()
    } else await item.delete()    
  }

  static async #onUpdateItem(_event, target) {
    _event.stopPropagation()
    const item = this.document.items.get($(target).data('id'))
    const path = $(target).data('path')
    const bValue = this._access(item, path)
    await item.update({[path]: !bValue})
  }

  /**
   * _prepareContext
   * @override
   */
  async _prepareContext() {

    return {
      fields:             this.document.schema.fields,
      systemFields:       this.document.system.schema.fields,
      actor:              this.document,
      system:             helperSheets.checkStats(this.document.system),
      source:             this.document.toObject(),
      isEditMode:         this.isEditMode,
      isPlayMode:         this.isPlayMode,
      isEditable:         this.isEditable && this._sheetMode === 0,
      isGM:               game.user.isGM,
      rules:              helperContext.getRules(),
      myRules:            this.document.system.rules,
      configRULES:        configRULES[this.document.system.rules],
      mainRenderOptions:  helperSheets.getMainRenderOptions(this),
      skillRenderOptions: helperSheets.getSkillRenderOptions(this)
    }    
  }

  /**
   * textImplentation
   */
  static async textImplentation(field, document) {
      return await foundry.applications.ux.TextEditor.implementation.enrichHTML(
                          document.system[field], { relativeTo: document }) 
  }

  /**
   * title
   * @override
   */
  get title() {
    return this.document.name
  }

  /**
   * minimize
   */
  async minimize() {
    helperSheets.showTitle($(this.document.sheet.element))
    super.minimize()
  }

  /**
   * maximize
   */
  async maximize() {
    helperSheets.hideTitle($(this.document.sheet.element))
    super.maximize()
  }  

  /**
   * _onRender
   * @param {*} context 
   * @param {*} options 
   * @override
   */
  async _onRender(context, options) {
    await super._onRender(context, options)
    helperSheets.adjustTextSize($(this.element), this.document)
    helperSheets.addRulesClass($(this.element), this.document)
    helperSheets.addEditClass($(this.element), this.document)
    helperSheets.hideTitle($(this.element))
    helperSheets.addRulesButton($(this.element))
    helperSheets.addTextSizeButton($(this.element))
    helperSheets.addEditButton($(this.element), this.isPlayMode)
    helperSheets.drawSpectrum($(this.element))
    this.activateListeners($(this.element))
    this.activateTab(context, $(this.element))
  }

  /**
   * _onFirstRender
   * @param {*} context 
   * @param {*} options 
   * @override
   */  
  async _onFirstRender (context, options) {
    await super._onFirstRender(context, options)
  }

  _onResizeMouseDown(event) {
    event.preventDefault();
    this._resizableButton.addEventListener(...this._extendHandlers.resizeMove);
    this._resizableButton.addEventListener(...this._extendHandlers.resizeUp);
    helperSheets.adjustContent($(this.element))
  }

  _onResizeMouseMove(event) {
    event.preventDefault();
    helperSheets.adjustContent($(this.element))
  }
  _onResizeMouseUp(event) {
    event.preventDefault();
    this._resizableButton.removeEventListener(...this._extendHandlers.resizeMove);
    this._resizableButton.removeEventListener(...this._extendHandlers.resizeUp); 
    this.actor.sheet.render(true);     
  }

  /**
   * activateListeners
   * @param {*} html 
   */
  activateListeners(html) {

    $(window).on( "resize", async e => {
      if (this.rendered) await this.render(true);
    });

    //...RESIZING...
    delete this._extendHandlers;
    this._extendHandlers = Array();
    this._resizableButton = html.find('.window-resize-handle')[0];
    this._extendHandlers["resizeDown"] = ["pointerdown", e => this._onResizeMouseDown(e), false];
    this._extendHandlers["resizeMove"] = ["pointermove", e => this._onResizeMouseMove(e), false];
    this._extendHandlers["resizeUp"] = ["pointerup", e => this._onResizeMouseUp(e), false];   
    this._resizableButton.addEventListener(...this._extendHandlers.resizeDown);    

    if ( !this.isEditable || !this.isEditMode) return;
    
    /** --- SORTABLES --- */
    if (html.find('table._sortable').length > 0) {
      html.find('table._sortable tbody').sortable({
        item: '> tr._sortable',
        forcePlaceholderSize: true,
        placeholder: '_sortTR',
        cursor: 'pointer',
        axis: 'y',
        stop: this._dropTableTR.bind(this)
      })
    }

    /** --- TABLES --- */
    html.find('._table tbody tr').on("click", this._clickTableTR.bind(this))
  }

  /**
   * activateTab
   * @param {*} context 
   * @param {*} html 
   */
  activateTab(context, html) {

    [
     context.tabs, 
     context.tabsStats,
     context.tabsHechizos,
     context.tabsEnsalmos
    ].map(_tabs => {
        if (!_tabs) return
        for (var s in _tabs) { if (_tabs[s].active) {
          const tab = _tabs[s];
          html.find(`.tab[data-group="${tab.group}"][data-tab="${tab.id}"],
                    a[data-action="tab"][data-group="${tab.group}"][data-tab="${tab.id}"]`).each((i,e) => {
            $(e).addClass(tab.cssClass)
          })
        }}      
    })
  }

  /**
   * _dropTableTR
   * @param {*} event 
   * @param {*} ui 
   */
  async _dropTableTR(event, ui) {
    const path = $(event.target).parents('._table').data('path')
    let mItems = this._access(this.document, path)

    const oldIndex = mItems.findIndex(e => e.key === ui.item.data('key'))
    const newIndex = $(event.target).find('tr').index(ui.item)
    const item = mItems[oldIndex]
    
    mItems.splice(oldIndex, 1)
    mItems.splice(newIndex, 0, item)
    await this.document.update({[path]: mItems})
  }
  
  /**
   * _clickTableTR
   * @param {*} event 
   */
  _clickTableTR(event) {
    const key = $(event.currentTarget).data('key')
    if (!key || key === '') return 
    const option = $(event.currentTarget).parents('table._table')
                                         .find('thead tr select[data-field="key"]')
                                         .find('option[value="'+key+'"]')
    if (!option) return
    option.prop('selected', true)
  }

  /**
   * _access
   * @param {*} object 
   * @param {*} path 
   * @returns 
   */
  _access(object, path) {
    let oReturn = object
    path.split('.').map(s => { oReturn = oReturn[s] })
    return oReturn
  }

}
