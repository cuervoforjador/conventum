import { SYSTEM_ID } from "../config/uiConstants.js";

export default class newBook extends foundry.applications.api.DialogV2 {

    get actor() { return this.options.actor }

    /**
     * close
     */
    async close(options={}) {
        const sId = this.element.id
        const backDrop = $(document).find('#backdrop_'+this.element.id)
        if (backDrop) backDrop.remove()
        return super.close()
    }
}