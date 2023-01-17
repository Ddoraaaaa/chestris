import * as utils from "./utils";
import * as constants from "./constants";

// export function updateKeys(playerControls) {
//     const savedControls = utils.getCookie();
//     console.log(savedControls, 69);
//     for (const [x, y] of Object.entries(savedControls)) {
//         switch(x) {
//             case "das":
//             case "arr":
//             case "grav":
//                 playerControls.handling[x] = Number(y);
//                 // console.log(x, "is handling");
//                 break;
//             default:
//                 playerControls.controls[x] = y;
//                 // console.log(x, "is not handling");
//         }
//     }
// }

export function rgKeyDown(elem, event) {
    if(event.keyCode == "Tab") {
        elem.value="";
        return;
    }
    elem.value=event.code;
    elem.readOnly=true;
}

export function rgKeyUp(elem) {
    elem.readOnly=false;
}

export function applyHandling(gameHandling) {
    var cookieObj = utils.getCookie();
    for(let key of constants.CTRL_KEYS.handling) {
        if(cookieObj[key]) {
            console.log(key, "vai cac", cookieObj[key], gameHandling);
            gameHandling.handling[key] = Number(cookieObj[key]);
            document.getElementsByName(key)[0].value = cookieObj[key];
        }
        else {
            gameHandling.handling[key] = constants.DEFAULT_CONTROLS.handling[key];
            document.getElementsByName(key)[0].value = "";
        }
    }
    for(let key of constants.CTRL_KEYS.controls) {
        if(cookieObj[key]) {
            gameHandling.controls[key] = cookieObj[key];
            document.getElementsByName(key)[0].value = cookieObj[key];
        }
        else {
            gameHandling.controls[key] = constants.DEFAULT_CONTROLS.controls[key];
            document.getElementsByName(key)[0].value = "";
        }
    }
}

export function mapKeys(frm, gameHandling) {
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
    applyHandling(gameHandling);
}

export function resetKeys(gameHandling) {
    for(var key of constants.CTRL_KEYS.handling) {
        utils.setCookie(key, 1234, 1);
    }
    for(var key of constants.CTRL_KEYS.controls) {
        utils.setCookie(key, 1234, 1);
    }
    applyHandling(gameHandling);
}