import {api, md_stat, md_lore, md_text} from "../_constants.js"
import extendItem_Base from "./_base.js"

export default class modelEnsalmo extends extendItem_Base {

    /**
     * defineSchema
     * @returns 
     */
    static defineSchema() {
        const schema = super.defineSchema();

        schema.aprendido = new api.BooleanField({ initial: false })
        schema.ordo = new api.StringField({ initial: '' })     
        schema.propiedades = new api.SchemaField({
            estadoGracia: new api.BooleanField({ initial: false }),
            requisitos: new api.HTMLField({ initial: '' }),
            ceremonia: new api.HTMLField({ initial: '' }),
            duracion: new api.HTMLField({ initial: '' }),
            resumen: new api.StringField({ initial: '' })
        })    

        schema.massEdit = new api.HTMLField({ initial: '' })
        schema.massEditFolder = new api.StringField({ initial: '' })

        return schema;
    }

}