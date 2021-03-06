// MINIJAVA
define(function(require,exports,module) {
    const myGrammar=require("examples/minijava/myGrammar");
    const myCodeGen=require("examples/minijava/myCodeGen");
    const mySemantics=require("examples/minijava/mySemantics");
    const VisitorTmpl=require("lang/VisitorTmpl");
    VisitorTmpl.genVisitor(myGrammar.parser);
window.run=()=>{
    let src=document.forms.prog.text.value;
    if (!src.match(/\n$/)) src+="\n";
    localStorage.lastSrc=src;
    const tres=myGrammar.tokenizer.tokenize(src);//get("tokens").parseStr(src);
    if (!tres.success) {
        alert("Token error! at "+ tres.src.maxRow+":"+tres.src.maxCol);
        return;
    }
    const tokens=tres.result[0];
    console.log("tokenres",tokens.map(
        (e)=>e.type+" "+e.pos+" "+src.substring(e.pos,e.pos+e.len)
    ));
    const r=
        myGrammar.parser.get("program").parseTokens(tokens);
    if (!r.success) {
        const et=tokens[r.src.maxPos];
        console.log("Err token",et);
        alert("Error at "+et.row+":"+et.col);
    } else {
        console.log(r);
        const node=r.result[0];
        mySemantics.check(node);
        const gensrc=myCodeGen.generate(node);
        console.log(gensrc);
        eval(gensrc+"\nvar m=new Main();\nm.main();");
    }
};

});
