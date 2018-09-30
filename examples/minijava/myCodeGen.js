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
        const
            fields=node.members.
                filter((member)=>member.type==="fieldDecl"),
            methods=node.members.
                filter((member)=>member.type==="methodDef");
        this.printf("class %s {\n" ,node.name   );
        this.printf("  constructor(%j) {\n", ["," ,fields.map((f)=>f.name)]);
        for (const f of fields) {
            this.printf("    this.%s=%s;\n", f.name, f.name);
        }
        this.printf("  }\n");
        for (const m of methods) {
            this.printf("  %s () {\n",m.name);
            this.printf("  }\n");
        }
        this.printf("}\n");
    },
    fieldDecl: function (node) {
        this.printf("      this.%s=0;\n", node.name);
    },
    symbol: function (node) {
        this.printf("%s",node);
    },

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
