import { SYSTEM_ID } from "../config/uiConstants.js"
import helperContext from "../helper/helperContext.js"
import helperSettings from "../helper/helperSettings.js";
import helperTools from "../helper/helperTools.js"
import helperDialog from "../helper/helperDialog.js"
import helperSocket from "../helper/helperSocket.js";

export default class bookImages {

    _imageBackground = "systems/aquelarre/assets/ui/systemBackground.png"
    _imageTile = null
    _region = null

    /**
     * constructor
     */
    constructor(formula="", data={}, options={}) {
        const scene = canvas.scene
        this._imageTile = scene.tiles.find(e => e.flags?.aquelarre.bookID === 'initial')        
    }

    /**
     * init
     */
    async init() {
        const scene = canvas.scene  
        const dims = canvas.scene.dimensions     

        if (!this._imageTile) {            
            await scene.createEmbeddedDocuments("Tile", [{
                texture: {
                    src: this._imageBackground,
                    fit: "contain"
                },
                flags: {
                    [SYSTEM_ID]: {
                        "bookID": "initial"
                    }                
                },
                x: scene.width / 2 + scene.width / 4,
                y: scene.height / 2 + scene.height / 4,
                width: scene.width,
                height: scene.height,
                elevation: 0,
                sort: 0,
                hidden: false,
                locked: true,
                alpha: 1.0,
                rotation: 0
            }])
            this._imageTile = scene.tiles.find(e => e.flags?.aquelarre.bookID === 'initial')

            await canvas.scene.update({  "grid.alpha": "0" })
            if (canvas.scene.levels.get('defaultLevel0000')) {
                let oLevel = canvas.scene.levels.get('defaultLevel0000')
                await oLevel.update({"background.color": "#000000"})
            }
        } 
    }

    /**
     * changeImage
     */
    async changeImage() {
        const oFilePicker = new FilePicker({
            type: "image",
            current: "",
            callback: (path) => {
                this._imageTile.update({"texture.src": path})
            }
        }).render(true);
    }

    /**
     * close
     */
    async close() {
        if (!this._imageTile) return
        await this._imageTile.delete()
    }

    /**
     * adjust
     */
    adjust() {
      helperSocket.requestBookImageAdjust()        
    }

    /**
     * fog
     */
    async fog(toggle) {
        
        const _control = ui.controls.activeControl;
        const _tool = ui.controls.activeTool;

        //console.log(Object.keys(CONFIG.weatherEffects));
        if (toggle) await canvas.scene.update({ weather: "fog" })
               else await canvas.scene.update({ weather: "" })
        ui.controls.initialize({ control: _control })
    }

    /**
     * applyAdjust
     */
    static async applyAdjust() {
        const scene = canvas.scene
        const oTile = scene.tiles.find(e => e.flags?.aquelarre.bookID === 'initial')
        if (!oTile) return

        const scaleX = window.innerWidth / oTile.width
        const scaleY = window.innerHeight / oTile.height
        const zoom = Math.min(scaleX, scaleY) * 0.95

        await canvas.animatePan({ 
            x: oTile.x,
            y: oTile.y,
            scale: Math.max(zoom, 0.1),
            duration: 1000
        })        
    }

}