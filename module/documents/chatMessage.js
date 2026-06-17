export default class newChatMessage extends ChatMessage {

    get isLore() { return this.flags.isLore?.value === true }
    get rules() { return this.flags.rules?.value }
    get lore() { return this.flags.lore?.value }

    async renderHTML({ canDelete, canClose=false, ...rest }={}) {
        const html = await super.renderHTML({canDelete, canClose, ...rest})

        if (this.isLore) return $(html).addClass(['_extend', '_lore', '_'+this.rules])[0]
                    else return $(html).addClass(['_extend'])[0]
    }
}