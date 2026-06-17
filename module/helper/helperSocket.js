import { SYSTEM_ID } from "../config/uiConstants.js"
import helperCombat from "./helperCombat.js"
import helperContext from "./helperContext.js"
import helperTables from "./helperTables.js"
import helperTools from "./helperTools.js"

export default class helperSocket {

    /**
     * onSocketMessage
     * @param {*} data 
     * @returns 
     */
    static async onSocketMessage(data) {

        const activeGM = game.users.activeGM        
        switch (data.type) {
            case "applyDamage": {
                if (!game.user.isGM || (activeGM && activeGM.id !== game.user.id)) return
                await helperCombat.applyDamage(data)
                break
            }
            case "createRollTable": {
                if (!game.user.isGM || (activeGM && activeGM.id !== game.user.id)) return
                await helperTables.createRollTable(data)
                break                
            }
            case "rollTable": {
                if (game.userId !== helperSocket.getOwnerId( helperTools.getActor(data.actorId, data.tokenId)) ) return
                await helperTables.rollTable(data)
                break
            }
            case "deleteRollTable": {
                if (!game.user.isGM || (activeGM && activeGM.id !== game.user.id)) return
                await helperTables.deleteRollTable(data)
                break                
            }            
        }
    }

    /**
     * requestDamage
     * @param {*} options 
     */
    static async requestDamage({ actorId, tokenId, stats, chatMessageId = null }) {
        if (game.user.isGM) return helperCombat.applyDamage({ actorId, tokenId, stats, chatMessageId })
        if (!game.socket) return
        game.socket.emit(`system.${SYSTEM_ID}`, {
            type: "applyDamage",
            actorId,
            tokenId,
            stats,
            chatMessageId,
        }) 
    }

    /**
     * requestRollTable
     * @param {*} stats 
     */
    static async requestCreateRollTable({ actorId, tokenId, stats }) { 
        if (game.user.isGM) return helperTables.createRollTable({ actorId, tokenId, stats })  
        if (!game.socket) return
        game.socket.emit(`system.${SYSTEM_ID}`, {
            type: "createRollTable",
            actorId,
            tokenId,
            stats
        })       
    }

    /**
     * requestRollTable
     * @param {*} stats 
     */
    static async requestRollTable({ actorId, tokenId, stats }) {
        const actor = helperTools.getActor(actorId, tokenId)
        if (!actor) return

        let ownerId = helperSocket.getOwnerId(actor)
        if (game.userId === ownerId) return helperTables.rollTable({ actorId, tokenId, stats })        

        game.socket.emit(`system.${SYSTEM_ID}`, {
            type: "rollTable",
            actorId,
            tokenId,
            stats
        }) 
    }

    /**
     * requestDeleteRollTable
     * @param {*} param0 
     */
    static async requestDeleteRollTable({ actorId, tokenId, stats }) {
        if (game.user.isGM) return helperTables.deleteRollTable({ actorId, tokenId, stats })  
        if (!game.socket) return

        game.socket.emit(`system.${SYSTEM_ID}`, {
            type: "deleteRollTable",
            actorId,
            tokenId,
            stats
        })         
    }

    /**
     * getOwner
     * @param {*} actor 
     */
    static getOwnerId(actor) {
        let ownerId = ''
        const userMaster = game.users.find(e => e.isActiveGM)
        for (var s in actor.ownership) {
            if (actor.ownership[s] === 3 && s !== userMaster.id && game.users.get(s).active) ownerId = s
        }
        if (ownerId !== '') return ownerId
                       else return userMaster.id
    }
}