import { SYSTEM_ID } from "../config/uiConstants.js"
import helperContext from "./helperContext.js"
import helperSettings from "./helperSettings.js";
import helperTools from "./helperTools.js"
import helperDialog from "./helperDialog.js"
import tutTiendas from "../tutorial/tutTiendas.js"
import bookImages from "../bookImages/bookImages.js";

export default class helperSceneControls {

    /**
     * getSceneControlButtons
     * @param {*} controls 
     */
    static getSceneControlButtons(controls) {
        //return;

        controls.aquelarre = {
            name: "aquelarre",
            title: game.i18n.localize('common.aquelarre'),
            icon: "fas fa-ram",
            layer: "controls",
            visible: game.user.isGM,
            tools: {
                bookImages: {
                    button: true,
                    icon: "fas fa-image",
                    name: "bookImages",
                    order: 1,
                    title: game.i18n.localize("common.bookImages"),
                    onClick: helperSceneControls._bookImages                    
                },
                bookImagesFile: {
                    button: true,
                    icon: "fas fa-file",
                    name: "bookImagesFile",
                    order: 1,
                    title: game.i18n.localize("common.bookImagesFile"),
                    onClick: helperSceneControls._bookImagesFile                    
                },                
                bookImagesAdjust: {
                    button: true,
                    icon: "fas fa-panorama",
                    name: "bookImagesAdjust",
                    order: 2,
                    title: game.i18n.localize("common.bookImagesAdjust"),
                    onClick: helperSceneControls._bookImagesAdjust                    
                },
                bookImagesFog: {
                    toggle: true,
                    active: false,
                    icon: "fas fa-cloud-fog",
                    name: "bookImagesFog",
                    order: 3,
                    title: game.i18n.localize("common.bookImagesFog"),
                    onClick: helperSceneControls._bookImagesFog                   
                },                                
                bookImagesClose: {
                    button: true,
                    icon: "fas fa-image-slash",
                    name: "bookImagesClose",
                    order: 4,
                    title: game.i18n.localize("common.bookImagesClose"),
                    onClick: helperSceneControls._bookImagesClose                    
                },                
                shopExample: {
                    button: true,
                    icon: "fas fa-shop",
                    name: "shopExample",
                    order: 5,
                    title: game.i18n.localize("common.tutorialComercios"),
                    onClick: helperSceneControls._tutTiendas
                }
                /*
                maintTool: {
                    button: true,
                    icon: "fas fa-tools",
                    name: "maintTool",
                    order: 1,
                    title: "Actualizar Hechizos",
                    onClick: helperSceneControls._maintTool
                }
                */
            },
            //activeTool: "maintTool"
        };        
    }

    /**
     * _maintTool
     */
    static async _maintTool() {
        const pack = game.packs.get('aquelarre.aq4_pack')
        const mDocs = (await pack.getDocuments()).filter(e => e.type === 'rasgo')
        mDocs.map(doc => {
            if (!doc.system.verguenza) return;
            //doc.update({"system.fuente": sFuente})
            const sImg = "systems/aquelarre/assets/img/aq/verguenza.png" //doc.img.replace('.jpg', '.png')
            doc.update({"img": sImg})
        })

    }

    /**
     * _tutTiendas
     */
    static async _tutTiendas() {
        tutTiendas.display()   
    }

    /**
     * _bookImages
     */
    static async _bookImages() {
        game.bookImages = new bookImages()
        await game.bookImages.init()
    }

    /**
     * _bookImagesFile
     */
    static async _bookImagesFile() {
        if (!game.bookImages) {
            game.bookImages = new bookImages()
            await game.bookImages.init()
        }
        game.bookImages.changeImage()        
    }

    /**
     * _bookImagesAdjust
     */
    static async _bookImagesAdjust() {
        if (!game.bookImages) {
            game.bookImages = new bookImages()
            await game.bookImages.init()
        }
        game.bookImages.adjust()
    }

    /**
     * _bookImagesFog
     */
    static async _bookImagesFog(isToggled) {
        if (!game.bookImages) {
            game.bookImages = new bookImages()
            await game.bookImages.init()
        }
        await game.bookImages.fog(isToggled)
    }

    /**
     * _bookImagesClose
     */
    static async _bookImagesClose() {
        if (!game.bookImages) {
            game.bookImages = new bookImages()
            await game.bookImages.init()
        }        
        await game.bookImages.close()
    }
}