
// import {parseCode} from './code-analyzer';
// import {parser} from './code-analyzer';

import {getAns} from './code-analyzer';
let global = [];
let local=[];
let assignment=[];
let flag=false;
let ans=getAns();
//let originalAns=getAns();
let i=0;
let func1='';
let func2='';
let tab=0;
let argVals=[];
let arrayForTest=[];



const substitution=(values)=>{
    reset();
    if (!flag) {
        while (ans[i].Type != 'Function Declaration') {
            global.push({key: ans[i].Name, value: ans[i].Value} );
            argVals.push(''+ans[i].Value);
            func1=func1+'let '+ans[i].Name+' = '+ans[i].Value+';\n';func2=func2+'let '+ans[i].Name+' = '+ans[i].Value+'; \n';
            i++;}}
    flag = true;
    func1=func1+'function '+ ans[i].Name+'('; func2=func2+'function '+ ans[i].Name+'(';
    var line = ans[i].Line;
    i++;
    while (ans[i].Line === line) {
        global.push({key: ans[i].Name, value: ans[i].Value});
        func1=func1+ans[i].Name+',';func2=func2+ans[i].Name+',';
        i++;}
    setValues(values);
    func1=func1.substring(0,func1.length-1);func1=func1+'){ \n ';func2=func2.substring(0,func2.length-1);func2=func2+'){ \n ';
    tab=tab+1;
    start();};


