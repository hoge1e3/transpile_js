// MINIJAVA
define(["lang/Grammar"], function (Grammar) {
    const spc=/^\s*/;
    const tokenizer=new Grammar({space:spc});
    const P=Grammar.P;
    //トークンの定義
    const tdef={
        tokens: [{"this":tokenizer.rep0("token")}, /^\s*/ ,P.StringParser.eof],
        token: tokenizer.or("class","int","double","symbol","(",")","{","}",";"),
        class: "'class",
        int: "'int",
        double: "'double",
        symbol: /^[a-zA-Z_$][a-zA-Z_$0-9]*/,
        //number: /^[+-]?(([0-9]+\.[0-9]+)|([0-9]+))/,
        number: /^[+-]?(([0-9]+\.[0-9]+)|(\.[0-9]+)|([0-9]+\.)|([0-9]+))/,
        "{": "'{",
        "}": "'}",
        "(": "'(",
        ")": "')",
        ";": "';",
    };
    tokenizer.def(tdef);


    const g=new Grammar;
    const rep0=g.rep0;
    const rep1=g.rep1;
    const sep0=g.sep0;
    const sep1=g.sep1;
    const opt=g.opt;
    const or=g.or;
    const br=/^\r?\n/;
    const tk=P.TokensParser.token;
    //構文の定義
    const gdef={
        program: [{body:rep0("classDef")},P.TokensParser.eof],
        classDef: ["class", {name:"symbol"}, "{", {members: rep0("member")},  "}"],
        member: or("fieldDecl", "methodDef"),
        fieldDecl: [{typeName:"typeName"},{name:"symbol"},";"],
        methodDef: [{typeName:"typeName"},{name:"symbol"},"(",")","{","}"],
        typeName: or("int","double"),
        ";": tk(";"),"class":tk("class"),"int":tk("int"),"double":tk("double"),
        "{": tk("{"), "}":tk("}"),"(": tk("("), ")":tk(")"),symbol: tk("symbol")
    };
    g.def(gdef);

    return {parser:g, tokenizer:tokenizer};
});
