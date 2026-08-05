import { SYSTEM_ID } from "../../config/uiConstants.js"
import { configRULES } from "../../config/rules.js";
import extendItem0Sheet from "../item.js";
import helperSheets from "../../helper/helperSheets.js";

export default class sheetTienda extends extendItem0Sheet {

  static templateFolder = "systems/"+SYSTEM_ID+"/templates/item"
  static templateTag = "tienda"

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ['_'+this.templateTag],
    position: { 
        width: 700
    },    
  }

  /** @override */
  static PARTS = {
    header: { template: `${this.templateFolder}/headers/${this.templateTag}.hbs` },
    main: { template: `${this.templateFolder}/main/${this.templateTag}.hbs` }
  } 
  static TABS = {
    primary: {
      tabs: [ {id: "actors"}, {id: "productos"}, {id: "descripcion"} ],
      initial: "actors"
    }
  }  

  /**
   * _prepareContext
   * @override
   */
  async _prepareContext() {
    const rules = this.document.system.rules
    const context = await super._prepareContext()    

    context._folders = helperSheets.getFolders()
    context._actors = helperSheets.getActors(context.system.actors)
    context._productos = helperSheets.getProductos(context.system.folder, context.system.productos)

    context.tabs = this._prepareTabs("primary")
    return context
  }

  /**
   * _onRender
   * @param {*} context 
   * @param {*} options 
   * @override
   */
  async _onRender(context, options) {
    await super._onRender(context, options)    
    this.activateListeners($(this.element))
  }

  /**
   * activateListeners
   * @param {*} html 
   */
  activateListeners(html) {

    if ( !this.isEditable || !this.isEditMode) return;

    html.find("input._change").on("change", this._change.bind(this))
  }

  /**
   * _change
   * @param {*} event 
   */
  async _change(event) {
    event.stopPropagation()

    const id = $(event.currentTarget).data('id')
    const path = $(event.currentTarget).data('path')
    const target = $(event.currentTarget).data('target')

    let mTarget = []
    $(event.currentTarget).parents('tbody').find('tr').each((i,e) => {
      let oNew = {}
      for (var s in e.dataset) { oNew[s] = $(e).data(s) }
      mTarget.push(oNew)
    })

    let oItem = mTarget.find(e => e.id === $(event.currentTarget).data('id'))
    oItem[path] = $(event.currentTarget).attr('type') === 'checkbox' ? $(event.currentTarget).prop('checked')
                                                                     : $(event.currentTarget).val()

    await this.document.update({[target]: mTarget})
  }

}