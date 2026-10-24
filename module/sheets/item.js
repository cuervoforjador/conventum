import { SYSTEM_ID } from "../config/uiConstants.js";
import { configRULES } from "../config/rules.js";
import helperSheets from "../helper/helperSheets.js"
import helperContext from "../helper/helperContext.js";
import helperSettings from "../helper/helperSettings.js";
import helperTools from "../helper/helperTools.js";

const { HandlebarsApplicationMixin } = foundry.applications.api
export default class extendItem0Sheet 
             extends HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {

  //Constants...
  static SHEET_MODES = { 
    EDIT: 0, 
    PLAY: 1
  }

  //Attributes...
  _sheetMode = helperSettings.getModeEdit() && helperTools.isGM() ? 
                this.constructor.SHEET_MODES.EDIT : this.constructor.SHEET_MODES.PLAY
  _focus = null
  _searching = ''
  _tableID = ''

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["_extend", "_item"],
    position: { 
        width: 700, 
        height: 600 
    },
    form: { submitOnChange: true },
    window: { resizable: true },
    actions: {
      _edit:          this.#onEditSheet,
      _play:          this.#onPlaySheet,
      _readKey:       this.#onReadKey,
      _clipboard:     this.#onClipboard,
      _checkButton:   this.#onBooleanField,
      _addRow:        this.#onAddRow,
      _deleteRow:     this.#onDeleteRow,
      _selectRow:     this.#onSelectRow,
      _markRow:       this.#onMarkRow,
      _checkProperty: this.#onCheckProperty,
      _copyObject:    this.#onCopyObject,
      _greenIcon:     this.#onGreenIcon,
      _massEdit:      this.#onMassEdit
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
    const sTarget = $(event.currentTarget).parent().find('input[name="name"]').val()
    const sKey = helperSheets.clearKey(sTarget)
    let mDocs = await helperContext.getFromCompendium(this.document.system.rules)
    if (mDocs.find(e => e.system.key === sKey)) sKey = ''
    await this.document.update({"system.key": sKey})
  }

  static #onClipboard(_event, target) {
    const plainText = $(target).data('plaintext')
    game.clipboard.copyPlainText(plainText).then(() => {
      ui.notifications.info(plainText);
    });    
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
    const bNumeric = $(target).parents('._table').data('keynumeric')
    let mRows = this._access(this.document, path)

    let row = {}
    $(target).parent().parent().find('[data-field]').each((i,e) => {
      const field = $(e).data('field')
      row[field] = $(e).val()
      if (bNumeric && field === 'key' &&  Number($(e).val()) === 0) row[field] = mRows.length + 1
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
    const path = $(target).parents('._table').data('path')
    const bNumeric = $(target).parents('._table').data('keynumeric')
    const row = bNumeric ?  this._access(this.document, path).find(e => Number(e.key) === Number(key)) :
                            this._access(this.document, path).find(e => e.key === key)
    $(target).parents('table').find('._sortTR').find('input').each((i,e) => {
      var nIndex = 0
      for (var s in row) {
        if (nIndex === i) $(e).val(row[s])
        nIndex++
      }
    })
  }

  static async #onMarkRow(_event, target) {
    const key = $(target).data('key')
    const field = $(target).data('field')
    const path = $(target).parents('._table').data('path')
    const bNumeric = $(target).parents('._table').data('keynumeric')

    let mRows = this._access(this.document, path)
    let row = bNumeric ?  mRows.find(e => Number(e.key) === Number(key)) :
                          mRows.find(e => e.key === key)
    row[field] = $(target).prop('checked')

    await this.document.update({[path]: mRows})
  }

  _onChangeProperty(event) {
    extendItem0Sheet.#onCheckProperty(event, event.currentTarget, this.document)
  }

  static async #onCheckProperty(_event, target, document) {
    const _table = $(target).parents('._table')
    const path = _table.data('path')
    const key = $(target).parents('._row').data('key')
    const field = $(target).data('field')
    
    const mRows = []
    _table.find('._row').each((i, e) => {
      var oRow = {}
      oRow.key = $(e).data('key')
      $(e).find('[data-field]').each((i2, e2) => {
        oRow[$(e2).data('field')] = $(e2).is(':checkbox') ? $(e2).prop('checked') : $(e2).val()
      })
      mRows.push(oRow)
    })

    if (!document) document = this.document
    await document.update({[path]: mRows})
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

  static async #onMassEdit(_event, target) {
    const sText = this.document.system.massEdit
    if (!sText || sText === '') return

    if (this.document.type === 'hechizo') helperSheets.parseHechizo(sText, this.document)
    if (this.document.type === 'ensalmo') helperSheets.parseEnsalmo(sText, this.document)
    if (this.document.type === 'formula') helperSheets.parseFormula(sText, this.document)
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
      configRULES:          configRULES[this.document.system.rules],
      
      _searching:           this._searching,
      _richDescripcion:     richDescription
    }
  }

  /**
   * textImplentation
   */
  static async textImplentation(fieldPath, document) {
      
      return await foundry.applications.ux.TextEditor.implementation.enrichHTML(
                          this.access(document.system, fieldPath), { relativeTo: document }) 
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
    helperSheets.adjustDescriptionSection($(this.element))

    this.activateListeners($(this.element))
    this.activateTab(context, $(this.element))
    this.addCustomTextButtons(context, $(this.element))
    this.activateFocus()

    if (this._searching !== '') this._toggleLinesTable(this._tableID, this._searching)   
  }

  /**
   * activateListeners
   * @param {*} html 
   */
  activateListeners(html) {

    if ( !this.isEditable || !this.isEditMode) return;

    html.find("input[name]").on("focusin", this._onFocusIn.bind(this))
    html.find("button").on("click", this._onFocusIn.bind(this))

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

    html.find("input[name='system.etiquetas']").on("change", this._changeEtiquetas.bind(this))
    html.find("._table tbody tr").on("click", this._clickTableTR.bind(this))
    html.find("._alternative button[type='button']").on("click", this._changeAlternative.bind(this))
    html.find("img._option").on("click", this._clickOption.bind(this))

    /** --- SEARCHERS --- */
    html.find("input.search-input").on("keyup", this._searchInTable.bind(this))

    /** --- TABLE PROPERTIES --- */
    html.find('input[data-action="_changeProperty"]').on("change", this._onChangeProperty.bind(this))

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
   * changeTab
   * @param {*} tab 
   * @param {*} group 
   * @param {*} options 
   */
  changeTab(tab, group, options) {
    if (tab === 'massedit') {
        const body = $(document).find('body')
        const sideBar = $(document).find("#interface section#ui-right #sidebar #sidebar-content")
        $(this.element).width(body.width() - sideBar.width())
        $(this.element).height(body.height() - 100)
        $(this.element).css('top', 5)
        $(this.element).css('left', 5)
    }
    super.changeTab(tab, group, options);
  }

  /**
   * addCustomTextButtons
   * @param {*} context 
   * @param {*} html 
   */
  addCustomTextButtons(context, html) {

    html.find('.menu-container menu.editor-menu').each((i,e) => {
      const menu = $(e)
      const path = menu.parents('.editor').attr('name')
      const type = context.item.type
      const rules = context.myRules

      if (menu.find('li._fromPDF').length === 0) {
        menu.append(`<li class="_custom _fromPDF">
                        <button type="button" data-action="fromPDF" data-tooltip="Arreglar Texto">
                          <i class="fa-solid fa-text fa-fw"></i>
                        </button>
                    </li>`)
        if (path === 'system.massEdit' && context.modeMass) {
          menu.append(`<li class="_custom _massEdit">
                        <button type="button" data-action="massEdit" data-tooltip="Reconocer Texto">
                          <i class="fa-solid fa-wand-magic-sparkles fa-fw"></i>
                        </button>
                      </li>`)
        }                 
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
        menu.find('li._massEdit button').on("click", async (event, data) => {
          let content = $(event.delegateTarget).parents('prose-mirror').find('.editor-content')
          let sContent = content.html()                    
          if (type === 'hechizo') sContent = helperSheets.reconocerHechizo(rules, sContent)
          if (type === 'ensalmo') sContent = helperSheets.reconocerEnsalmo(rules, sContent)
          if (type === 'formula') sContent = helperSheets.reconocerFormula(rules, sContent)
          content.html(sContent)
          await context.item.update({"system.massEdit": sContent})
        })
      }
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
   * _changeAlternative
   * @param {*} event 
   */
  async _changeAlternative(event) {
    const target = $(event.currentTarget)
    const path = target.data('path')
    const data = {}
    target.parents('._alternative').find('input[type="checkbox"]').each((i,e) => {
      if ($(e).attr('name') !== path) data[$(e).attr('name')] = false
    })
    await this.document.update(data)
  }

  /**
   * _clickOption
   * @param {*} event 
   */
  async _clickOption(event) {
    const target = $(event.currentTarget)
    const path = target.data('path')
    const key = target.data('key')

    let mValues = this._access(this.document, path)
    if (!mValues) return
    
    const mData = []
    target.parents('._options').find('._option').each((i,e) => {
      const pValue = mValues.find(p => p.key === $(e).data('key'))
      mData.push({
        key: $(e).data('key'),
        checked: !!pValue?.checked
      })
    })

    let oValue = mData.find(e => e.key === key)
    if (oValue) oValue.checked = !oValue.checked
    
    await this.document.update({[path]: mData})
  }

  /**
   * _searchInTable
   * @param {*} event 
   */
  _searchInTable(event) {
      const idTable = $(event.currentTarget).data('table')
      const sValue = helperTools.removeAccents($(event.currentTarget).val().toLowerCase())
      this._searching = sValue
      this._tableID = idTable            
      this._toggleLinesTable(idTable, sValue)
  }
  _toggleLinesTable(idTable, sValue) {
      if (sValue.length <= 3) {
        $("#"+idTable+' ._row').each((i,e) => {$(e).show()})
        return
      }
      $("#"+idTable+' ._row').filter((i, e) => {
        var bFound = false
        sValue.split(',').map(sValue0 => {
          bFound = helperTools.removeAccents($(e).find('._label').text().toLowerCase()).indexOf(sValue0.trim()) > -1 || bFound
        })
        $(e).toggle(bFound)
      })
  }


  /**
   * _changeEtiquetas
   * @param {*} event 
   */
  _changeEtiquetas(event) {
    let sVal = ''
    $(event.currentTarget).val().split(',').map(s => {
      sVal += sVal === '' ? s.trim().toLowerCase() : ', ' + s.trim().toLowerCase()
    })
    $(event.currentTarget).val(sVal)
  }

  /**
   * 
   * @param {*} event 
   * @override
   */
  _onFocusIn(event) {
    if (!$(event.currentTarget).is('button')) event.stopPropagation()    
    this._focus = $(event.currentTarget)
  }
  activateFocus() {
    if (!this._focus) return
    $(this.form).find('[name="'+this._focus.prop('name')+'"]').focus()
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
  static access(object, path) {
    let oReturn = object
    path.split('.').map(s => { oReturn = oReturn[s] })
    return oReturn
  }  

}