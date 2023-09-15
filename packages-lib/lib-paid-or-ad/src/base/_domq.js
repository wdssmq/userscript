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
    attr,
} from "domq.js/src/domq.modular";

// Static methods
// https://github.com/nzbin/domq#static-methods
const methods = {
    // isArray,
};

// Instance methods
// https://github.com/nzbin/domq#instance-methods
const fnMethods = {
    on,
    addClass,
    append,
    find,
    hasClass,
    text,
    removeClass,
    attr,
};

D.extend(methods);
D.fn.extend(fnMethods);

window.D = D;

export default D;
