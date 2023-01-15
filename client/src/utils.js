export function hideElement(elem) {
    elem.classList.remove("d-flex")
    elem.classList.add("d-none");
}

export function unhideElement(elem) {
    elem.classList.add("d-flex");
    elem.classList.remove("d-none")
}

export function getCookie() {
    var cookie = document.cookie;
    var res = {};
    cookie.split(/\s*;\s*/).forEach(function(pair) {
        pair = pair.split(/\s*=\s*/);
        res[pair[0]] = pair.splice(1).join('=');
    });
    // console.log(res);
    return res;
}

export function setCookie(key, value, isDelete) {
    var cookieString = key + "=" + value
    if(isDelete) {
        cookieString += "; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    }
    cookieString += "; path=/";
    console.log(cookieString)
    document.cookie=cookieString;
}

export function enforceMinMax(elem) {
    if (elem.value != "") {
        if (parseInt(elem.value) < parseInt(elem.min)) {
            elem.value = elem.min;
        }
        if (parseInt(elem.value) > parseInt(elem.max)) {
            elem.value = elem.max;
        }
    }
}