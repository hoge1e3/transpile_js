window.reqConf={
    paths: {
        "source-map":"lang/source-map",
    },
    baseUrl: "../"
};
(function(){
    var reqConf=window.reqConf;
    for (var k in reqConf.paths)
    if (reqConf.paths[k].match(/\/$/)) reqConf.paths[k]+=k;
})();
