/**
 * Helpers for Sprites
 */

import { mainUtils } from "../mainUtils.js";

export class helperSprites {

    /**
     * sightRefresh
     * @param {*} layer 
     */
    static sightRefresh(layer) {

        //Tokens
        let TokenLayer = canvas.layers.find(e => e.options.name === 'tokens');
        TokenLayer.children[0].children.forEach(token => {
            let textToken = token.children.find(e => e.text);
            if (textToken) {
                textToken.style.fontFamily = "Almendra";
                textToken.style._fill = "#FFFFFFCC";
                textToken.style.stroke = "#333333";
                textToken.updateText();
            }
        });

    }

    /**
     * stylingToken
     * @param {*} token 
     */
    static stylingToken(token) {

        if (!token) return;

        //Text
        if ((!token.hud) || (token.hud.children === undefined)) return;
        let textToken = token.hud.children.find(e => e.text);
        textToken.style.fontFamily = "Almendra";

    }

}