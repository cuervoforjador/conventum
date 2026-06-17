import {api, md_stat, md_lore, md_text} from "../_constants.js"
import extend_Base from "../base.js";

export default class extendItem_Base extends extend_Base {

    /**
     * defineSchema
     * @returns 
     */
    static defineSchema() {
        const schema = super.defineSchema()

        schema.descripcion = new api.HTMLField({ initial: '' })
        schema.fuente =  new api.StringField({ initial: '' })

        return schema        
    }

}