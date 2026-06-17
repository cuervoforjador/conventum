import { SYSTEM_ID, ACTOR_IMG, ACTOR_IMGvyc } from "../config/uiConstants.js"
import helperContext from "../helper/helperContext.js";

export default class newActor extends Actor {

  /**
   * _initializeSource
   * @override
   */  
  _initializeSource(source, options={}) {
    const rules = game.settings.get(SYSTEM_ID, 'rules')
    const imgSrc = (rules !== 'vyc') ? ACTOR_IMG : ACTOR_IMGvyc

    source = super._initializeSource(source, options)
    if (source.system.rules === '') {
      source.img = `systems/${SYSTEM_ID}/${imgSrc}`
      source.system.rules = rules    
    }
    return source
  }

  /**
   * getRollData
   * @override
   */
  getRollData() {
    
    return { ...this.toObject(false).system, ...{
        initiative: this.system.initiative ?? 0 }
    }
  }

  /**
   * getCompetencia
   * @param {*} key 
   * @returns 
   */
  getCompetencia(key) {
    return this.items.find(e => e.type === 'competencia' && e.system.key === key)
  }

}