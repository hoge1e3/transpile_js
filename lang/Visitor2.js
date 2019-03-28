define(function (require,exports,module) {
class Visitor {
    constructor(){
        this.path=[];
    }
    visit(node) {
        const $=this;
		try {
			$.path.push(node);
			if ($.debug) console.log("visit ",node.type, node.pos);
			var v=(node ? $[$.methodName(node.type)] :null);
			if (v) return v.call($, node);
			return $.visitDefault.call($,node);
		} finally {
			$.path.pop();
		}
    }
    visitDefault(){}
    methodName(type) {
        return "visit"+this.capitalize(type);
    }
    capitalize(str) {
        const head=str[0];
        const tail=str.substring(1);
        return head.toUpperCase()+tail;
    }
}
module.exports=Visitor;
});
