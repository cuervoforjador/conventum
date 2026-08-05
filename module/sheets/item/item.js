import { SYSTEM_ID } from "../../config/uiConstants.js"
import { configRULES } from "../../config/rules.js";
import extendItem0Sheet from "../item.js";

export default class sheetItem extends extendItem0Sheet {

  static templateFolder = "systems/"+SYSTEM_ID+"/templates/item"
  static templateTag = "item"

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

  /**
   * _prepareContext
   * @override
   */
  async _prepareContext() {
    const rules = this.document.system.rules
    const context = await super._prepareContext()    
    
    context.system.unidades.actual = !context.system.unidades.use ? 0 : context.system.unidades.actual
    context.system.unidades.total = !context.system.unidades.use ? 0 : context.system.unidades.total
    context.system.unidades.actual = (context.system.unidades.actual > context.system.unidades.total) ? 
                                      context.system.unidades.total : context.system.unidades.actual

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

    html.find("input[name='system.unidades.total']").on("change", this._changeUnidades.bind(this))
  }

  /**
   * _changeUnidades
   * @param {*} event 
   */
  _changeUnidades(event) {
    this.document.update({"system.unidades.actual": Number($(event.currentTarget).val())})
  }

}