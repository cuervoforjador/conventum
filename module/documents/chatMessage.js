export default class newChatMessage extends ChatMessage {

    get isLore() { return this.flags.isLore?.value === true }
    get rules() { return this.flags.rules?.value }
    get lore() { return this.flags.lore?.value }

    async renderHTML({ canDelete, canClose=false, ...rest }={}) {
        const html = await super.renderHTML({canDelete, canClose, ...rest})
        let classes = ['_extend', '_'+this.rules]
        if (this.flags.class?.value) classes.push(this.flags.class?.value)
        if (this.isLore) classes.push('_lore')
        return $(html).addClass(classes)[0]
    }
}