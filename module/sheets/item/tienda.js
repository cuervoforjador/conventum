import { SYSTEM_ID } from "../../config/uiConstants.js"
import { configRULES } from "../../config/rules.js";
import extendItem0Sheet from "../item.js";
import helperSheets from "../../helper/helperSheets.js";
import helperSocket from "../../helper/helperSocket.js";

export default class sheetTienda extends extendItem0Sheet {

  static templateFolder = "systems/"+SYSTEM_ID+"/templates/item"
  static templateTag = "tienda"

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ['_'+this.templateTag],
    position: { 
        width: 700
    },   
    actions: {
      _showItem:      this.#onShowItem,
      _refresh:       this.#onRefresh
    } 
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

    if (context.system.productos.length === 0) {

    }

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
   * onShowItem
   * @param {*} _event 
   * @param {*} target 
   * @returns 
   */
  static async #onShowItem(_event, target) {
    _event.stopPropagation()
    const sId = $(target).data('id')
    const item = game.items.get(sId)
    if (!item) return
    item.sheet.render(true)
  }

  /**
   * onRefresh
   * @param {*} _event 
   * @param {*} target 
   */
  static async #onRefresh(_event, target) {
      let mTarget = []
      $(event.currentTarget).find('section[data-tab="productos"]')
                            .find('table._list tbody').find('tr').each((i,e) => {
        let oNew = {}
        for (var s in e.dataset) { oNew[s] = $(e).data(s) }
        mTarget.push(oNew)
      })
      await this.document.update({"system.productos": mTarget})

      for (let oActor of this.document.system.actors) {
        const actor = game.actors.get(oActor.id)
        if (oActor.visible && actor) helperSocket.requestRefreshActorSheet(actor.id, actor.token?.id)
      }
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
    if (target === 'item') {

      let oItem = game.items.get(id)
      const value = $(event.currentTarget).attr('type') === 'checkbox' ? $(event.currentTarget).prop('checked')
                                                                       : $(event.currentTarget).val()      
      await oItem.update({[path]: value})

    } else {

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

}