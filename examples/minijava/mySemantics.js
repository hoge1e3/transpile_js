// MINIJAVA
define (["lang/Visitor"],
function (Visitor) {

class Field {
    constructor(type, name) {
        this.type=type;
        this.name=name;
    }
}
class Class {
    constructor(name) {
        this.name=name;
        this.fields={ };// {name: Field}
    }
    getField(name) {
        return this.fields[name];
    }
    addField(field) {
        this.fields[field.name]=field;
    }
}
let curClass; // 今解析中のクラスオブジェクト
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
        console.log("classDef",node);
        for (const f of fields) {
            this.visit(f);
        }
        for (const m of methods) {
            this.visit(m);
        }
        console.log("curClass", curClass);
    },
    methodDef: function (node) {
        console.log("methodDef",node);
        for (const b of node.body) {
            this.visit(b);
        }
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
        console.log("symbol",node, node.text);
        // 存在しないフィールドにアクセスしようとしたら
        // エラー（例外）を投げる
        // JS でのエラーの投げ方：
        const f=curClass.getField(node.text);
        // f =  undefined (ない場合)
        // OK  f === undefined
        // NG  f !== null   !(f === null)
        // OK  f !=  null    !(f == null)
        if (!f) {
            throw new Error(node.text+" is not defined");
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
