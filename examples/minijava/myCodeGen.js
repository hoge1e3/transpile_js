// MINIJAVA
define(function (require,exports,module) {
const Visitor=require("../../lang/Visitor");
const CodeGen=require("../../lang/CodeGen");

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
        this.printf("class %s {%{" ,node.name   );
        this.printf("constructor(%s) {%{", fields.map((f)=>f.name).join(",")  );
        for (const f of fields) {
            this.printf("this.%s=%s;%n", f.name, f.name);
        }
        this.printf("%}}%n");
        for (const m of methods) {
            const p=m.params.map((p)=>p.name.text).join(",");
            this.printf("%s (%s) {%{",m.name, p);
            for (const b of m.body) {
                this.visit(b);
            }
            this.printf("%n%}}%n");
        }
        this.printf("%}}%n");
    },
    exprStmt: function (node) {
        this.visit(node.expr);
        this.printf(";%n");
    },
    returnStmt: function (node) {
        this.printf("return %v;%n",node.expr);
    },
    block: function (node) {
        this.printf("{%{");
        for (const b of node.body) {
            this.visit(b);
        }
        this.printf("%n%}}");
    },
    ifStmt: function (node) {
        if (node.elsePart) {
            this.printf("if (%v) %v else %v",
            node.cond,node.then, node.elsePart.else);
            /*
            this.printf("if (");
            this.visit(node.cond);
            this.printf(")");
            this.visit(node.then);
            this.printf(" else ");
            this.visit(node.elsePart.else);
            */
        } else {
            this.printf("if (%v) %v",node.cond,node.then);
        }
    },
    whileStmt: function (node) {
        this.printf("while (%v) %v",node.cond,node.do);
    },
    infixr: function(node) {
        // node.left node.op node.right
        this.printf("(");
        this.visit(node.left);
        this.visit(node.op);
        this.visit(node.right);
        this.printf(")");
    },
    infixl: function(node) {
        // node.left node.op node.right
        this.printf("(");
        this.visit(node.left);
        this.visit(node.op);
        this.visit(node.right);
        this.printf(")");
    },
    postfix: function (node) {
        this.printf("%v%v",node.left,node.op);
    },
    prefix: function (node) {
        if (node.op.type==="new") {//1112 -> mod 1203
            //  new XXXX();
            this.visit(node.right);
            //var classname= node.right.left.text;
            //this.printf("new %s%v",classname, node.right.op);
        } else {
            this.printf("%v%v",node.op,node.right);
            // this.visit(node.op);
            // this.visit(node.right);
        }
    },
    args: function (node) {
        this.printf("(%j)",[",",node.args]);
    },
    memberRef: function (node) {
        this.printf(".%s",node.name);
    },
    "number": function (node) { this.printf("%s",node);},
    "=": function (node) { this.printf("%s",node);},
    "+": function (node) { this.printf("%s",node);},
    "-": function (node) { this.printf("%s",node);},
    "*": function (node) { this.printf("%s",node);},
    "/": function (node) { this.printf("%s",node);},
    "==": function (node) { this.printf("%s",node);},
    "!=": function (node) { this.printf("%s",node);},
    ">=": function (node) { this.printf("%s",node);},
    "<=": function (node) { this.printf("%s",node);},
    "<": function (node) { this.printf("%s",node);},
    ">": function (node) { this.printf("%s",node);},
    ">>": function (node) { this.printf("%s",node);},
    "<<": function (node) { this.printf("%s",node);},
    ">>>": function (node) { this.printf("%s",node);},
    "|": function (node) { this.printf("%s",node);},
    "^": function (node) { this.printf("%s",node);},
    "&": function (node) { this.printf("%s",node);},
    fieldDecl: function (node) {
        this.printf("this.%s=0;%n", node.name);
    },
    localDecl: function (node) {
        this.printf("let %s;%n",node.name);
    },
    symbol: function (node) {
        if (node.isClass) {//1203
            this.printf("new %s",node);
        } else if (node.isParam || node.isLocal || node.text==="window") {//1112
            this.printf("%s",node);
        } else {
            this.printf("this.%s",node);
        }
    },
    literal: function (node) {//1126宿題
        this.printf("%s",node);
    }

};
const Generator= {
    generate: function (node) {
        const v=Visitor(vdef);
        v.def=function (node) {
            if (node==null) this.printf("NULL");
            else this.printf("/*UNDEFINED: '%s'*/",node.type);
            console.log(node.type, node);
        };
        const c=CodeGen({
            visitor:v
        });
        v.visit(node);
        //console.log(c.buf);
        return c.buf;
    }
};
return Generator;
});
