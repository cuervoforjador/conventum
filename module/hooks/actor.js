import { SYSTEM_ID, ACTOR_IMG, ACTOR_IMGvyc } from "../config/uiConstants.js"

export default class hooksActor {

    /**
     * createActor
     * @param {*} actor 
     * @param {*} options 
     * @param {*} id 
     */
    static createActor(actor, options, id) {
        actor.prototypeToken.update({"actorLink": true})
    }

}