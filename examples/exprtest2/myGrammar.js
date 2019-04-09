// MINIJAVA
define(function (require,exports,module) {
    const Grammar=require("lang/Grammar");
    const Tokenizer=require("lang/Tokenizer");
    const spc=/^\s*/;
    const tokenizer=new Tokenizer({
        space:spc,
        order: ["+","-","*","/","number"],
        defs: {
            number: {
                reg:/^(([0-9]+\.[0-9]+)|(\.[0-9]+)|([0-9]+\.)|([0-9]+))/,
                first: ".-0123456789"
            }
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
    module.exports={parser:g, tokenizer:tokenizer};
    console.log(module.exports);
});
