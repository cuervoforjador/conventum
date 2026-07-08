import extendCharacter_Character from "../models/character/character.js"
import extendCharacter_NPC from "../models/character/npc.js"

import modelItem from "../models/item/item.js"
import modelCompetencia from "../models/item/competencia.js"
import modelArma from "../models/item/arma.js"
import modelArmadura from "../models/item/armadura.js"
import modelSociedad from "../models/item/sociedad.js"
import modelPueblo from "../models/item/pueblo.js"
import modelReino from "../models/item/reino.js"
import modelEstrato from "../models/item/estrato.js"
import modelPosicion from "../models/item/posicion.js"
import modelProfesion from "../models/item/profesion.js"
import modelSecuela from "../models/item/secuela.js"
import modelRasgo from "../models/item/rasgo.js"
import modelGrimorio from "../models/item/grimorio.js"
import modelHechizo from "../models/item/hechizo.js"
import modelEnsalmo from "../models/item/ensalmo.js"
import modelFormula from "../models/item/formula.js"

import newActor from "../documents/actor.js"
import newItem from "../documents/item.js"
import newChatMessage from "../documents/chatMessage.js"
import newRollTable from "../documents/rollTable.js"
import newCombat from "../documents/combat.js"
import newRoll from "../documents/roll.js"

export default class helperModels {

    /**
     * initModels
     */
    static initModels() {

        CONFIG.Actor.dataModels.character = extendCharacter_Character
        CONFIG.Actor.dataModels.npc = extendCharacter_NPC

        CONFIG.Item.dataModels.item = modelItem
        CONFIG.Item.dataModels.competencia = modelCompetencia
        CONFIG.Item.dataModels.arma = modelArma
        CONFIG.Item.dataModels.armadura = modelArmadura
        CONFIG.Item.dataModels.sociedad = modelSociedad
        CONFIG.Item.dataModels.pueblo = modelPueblo
        CONFIG.Item.dataModels.reino = modelReino
        CONFIG.Item.dataModels.estrato = modelEstrato
        CONFIG.Item.dataModels.posicion = modelPosicion
        CONFIG.Item.dataModels.profesion = modelProfesion
        CONFIG.Item.dataModels.secuela = modelSecuela
        CONFIG.Item.dataModels.rasgo = modelRasgo
        CONFIG.Item.dataModels.grimorio = modelGrimorio
        CONFIG.Item.dataModels.hechizo = modelHechizo
        CONFIG.Item.dataModels.ensalmo = modelEnsalmo
        CONFIG.Item.dataModels.formula = modelFormula
    }

    /**
     * setDocumentClasses
     */
    static setDocumentClasses() {

        CONFIG.Actor.documentClass = newActor
        CONFIG.Item.documentClass = newItem
        CONFIG.ChatMessage.documentClass = newChatMessage
        CONFIG.RollTable.documentClass = newRollTable
        CONFIG.Combat.documentClass = newCombat
        CONFIG.Dice.rolls.push(newRoll)
    }

}