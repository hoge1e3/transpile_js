// MINIJAVA
define(function (require,exports,module) {
const Visitor=require("../../lang/Visitor2");

class Field {
    constructor(type, name) {
        console.log("Field name=",name,"type=",type);
        this.type=nameToType(type);//1029変更
        if (!this.type) throw new Error("Type "+type+" not defined");//1210
        this.name=name;
    }
}
class Method {
    constructor(returnType, name) {
        console.log("Method name=",name,"returnType=",returnType);
        this.returnType=nameToType(returnType);//1029変更
        this.name=name;
        this.params=[];
        this.locals={};//1022宿題
    }
    // nameで指定された名前のパラメータがあれば返す．なければundefinedを返す
    getParam(name) {
        for (const p of this.params) {
            if (p.name===name) return p;
        }
        //return undefined;
    }
    getLocal(name) {return this.locals[name];}
}
class Param {
    constructor(type, name) {
        console.log("Param name=",name,"type=",type);
        this.type=nameToType(type);//1029変更
        this.name=name;
    }
}
class Local {// 1022宿題:Paramと同じ
    constructor(type, name) {
        console.log("Local name=",name,"type=",type);
        this.type=nameToType(type);//1029変更
        this.name=name;
    }
}
class Class {
    constructor(name, superClass) {
        this.name=name;
        this.fields={ };// {name: Field}
        this.methods={ };// {name: Method}
        this.superClass=superClass;
    }
    isAssignableFrom(right) {//1210
        // right:Class の値がこのクラスの変数に代入可能ならtrue
        if (this===right) return true;
        // right が thisの子クラスなら，true
        return this.isSuperclassOf(right);
    }
    isSuperclassOf(sclass) {//1210
        // thisがsclassのスーパークラスならtrue
        if (sclass==null) return false;
        if (this===sclass.superClass) return true;
        return this.isSuperclassOf(sclass.superClass);
        /*let s;
        for (s=sclass.superClass;s&&s!==this;s=s.superClass);
        return !!s;*/
    }
    isSubclassOf(sclass) {
        // thisがsclassのサブクラスならtrue
        return sclass.isSuperclassOf(this);
    }
    getField(name) {
        return this.fields[name];
    }
    addField(field) {
        this.fields[field.name]=field;
    }
    getMethod(name) {
        return this.methods[name];
    }
    addMethod(method) {
        this.methods[method.name]=method;
    }
}
class AnyClass extends Class {

}
class MapType {//写像   1119
    constructor(inputs , output  ) {
        // inputs を入力として output を返す写像を定義
        // inputsは複数個入るので型(Class)の配列，outputは単独の型
        // 数学風に書くなら::  inputs -> output
        this.inputs=inputs;
        this.output=output;
    }
}

let curClass; // 今解析中のクラスオブジェクト
let curMethod; // 今解析中のメソッドオブジェクト
let pass; // 冬休み課題[2]  pass=1   エラーがあっても実際にはエラーを出さない
//                         pass=2   エラーがあったらエラーを出す（従来通り）
let loopDepth; // 冬休み課題[4] while に入ると1増えて，出ると1減る
//                loopDepthが0のときにbreak があったらエラーを出す．

//1029追加
let types={
    //int: new Class("int"),
    //double: new Class("double"),
    void: new Class("void"),//1126宿題
    string: new Class("string"),//1126宿題
    boolean: new Class("boolean"),//1126宿題
};  // 型の名前  → 実際の型(Class)オブジェクト
// 1210宿題：intをdoubleのサブクラスにする．
types.double=new Class("double");
types.int=new Class("int",types.double);//訂正1217

types.String=types.string;//1126宿題
function nameToType(typeName) {//名前からClassオブジェクトを取得
    return types[typeName];
}
//----

class MyVisitor extends Visitor {
    visitProgram(node) {
        for (const b of node.body) {
            this.visit(b);
        }
    }
    visitClassDef(node) {
        const
            fields=node.members.
                filter((member)=>member.type==="fieldDecl"),
            methods=node.members.
        filter((member)=>member.type==="methodDef");
        let superClass;
        if (node.parentClass) {
            superClass=nameToType(node.parentClass.name);
        }
        curClass = new Class( node.name, superClass );
        console.log("curClass",curClass);
        types[node.name] = curClass;//1029追加
        console.log("classDef",node);
        for (const m of methods) {
            let mm=new Method(m.typeName,m.name.text);
            curClass.addMethod(mm);
            // パラメータごとに繰り返し
            for (const p of m.params) {
                mm.params.push( new Param( p.typeName  , p.name.text ));
            }
            // デバッグ用
            console.log("method params", mm.params);
        }
        for (const f of fields) {
            this.visit(f);
        }
        for (const m of methods) {
            this.visit(m);
        }
        console.log("curClass", curClass);
    }
    visitMethodDef (node) {
        curMethod = curClass.getMethod(node.name.text);
        console.log("methodDef",node,curMethod);
        // curClass.addMethod()
        for (const b of node.body) {
            this.visit(b);
        }
    }
    visitLocalDecl (node) {
        // 1022宿題: 現在のメソッドにローカル変数を追加
        if (node.typeName.text==="void") {//1126宿題
            throw new Error("Cannot declare void variable "+node.typeName.row+":"+node.typeName.col);
        }
        curMethod.locals[node.name]=new Local(node.typeName, node.name.text);
    }
    visitExprStmt (node) {
        this.visit(node.expr);
    }
    visitInfixr (node) {
        // node.left node.op node.right
        console.log("infixr",node);
        this.visit(node.left);
        this.visit(node.right);
        var lt=node.left.exprType,rt=node.right.exprType;
        switch (node.op.text) {
        case "=":
        // 1112宿題 , 1210宿題(isAssignableFromをつかってすっきり書け)
            if (lt.isAssignableFrom(rt)) {
                node.exprType=lt;
            } else {
                console.log("= error", lt, rt);
                throw new Error("Cannot use "+node.op.text+" in this type "+node.op.row+":"+node.op.col);
            }
            break;
        }
    }
    visitInfixl(node) {
        // node.left node.op node.right
        this.visit(node.left);
        this.visit(node.right);
        var lt=node.left.exprType,rt=node.right.exprType;
        switch (node.op.text) {
        case ">":case "<":case ">=":case "<=":case "!=":case "=="://1126宿題
            if ((node.op.text==="==" || node.op.text==="!=") && lt===rt) {
                node.exprType=types.boolean;
            } else if ((lt===types.int || lt===types.double) &&
                (rt===types.int || rt===types.double)) {
                node.exprType=types.boolean;
            } else {
                console.log("Cannot use "+node.op.text+" in ",lt,rt);
                throw new Error("Cannot use "+node.op.text+" in this type "+node.op.row+":"+node.op.col);
            }
            break;
        case "+":case "-":case "*":case "/":case "%":
        // 1112宿題
            if (lt===types.int && rt===types.int) {
                node.exprType=types.int;
            }else if (lt===types.double && rt===types.double) {
                node.exprType=types.double;
            }else if (lt===types.int && rt===types.double) {
                node.exprType=types.double;
            }else if (lt===types.double && rt===types.int) {
                node.exprType=types.double;
            } else if (node.op.text==="+" && (lt===types.string || rt===types.string)) {//1126宿題
                node.exprType=types.string;
            }else {
                console.log("Cannot use "+node.op.text+" in ",lt,rt);
                throw new Error("Cannot use "+node.op.text+" in this type "+node.op.row+":"+node.op.col);
            }
            break;
        case "^":case "&":case "|":case "<<":case ">>":case ">>>":
        // 1112宿題
            if (lt===types.int && rt===types.int) {
                node.exprType=types.int;
            }else {
                throw new Error("Cannot use "+node.op.text+" in this type "+node.op.row+":"+node.op.col);
            }
            break;

        }
    }
    visitPostfix(node) {
        // node.left node.op
        this.visit(node.left);
        // 1029追加
        if (node.op.type==="memberRef") {
            // node が a.b のようなノードだったら
            // node.left == a
            // node.op.name == b
            // a の型は node.left.exprType
            var leftType=node.left.exprType;
            if (!leftType) return;//1112 <- window は型がないので飛ばす
            // leftType(aの型)にnode.op.name(b)という名前のメソッドかフィールドがあるかどうかチェック
            var m=leftType.getMethod(node.op.name);
            var f=leftType.getField(node.op.name);
            if (!m && !f) {//なければエラー
                throw new Error("Method or Field "+node.op.name+
                " not found in type "+leftType.name);
            }
            if (f) {//フィールドとして見つかった場合
                // a.b 自身の型は f.type
                node.exprType=f.type;
            } else if (m) {//メソッドとして見つかった場合
                /*1119*/
                console.log("method found",m);
                //1119宿題：引数の型(inputs)を正しく追加する
                const paramTypes=[];
                for (const param of m.params) {
                    paramTypes.push(param.type);// <-訂正1203： m.type -> param.type
                }
                node.exprType=new MapType(paramTypes , m.returnType  );
                console.log("method type",node.exprType);//確認用
            }
        }
        if (node.op.type==="args") {// f(x,y)     1119
            this.visit(node.op);
            //1119宿題
            //argsの中（引数）をvisit して，それぞれの式に含まれる変数の種類
            //（フィールドorローカルor引数）を判別させる
            console.log("args",node.op);
            var leftType=node.left.exprType;
            if (!leftType) return;// window.f() の場合は型がない
            // leftTypeはMapTypeのはず
            // TODO1203(1) 実引数と仮引数の個数が等しいかチェック
            // leftType と node.op をうまく使ってチェックしましょう
            console.log("arg-check",leftType, node.op);
            const paramTypes=leftType.inputs, args=node.op.args;
            if (paramTypes.length!==args.length) {
                throw new Error("# of Arg/param not match  args="+node.op.args.length+" params="+leftType.inputs.length+ "row = "+node.op.args[0].row);
            }
            // TODO1203(2) それぞれの実引数と仮引数の型に互換性があるかチェック
            //  for i=0..N-1  (Nは引数の個数)
            //     仮引数[i] = 実引数[i] （仮引数[i]への実引数[i]の代入） ができるか
            for (let i=0;i<args.length;i++) {
                //訂正1217 ! を忘れていた
                if (args[i].exprType && !paramTypes[i].isAssignableFrom(args[i].exprType)) {
                    console.log("typenotmatch",args[i].exprType, paramTypes[i]);
                    throw new Error((i+1)+"th arg/param type not match "+args[i].row+":"+args[i].col);
                }
            }
            node.exprType=leftType.output;
        }
        //----
    }
    visitPrefix(node) {
        // node.op node.right
        console.log("prefix", node);
        /*if (node.op.type==="new") {//1112 //del 1203
            //  new XXXX();
            console.log("new args=",node.right.op);
            console.log("new type=",node.right.left.text);
            this.visit(node.right.op);
            node.exprType=nameToType(node.right.left.text);
            if (!node.exprType) {
                throw new Error("Type "+node.right.left.text+" not found "+
                node.op.row+":"+node.op.col);
            }
            // 1119宿題：ここでもargsを辿る必要がある
            console.log("args(new)",node.right.op);
        } else {*/
            this.visit(node.right);
            node.exprType=node.right.exprType;//add 1203
        //}
    }
    visitArgs(node) {
        // node.arg
        for (var arg of node.args) {
            this.visit(arg);
        }
    }
    visitMemberRef(node) {
        // node.name
    }
    visitNumber(node) {
        // 1112宿題
        if (node.text.indexOf(".")>=0) node.exprType=types.double;
        else node.exprType=types.int;
    }
    visitLiteral(node) {//1126宿題
        node.exprType=types.string;
    }
    visitFieldDecl (node) {
        //node.name
        console.log("fieldDecl",node, node.name.text);
        let field=new Field(node.typeName, node.name.text);
        curClass.addField(field);
    }
    visitSymbol (node) {
        //console.log("symbol",node, node.text);
        // 存在しないフィールドにアクセスしようとしたら
        // エラー（例外）を投げる
        const f=curClass.getField(node.text);
        const m=curClass.getMethod(node.text);
        const p=curMethod.getParam(node.text);
        const l=curMethod.getLocal(node.text);
        const c=types[node.text];//add 1203
        // 1022宿題： ローカル変数の存在もチェックする
        if (node.text==="window") {//1112
            return;
        }
        if (!f && !m && !p && !l && !c)  {//change 1203
            throw new Error(node.text+" is not defined");
        }
        if (p) {//  p==null やundefined以外
            node.isParam=true;
            node.exprType=p.type; //1029追加
        }
        if (l) {
            console.log("symbol name=", node.text," type=",l.type);
            node.isLocal=true;
            node.exprType=l.type; //1029追加
        }
        if (f) {
            node.exprType=f.type; //1029追加
        }
        if (m) {
            const paramTypes=[];
            for (const param of m.params) {
                paramTypes.push(param.type); // <-訂正1203： m.type -> param.type
            }
            // NG  node.exprType=new MapType(m.params , m.returnType  );
            node.exprType=new MapType(paramTypes , m.returnType  ); //1029追加
        }
        if (c) {// add 1203
            const paramTypes=[];
            node.isClass=true;
            for (const k in c.fields ) {
                paramTypes.push(c.getField(k).type);
            }
            node.exprType=new MapType(paramTypes, c);
        }
    }
    visitReturnStmt(node) {
        this.visit(node.expr);
    }
    visitIfStmt(node) {//1126宿題
        console.log("if",node);
        this.visit(node.cond);
        if (node.cond.exprType!==types.boolean) {
            throw new Error("Use boolean type as if condition "+node[0].row+":"+node[0].col);
        }
        this.visit(node.then);
        if (node.elsePart) this.visit(node.elsePart.else);
    }
    visitBlock (node) {//1126宿題
        for (const b of node.body) this.visit(b);
    }
    default(node) {
        if (node==null) console.log("Semantics.check.def","NULL");
        else console.log("Semantics.check.def",node.type, node);
    }
}
const Semantics= {
    check: function (node) {//node:プログラム全体のノード
        const v=new MyVisitor();
        window.types=types;
        for (pass=1; pass<=2; pass++) {//冬休み課題[2]
            v.visit(node);
        }
    }
};
return Semantics;
});
