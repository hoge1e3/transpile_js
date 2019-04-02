define(["./Parser","./Grammar"],function (P, Grammar) {
    class Tokenizer {
        constructor({order,defs,space}) {
            this.g=new Grammar({space});
            const map=defs||{};
            const tokenTypes=[];
            const tdef={
                __tokens: [{"this":this.g.rep0("__token")}, space ,P.StringParser.eof],
            };
            const seq=order.map(o=>{
                if (typeof o==="string") {
                    tokenTypes.push(o);
                    if (map[o]) {
                        tdef[o]=map[o];
                    } else {
                        tdef[o]="'"+o;
                    }
                }
                return o;
            });
            tdef.__token= this.g.or(...seq);
            this.tokenTypes=tokenTypes;
            this.g.def(tdef);
        }
        tokenize(str) {
            return this.g.get("__tokens").parseStr(str);
        }
    }
    return Tokenizer;
});
