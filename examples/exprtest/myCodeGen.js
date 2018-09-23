// MINIJAVA
define (["lang/Visitor","lang/CodeGen"],
function (Visitor, CodeGen) {

const vdef={
    program: function (node) {
        this.printf("let hogeCount=0;%n");
        this.printf("console.log('start');%n");
        for (const b of node.body) {
            this.visit(b);
        }
        this.printf("console.log('end');%n");
    },
    infixl: function (node) {
        this.printf("%v %v %s ",node.left,node.right,node.op);
    },
    infixr: function (node) {
        this.printf("%v %v %s ",node.left,node.right,node.op);
    },
    number: function (node) {
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
