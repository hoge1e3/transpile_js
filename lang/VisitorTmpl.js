define(function (require, exports, module) {
    const CodeGen=require("./CodeGen");
    const T=require("./NodeTypes");
    exports.genVisitor=function (g) {
        const buf=new CodeGen();
        for (var gname in g.defs) {
            let gr=g.defs[gname];
            if (gr.nodeType instanceof T.Struct) {
                buf.printf("visit%s (node) {%{",gname);
                for (const member of gr.nodeType.members) {
                    buf.printf("const %s/*:%s*/=node.%s;%n",
                    member.name, typeName(member.type) , member.name);
                }
                buf.printf("%n%}}%n");
            }
        }
        console.log(buf.buf);
        function typeName(type) {
            if (type.name) return type.name;
            if (type instanceof T.Array) {
                return typeName(type.element)+"[]";
            }
            if (type instanceof T.Opt) {
                return typeName(type.element)+"|undefined";
            }
            return "any";
        }
    };
});
