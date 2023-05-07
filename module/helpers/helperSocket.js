/**
 * Helpers for Socket
 */

import { mainUtils } from "../mainUtils.js";
import { helperSprites } from "./helperSprites.js";

export class helperSocket {

    static socketAlias = "system.conventum"

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
     * onReceived
     */
    static onReceived() {
        game.socket.on(this.socketAlias, (payload) => {
            console.log("--- "+game.system.title+" Socket ---");
            switch (payload.action) {
                case "hit":
                    if (payload.targetUsers.find(e => e === game.userId))
                        helperSprites.blood(payload.properties.damage);
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

}