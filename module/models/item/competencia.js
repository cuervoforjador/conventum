import {api, md_stat, md_lore, md_text} from "../_constants.js"
import extendItem_Base from "./_base.js"

export default class modelCompetencia extends extendItem_Base {

    /**
     * defineSchema
     * @returns 
     */
    static defineSchema() {
        const schema = super.defineSchema();

        schema.latin = new api.StringField({ initial: '' })
        schema.superior = new api.StringField({ initial: '' })
        schema.caracteristica = new api.StringField({ initial: '' })
        schema.folder = new api.BooleanField({ initial: false })
        schema.basica = new api.BooleanField({ initial: false })
        schema.idioma = new api.BooleanField({ initial: false })
        schema.armas = new api.BooleanField({ initial: false })
        schema.status = new api.SchemaField({
            noble: new api.BooleanField({ initial: false }),
            soldado: new api.BooleanField({ initial: false }),
            villano: new api.BooleanField({ initial: false })
        })

        return schema;
    }

}