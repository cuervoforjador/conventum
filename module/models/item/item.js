import {api, md_stat, md_lore, md_text} from "../_constants.js"
import extendItem_Base from "./_base.js"

export default class modelItem extends extendItem_Base {

    /**
     * defineSchema
     * @returns 
     */
    static defineSchema() {
        
        const schema = super.defineSchema();

        schema.municion = new api.BooleanField({ initial: false })
        schema.ropa = new api.BooleanField({ initial: false })
        schema.comida = new api.BooleanField({ initial: false })
        schema.bebida = new api.BooleanField({ initial: false })
        schema.montura = new api.BooleanField({ initial: false })

        return schema;
    }

}