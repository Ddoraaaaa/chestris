import * as utils from "./utils";
import * as constants from "./constants";

export function updateKeys(playerControls) {
    const savedControls = utils.getCookie();
    console.log(savedControls, 69);
    for (const [x, y] of Object.entries(savedControls)) {
        switch(x) {
            case "das":
            case "arr":
            case "grav":
                playerControls.handling[x] = Number(y);
                // console.log(x, "is handling");
                break;
            default:
                playerControls.controls[x] = Number(y);
                // console.log(x, "is not handling");
        }
    }
}

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
    // console.log(frm);
    const formData = new FormData(frm);
    const formDataObj = Object.fromEntries(formData.entries());

    // console.log(formData.entries());
    // console.log(formDataObj);

    for(var key in formDataObj) {
        if(formDataObj[key]) {
            utils.setCookie(key, formDataObj[key], 0)
        }
    }
}

export function resetKeys() {
    for(var key of constants.CTRL_KEYS) {
        utils.setCookie(key, 1234, 1);
    }
}