import { SYSTEM_ID } from "../config/uiConstants.js"
import helperCombat from "./helperCombat.js"
import helperContext from "./helperContext.js"
import helperSheets from "./helperSheets.js"
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
            case "refreshActorSheet": {
                if (game.user.isGM) return
                const actor = helperTools.getActor(data.actorId, data.tokenId)
                if (!actor || actor.ownership[game.user.id] !== 3) return
                if (actor.sheet.rendered) actor.sheet.render(true)
                break
            }
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
            case 'buyItem': {
                if (!game.user.isGM || (activeGM && activeGM.id !== game.user.id)) return
                await helperSheets.requestComprarItem(data)
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
     * requestBuyItem
     * @param {*} param0 
     */
    static async requestBuyItem({ actorId, tokenId, stats}) {
        if (game.user.isGM) return helperSheets.requestComprarItem({ actorId, tokenId, stats })  
        if (!game.socket) return

        game.socket.emit(`system.${SYSTEM_ID}`, {
            type: "buyItem",
            actorId,
            tokenId,
            stats
        })        
    }

    /**
     * requestRefreshActorSheet
     * @param {*} actorId 
     * @param {*} tokenId 
     */
    static async requestRefreshActorSheet(actorId, tokenId) {        
        const actor = helperTools.getActor(actorId, tokenId)
        if (!actor) return        
        if (game.user.isGM && actor.sheet.rendered) actor.sheet.render(true)
        if (actor.hasPlayerOwner) {
            const stats = {}
            game.socket.emit(`system.${SYSTEM_ID}`, {
                type: "refreshActorSheet",
                actorId,
                tokenId,
                stats
            })
        }
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