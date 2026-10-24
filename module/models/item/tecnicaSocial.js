import {api, md_stat, md_lore, md_text} from "../_constants.js"
import extendItem_Base from "./_base.js"

export default class modelTecnicaSocial extends extendItem_Base {

    /**
     * defineSchema
     * @returns 
     */
    static defineSchema() {
        const schema = super.defineSchema();

        schema.sociedad = new api.SchemaField({
            apariencia: new api.BooleanField({ initial: false }),
            renombre: new api.BooleanField({ initial: false }),
            naturaleza: new api.BooleanField({ initial: false }),
            actitud: new api.BooleanField({ initial: false }),
        })

        return schema;
    }

}