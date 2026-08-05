import { SYSTEM_ID } from "../../config/uiConstants.js"
import { configRULES } from "../../config/rules.js";
import extendItem0Sheet from "../item.js";
import helperContext from "../../helper/helperContext.js";
import helperSettings from "../../helper/helperSettings.js";
import helperSheets from "../../helper/helperSheets.js";

export default class sheetEnsalmo extends extendItem0Sheet {

  static templateFolder = "systems/"+SYSTEM_ID+"/templates/item"
  static templateTag = "ensalmo"

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ['_'+this.templateTag],
    position: { 
        width: 900
    },     
  }

  /** @override */
  static PARTS = {
    header: { template: `${this.templateFolder}/headers/${this.templateTag}.hbs` },
    main: { template: `${this.templateFolder}/main/${this.templateTag}.hbs` }
  } 
  static TABS = {
    primary: {
      tabs: [ {id: "propiedades"}, {id: "descripcion"}, {id: "massedit"} ],
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
    context.modeMass = helperSettings.getModeMass()

    context.niveles = helperContext.getEnsalmosNiveles(rules)
    context._textRequisitos = await extendItem0Sheet.textImplentation('propiedades.requisistos', this.document)
    context._textCeremonia = await extendItem0Sheet.textImplentation('propiedades.ceremonia', this.document)
    context._textDuracion = await extendItem0Sheet.textImplentation('propiedades.duracion', this.document)
    context._textMassEdit = await extendItem0Sheet.textImplentation('propiedades.preparacion', this.document)
    context._folders = helperSheets.getFolders()

    context.tabs = this._prepareTabs("primary")
    return context
  }

}