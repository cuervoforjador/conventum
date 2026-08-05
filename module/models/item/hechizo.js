import {api, md_stat, md_lore, md_text} from "../_constants.js"
import extendItem_Base from "./_base.js"

export default class modelHechizo extends extendItem_Base {

    /**
     * defineSchema
     * @returns 
     */
    static defineSchema() {
        const schema = super.defineSchema();

        schema.aprendido = new api.BooleanField({ initial: false })
        schema.vis = new api.StringField({ initial: '' })
        schema.tiradaRR = new api.BooleanField({ initial: false })
        schema.info = new api.SchemaField({
            forma: new api.StringField({ initial: '' }),
            naturaleza: new api.StringField({ initial: '' }),
            origen: new api.StringField({ initial: '' })
        })        
        schema.propiedades = new api.SchemaField({
            caducidad: new api.SchemaField({
                useFormula: new api.BooleanField({ initial: false }),
                formula: new api.StringField({ initial: '' }),
                text: new api.StringField({ initial: '' })
            }),
            duracion: new api.SchemaField({
                useFormula: new api.BooleanField({ initial: false }),
                formula: new api.StringField({ initial: '' }),
                text: new api.StringField({ initial: '' })
            }),
            preparacion: new api.HTMLField({ initial: '' }),
            resumen: new api.StringField({ initial: '' }) 
        })

        schema.componentes = new api.ArrayField(new api.SchemaField({
            key: new api.StringField({ initial: '' }),
            name: new api.StringField({ initial: '' }),
            checked: new api.BooleanField({ initial: false })
        }))  
        
        schema.massEdit = new api.HTMLField({ initial: '' })
        schema.massEditFolder = new api.StringField({ initial: '' })

        return schema;
    }

}