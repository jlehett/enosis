
export default class Middleware {
    constructor(key, fn) {
        this.key = key;
        this.fn = fn;
    }

    /******************
     * PUBLIC METHODS *
     ******************/

    fetch(user) {
        return this.fn(user);
    }

    /*******************
     * PRIVATE METHODS *
     *******************/
}