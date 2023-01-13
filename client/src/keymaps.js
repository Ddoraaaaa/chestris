import * as utils from "./utils";
import * as constants from "./constants";

export function rgKeyDown(elem, event) {
    if(event.keyCode == 27) {
        elem.value="";
        return;
    }
    elem.value=event.keyCode;
    elem.readOnly=true;
}

export function rgKeyUp(elem) {
    elem.readOnly=false;
}

export function applyHandling(gameHandling) {
    var cookieObj = utils.getCookie();
    for(let key of constants.CTRL_KEYS) {
        if(cookieObj[key]) {
            gameHandling[key] = Number(cookieObj[key]);
        }
    }
}

export function mapKeys(frm) {
    console.log(frm);
    const formData = new FormData(frm);
    const formDataObj = Object.fromEntries(formData.entries());

    console.log(formData.entries());
    console.log(formDataObj);

    for(var key in formDataObj) {
        if(formDataObj[key]) {
            utils.setCookie(key, formDataObj[key], 0)
        }
    }
}

export function resetKeys() {
    for(var key of CTRL_KEYS) {
        utils.setCookie(key, 1234, 1);
    }
}