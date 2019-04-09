// MINIJAVA
define(function (require,module,exports) {
    const Grammar=require("lang/Grammar");
    const Tokenizer=require("lang/Tokenizer");
    const spc=/^\s*/;
    const tokenizer=new Tokenizer({
        space:spc,
        order: ["+","-","*","/","number"],
        defs: {
            number: /^(([0-9]+\.[0-9]+)|(\.[0-9]+)|([0-9]+\.)|([0-9]+))/
        }
    });
    const g=new Grammar({tokenizer});
    g.def({
        expr: {
            element: "number",
            operators: [
                ["add:infixl",{"|":["+","-"]}],
                ["mul:infixl",{"|":["*","/"]}],
                ["neg:prefix","-"]
            ]
        }
    });
    return {parser:g, tokenizer:tokenizer};
});
