/**
 * Helpers for Messages in Sidebar
 */

import { mainUtils } from "../mainUtils.js";

export class helperMessages {

    /**
     * chatMessage
     * @param {string} sContent 
     * @param {object} actor 
     * @param {boolean} bSimpleText 
     * @param {string} sFrame 
     * @param {string} sHeight 
     */
    static chatMessage(sContent, actor, bSimpleText, sFrame, sHeight) {
        sFrame = (sFrame) ? sFrame : '';
        sHeight = (sHeight) ? sHeight : '154px';

        if (bSimpleText) 
            sContent = this.simpleContent(actor, sContent);
        
        ChatMessage.create({content: this.extendContent(actor, sContent, sHeight, sFrame) });
    }

    static simpleContent(actor, sContent) {
        return  '<div class="_messageFrame">'+
                    '<div class="_messageImg"><img src="'+actor.img+'"/></div>'+
                    '<div class="_vertical">'+
                            '<div class="_title">'+actor.name+'</div>'+
                            '<div class="_content">'+sContent+'</div>'+
                    '</div>'+
                '</div>';
    }

    static extendContent(actor, sContent, sHeight, sFrame) {
        return  '<div class="_chatBox" style="height: '+sHeight+';">'+
                    '<div class="_chatPaper"></div>'+
                    '<div class="_chatShadow"></div>'+
                    '<div class="_chatFrame"'+
                        ' style="background: url(/systems/aquelarre/image/frame/'+
                                actor.system.control.frame.toString() +
                                '/chatFrame'+sFrame+'.png)"></div>'+
                    '<div class="_chatContent">'+sContent+'</div>'+                        
                '</div>';
    }    

}