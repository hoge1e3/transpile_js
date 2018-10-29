// MINIJAVA
define (["lang/Visitor"],
function (Visitor) {

let types={};  // 型の名前  → 実際の型(Class)オブジェクト
function nameToType(typeName) {
    return types[typeName];
}
class Field {
    constructor(type, name) {
        console.log("Field name=",name,"type=",type);
        this.type=nameToType(type);
        this.name=name;
    }
}
class Method {
    constructor(returnType, name) {
        console.log("Method name=",name,"returnType=",returnType);
        this.returnType=nameToType(returnType);
        this.name=name;
        this.params=[];
        this.locals={};//1022宿題
    }
    // nameで指定された名前のパラメータがあれば返す．なければundefinedを返す
    getParam(name) {
        for (const p of this.params) {
            if (p.name===name) return p;
        }
        //return undefined;
    }
    getLocal(name) {return this.locals[name];}
}
class Param {
    constructor(type, name) {
        console.log("Param name=",name,"type=",type);
        this.type=nameToType(type);
        this.name=name;
    }
}
class Local {// 1022宿題:Paramと同じ
    constructor(type, name) {
        console.log("Local name=",name,"type=",type);
        this.type=nameToType(type);
        this.name=name;
    }
}
class Class {
    constructor(name) {
        this.name=name;
        this.fields={ };// {name: Field}
        this.methods={ };// {name: Method}
    }
    getField(name) {
        return this.fields[name];
    }
    addField(field) {
        this.fields[field.name]=field;
    }
    getMethod(name) {
        return this.methods[name];
    }
    addMethod(method) {
        this.methods[method.name]=method;
    }
}
let curClass; // 今解析中のクラスオブジェクト
let curMethod; // 今解析中のメソッドオブジェクト
const vdef={
    program: function (node) {
        for (const b of node.body) {
            this.visit(b);
        }
    },
    classDef: function (node) {
        const
            fields=node.members.
                filter((member)=>member.type==="fieldDecl"),
            methods=node.members.
        filter((member)=>member.type==="methodDef");
        curClass = new Class( node.name );
        types[node.name] = curClass;
        console.log("classDef",node);
        for (const m of methods) {
            let mm=new Method(m.typeName,m.name.text);
            curClass.addMethod(mm);
            // パラメータごとに繰り返し
            for (const p of m.params) {
                mm.params.push( new Param( p.typeName  , p.name.text ));
            }
            // デバッグ用
            console.log("method params", mm.params);
        }
        for (const f of fields) {
            this.visit(f);
        }
        for (const m of methods) {
            this.visit(m);
        }
        console.log("curClass", curClass);
    },
    methodDef: function (node) {
        curMethod = curClass.getMethod(node.name.text);
        console.log("methodDef",node,curMethod);
        // curClass.addMethod()
        for (const b of node.body) {
            this.visit(b);
        }
    },
    localDecl: function (node) {
        // 1022宿題: 現在のメソッドにローカル変数を追加
        curMethod.locals[node.name]=new Local(node.typeName, node.name.text);
    },
    exprStmt: function (node) {
        this.visit(node.expr);
    },
    infixr: function(node) {
        // node.left node.op node.right
        this.visit(node.left);
        this.visit(node.right);
    },
    infixl: function(node) {
        // node.left node.op node.right
        this.visit(node.left);
        this.visit(node.right);
    },
    postfix: function (node) {
        // node.left node.op
        this.visit(node.left);
    },
    prefix: function (node) {
        // node.op node.right
        this.visit(node.right);
    },
    args: function (node) {
        // node.arg
    },
    memberRef: function (node) {
        // node.name
    },
    "number": function (node) {
        // node.text

    },
    fieldDecl: function (node) {
        //node.name
        console.log("fieldDecl",node, node.name.text);
        let field=new Field(node.typeName, node.name.text);
        curClass.addField(field);
    },
    symbol: function (node) {
        //console.log("symbol",node, node.text);
        // 存在しないフィールドにアクセスしようとしたら
        // エラー（例外）を投げる
        const f=curClass.getField(node.text);
        const m=curClass.getMethod(node.text);
        const p=curMethod.getParam(node.text);
        const l=curMethod.getLocal(node.text);
        // 1022宿題： ローカル変数の存在もチェックする
        if (!f && !m && !p && !l)  {
            throw new Error(node.text+" is not defined");
        }
        if (p) {//  p==null やundefined以外
            node.isParam=true;
        }
        if (l) {
            console.log("symbol name=", node.text," type=",l.type);
            node.isLocal=true;
            node.exprType=l.type; 
        }
    },

};
const Semantics= {
    check: function (node) {
        const v=Visitor(vdef);
        v.def=function (node) {
            if (node==null) console.log("Semantics.check.def","NULL");
            else console.log("Semantics.check.def",node.type, node);
        };
        v.visit(node);
    }
};
return Semantics;
});
