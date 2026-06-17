import { SYSTEM_ID } from "../config/uiConstants.js";
import helperSheets from "../helper/helperSheets.js"
import helperContext from "../helper/helperContext.js";

const { HandlebarsApplicationMixin } = foundry.applications.api
export default class extendItem0Sheet 
             extends HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {

  //Constants...
  static SHEET_MODES = { 
    EDIT: 0, 
    PLAY: 1
  }

  //Attributes...
  _sheetMode = this.constructor.SHEET_MODES.PLAY

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["_extend", "_item"],
    position: { 
        width: 600, 
        height: 600 
    },
    form: { submitOnChange: true },
    window: { resizable: true },
    actions: {
      _edit:          this.#onEditSheet,
      _play:          this.#onPlaySheet,
      _readKey:       this.#onReadKey,
      _checkButton:   this.#onBooleanField,
      _addRow:        this.#onAddRow,
      _deleteRow:     this.#onDeleteRow,
      _selectRow:     this.#onSelectRow,
      _copyObject:    this.#onCopyObject,
      _greenIcon:     this.#onGreenIcon
    },
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

  static async #onReadKey(_event, target) {
    const sTarget = $(event.currentTarget).parent().find('input[name="name"]')
    let sKey = sTarget.val().replaceAll(' ', '_').toLowerCase()
    sKey = sKey.replaceAll('ú', 'u').replaceAll('ó', 'o').replaceAll('í', 'i').replaceAll('é', 'e').replaceAll('á', 'a')
    sKey = sKey.replaceAll('ü', 'u').replaceAll('ö', 'o').replaceAll('ï', 'i').replaceAll('ë', 'e').replaceAll('ä', 'a')
    sKey = sKey.replaceAll('ù', 'u').replaceAll('ò', 'o').replaceAll('ì', 'i').replaceAll('è', 'e').replaceAll('à', 'a')
    sKey = sKey.replaceAll('û', 'u').replaceAll('ô', 'o').replaceAll('î', 'i').replaceAll('ê', 'e').replaceAll('â', 'a')
    sKey = sKey.replaceAll('(', '').replaceAll(')', '').replaceAll('[', '').replaceAll(']', '').replaceAll('ñ', 'n')
    sKey = sKey.replaceAll('/', '').replaceAll('"', '').replaceAll("'", '').replaceAll('`', '').replaceAll('´', '')
    sKey = sKey.replaceAll('*', '').replaceAll('?', '').replaceAll('¿', '').replaceAll('!', '').replaceAll('¡', '')
    sKey = sKey.replaceAll('^', '').replaceAll('¨', '').replaceAll('+', '').replaceAll('-', '').replaceAll('.', '')
    sKey = sKey.replaceAll(',', '').replaceAll(';', '').replaceAll(':', '').replaceAll('<', '').replaceAll('>', '')

    let mDocs = await helperContext.getFromCompendium(this.document.system.rules)
    if (mDocs.find(e => e.system.key === sKey)) sKey = ''
    await this.document.update({"system.key": sKey})
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

  static #onSelectRow(_event, target) {
    const key = $(target).parents('tr').data('key')
    const path = $(target).parents('table').data('path')
    const row = this._access(this.document, path).find(e => e.key === key)
    $(target).parents('table').find('._sortTR').find('input').each((i,e) => {
      var nIndex = 0
      for (var s in row) {
        if (nIndex === i) $(e).val(row[s])
        nIndex++
      }
    })
  }

  static async #onGreenIcon(_event, target) {
    const filename = this.document.img
    const folder = filename.split('/').slice(0,-1).join('/')
    const newFilename = filename.replace('.svg', '-green.svg')
    const file = await fetch(filename);
    const content = await file.text();
    const newContent = content.replaceAll('#820a0a', '#204231')
    const newFile = new File([newContent], newFilename, { type: "text/plain" })

    const FilePickerV2 = foundry.applications.apps.FilePicker.implementation;
    const filePicker = await FilePickerV2.upload("data", folder, newFile)
    await this.document.update({'img': newFilename})
  }

  static async #onCopyObject(_event, target) {
    const select = $(target).parents('._combo').find('select._copyObject')
    const key = select.find(':selected').val()
    const path = select.data('path')
    const rules = this.document.system.rules
    const lore = this.document.type
    const mDocs = await helperContext.getFromCompendium(rules, lore)
    const item = mDocs.find(e => e.system.key === key)
    if (!item) return
    const data = this._access(item, path)
    await this.document.update({[path]: data})
  }

  /** @override */
  async _prepareContext() {
    
    const richDescription = await extendItem0Sheet.textImplentation('descripcion', this.document);

    return {
      fields:               this.document.schema.fields,
      systemFields:         this.document.system.schema.fields,
      item:                 this.document,
      system:               this.document.system,
      source:               this.document.toObject(),
      isEditable:           this.isEditable && this._sheetMode === 0,
      rules:                helperContext.getRules(),
      myRules:              this.document.system.rules,

      _richDescripcion:     richDescription
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
    helperSheets.addRulesClass($(this.element), this.document)
    helperSheets.hideTitle($(this.element))
    //helperSheets.adjustContent($(this.element))
    helperSheets.addEditButton($(this.element), this.isPlayMode)
    this.activateListeners($(this.element))
    this.activateTab(context, $(this.element))
    this.addCustomTextButtons(context, $(this.element))
  }

  /**
   * activateListeners
   * @param {*} html 
   */
  activateListeners(html) {

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
    for (var s in context.tabs) { if (context.tabs[s].active) {
      const tab = context.tabs[s];
      html.find(`.tab[data-group="${tab.group}"][data-tab="${tab.id}"],
                 a[data-action="tab"][data-group="${tab.group}"][data-tab="${tab.id}"]`).each((i,e) => {
        $(e).addClass(tab.cssClass)
      })
    }}
  }

  /**
   * addCustomTextButtons
   * @param {*} context 
   * @param {*} html 
   */
  addCustomTextButtons(context, html) {
    const menu = html.find('.menu-container menu.editor-menu')
    if (menu.find('li._fromPDF').length === 0) {
      menu.append(`<li class="_custom _fromPDF">
                      <button type="button" data-action="fromPDF" data-tooltip="Arreglar Texto">
                        <i class="fa-solid fa-text fa-fw"></i>
                      </button>
                   </li>`)
      menu.find('li._fromPDF button').on("click", (event, data) => {
        let content = $(event.delegateTarget).parents('prose-mirror').find('.editor-content')
        let sContent = content.html()
        sContent = sContent.replaceAll('<p>', '')
        let mContent = sContent.split('</p>')
        let sFinal = ""
        mContent.map(s => {
          if (sFinal.slice(-1) === '-') sFinal = sFinal.slice(0, -1) + s
          else sFinal = sFinal === '' ? s : sFinal + ' ' + s
        })
        sFinal = sFinal.replaceAll('. ', '.</p><p>')
        sFinal = '<p>'+sFinal+'</p>'
        content.html(sFinal)
      })
    }
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