/**
 * Helpers for Socket
 */

import { HookCombat } from "../hooks/_hooksCombat.js";
import { mainUtils } from "../mainUtils.js";
import { helperSheetCombat } from "../sheets/helpers/helperSheetCombat.js";
import { helperSprites } from "./helperSprites.js";

export class helperSocket {

    static socketAlias = "system.conventum"

    /**
     * onReceived
     */
    static onReceived() {
        game.socket.on(this.socketAlias, (payload) => {
            console.log("--- "+game.system.title+" Socket ---");
            switch (payload.action) {
                
                case "update":
                    helperSocket._postUpdate(payload);
                    break;

                case "refreshSheets":
                    helperSocket._doRefreshSheets();
                    break;

                case "refreshCombat":
                    helperSocket._doRefreshCombat();
                    break;          
 
                case "refreshActorsDirectory":
                    helperSocket._doRefreshActorsDirectory();
                    break;
                    
            }
        });
    }

    /**
     * send
     * @param {*} payload 
     */
    static send(payload) {
        game.socket.emit(this.socketAlias, this._payloadHeader(payload));
    }  

    /**
     * update
     */
    static async update(entity, data) {

        //delete data._id;

        if ( (game.user.isGM) ||
             ((entity.ownership !== undefined) && 
              (entity.ownership[game.userId]) && (entity.ownership[game.userId] === 3)) ) {
        
            //Messages...
            if (game.messages.get(entity.id)) {
                await this._updateFlagsMessages(entity, data);
                            
            } else {
            //Another entities...
                await entity.update(data);
                if ((entity.sheet) && (entity.sheet.rendered))
                await entity.sheet.render(true);                
            }            
            
        } else {
            helperSocket.send({
                action: 'update',
                type: entity.type,
                id: entity.id,
                tokenId: entity.isToken ? entity.token.id : null,
                data: data
            });            
        }
    }

    /**
     * refreshSheets
     */
    static refreshSheets() {
        helperSocket.send({
            action: 'refreshSheets'
        });
        this._doRefreshSheets();
    }

    /**
     * refreshActorsDirectory
     */
    static refreshActorsDirectory() {
        helperSocket.send({
            action: 'refreshActorsDirectory'
        });
        this._doRefreshActorsDirectory();
    }

    /**
     * refreshCombatTrack
     */
    static refreshCombatTrack() {
        helperSocket.send({
            action: 'refreshCombat'
        });
        this._doRefreshCombat();     
    }

    /**
     * _payloadHeader
     * @param {*} payload 
     * @returns 
     */
    static _payloadHeader(payload) {
        return {
            "action": payload.action ? payload.action : "noAction",
            "userId": payload.userId ? payload.userId : game.userId,
            "id": payload.id ? payload.id : '',
            "tokenId": payload.tokenId ? payload.tokenId : '',
            "data": payload.data ? payload.data : {},
            "force": false,
        };
    }

    /**
     * _postUpdate
     * @param {*} payload 
     */
    static async _postUpdate(payload) {
        if (!game.user.isGM) return;
        
        let entity = null;
        if (game.items.get(payload.id)) {
            entity = game.items.get(payload.id);
        }
        if (game.actors.get(payload.id)) {
            entity = (game.scenes.active.tokens.get(payload.tokenId)) ? 
                        game.scenes.active.tokens.get(payload.tokenId).getActor() :
                        game.actors.get(payload.id);            
        }
        if (game.messages.get(payload.id)) {
            entity = game.messages.get(payload.id);
            await this._updateFlagsMessages(entity, payload.data);
            return;
        }
        if (!entity) return;

        await entity.update(payload.data);
        if (entity.sheet.rendered) entity.sheet.render(true);
        //this.refreshSheets();
    }

    /**
     * _updateFlagsMessages
     * @param {*} entity 
     * @param {*} data 
     */
    static async _updateFlagsMessages(entity, data) {
        let updateData = {...{_id: entity.id}, ...data};
        if ((data.flags) || (data.flags !== undefined)) {
            updateData.flags._actor = null;
            updateData.flags._action = null;
            updateData.flags._weapon = null;
            updateData.flags._weapon2 = null;
            updateData.flags._spell = null;

            updateData.flags._skill = null;
            updateData.flags._combat = null;
            updateData.flags._encounter = null;
            updateData.flags._roll = null;
            updateData.flags._targetsDamage = {};
        }
        await ChatMessage.updateDocuments([updateData]);        
    }

    /**
     * _doRefreshSheets
     */
    static _doRefreshSheets() {
        for (let actor of game.actors) {
            if (actor.sheet.rendered)
                actor.sheet.render(true);
        }
    }

    /**
     * _doRefreshCombat
     */
    static _doRefreshCombat() {
        HookCombat.refreshCombatTrak();
    }

    /**
     * _doRefreshActorsDirectory
     */    
    static _doRefreshActorsDirectory() {
        game.actors.apps[0].render(true);
    }
}