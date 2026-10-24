import { SYSTEM_ID } from "../../config/uiConstants.js"
import { configRULES } from "../../config/rules.js";
import extendItem0Sheet from "../item.js";
import helperContext from "../../helper/helperContext.js";
import helperSettings from "../../helper/helperSettings.js";
import helperSheets from "../../helper/helperSheets.js";

export default class sheetTecnicaSocial extends extendItem0Sheet {

  static templateFolder = "systems/"+SYSTEM_ID+"/templates/item"
  static templateTag = "tecnicaSocial"

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ['_'+this.templateTag],
    position: { 
        width: 800
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

    return context
  }

}