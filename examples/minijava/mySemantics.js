// MINIJAVA
define (["lang/Visitor"],
function (Visitor) {

class Field {
    constructor(type, name) {
        console.log("Field name=",name,"type=",type);
        this.type=nameToType(type);//1029変更
        this.name=name;
    }
}
class Method {
    constructor(returnType, name) {
        console.log("Method name=",name,"returnType=",returnType);
        this.returnType=nameToType(returnType);//1029変更
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
        this.type=nameToType(type);//1029変更
        this.name=name;
    }
}
class Local {// 1022宿題:Paramと同じ
    constructor(type, name) {
        console.log("Local name=",name,"type=",type);
        this.type=nameToType(type);//1029変更
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
//1029追加
let types={
    int: new Class("int"),
    double: new Class("double"),
};  // 型の名前  → 実際の型(Class)オブジェクト
function nameToType(typeName) {//名前からClassオブジェクトを取得
    return types[typeName];
}
//----

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
        types[node.name] = curClass;//1029追加
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
        console.log("infixr",node);
        this.visit(node.left);
        this.visit(node.right);
        var lt=node.left.exprType,rt=node.right.exprType;
        switch (node.op.text) {
        case "=":
            if (lt===types.double && rt === types.int) {
                node.exprType=types.double;
            } else if (lt===rt) {
                node.exprType=lt;
            } else {
                throw new Error("Cannot use "+node.op.text+" in this type "+node.op.row+":"+node.op.col);
            }
            break;
        }
    },
    infixl: function(node) {
        // node.left node.op node.right
        this.visit(node.left);
        this.visit(node.right);
        var lt=node.left.exprType,rt=node.right.exprType;
        switch (node.op.text) {
        case "+":case "-":case "*":case "/":case "%":
            if (lt===types.int && rt===types.int) {
                node.exprType=types.int;
            }else if (lt===types.double && rt===types.double) {
                node.exprType=types.double;
            }else if (lt===types.int && rt===types.double) {
                node.exprType=types.double;
            }else if (lt===types.double && rt===types.int) {
                node.exprType=types.double;
            }else {
                throw new Error("Cannot use "+node.op.text+" in this type "+node.op.row+":"+node.op.col);
            }
            break;
        case "^":case "&":case "|":case "<<":case ">>":case ">>>":
            if (lt===types.int && rt===types.int) {
                node.exprType=types.int;
            }else {
                throw new Error("Cannot use "+node.op.text+" in this type "+node.op.row+":"+node.op.col);
            }
            break;

        }
    },
    postfix: function (node) {
        // node.left node.op
        this.visit(node.left);
        // 1029追加
        if (node.op.type==="memberRef") {
            // node が a.b のようなノードだったら
            // node.left == a
            // node.op.name == b
            // a の型は node.left.exprType
            var leftType=node.left.exprType;
            if (!leftType) return;//1112 <- window は型がないので飛ばす
            // leftType(aの型)にnode.op.name(b)という名前のメソッドかフィールドがあるかどうかチェック
            var m=leftType.getMethod(node.op.name);
            var f=leftType.getField(node.op.name);
            if (!m && !f) {//なければエラー
                throw new Error("Method or Field "+node.op.name+
                " not found in type "+leftType.name);
            }
            if (f) {//フィールドとして見つかった場合
                // a.b 自身の型は f.type
                node.exprType=f.type;
            } else if (m) {
                //TODO
            }
        }
        //----
    },
    prefix: function (node) {
        // node.op node.right
        console.log("prefix", node);
        if (node.op.type==="new") {//1112
            //  new XXXX();
            console.log("new type=",node.right.left.text);
            node.exprType=nameToType(node.right.left.text);
            if (!node.exprType) {
                throw new Error("Type "+node.right.left.text+" not found "+
                node.op.row+":"+node.op.col);
            }
        } else {
            this.visit(node.right);
        }
    },
    args: function (node) {
        // node.arg
    },
    memberRef: function (node) {
        // node.name
    },
    "number": function (node) {
        // node.text
        if (node.text.indexOf(".")>=0) node.exprType=types.double;
        else node.exprType=types.int;
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
        if (node.text==="window") {//1112
            return;
        }
        if (!f && !m && !p && !l)  {
            throw new Error(node.text+" is not defined");
        }
        if (p) {//  p==null やundefined以外
            node.isParam=true;
            node.exprType=p.type; //1029追加
        }
        if (l) {
            console.log("symbol name=", node.text," type=",l.type);
            node.isLocal=true;
            node.exprType=l.type; //1029追加
        }
        if (f) {
            node.exprType=f.type; //1029追加
        }
        /*if (m) {
            node.exprType=m.type; //1029追加
        }*/
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
