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
                    helperSocket._update(payload);
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

        if (game.user.isGM) {
            await entity.update(data);
        } else {
            helperSocket.send({
                action: 'update',
                type: entity.type,
                id: entity.id,
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
            "data": payload.data ? payload.data : {},
            "force": false,
        };
    }

    /**
     * _update
     * @param {*} payload 
     */
    static _update(payload) {
        if (!game.user.isGM) return;
        
        let entity = null;
        if (game.items.get(payload.id)) entity = game.items.get(payload.id);
        if (game.actors.get(payload.id)) entity = game.actors.get(payload.id);
        if (!entity) return;

        entity.update(payload.data);
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