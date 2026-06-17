export default class helperTokens {

    /**
     * configTrackableAttributes
     */
    static configTrackableAttributes() {

        CONFIG.Actor.trackableAttributes = {
            character: {
                bar:   ["atributos.ptv","atributos.rr","atributos.irr."],
                value: ["caracteristicas.fue", "caracteristicas.agi", "caracteristicas.hab", "caracteristicas.res", "caracteristicas.per", "caracteristicas.tem", "caracteristicas.com", "caracteristicas.cul", "caracteristicas.asp"],
            },
            npc: {
                bar:   ["attributes.health.points"],
                value: ["primary.strength"],
            }
        }

    }
}