import { SYSTEM_ID } from "../module/config/uiConstants.js"

export default class helperPxTools {

    static parseUnit(str, out) {
        if (!out)
            out = [ 0, '' ]

        str = String(str)
        var num = parseFloat(str, 10)
        out[0] = num
        out[1] = str.match(/[\d.\-\+]*\s*(.*)/)[1] || ''
        return out
    }

    static parseUnit(str, out) {
        if (!out)
            out = [ 0, '' ]

        str = String(str)
        var num = parseFloat(str, 10)
        out[0] = num
        out[1] = str.match(/[\d.\-\+]*\s*(.*)/)[1] || ''
        return out
    }

    static getPropertyInPX(element, prop) {
        var parts = this.parseUnit(getComputedStyle(element).getPropertyValue(prop))
        return parts[0] * this.toPX(parts[1], element)
    }

    static getSizeBrutal(unit, element) {
        var testDIV = document.createElement('div')
        testDIV.style['height'] = '128' + unit
        element.appendChild(testDIV)
        var size = this.getPropertyInPX(testDIV, 'height') / 128
        element.removeChild(testDIV)
        return size
    }    

    static toPX(str, element) {
        if (!str && str !== 0) return null

        element = element || document.body
        str = (str + '' || 'px').trim().toLowerCase()
        if(element === window || element === document) {
            element = document.body
        }

        switch(str) {
            case '%':  //Ambiguous, not sure if we should use width or height
            return element.clientHeight / 100.0
            case 'ch':
            case 'ex':
            return this.getSizeBrutal(str, element)
            case 'em':
            return this.getPropertyInPX(element, 'font-size')
            case 'rem':
            return this.getPropertyInPX(document.body, 'font-size')
            case 'vw':
            return window.innerWidth/100
            case 'vh':
            return window.innerHeight/100
            case 'vmin':
            return Math.min(window.innerWidth, window.innerHeight) / 100
            case 'vmax':
            return Math.max(window.innerWidth, window.innerHeight) / 100
            case 'in':
            return PIXELS_PER_INCH
            case 'cm':
            return PIXELS_PER_INCH / 2.54
            case 'mm':
            return PIXELS_PER_INCH / 25.4
            case 'pt':
            return PIXELS_PER_INCH / 72
            case 'pc':
            return PIXELS_PER_INCH / 6
            case 'px':
            return 1
        }

        // detect number of units
        var parts = this.parseUnit(str)
        if (!isNaN(parts[0])) {
            if (parts[1]) {
            var px = this.toPX(parts[1], element)
            return typeof px === 'number' ? parts[0] * px : null
            }
            else {
            return parts[0]
            }
        }

        return null
    }    

}