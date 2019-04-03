// MINIJAVA
define(["examples/exprtest2/myGrammar","examples/exprtest2/myCodeGen"],
function (myGrammar, myCodeGen) {
window.run=()=>{
    let src=document.forms.prog.text.value;
    if (!src.match(/\n$/)) src+="\n";
    localStorage.lastSrc=src;
    const tres=myGrammar.tokenizer.tokenize(src);
    const tokens=tres.result[0];
    console.log("tokenres",tres.success,tokens.map(
        (e)=>e.type+" "+e.pos+" "+src.substring(e.pos,e.pos+e.len)
    ));

    const r=
        myGrammar.parser.get("expr").parseTokens(tokens);
    if (!r.success) {
        const et=tokens[r.src.maxPos];
        console.log("Err token",et);
        alert("Error at "+et.row+":"+et.col);
    } else {
        const node=r.result[0];
        console.log("node",node);
        /*const gensrc=myCodeGen.generate(node);
        console.log(gensrc);
        eval(gensrc);*/
    }
};

});