const start=() =>{
    while(i<ans.length) {

        part1();
        part2();
        part3();
        part4();

    }
    tab--;
    addTabs1();
    addTabs2();
    func1=func1+'}\n';
    func2=func2+'}\n';
    //replaceArrays1();
    //replaceArrays2();
    arrayForTest=func1.split('\n');


};
const ifSub=()=>{
    while(i<ans.length && ans[i].Type != 'End of If' ){
        part1();
        part2();
        part3();
        part4();

    }
    tab--;
    addTabs1();
    addTabs2();
    func1=func1+'} \n';
    func2=func2.substring(0,func2.length-5);
    func2=func2+'+"end"; \n ';
    func2=func2+'} \n';


    i++;

};
const elseIfSub=()=>{
    while(i<ans.length && ans[i].Type != 'End of ElseIf' ){
        part1();
        part2();
        part3();
        part4();
    }
    tab--;
    addTabs1();
    addTabs2();
    func1=func1+'} \n';
    func2=func2.substring(0,func2.length-5);
    func2=func2+'+"end"; \n ';
    func2=func2+'} \n';

    i++;

};
const whileSub=()=>{
    while(i<ans.length && ans[i].Type != 'End of While' ){
        part1();
        part2();
        part3();
        part4();
    }
    tab--;
    addTabs1();
    addTabs2();
    func1=func1+'}\n';
    func2=func2.substring(0,func2.length-5);
    func2=func2+'+"endOfWhile"; \n ';
    func2=func2+'}\n';
    i++;

};
const elseSub=()=>{
    while(i<ans.length && ans[i].Type != 'End of Else' ){
        part1();
        part2();
        part3();
        part4();
    }
    tab--;
    addTabs1();
    addTabs2();
    func1=func1+'}\n';
    func2=func2.substring(0,func2.length-5);
    func2=func2+'+"end"; \n ';
    func2=func2+'}\n';
    i++;

};
const inDic=(key,array)=>{
    for(var k=0; k<array.length; k++){
        if(array[k].key== key)
            return true;
    }
    return false;
};
const getValue=(key,array)=>{
    let v='';
    for(var k=0; k<array.length; k++){
        if(array[k].key== key)
            v= array[k].value;
    }
    return v;
};
const checkIf=()=>{
    addTabs1();addTabs2();
    let s='if(';
    var condition = '';var res1;
    func2=func2+s+ans[i].Condition+'){ \n';
    ans[i].Condition = ans[i].Condition + ''; let str=ans[i].Condition;
    res1 = ans[i].Condition.split(' ');
    for (var j = 0; j < res1.length; j++) {
        if (inDic(res1[j], assignment)) condition = condition + getValue(res1[j], assignment) + ' ';
        else if (inDic(res1[j], global)) condition = condition + res1[j] + ' ';
        else if (inDic(res1[j], local)) condition = condition + getValue(res1[j], local) + ' ';
        else condition = condition + res1[j] + ' ';}
    ans[i].Condition = condition;
    s=s+condition+' '+str+' ';color(s,condition);
    tab++;
    var temp = assignment.slice();
    i++;
    ifSub();
    assignment = temp;
};
const checkElseIf=()=>{
    addTabs1();addTabs2();
    let s='else if(';
    var condition = '';var res1;
    func2=func2+s+ans[i].Condition+'){ \n';
    ans[i].Condition = ans[i].Condition + ''; let str=ans[i].Condition;
    res1 = ans[i].Condition.split(' ');
    for (var j = 0; j < res1.length; j++) {
        if (inDic(res1[j], assignment)) condition = condition + getValue(res1[j], assignment) + ' ';
        else if (inDic(res1[j], global)) condition = condition + res1[j] + ' ';
        else if (inDic(res1[j], local)) condition = condition + getValue(res1[j], local) + ' ';
        else condition = condition + res1[j] + ' ';}
    ans[i].Condition = condition;
    s=s+condition+' '+str+' ';color(s,condition);
    tab++;
    var temp = assignment.slice();
    i++;
    elseIfSub();
    assignment = temp;
};
const checkWhile=()=>{
    addTabs1();addTabs2();
    let s='while(';func2=func2+'while(';
    var condition = '';var res1;
    func2=func2+ans[i].Condition+'){ \n';
    ans[i].Condition = ans[i].Condition + '';let str=ans[i].Condition;
    res1 = ans[i].Condition.split(' ');
    for (var j = 0; j < res1.length; j++) {
        if (inDic(res1[j], assignment)) condition = condition + getValue(res1[j], assignment) + ' ';
        else if (inDic(res1[j], global)) condition = condition + res1[j] + ' ';
        else if (inDic(res1[j], local)) condition = condition + getValue(res1[j], local) + ' ';
        else condition = condition + res1[j] + ' ';}
    ans[i].Condition = condition;
    s=s+condition+' '+str+' ';color(s,condition);
    //func1=func1+condition+'){ \n';
    tab++;var temp = assignment.slice();
    i++;
    whileSub();
    assignment = temp;
};
const checkElse=()=>{
    addTabs1();
    addTabs2();
    func1=func1+'else{ \n';
    func2=func2+'else{ \n';
    tab++;
    var temp = assignment.slice();
    i++;
    elseSub();
    assignment = temp;

};
const checkReturn=()=>{
    addTabs1();
    addTabs2();
    func1=func1+'return ';
    func2=func2+'return '+ans[i].Value+';\n';
    var value = '';
    var res;
    ans[i].Value = ans[i].Value + '';
    res = ans[i].Value.split(' ');
    for (var j = 0; j < res.length; j++) {
        if (inDic(res[j], global)) value = value + res[j] + ' ';
        else if (inDic(res[j], assignment)) value = value + getValue(res[j], assignment) + ' ';
        else if (inDic(res[j], local)) value = value + getValue(res[j], local) + ' ';
        else value = value + res[j] + ' ';
    }
    ans[i].Value = value;
    func1=func1+value+';\n';
    i++;

};
const checkVarAssi=()=>{
    var value = '';
    var res;
    checkVarAssiAddition();
    ans[i].Value = ans[i].Value + '';
    res = ans[i].Value.split(' ');
    for (var j = 0; j < res.length; j++) {
        if (inDic(res[j], global))
            value = value + res[j] + ' ';
        else if (inDic(res[j], assignment))
            value = value + getValue(res[j], assignment) + ' ';
        else if (inDic(res[j], local))
            value = value + getValue(res[j], local) + ' ';
        else
            value = value + res[j] + ' ';}
    ans[i].Value = value;
    checkVarAssi2();

};
const checkVarAssi2=()=>{
    if (ans[i].Type == 'Variable Declaration') {
        local.push({
            key: ans[i].Name,
            value: ans[i].Value});
        if(ans[i].Value.indexOf('[')>-1)
            setArrayValues(ans[i].Name,ans[i].Value,local);
        addTabs1();
        func1=func1+ans[i].Name+' = '+ans[i].Value+'; \n';
    }
    else {
        assignment.push({
            key: ans[i].Name,
            value: ans[i].Value});
        // if(!flag ||inDic(ans[i].Name, global)){
        addTabs1();
        func1=func1+ans[i].Name+' = '+ans[i].Value+'; \n';//}
    }
    i++;
};
const checkVarAssiAddition=()=>{
    // let tempName=ans[i].Name;
    // let tempValue=ans[i].Value;
    // while(ans[i].Name.indexOf('[')>-1 || ans[i].Name.indexOf(']')>-1|| ans[i].Value.indexOf('[')>-1 || ans[i].Value.indexOf('[')>-1){
    //     ans[i].Name=ans[i].Name.replace('[','#');
    //     ans[i].Name=ans[i].Name.replace(']','^');
    // }
    // while(ans[i].Value.indexOf('[')>-1 || ans[i].Value.indexOf('[')>-1){
    //
    // }
    if (ans[i].Type == 'Variable Declaration') {

        addTabs2();
        func2=func2+ans[i].Name+' = '+ans[i].Value+'; \n';
    }
    else {
        addTabs2();
        func2=func2+ans[i].Name+' = '+ans[i].Value+'; \n';
    }
};



