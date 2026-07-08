import {api, md_stat, md_lore, md_text} from "./_constants.js"

export default class extend_Base extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        const schema = {}

        schema.key  = new api.StringField({ initial: '' })
        schema.rules =  new api.StringField({ initial: 'aq3' })

        return schema
    }

}