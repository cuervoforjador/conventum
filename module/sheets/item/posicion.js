import { SYSTEM_ID } from "../../config/uiConstants.js"
import { configRULES } from "../../config/rules.js";
import extendItem0Sheet from "../item.js";
import helperContext from "../../helper/helperContext.js";

export default class sheetPosicion extends extendItem0Sheet {

  static templateFolder = "systems/"+SYSTEM_ID+"/templates/item"
  static templateTag = "posicion"

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ['_'+this.templateTag]
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
    const context = await super._prepareContext()
    const rules = context.system.rules;

    context.configRULES = configRULES[rules]
    return context

  }

}