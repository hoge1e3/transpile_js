// MINIJAVA
define (["lang/Visitor"],
function (Visitor) {

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
        console.log("classDef",node);
        for (const f of fields) {
            this.visit(f);
        }
        for (const m of methods) {
            this.visit(m);
        }
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
    },
    symbol: function (node) {
        console.log("symbol",node, node.text);

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
