import _hooksSetup from '../hooks/setup.js'
import hooksFolders from '../hooks/folders.js'
import hooksRender from '../hooks/render.js'
import hooksActor from '../hooks/actor.js'
import hooksItem from '../hooks/items.js'
import hooksMessages from '../hooks/messages.js'
import helperMessages from './helperMessages.js'

export default class helperHooks {

    /**
     * initHooks
     */
    static initHooks() {

        Hooks.once('setup', _hooksSetup)

        Hooks.on("renderChatMessageHTML", helperMessages.activateListeners.bind(this))
        
        Hooks.on('activateCompendiumDirectory', hooksFolders.activateCompendiumDirectory.bind(this))
        Hooks.on('renderCompendium', hooksFolders.renderCompendium.bind(this))
        Hooks.on('renderApplicationV2', hooksRender.renderApplicationV2.bind(this))

        Hooks.on("createActor", hooksActor.createActor.bind(this))
        Hooks.on("createItem", hooksItem.createItem.bind(this))
    }

}