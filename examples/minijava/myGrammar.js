// MINIJAVA
define(["lang/Grammar"], function (Grammar) {
    const spc=/^\s*/;
    const tokenizer=new Grammar({space:spc});
    const P=Grammar.P;
    //トークンの定義
    const tdef={
        tokens: [{"this":tokenizer.rep0("token")}, /^\s*/ ,P.StringParser.eof],
        token: tokenizer.or("new"/*1112*/,"if","while","return"/*1119*/,
        "class","else","int","double","void"/*1126*/,"String"/*1126*/,"boolean"/*1126*/,
        "symbol","number","literal"/*1126*/,
        "<<",">>>",">>",
        "<=",">=","!=","==",">","<","!",
        "(",")","{","}","+","-","=","*",";",".",",","/","&","^","|"),
        literal: /^"[^"]*"/,/*1126*/
        if: "'if",
        else: "'else",
        while: "'while",
        class: "'class",
        int: "'int",
        double: "'double",
        void: "'void",  /*1126*/
        String: "'String",/*1126*/
        boolean: "'boolean",/*1126*/
        new: "'new",//1112
        return: "'return",/*1119*/
        symbol: /^[a-zA-Z_$][a-zA-Z_$0-9]*/,
        //number: /^[+-]?(([0-9]+\.[0-9]+)|([0-9]+))/,
        number: /^(([0-9]+\.[0-9]+)|(\.[0-9]+)|([0-9]+\.)|([0-9]+))/,
        "{": "'{",
        "}": "'}",
        "(": "'(",
        ")": "')",
        ";": "';",
        ",": "',",
        "/": "'/",
        "+": "'+",
        "-": "'-",
        "!": "'!",
        "*": "'*",
        "=": "'=",
        ".": "'.",
        "<=":"'<=",
        ">=":"'>=",
        "!=":"'!=",
        "==":"'==",
        ">":"'>",
        "<":"'<",
        "<<":"'<<",
        ">>":"'>>",
        ">>>":"'>>>",
        "&":"'&",
        "|":"'|",
        "^":"'^",
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
            element: or("number","symbol", "literal"),
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
        "new": tk("new"),//1112
        "args": ["(", {args:g.sep0("expr", "," )}  , ")"],
        "memberRef": ["." , {name:"symbol"} ],
        "number": tk("number"),
        ";": tk(";"),"class":tk("class"),
        "int":tk("int"),"double":tk("double"),
        "String":tk("String"),"boolean":tk("boolean"),"void":tk("void"),/*1126*/
        "literal": tk("literal"), /*1126*/
        "return": tk("return"),/*1119*/
        "{": tk("{"), "}":tk("}"),"(": tk("("), ")":tk(")"),
        "=": tk("="),  "+": tk("+"), "-": tk("-"),  "*": tk("*"), "/":tk("/"), ",":tk(","),
        ".": tk("."), "if":tk("if"),"while":tk("while"),"else":tk("else"),
        "==": tk("=="),
        "!=": tk("!="),
        "!": tk("!"),
        ">=": tk(">="),
        "<=": tk("<="),
        ">": tk(">"),
        "<": tk("<"),
        ">>": tk(">>"),
        "<<": tk("<<"),
        ">>>": tk(">>>"),
        "^": tk("^"),
        "&": tk("&"),
        "|": tk("|"),
        symbol: tk("symbol")
    };
    g.def(gdef);

    return {parser:g, tokenizer:tokenizer};
});
