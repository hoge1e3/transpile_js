// MINIJAVA
define(["lang/Grammar", "lang/Tokenizer"], function (Grammar,Tokenizer) {
    const spc=/^\s*/;    //冬休み課題 コメントを飛ばす
    //const tokenizer=new Grammar({space:spc});
    const P=Grammar.P;
    const tokenizer=new Tokenizer({
        space:spc,
        order:[
            "new"/*1112*/,"if","while","return"/*1119*/,
            "class","else","int","double","void"/*1126*/,"String"/*1126*/,"boolean"/*1126*/,
            "extends"/*1210*/,"symbol","number","literal"/*1126*/,
            "<<",">>>",">>",
            "<=",">=","!=","==",">","<","!",
            "(",")","{","}","+","-","=","*",";",".",",","/","&","^","|"
        ],
        defs: {
            literal: /^"[^"]*"/,/*1126*/
            num: /^[0-9]+/,
            symbol: /^[a-zA-Z_$][a-zA-Z_$0-9]*/,
            number: /^(([0-9]+\.[0-9]+)|(\.[0-9]+)|([0-9]+\.)|([0-9]+))/
        }
    });
    //window.t=t;
    //console.log(t.tokenize("a b hoge aa bb 123 555"));

    const g=new Grammar({tokenizer});
    const rep0=g.rep0;
    const rep1=g.rep1;
    const sep0=g.sep0;
    const sep1=g.sep1;
    const opt=g.opt;
    const or=g.or;
    const br=/^\r?\n/;
    //const tk=P.TokensParser.token;
    //構文の定義
    const gdef={
        program: [{body:rep0("classDef")},P.TokensParser.eof],
        classDef: ["class", {name:"symbol"}, {parentClass:opt("parentClass")}/*1210*/, "{", {members: rep0("member")},  "}"],
        parentClass: ["extends",{name:"symbol"}],/*1210*/
        member: or("fieldDecl", "methodDef"),
        fieldDecl: [{typeName:"typeName"},{name:"symbol"},";"],
        localDecl: [{typeName:"typeName"},{name:"symbol"},";"],
        methodDef: [{typeName:"typeName"},{name:"symbol"},
            "(", {params:"params"}, ")","{",
            {body:rep0("stmt")} , // 文*
        "}"],
        params: sep0("param", ","),
        param: [{typeName:"typeName"},{name:"symbol"}],
        typeName: or("int","double","void"/*1126*/,"boolean"/*1126*/,"String"/*1126*/,"symbol"),
        stmt: or("exprStmt","localDecl","ctrlStmt","block","returnStmt"/*1119*/),
        ctrlStmt: or("ifStmt","whileStmt"),
        ifStmt: ["if","(",{cond:"expr"},")",{then:"stmt"},
            {elsePart:opt("elsePart")}],
        elsePart: ["else",{else:"stmt"}],
        whileStmt: ["while","(",{cond:"expr"},")",{do:"stmt"}],
        block: ["{",  {body:rep0("stmt")}, "}"],
        exprStmt: [{expr:"expr"} , ";"],
        returnStmt: ["return",{expr:opt("expr")} , ";"],/*1119*/
        expr:  g.expr({
            element: or("number","symbol", "literal"/*,"paren"*/),// 冬休み課題[3]
            operators: [// 優先順位(低い)
                ["infixr", "="  ] , //  = 右結合２項演算子
                ["infixl", or(">=","<=","==","!=",">","<")  ] , //  + -  左結合２項演算子
                ["infixl", or("|")  ] ,
                ["infixl", or("^")  ] ,
                ["infixl", or("&")  ] ,
                ["infixl", or("<<",">>",">>>")  ] ,
                ["infixl", or("+","-")  ] , //  + -  左結合２項演算子
                ["infixl", or("*","/")  ] , //  * 左結合２項演算子
                ["prefix","new"],//1112
                ["prefix",or("!","-")],
                ["postfix" , or("args" , "memberRef") ] , // (a,b)  .x
                // 優先順位(高い)
            ]
        }),
        //"paren":  冬休み課題[3]
        "args": ["(", {args:g.sep0("expr", "," )}  , ")"],
        "memberRef": ["." , {name:"symbol"} ]
    };
    g.def(gdef);

    return {parser:g, tokenizer};
});
