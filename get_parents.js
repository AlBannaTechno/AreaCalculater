/*
ref : https://stackoverflow.com/questions/4609328/how-to-get-current-function-object-reference
-----------------------------------------------------------------------------------------------
This File Created To Get All parents of any function/object
TODO : Need To Document This file
By : Osama Al Banna (Al Banna Techno)
 */
let util=require('util');
let serialize=function(obj){
    return util.inspect(obj,false,null);
};
function checkIfFunctionIsTheMainCaller(func,direct=true,js_file=true){
    let name=func.name;
    if(name.length!==0) // we do this because anonymous function and main caller produce the same 0 length name
        return false;
    let args=func.arguments;
    if(args['3']!==undefined && args['4']!==undefined && typeof(args['3'])==="string" && typeof(args['4'])==="string" &&args['3'][0]===args['4'][0]){
        if(js_file && !direct){
            if(args[4].slice(args[4].length-3)==='.js'){
                return true;
            }
            else{
                return false;
            }
        }
        else{
            return true;
        }
    }

    return false;
}
function get_parents(limit){ // we can't use [limit=0]=>default value ; because strict mode prevent us it'may be a bug'
    let main_list=[]; // e: [name,[params]]
    let last=arguments.callee;
    let check_break=false;
    // if there is no limit
    if(limit===undefined){
        while(true){
            last=(function (ls){
                ls=ls.caller;
                if(checkIfFunctionIsTheMainCaller(ls)){
                    check_break=true;
                    return;
                }
                main_list.push([ls.name,ls.arguments,ls]);
                return ls;
            }(last));
            if(check_break)
                break;
        }
    }
    else if(typeof(limit)==="number"){
        let counter=0;
        while(counter<=limit){
            counter++;
            last=(function (ls){
                ls=ls.caller;
                if(checkIfFunctionIsTheMainCaller(ls)){
                    check_break=true;
                    return;
                }
                main_list.push([ls.name,ls.arguments,ls]);
                return ls;
            }(last));
            if(check_break)
                break;
        }
    }
    else if(typeof(limit)==="object"){
        // we will write long code to support high performance by using separate code instead of using if/else with polymorphism
        // let max=limit.max===0 ?0:limit.max || false;
        let max=null;
        // next steps to prevent problem when limit.max=0 : because 0 || false = false in javascript
        if(limit.max===0){
            max=0;
        }
        else{
            max=limit.max || false;
        }
        let name_limit=limit.name || false;
        let args_limit=limit.args || false ;
        let counter={c:0};
        console.log(name_limit&&args_limit);
        let both=limit.both===undefined ?true : limit.both; // if true will check of name&&args else check for every one on individual : default=true
        let _cm =max===0 || max; // check max
        let loop_check=()=>{return true;};
        if(_cm){// end step of prevent max=0 : problem
            loop_check=function(counter,max){
                counter.c++;
                return (counter.c-1)<=max;
            }
        }
        // we can't use !(name_limit&&args_limit)
        if(!name_limit && !args_limit){
            console.log("_cm:true::1");
            while(loop_check(counter,max)){
                counter++;
                console.log(counter);
                last=(function (ls){
                    ls=ls.caller;
                    if(checkIfFunctionIsTheMainCaller(ls)){
                        check_break=true;
                        return;
                    }
                    main_list.push([ls.name,ls.arguments,ls]);
                    return ls;
                }(last));
                if(check_break)
                    break;
            }
        }
        else if(name_limit && args_limit && both){
            console.log("_cm:true::2");
            while(loop_check(counter,max)){
                // console.log(counter);
                last=(function (ls){
                    ls=ls.caller;
                    if(checkIfFunctionIsTheMainCaller(ls)) // first check if this is not the final caller [main file]
                    {
                        check_break=true;
                        return;
                    }
                    // check matched pattern
                    if(ls.name===name_limit &&  serialize(ls.arguments)===serialize(args_limit)){
                        check_break=true;
                    }
                    main_list.push([ls.name,ls.arguments,ls]);
                    return ls;
                }(last));
                if(check_break)
                    break;
            }
        }
        else if(name_limit && args_limit&& !both){
            console.log("_cm:true::3");
            while(loop_check(counter,max)){
                last=(function (ls){
                    ls=ls.caller;
                    if(checkIfFunctionIsTheMainCaller(ls)) // first check if this is not the final caller [main file]
                    {
                        check_break=true;
                        return;
                    }
                    // check matched pattern
                    if(ls.name===name_limit ||  serialize(ls.arguments)===serialize(args_limit)){
                        check_break=true;
                    }
                    main_list.push([ls.name,ls.arguments,ls]);
                    return ls;
                }(last));
                if(check_break)
                    break;
            }
        }
        else if(name_limit && !args_limit){
            console.log("4");
            while(loop_check(counter,max)){
                last=(function (ls){
                    ls=ls.caller;
                    if(checkIfFunctionIsTheMainCaller(ls)) // first check if this is not the final caller [main file]
                    {
                        check_break=true;
                        return;
                    }
                    // check matched pattern
                    if(ls.name===name_limit){
                        check_break=true;
                    }
                    main_list.push([ls.name,ls.arguments,ls]);
                    return ls;
                }(last));
                if(check_break)
                    break;
            }
        }
        else if(args_limit && !name_limit){
            console.log("_cm:true::5");
            while(loop_check(counter,max)){
                last=(function (ls){
                    ls=ls.caller;
                    if(checkIfFunctionIsTheMainCaller(ls)) // first check if this is not the final caller [main file]
                    {
                        check_break=true;
                        return;
                    }
                    // check matched pattern
                    if(serialize(ls.arguments)===serialize(args_limit)){
                        check_break=true;
                    }
                    main_list.push([ls.name,ls.arguments,ls]);
                    return ls;
                }(last));
                if(check_break)
                    break;
            }
        }
    }
    return main_list;
}
module.exports.getParents=get_parents;
module.exports.serialize=serialize;
/*
Test :
To use test with browser
if (typeof require != 'undefined' && require.main==module) {
    fnName();
}
 */
if (require.main === module) {
    (function data(){
        (function sub2() {
            console.log(get_parents())
        })();
    }());
}
