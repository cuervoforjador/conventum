
let aqTours = class mainAqTour {};
if (typeof Tour !== 'undefined') {

    aqTours = class aqTours extends Tour {

        async _preStep () {
            await super._preStep();
            //...
        }

        async waitForElement (selector) {
            return new Promise((resolve, reject) => {
                const element = document.querySelector(selector)
                if (element) {
                resolve()
                return
                }
        
                const observer = new MutationObserver((mutations, observer) => {
                document.querySelectorAll(selector).forEach((el) => {
                    resolve()
                    observer.disconnect()
                })
                })
        
                observer.observe(document.body, {
                childList: true,
                subtree: true
                })
            })
        }
        
        async _postStep () {
            await super._postStep()
            if (this.stepIndex < 0 || !this.hasNext) {
              return;
            }
      
            if (!this.currentStep.action) {
              return;
            }
      
            if (this.isResetting) {
              this.isResetting = false;
              return;
            }
      
            switch (this.currentStep.action) {
              case 'click':
                document.querySelector(this.currentStep.selector).click();
                break;
            }
        }        

    }
}
export { aqTours }