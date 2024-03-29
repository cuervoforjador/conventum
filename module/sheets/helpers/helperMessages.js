/**
 * Helpers for Messages in Sidebar
 */

import { mainUtils } from "../../mainUtils.js";

export class helperMessages {

    /**
     * chatMessage
     * @param {string} sContent 
     * @param {object} actor 
     * @param {boolean} bSimpleText 
     * @param {string} sFrame 
     * @param {string} sHeight 
     */
    static chatMessage(sContent, actor, bSimpleText, sFrame, sHeight, big) {
        sFrame = (sFrame) ? sFrame : actor.system.control.frame.toString();
        sHeight = (sHeight) ? sHeight : '154px';
        const chatFrame = big ? 'chatFrame2' : 'chatFrame';

        if (bSimpleText) 
            sContent = '<div class="_messageFrame">'+
                        '<div class="_messageImg"><img src="'+actor.img+'"/></div>'+
                        '<div class="_vertical">'+
                                '<div class="_title">'+actor.name+'</div>'+
                                '<div class="_content">'+sContent+'</div>'+
                        '</div>'
                    '</div>';
        const message = 
            ChatMessage.create({content: 
                        '<div class="_chatBox" style="height: '+sHeight+';">'+
                            '<div class="_chatPaper"></div>'+
                            '<div class="_chatShadow"></div>'+
                            '<div class="_chatFrame"'+
                                ' style="background: url(/systems/aquelarre/image/frame/'+
                                    sFrame + '/'+chatFrame+'.png)"></div>'+
                            '<div class="_chatContent">'+sContent+'</div>'+                        
                        '</div>' });
        
        return message;
    }

}