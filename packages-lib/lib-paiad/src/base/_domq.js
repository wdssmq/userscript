import {
    D,
    on,
    // isArray,
    addClass,
    append,
    find,
    hasClass,
    text,
    removeClass,
    removeAttr,
    attr,
    html,
    empty,
} from "domq.js/src/domq.modular";

// Static methods
// https://github.com/nzbin/domq#static-methods
const methods = {
    // isArray,
};

// Instance methods
// https://github.com/nzbin/domq#instance-methods
const fnMethods = {
    addClass,
    append,
    attr,
    empty,
    find,
    hasClass,
    html,
    on,
    removeAttr,
    removeClass,
    text,
};

D.extend(methods);
D.fn.extend(fnMethods);

window.D = D;

export default D;
