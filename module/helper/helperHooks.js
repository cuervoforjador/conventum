import _hooksSetup from '../hooks/setup.js'
import hooksFolders from '../hooks/folders.js'
import hooksRender from '../hooks/render.js'
import hooksActor from '../hooks/actor.js'
import hooksItem from '../hooks/items.js'
import hooksCombat from '../hooks/combat.js'
import hooksMessages from '../hooks/messages.js'
import hooksScenes from '../hooks/scenes.js'
import helperMessages from './helperMessages.js'
import helperSceneControls from './helperSceneControls.js'
import helperCanvas from './helperCanvas.js'


export default class helperHooks {

    /**
     * initHooks
     */
    static initHooks() {

        Hooks.once('setup', _hooksSetup)

        Hooks.on("getSceneControlButtons", helperSceneControls.getSceneControlButtons.bind(this))
        
        Hooks.on("canvasReady", helperCanvas.canvasReady.bind(this))
        Hooks.on("canvasPan", helperCanvas.canvasPan.bind(this))
        Hooks.on("collapseSidebar", helperCanvas.collapseSidebar.bind(this))

        Hooks.on("preCreateScene", hooksScenes.preCreateScene.bind(this))

        Hooks.on("renderChatMessageHTML", helperMessages.activateListeners.bind(this))
        
        Hooks.on('activateCompendiumDirectory', hooksFolders.activateCompendiumDirectory.bind(this))
        Hooks.on('renderCompendium', hooksFolders.renderCompendium.bind(this))
        Hooks.on('renderApplicationV2', hooksRender.renderApplicationV2.bind(this))

        Hooks.on("preCreateActor", hooksActor.preCreateActor.bind(this))
        Hooks.on("createActor", hooksActor.createActor.bind(this))
        Hooks.on("createItem", hooksItem.createItem.bind(this))

        Hooks.on("activateCombatTracker", hooksCombat.activateCombatTracker.bind(this))
        Hooks.on("deactivateCombatTracker", hooksCombat.deactivateCombatTracker.bind(this))
        Hooks.on("renderCombatTracker", hooksCombat.renderCombatTracker.bind(this))
        Hooks.on("createCombat", hooksCombat.createCombat.bind(this))
        Hooks.on("updateCombat", hooksCombat.updateCombat.bind(this))
        Hooks.on("deleteCombat", hooksCombat.deleteCombat.bind(this))
        Hooks.on("createCombatant", hooksCombat.createCombatant.bind(this))
        Hooks.on("updateCombatant", hooksCombat.updateCombatant.bind(this))
        Hooks.on("deleteCombatant", hooksCombat.deleteCombatant.bind(this))


    }

}