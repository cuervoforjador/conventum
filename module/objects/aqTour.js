/**
 * @extends {Tour}
 */
export class aqTour extends Tour {

    /**
     * start
     */
    async start() {
        await super.start();
        //aside.tour
    }

    /**
     * _renderStep
     */
    async _renderStep() {
        await super._renderStep();

        let nLeft = (window.innerWidth - $(this.targetElement).outerWidth())/2;
        let nTop = (window.innerHeight - $(this.targetElement).outerHeight())/2;

        [this.targetElement, this.fadeElement, this.overlayElement].map(e => {
            $(e).addClass('_aqTour');
            $(e).css({position: 'absolute',
                      left: nLeft,
                      top: nTop});
        });
    }

}