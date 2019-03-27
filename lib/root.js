/*global window,self,global*/
define([],function (){
    function getRoot() {
        if (typeof window!=="undefined") return window;
        if (typeof self!=="undefined") return self;
        if (typeof global!=="undefined") return global;
    }
    return getRoot();
});
