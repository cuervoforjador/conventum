import { aqActions } from "./aqActions.js";
import { aqCombat } from "./aqCombat.js";
import { aqContext } from "./aqContext.js";
import { helperSocket } from "../helpers/helperSocket.js";
import { helperSheetHuman } from "../sheets/helpers/helperSheetHuman.js";
import { helperSheetArmor } from "../sheets/helpers/helperSheetArmor.js";
import { helperActions } from "../sheets/helpers/helperActions.js";
import { helperMessages } from "../sheets/helpers/helperMessages.js";
import { helperSprites } from "../helpers/helperSprites.js";

export class aqCombatBar {

    canvas              =null
    area                ={}
    app                 =null

    encounter           =null

    /**
     * constructor
     */
    constructor() {
        Hooks.call("aquelarreCombatBar", this);
        this._buildCanvas();
        this._initListeners();
        this._draw();
    }

    /**
     * _buildCanvas
     */
    _buildCanvas() {

        const sidebarWidth = $('#sidebar').width();
        const sidebarOffset = sidebarWidth > window.innerWidth / 2 ? 0 : sidebarWidth;        
        this.area = {
            left: 0,
            top: 0,
            width: window.innerWidth - sidebarOffset,
            height: window.innerHeight - 1
        };

        this.canvas = $(`<div id="aqCombatBar-box-canvas" 
                              style="position: absolute; 
                                     left: ${this.area.left}px; 
                                     top: ${this.area.top}px; 
                              pointer-events: none;"></div>`);

        this.canvas.css("z-index", 1000);
        this.canvas.appendTo($('body'));          
        this.canvas.width(this.area.width + 'px');
        this.canvas.height(this.area.height + 'px');                            
    }

    /**
     * _initListeners
     */
    _initListeners() {

        $(window).resize(() => {
            this._rtime = new Date();
            if (this._timeout === false) {
                this._timeout = true;
                setTimeout(this._resizeEnd.bind(this), 1000);
            }
        });

        $(document).on("click", ".aabbccdd", (event) => {
            event.preventDefault();
            //...
        });

    }

    /**
     * _draw
     */
    _draw() {

        this.encounter = aqActions.getCurrentEncounter();
        this.nNodes = this.encounter.system.steps.length;

        if (this.app) {
            this.app.destroy();
        }

        this.app = new PIXI.Application({ backgroundAlpha: 0, 
                                          resizeTo: this.canvas[0] });
        this.canvas[0].appendChild(this.app.view);

        //Steel bar
        let tx1 = PIXI.Texture.from("/systems/conventum/image/texture/steelbar.png");
        let sprBar = new PIXI.TilingSprite(tx1, (this.nNodes*60)+115, 40);
        sprBar.y = 40;
        this.app.stage.addChild(sprBar);          

        //Banners
        for (let index=0; index<this.encounter.system.steps.length; index++) {
            const step = this.encounter.system.steps[index];

            let tx2 = PIXI.Texture.from("/systems/conventum/image/texture/pendon0.png");
            const banner = new PIXI.SimplePlane(tx2, 2, 2);
            banner.x = 120 + (index*60);
            banner.y = 60;    
            this.app.stage.addChild(banner);             

            const buffer = banner.geometry.getBuffer('aVertexPosition');
            let timer = 0;        
            this.app.ticker.add(() => {
                for (let i = 0; i < buffer.data.length; i++) {
                    let incr = Math.sin((timer / 10) + i) * 0.1;
                    buffer.data[i] += incr;
                }
                buffer.update();
                timer = timer + 1;
            });

        }



    }

    /**
     * _resizeEnd
     */
    _resizeEnd() {
        if (new Date() - this._rtime < 1000) {
            setTimeout(this._resizeEnd.bind(this), 1000);
        } else {
            this._timeout = false;
            this.resizeAndRebuild();
        }
    }

    /**
     * _compareSteps
     */
    _compareSteps(a, b) {
        return ((a.action === b.action) &&
                (a.actor === b.actor) &&
                (a.consumed === b.consumed) &&
                (a.isToken === b.isToken) &&
                (a.tokenId === b.tokenId) &&
                (a.uniqeId === b.uniqeId));
    }

    /**
     * resizeAndRebuild
     */
    resizeAndRebuild() {
        this.canvas[0].remove();
        this._buildCanvas();
        this.rebuild();
    }

    /**
     * rebuild
     */
    rebuild() {
        this._encounter = aqActions.getCurrentEncounter();
    }

    /**
     * update
     */
    update() {

        const currentEncounter = aqActions.getCurrentEncounter();
        if (currentEncounter.id !== this._encounter.id) 
            this.rebuild();
        else {
            //step by step
            for (var i=0; i<currentEncounter.system.steps.length; i++) {
                const step = currentEncounter.system.steps[i];
                const stepOLD = (i < this._encounter.length) ? this._encounter[i] : null;
                if (!this._compareSteps(step, stepOLD)) {

                }
            }
        }
    }



}