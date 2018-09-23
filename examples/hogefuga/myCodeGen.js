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
    hogeStmt: function (node) {
        this.printf("console.log('hoge',%s);%n" ,  node.value);
    },
    fugaStmt: function (node) {
        const v1=parseFloat(node.value1);
        const v2=parseFloat(node.value2);
        this.printf("console.log('fuga',%s);%n" , v1+v2);
    },
    piyoStmt: function (node) {
        for (var i=0; i<node.times; i++) {
            this.printf("console.log('piyo');%n");
        }
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