const part1=()=>{
    if (i<ans.length && (ans[i].Type == 'Variable Declaration' || ans[i].Type == 'Assignment Expression')) {
        checkVarAssi();
    }

};
const part2=()=>{
    if (i<ans.length && (ans[i].Type == 'If Statement' )) {
        checkIf();
    }
    if (i<ans.length && ( ans[i].Type == 'ElseIf Statement' )) {
        checkElseIf();
    }


};
const part3=()=>{
    if ( i<ans.length && (ans[i].Type == 'While Statement')) {
        checkWhile();
    }
    if (i<ans.length && (ans[i].Type == 'Else Statement')) {
        checkElse();
    }

};
const part4=()=>{
    if (i<ans.length && (ans[i].Type == 'Return Statement')) {
        checkReturn();
    }
    if(i<ans.length && ans[i].Type == 'Unary Expression'){
        i++;
    }

};
//######
const addTabs1=()=>{
    for(var k=0; k<=tab; k++){
        func1=func1+'\t';

    }

};
const addTabs2=()=>{
    for(var k=0; k<=tab; k++){

        func2=func2+'\t';
    }

};
const checkCondition=(exp)=>{
    let toEval='';
    let list=exp.split(' ');
    for(var k=0; k<list.length; k++){
        if(inDic(list[k],global))
            toEval=toEval+getValue(list[k],global);
        // else if(inDic(list[k],assignment))
        //     toEval=toEval+getValue(list[k],assignment);
        // else if(inDic(list[k],local))
        //     toEval=toEval+getValue(list[k],local);
        else if(checkString(list[k]))
            toEval=toEval+list[k];
        else
            toEval=toEval+'"'+list[k]+'"';
    }


    var bool=eval(toEval);
    return bool;
};


const getFunc1=()=>{
    return func1;
};
const getFunc2=()=>{
    return func2;
};
const color=(s,condition)=>{
    if(checkCondition(condition)){
        func1=func1+'<span style="background-color:lightgreen;">'+s+'){ '+ '</span>'+'\n';
    }
    else  func1=func1+'<span style="background-color:lightcoral;">'+s+'){ '+'</span>'+'\n';

};
const setValues=(values)=>{
    let arrayHolder=[];
    while(values.indexOf('[')>-1){
        let res='['+values.slice(values.indexOf('[')+1,values.indexOf(']'))+']';
        arrayHolder.push(res);
        values=values.replace(res,'res');
    }
    setValuesPart2(values,arrayHolder);

};
const setValuesPart2=(values,arrayHolder)=>{
    if(values.indexOf(',')>-1){
        let split=values.split(',');
        for(var n=0; n<split.length; n++){
            argVals.push(split[n]);
        }
        for(var k=0; k<argVals.length; k++){
            if(argVals[k].includes('res')){
                global[k].value=''+arrayHolder.shift();
                setArrayValues(global[k].key,global[k].value,global);
            }
            else{
                global[k].value=argVals[k];
            }}}
    else{

        setValuesPart3(values,arrayHolder);
    }
};
const setValuesPart3=(values,arrayHolder)=>{
    if(values.includes('res')){
        global[0].value=''+arrayHolder.shift();
        setArrayValues(global[0].key,global[0].value,global);
    } else{global[0].value=values;}
};
const setArrayValues=(key,values,array)=>{
    values=values.replace('[','');
    values=values.replace(']','');
    let v='';
    if(values.indexOf(',')>-1){
        v=values.split(',');
    }
    else {v=[values];}
    for(var k=0; k<v.length; k++){
        array.push({key: key+'['+k+']', value: v[k]} );
    }

};

const getArray=()=>{
    return arrayForTest;
};
const reset=()=>{
    global = [];
    local=[];
    assignment=[];
    flag=false;
    ans=getAns();
    i=0;
    func1='';
    func2='';
    tab=0;
    argVals=[];
    arrayForTest=[];
    //temp=false;

};
const checkString=(str)=>{
    let oper=['+','-','*','/','(',')','<','>','=','==','===','!=','!==','<=','>=',' ',''];
    for(var k=0; k<oper.length; k++){
        if(oper[k]==str)
            return true;
    }
    if(!isNaN(str))
        return true;
    return false;
};
// const replaceArrays2=()=>{
//
//
//     while(func2.indexOf('[')>1 || func2.indexOf(']')>1){
//         func2=func2.replace('[','+"^"+');
//         func2=func2.replace(']','+"#"+');
//     }
//     //return func2;
// };
//
// const replaceArrays1=()=>{
//
//
//     while(func1.indexOf('[')>1 || func1.indexOf(']')>1){
//         func1=func1.replace('[','+"^"+');
//         func1=func1.replace(']','+"#"+');
//     }
//     // return func2;
// };



export {substitution};
export {getFunc1};
export {getFunc2};
export {getArray};

