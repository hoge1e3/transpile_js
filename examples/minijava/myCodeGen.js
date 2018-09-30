// MINIJAVA
define (["lang/Visitor","lang/CodeGen"],
function (Visitor, CodeGen) {

const vdef={
    program: function (node) {
        for (const b of node.body) {
            this.visit(b);
        }
    },
    classDef: function (node) {
        this.printf("class %s {\n" ,node.name   );
        this.printf("   constructor() {\n");
        for (let member of node.members) {
            // ここで  this.x=0;  のようなコードを出力
            if (member.type=="fieldDecl") {
                this.printf("      this.%s=0;\n", member.name);
            }
            // this.visit(decl)
        }
        this.printf("   }\n");
        for (let member of node.members) {
            // ここで  main() { ... }  のようなコードを出力
            if (member.type=="methodDef") {
                this.printf("      %s() {\n", member.name);
                this.printf("      }\n");
            }
        }
        this.printf("}\n");
    },
    fieldDecl: function (node) {
        this.printf("      this.%s=0;\n", node.name);
    }

};
const Generator= {
    generate: function (node) {
        const v=Visitor(vdef);
        v.def=function (node) {
            this.printf("/*UNDEFINED: %s*/",node.type);
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
