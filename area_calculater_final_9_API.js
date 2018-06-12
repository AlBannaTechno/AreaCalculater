const util = require('util');
let _main_log=require('./hyper_log'); // there is a problem with using new require('./hyper_log')();
let log=new _main_log();
log.show("info");
log.hide(["error","waringi"]);
function getThirdSide(side1,side2,angle){
    let po2=function(num){return Math.pow(num,2);};
    return Math.sqrt(((po2(side1)+po2(side2))-2*side1*side2*Math.cos(angle*180/Math.PI)));
}
function TriangleCalculator(sideA,sideB,sideC){
    let s=(sideA+sideB+sideC)/2;
    let area=Math.sqrt(s*(s-sideA)*(s-sideB)*(s-sideC));
    let po2=function(num){return Math.pow(num,2)};
    let deg=function(rad){return rad*180.0/Math.PI};
    let finalDegree=function(num){return deg(Math.acos(num))};
    let a=finalDegree((po2(sideB)+po2(sideC)-po2(sideA))/(2*sideB*sideC));
    let b=finalDegree((po2(sideA)+po2(sideC)-po2(sideB))/(2*sideA*sideC));
    let c=finalDegree((po2(sideA)+po2(sideB)-po2(sideC))/(2*sideA*sideB));
    return {area:area,angles:{a:a,b:b,c:c}};
}
function arraysEqual(arr1, arr2) {
    if(arr1.length !== arr2.length)
        return false;
    for(let i = arr1.length; i--;) {
        if(arr1[i] !== arr2[i])
            return false;
    }
    return true;
}
function isArrInArray(sub,main){
    // some : end loop when true returned
    return main.some(function(item){
        return arraysEqual(sub,item)
    });
}
function getAnglesNamed(triangles){
    return triangles.map(function(triangle){ // every triangle : [[a,b,length],[b,c,length],[c,d,length]]
        let tri=[triangle[0][2],triangle[1][2],triangle[2][2]];
        let result=TriangleCalculator(...tri);
        return {
            area:result.area,
            angles:[
                [
                    [triangle[0][0],triangle[1][1],triangle[0][1]],
                    result.angles.a
                ],
                [
                    [triangle[0][1],triangle[0][0],triangle[1][1]],
                    result.angles.b
                ],
                [
                    [triangle[0][0],triangle[0][1],triangle[1][1]],
                    result.angles.c
                ]
            ]
        }
    });
}
function generalCalculator(_sides={},_hypotenuses={},check_triangles=true){
    /*
        //sides :{A,B,C,D,E,F} => side :A = ab
        //in:{ac}
        sides={[a,b]=100,[b,c]}
     */
    let hyp_num=_sides.length-3;
    //check if this is pure triangle
    if(hyp_num===0){
        // TODO we need to refactor result to be as sides names
        // if we have one triangle we must put all it's sides in _sides parameter
        // new
        return getAnglesNamed([[_sides[0],_sides[1],_sides[2]]]);
        // return TriangleCalculator(...(_sides.map(function(item){
        //     return item[2];
        // })))
    }
    // First  check if sides arranged with clockwise direction
    _sides.slice(1).reduce(function(prev,current){
        if(prev[1]!==current[0]){
            throw Error("You must enter sides with clockwise direction , and must be arranged");
        }
        return current;
    },_sides[0]);
    // Second check if it is a closed shape : we must use this after clockwise check
    if(_sides[_sides.length-1][1]!==_sides[0][0]){
        throw Error("please Enter Closed Shape");
    }
    // second check _hypotenuses // very big problem but firstly : we will work  with one start point and multi ends : AC,AD,AE,...
    // Check if number of hypes = the needed num
    if(hyp_num!==_hypotenuses.length)
        throw "There is shortage in hypotenuses number please enter all hypotenuses";

    // get hypes names
    let hypes_check_list=[];
    for(let c=0;c<hyp_num;c++){
        hypes_check_list.push([_sides[0][0],_sides[c+1][1]]);
    }
    // check if all needed hypes in given hypes list
    let later_length_decision=_hypotenuses.length===hypes_check_list.length;
    if(!later_length_decision){
        throw "WARNING::CHECK_YOUR_HYPES_LIST_YOU_MAY_ENTERED_ADDITIONAL_VALUES";
    }
    _hypotenuses.map(function(item){
        if(!isArrInArray([item[0],item[1]],hypes_check_list))
            throw "ERROR::Check::hypotenuses::failed";
    });
    let triangles_num=hyp_num+1;

    let _temp_triangles=[];
    _temp_triangles.push([_sides[0],_sides[1],_hypotenuses[0]]); // add first triangle
    for(let c=0;c<triangles_num-2;c++){
        let _this_triangle=[_hypotenuses[c],_sides[c+2],_hypotenuses[c+1]];
        _temp_triangles.push(_this_triangle);
    }
    _temp_triangles.push([_hypotenuses[_hypotenuses.length-1],_sides[_sides.length-2],_sides[_sides.length-1]]); // add last triangle
    // check if every triangles is well sum of two sides in triangle must be >= the rest side
    if(check_triangles){
        _temp_triangles.map(function(triangle){
            let tri_sides=[triangle[0][2],triangle[1][2],triangle[2][2]];
            let m_l_s=tri_sides.indexOf(Math.max(...tri_sides)); // max length side
            let sum_length=0;
            for(let c=0;c<tri_sides.length;c++){if(c!==m_l_s){sum_length+=tri_sides[c]}}
            if(sum_length<tri_sides[m_l_s]){
                throw "ERROR::CHECK_TRIANGLES_THERE_IS_PROBLEM_WITH_TRIANGLE_EQUATION:A+B>=C, C : MAXIMUM-LENGTH\n"+util.inspect(triangle);
            }
        });
    }
    let triangles_results=[];
    triangles_results=getAnglesNamed(_temp_triangles);
    return [triangles_results,_sides.map(function(side){
        return side[0];
    })];
}
function AreaOrganizer(full_triangles_results){
    let triangles_results=full_triangles_results[0];
    let points=full_triangles_results[1];
    let total_area=triangles_results.reduce(function(prev,curr){
        return {area:prev.area+curr.area};
    },{area:0.0});
    let internal_angles={};
    // get serialize angles "string"
    for(let triangle of triangles_results){
        for(let angle of triangle.angles){
            internal_angles[angle[0].join()]=angle[1];
        }
    }
    // get required angle list
    let required_angles={};
    // first
    required_angles[triangles_results[0]["angles"][2][0]]=[triangles_results[0]["angles"][2][0].join()];
    // last-1
    required_angles[triangles_results[triangles_results.length-1]["angles"][0][0]]=[triangles_results[triangles_results.length-1]["angles"][0][0].join()];
    // rest angles
    let all_existed_corner_angles=[];
    function getRepeaterArr(arr,index){
        while(index>arr.length-1){
            index-=arr.length; // because 0
        }
        while(index<0){
            index+=arr.length;
        }
        return arr[index];
    }
    function getNextPoint(point){
        return getRepeaterArr(points,points.indexOf(point)+1);
    }
    for(let c=0; c<points.length;c++){
        all_existed_corner_angles.push([points[c],getRepeaterArr(points,c+1),getRepeaterArr(points,c+2)].join());
    }
    // get sub angles for every angle
    // first delete first and last-1 angle from all_existed_corner_angles because we get it
    delete all_existed_corner_angles[0]; // deleted will be undefined
    delete all_existed_corner_angles[all_existed_corner_angles.length-2];
    // get new list
    let _new__corner_list=[];
    all_existed_corner_angles=all_existed_corner_angles.map(function(item){
        if(item)_new__corner_list.push(item);
    });
    log.show("last_point");
    for(let c=0;c<_new__corner_list.length;c++){
        let f_corner_name=_new__corner_list[c].split(','); // we use this instead of do the inverse step and use Array compare operations , but with limitation : we can't use ',' in point name
        if(c===_new__corner_list.length-1){ // last element
            required_angles[_new__corner_list[c]]=[];
            for(let cc=0;cc<points.length-2;cc++){ // we need n-2 : corner angles to calculate base angle (a)
                required_angles[_new__corner_list[c]].push(
                    `${points[cc+1]},${points[0]},${points[cc+2]}`
                );
            }
        }
        else{
            required_angles[_new__corner_list[c]]=[
                [points[0],f_corner_name[1],f_corner_name[0]].join(),
                [points[0],f_corner_name[1],f_corner_name[2]].join()
            ];
        }
    }
    // calculate all all corner angles
    let final_corner_angles={};
    for(let corner_angle in required_angles){
        final_corner_angles[corner_angle]=0;
        for(let angle of required_angles[corner_angle]){
            final_corner_angles[corner_angle]+=internal_angles[angle];
        }
    }
    let total_internal_angles=0;
    for(let in_angle in final_corner_angles){
        total_internal_angles+=final_corner_angles[in_angle];
    }
    let total_internal_angles_in_real=(points.length-2)*180;
    let total_external_angles_in_real=(points.length+2)*180;
    let external_angles={};
    for(let angle in final_corner_angles){
        external_angles[angle]=360-final_corner_angles[angle];
    }
    let total_external_angles=0;
    for(let angle in external_angles){
        total_external_angles+=external_angles[angle];
    }
    // final result
    return {
        triangles:triangles_results,
        total_area:total_area.area,
        cornered_angles:final_corner_angles,
        internal_angles:internal_angles,
        external_angles:external_angles,
        total_internal_angles:total_internal_angles,
        total_internal_angles_in_real:total_internal_angles_in_real,
        total_external_angles:total_external_angles,
        total_external_angles_in_real:total_external_angles_in_real
    };
}
function AreaCalculator(sides={},hypotenuses={},check_triangles=true){
    return AreaOrganizer(generalCalculator(sides,hypotenuses,check_triangles));
}
module.exports.area=AreaCalculator;
module.exports.log=_main_log;