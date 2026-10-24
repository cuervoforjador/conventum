import { SYSTEM_ID } from "../../config/uiConstants.js"
import extendItem0Sheet from "../item.js";
import helperContext from "../../helper/helperContext.js";

export default class sheetAccion extends extendItem0Sheet {

  static templateFolder = "systems/"+SYSTEM_ID+"/templates/item"
  static templateTag = "accion"

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ['_'+this.templateTag],
    position: { 
        height: 800
    },       
  }

  /** @override */
  static PARTS = {
    header: { template: `${this.templateFolder}/headers/${this.templateTag}.hbs` },
    main: { template: `${this.templateFolder}/main/${this.templateTag}.hbs` }
  } 
  static TABS = {
    primary: {
      tabs: [ {id: "propiedades"}, {id: "descripcion"} ],
      initial: "descripcion"
    }
  }

  /**
   * _prepareContext
   * @override
   */
  async _prepareContext() {
    const rules = this.document.system.rules
    const context = await super._prepareContext()

    context.competenciasArmas = await helperContext.getCompetenciasArmasSheet(rules)
    context._textResumen = await extendItem0Sheet.textImplentation('resumen', this.document)

    context.tabs = this._prepareTabs("primary")
    return context
  }

}