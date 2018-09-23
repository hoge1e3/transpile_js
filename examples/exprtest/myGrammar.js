// MINIJAVA
define(["lang/Grammar"], function (Grammar) {
    const spc=/^\s*/;
    const tokenizer=new Grammar({space:spc});
    const P=Grammar.P;
    //トークンの定義
    const tdef={
        tokens: [{"this":tokenizer.rep0("token")}, /^\s*/ ,P.StringParser.eof],
        token: tokenizer.or("class","symbol","int","double","number","{","}",";","+","*","="),
        class: "'class",
        int: "'int",
        double: "'double",
        symbol: /^[a-zA-Z_$][a-zA-Z_$0-9]*/,
        //number: /^[+-]?(([0-9]+\.[0-9]+)|([0-9]+))/,
        number: /^(([0-9]+\.[0-9]+)|(\.[0-9]+)|([0-9]+\.)|([0-9]+))/,
        "{": "'{",
        "}": "'}",
        "=": "'=",
        "+": "'+",
        "*": "'*",
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
        program: g.expr({
            element:"number",
            operators:[["infixr","="],["infixl","+"],["infixl","*"]],
        }),
        number: tk("number"),
        "+": tk("+"),
        "=": tk("="),
        "*": tk("*"),
        ";": tk(";"),
    };
    g.def(gdef);

    return {parser:g, tokenizer:tokenizer};
});
