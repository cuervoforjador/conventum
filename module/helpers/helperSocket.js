/**
 * Helpers for Socket
 */

import { mainUtils } from "../mainUtils.js";
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
                
                case "refreshSheets":
                    helperSocket._doRefreshSheets();
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
     * refreshSheets
     */
    static refreshSheets() {
        helperSocket.send({
            action: 'refreshSheets'
        });
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
            "force": false,
        };
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

}