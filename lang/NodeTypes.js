define(function (require,exports,module) {//----
class NodeType {
}
class Lazy extends NodeType {
    constructor(reso) {
        super();
        this.resolver=reso;
    }
}
class Token extends NodeType {

}
class Struct extends NodeType {
    constructor(n) {
        super();
        this.name=n;
        this.members=[];
    }
    addMember(name,type) {
        this.members.push({name,type});
    }
}
class Array extends NodeType {
    constructor(e) {
        super();
        this.element=e;
    }
}
class Opt extends NodeType {
    constructor(e) {
        super();
        this.element=e;
    }
}
class Or extends NodeType{
    constructor(e) {
        super();
        this.candidates=[];
    }
    addCandidate(t){
        this.candidates.push(t);
    }
}
module.exports={NodeType,Struct,Lazy,Array,Opt,Or,Token};
});//--- of define
