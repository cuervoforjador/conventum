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

    /**
     * blood
     * @param {*} damage 
     */
    static async blood(damage) {

        const view = await canvas.scene.view();
        const texture = PIXI.Texture.from("/systems/aquelarre/image/sprites/blood.png");
        const sprite = new PIXI.AnimatedSprite([texture]);

        sprite.position.set(view._viewPosition.x, 
                            view._viewPosition.y);
        sprite.width = view.dimensions.sceneRect.x/10;
        sprite.height = view.dimensions.sceneRect.y/10;
        sprite.anchor.set(0.5);

        const blurFilter = new PIXI.filters.BlurFilter();
        sprite.filters = [blurFilter];
        canvas.app.stage.addChild(sprite);

        sprite.movProperties = movSpriteProperties(0.2, 4, true, true, true);          
        sprite.assignProperties = spriteAssignProperties;
        sprite.calculateProperties = spriteCalculateProperties;

        canvas.app.ticker.add(function() {
            sprite.assignProperties();
            sprite.calculateProperties();
            if (sprite.movProperties.clock >= sprite.movProperties.stopClock) {
               canvas.stage.removeChild(sprite);
               sprite.destroy();
               this.destroy();
            }            
        });

        if (damage) {
            const text = new PIXI.Text(damage, {
                            dropShadow: true,
                            dropShadowAlpha: 0.4,
                            dropShadowAngle: 1.2,
                            dropShadowBlur: 10,
                            dropShadowDistance: 14,
                            fill: ["#9d2f2f", "#130101"],
                            fontFamily: "Almendra",
                            fontSize: 100,
                            fontWeight: "bold",
                            lineJoin: "bevel",
                            padding: "",
                            stroke: "#b98d8d",
                            strokeThickness: 10,
                            align : 'center'});                                                    
            text.position.set(view._viewPosition.x - 200, 
                              view._viewPosition.y - 200);
            canvas.app.stage.addChild(text); 

            text.movProperties = movSpriteProperties(0.2, 4, false, true, false);          
            text.assignProperties = spriteAssignProperties;
            text.calculateProperties = spriteCalculateProperties;  
            canvas.app.ticker.add(function() {
                text.assignProperties();
                text.calculateProperties();
                if (text.movProperties.clock >= text.movProperties.stopClock) {
                   canvas.stage.removeChild(text);
                   text.destroy();
                   this.destroy();
                }            
            });                                                                           
        }        
    }

}

/** movSpriteProperties */
function movSpriteProperties(speed, stopClock, rotate, scale, move) {
    return { clock: 0,
             stopClock: stopClock,
             speed: speed,
             rotation: 0,
             rotate: rotate,
             scale: scale,
             move: move,
             blur: 0,
             alpha: 1 }
}

/** spriteAssignProperties */
function spriteAssignProperties() {
    this.rotation = this.movProperties.rotation;
    if (this.filters) {this.filters[0].blur = this.movProperties.blur;}
    this.alpha = this.movProperties.alpha 
    if (!this.movProperties.initialWidth) this.movProperties.initialWidth = this.width;
    if (!this.movProperties.initialHeight) this.movProperties.initialHeight = this.height;
}

/** spriteCalculateProperties */
function spriteCalculateProperties() {
    this.movProperties.clock += this.movProperties.speed;            
    
    this.movProperties.rotation = this.movProperties.rotate ? this.movProperties.clock : 0;

    if (this.filters) {this.filters[0].blur = 10 * this.movProperties.clock;}
    this.movProperties.alpha = (this.movProperties.stopClock - this.movProperties.clock) / 
                                this.movProperties.stopClock;
    this.width += this.movProperties.initialWidth + (this.movProperties.clock *10);
    this.height += this.movProperties.initialHeight + (this.movProperties.clock *10);
    if (this.movProperties.move) {
        this.position.set(
            this.position.x + (Math.sin(this.movProperties.clock*10) * 10),
            this.position.y - (Math.sin(this.movProperties.clock*10) * 10)
        );
    } else {
        this.position.set(
            this.position.x - (this.movProperties.clock * 50),
            this.position.y - (this.movProperties.clock * 50)
        );        
    }
}