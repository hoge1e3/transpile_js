define(function (require,exports,module) {//----
const P=require("lang/Parser");
const assert=require("lib/assert");
const EP=require("lang/ExpressionParser");
const NodeTypes=require("lang/NodeTypes");
class Grammar {
    constructor(options) {
        options=options||{};
        this.defs={};
        this.nodeTypes={};
        if (options.space) this.space=this.toParser(options.space);
        if (options.tokenizer && options.tokenizer.tokenTypes) {
            for (const tt of options.tokenizer.tokenTypes) {
                const tk=P.TokensParser.token;
                this.defs[tt]=tk(tt);
                this.defs[tt].nodeType=new NodeTypes.Token();
                this.defs[tt].nodeType.name=tt;
            }
        }
    }
    def(exprs) {
        if (exprs.$space) {
            this.space=this.toParser(exprs.$space);
        }
        const proc=name=>{
            if (name==="$space") return;
            const p=this.toParser(exprs[name]);
            const pr=p.ret(r=>{
                if (r && typeof r==="object" && !r.type) r.type=name;
                return r;
            });
            pr.nodeType=p.nodeType;
            if (pr.nodeType) pr.nodeType.name=name;
            if (p.names) pr.names=p.names;
            this.defs[name]=pr;
        };
        for (let k in exprs) proc(k);
    }
    expr(defs) {
        const elem=defs.element;
        const ops=defs.operators;
        const e=EP();
        e.element(this.toParser(elem));
        var prio=0;
        for (let op of ops ){
            const rtype=op.shift();
            op=op.map(this.toParser.bind(this));
            let [typeName,opType]=rtype.split(":");
            if (!opType) { opType=typeName; typeName=null;}
            switch (opType) {
                case "prefix":
                e.prefix(prio,...op);
                if (typeName) e.prioToNodeType(prio,typeName);
                break;
                case "postfix":
                e.postfix(prio,...op);
                if (typeName) e.prioToNodeType(prio,typeName);
                break;
                case "trifixr":
                e.trifix(prio,...op);
                if (typeName) e.prioToNodeType(prio,typeName);
                break;
                case "infixl":
                e.infixl(prio,...op);
                if (typeName) e.prioToNodeType(prio,typeName);
                break;
                case "infixr":
                e.infixr(prio,...op);
                if (typeName) e.prioToNodeType(prio,typeName);
                break;
                default:
                throw new Error(opType+": invalid operator type");
            }
            prio++;
        }
        console.log(e);
        return e.build();
    }
    get(name) {
        const res=this.defs[name];
        if (res) return res;
        const lz=P.lazy(()=>{
            const r=this.defs[name];
            if (!r) throw new Error(`Undefined grammar ${name}`);
            return r;
        });
        lz.nodeType=new NodeTypes.Lazy(()=>{
            const r=this.defs[name];
            if (!r) throw new Error(`Undefined grammar ${name}`);
            return r.nodeType;
        });
        lz.nodeType.name=name;
        return lz;
    }
    toParser(expr) {
        const tokenify=r=>{
            const r2=(this.space) ? this.space.and(r).ret((s,b)=>b) : r ;
            r2.nodeType=new NodeTypes.Token();
            return r2;
        };
        if (expr instanceof P.Parser) return expr;
        if (typeof expr==="string") {
            if (expr.match(/^'/)) {
                const r=P.StringParser.str(expr.substring(1));
                return tokenify(r);
            }
            return this.get(expr);
        } else if (expr instanceof RegExp) {
            const r=P.StringParser.reg(expr);
            return tokenify(r);
        } else if (expr instanceof Array) {
            let p;
            const struct=new NodeTypes.Struct();
            const names=[];
            for (let e of expr) {
                let name;
                if (e.constructor===Object) {
                    const tnames=[];
                    for (let k in e) {
                        tnames.push(k);
                    }
                    assert(tnames.length===1,"Invalid expr ",expr);
                    name=tnames[0];
                    assert(name!=="type", "Cannot use the name 'type' as an attribute name", expr);
                    names.push(name);
                    e=e[name];
                } else names.push(null);
                e=this.toParser(e);
                if (name) struct.addMember(name, e.nodeType);
                if (!p) p=e;
                else p=p.and(e);
            }
            p=p.ret((...results)=>{
                const r={};
                for (let i=0;i<results.length;i++) {
                    r[i]=results[i];
                    if (names[i]==="this") return results[i];
                    if (names[i]==="$extend") {
                        Object.assign(r,results[i]);
                        delete r.type;
                    } else {
                        if (names[i]) r[names[i]]=results[i];
                    }
                }
                r.subnodes=results;
                return r;
            });
            p.nodeType=struct;
            return p;
        } else if (expr) {
            const tnames=[];
            for (const k in expr) {
                tnames.push(k);
            }
            if (tnames.length===1) {
                switch (tnames[0]) {
                    case "?":
                    return this.opt(expr["?"]);
                    case "*":
                    return this.rep0(expr["*"]);
                    case "+":
                    return this.rep1(expr["+"]);
                    case "|":
                    return this.or(...expr["|"]);
                    case "-":
                    return this.except(...expr["-"]);
                }
            } else if (expr.element) {
                if (expr.operators) {
                    return this.expr(expr);
                } else if (expr.separator) {
                    if (expr["?"] || expr.opt || expr.repeat==0) {
                        return this.sep0(expr.element, expr.separator);
                    }
                    return this.sep1(expr.element, expr.separator);
                }
            }
        }
        assert.fail("Invalid expr",expr);
    }
}
//const testf=(...{a,b})=>a+b;
const methods=["opt","rep0","rep1","sep0","sep1","except"];
const p=Grammar.prototype;
Grammar.P=P;
for (const m of methods) {
    Object.defineProperty(p,m,{
        get: function () {
            const g=this;
            return (...args)=>{
                const a=args.map(g.toParser.bind(g));
                const parser=a.shift();
                const res=parser[m](...a);
                const nodeType=parser.nodeType;
                if (nodeType) {
                    switch (m) {
                        case "opt":res.nodeType=new NodeTypes.Opt(nodeType);break;
                        case "except":res.nodeType=nodeType;break;
                        default:
                        res.nodeType=new NodeTypes.Array(nodeType);
                    }
                }
                return res;
            };
        }
    });
}
const chainMethods=["and","or"];
for (const m of chainMethods) {
    Object.defineProperty(p,m,{
        get: function () {
            const g=this;
            return (...args)=>{
                const a=args.map(g.toParser.bind(g));
                let nodeType;
                if (m==="or") {
                    nodeType=new NodeTypes.Or();
                    for (const e of a) {
                        if (e.nodeType) nodeType.addCandidate(e.nodeType);
                    }
                }
                let head=a.shift();
                while(a.length>0) {
                    head=head[m](a.shift());
                }
                if (nodeType) {
                    head.nodeType=nodeType;
                }
                return head;
            };
        }
    });
}
module.exports=Grammar;
});//----end of define
