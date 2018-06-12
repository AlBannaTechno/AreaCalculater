let area=require('./area_calculater_final_9_API').area;
let _log=require('./hyper_log');
let log=new _log();
// old method
log.show("info");
let info=function(...args){
    log.l("info",...args);
};
// new method
let data_log=log.invoke("data");
data_log("message",{d:234,f:{x:3243,z:"345345"}});
function test(){
    data_log("Calling_data",{ff:54,y:33});
    log.l("data","work_correctly");
}
let real_model_4={
    sides:[
        ["a","b",33.30],
        ["b","c",32.20],
        ["c","d",31.85],
        ["d","a",32.20],
    ],
    hypotenuses:[
        ["a","c",51.20],
    ]
};
let result=area(real_model_4.sides,real_model_4.hypotenuses);
info("result",result);
test();