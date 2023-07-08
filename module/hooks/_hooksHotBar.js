/**
 * ACTOR
 */

import { mainUtils } from "../mainUtils.js";
import { mainBackend } from "../sheets/backend/mainBackend.js";

export class HookHotBar {

    /**
     * custoHotBar
     */
    static custoHotBar(element, html, options) {
        //CONFIG.custo.myFrame;
        $(html).find("li.macro").each(function(i, e) {
            $(e).css('background-image', 'url(' + CONFIG.custo.myFrame + ')');
            $(e).addClass('_aqMacro');
        });
    }



}