import {api, md_stat, md_lore, md_text} from "../_constants.js"
import extendItem_Base from "./_base.js"

export default class modelArma extends extendItem_Base {

    /**
     * defineSchema
     * @returns 
     */
    static defineSchema() {        
        const schema = super.defineSchema();

        schema.competencia = new api.SchemaField({
            key: new api.StringField({ initial: '' })
        })
        schema.dosmanos = new api.BooleanField({ initial: false })
        schema.auxiliar = new api.BooleanField({ initial: false })
        schema.escudo = new api.BooleanField({ initial: false })
        schema.adistancia = new api.BooleanField({ initial: false })
        schema.fuego = new api.BooleanField({ initial: false })
        
        schema.fuerza = new api.NumberField({ nullable: true, initial: null })
        schema.resistenciaActual = new api.NumberField({ nullable: true, initial: null })
        schema.resistencia = new api.NumberField({ nullable: true, initial: null })        
        schema.dano =  new api.StringField({ initial: '' })
        schema.tamano =  new api.StringField({ initial: '' })   
        schema.recarga = new api.NumberField({ nullable: true, initial: null })
        schema.alcance = new api.SchemaField({
            corto: new api.NumberField({ nullable: true, initial: null }),
            medio: new api.NumberField({ nullable: true, initial: null }),
            largo: new api.NumberField({ nullable: true, initial: null }),
            fue: new api.BooleanField({ initial: false })
        })

        return schema;
    }

}