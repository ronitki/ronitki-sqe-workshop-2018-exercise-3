import * as esgraph from 'esgraph/lib';
//import * as viz from 'viz.js';
import * as esprima from 'esprima';
import {getFunc1} from './code-substitution';
import {parseCode} from './code-analyzer';


const draw1=(func)=>{
    //the right code

    let parsecode=parseCode(func);
    let cfg=esgraph(parsecode.body[0].body);
    let dot=esgraph.dot(cfg,{counter:0,source:func});
    let secondParsed=esprima.parseScript(func);
    let cfgtoCompare=esgraph(secondParsed.body[0].body);
    let dotToCompare=esgraph.dot(cfgtoCompare,{counter:0,source:func});
    let final=fixDot(dot,dotToCompare);

    return final;

};


const fixDot=(dot,dotToCompare)=>{
    dot = removeExceptions(dot);
    dotToCompare = removeExceptions(dotToCompare);
    dot=combineDeclaration(dot,dotToCompare);
    dotToCompare=removeDec(dotToCompare);
    dot=removeEmptyCells(dot);
    dot=changeShape(dot,dotToCompare);
    dot=removeStartAndExit(dot);
    dot=colorGraph(dot);
    dot=setNumbers(dot);
    dot=cleanGraph(dot);

    return dot;

};

const removeExceptions=(dot)=>{
    let array = dot.split('\n');
    for (var i=0; i<array.length; i++) {
        if(array[i].includes('exception')) {
            array.splice(i, 1);
        }
    }
    return arrayToString(array);

};

const arrayToString=(arr)=>{
    let ans = '';
    for (var i=0; i<arr.length; i++) {
        ans += arr[i].toString()+'\n';
    }
    return ans;
};

const combineDeclaration=(dot,dotToCompare)=>{
    let dotArray = dot.split('\n');
    let dotToCompareArray = dotToCompare.split('\n');
    for(var i=0; i<dotArray.length-1; i++){
        if(dotToCompareArray[i].includes('AssignmentExpression')&& dotToCompareArray[i+1].includes('AssignmentExpression')){
            if(checkEdge(dotArray,i)) {
                dotArray = changeDecLines(dotArray, i);
                dotToCompareArray.splice(i + 1, 1);
                i--;
            }
        }
    }
    return arrayToString(dotArray);
};
const removeDec=(dotToCompare)=>{
    let dotToCompareArray = dotToCompare.split('\n');
    for(var i=0; i<dotToCompareArray.length-1; i++){
        if(dotToCompareArray[i].includes('AssignmentExpression')&& dotToCompareArray[i+1].includes('AssignmentExpression')){
            if(checkEdge(dotToCompareArray,i)) {
                dotToCompareArray = changeDecLines(dotToCompareArray, i);
                //dotToCompareArray.splice(i + 1, 1);
                i--;
            }
        }
    }
    return arrayToString(dotToCompareArray);
};

const getLabel=(string)=>{
    let ans= string.substring(string.indexOf('label=')+7, string.indexOf('"]'));
    //let ans= string.substring(string.indexOf('label=')+7, string.length-2);
    return ans;
};
const getCondition=(string)=>{
    let ans= string.substring(string.indexOf('label=')+7, string.indexOf('",'));
    return ans;
};
const getNodeNumber =(str)=> {
    return str.substring(1, str.indexOf('[')-1);
};

const changeDecLines=(dotArray,i)=>{
    let newLine = getLabel(dotArray[i]) + '@%' + getLabel(dotArray[i+1]);
    dotArray[i] = dotArray[i].replace(getLabel(dotArray[i]), newLine);
    changeEdges(dotArray,i);
    dotArray.splice(i+1, 1);
    return dotArray;

};

const changeEdges=(dotArray,i)=>{
    let replaceEdge = 'n' + getNodeNumber(dotArray[i]) + ' -> n' + getNodeNumber(dotArray[i+1]) + ' []';
    let newEgde='n' + getNodeNumber(dotArray[i]) + ' -> n' + getNodeNumber(dotArray[i+2]) + ' []';
    let removeEdge = 'n' + getNodeNumber(dotArray[i+1]) + ' -> n' + getNodeNumber(dotArray[i+2]) + ' []';
    let removeN='n' + getNodeNumber(dotArray[i+1]);
    for (var k=0; k<dotArray.length; k++) {
        if(dotArray[k]===replaceEdge) {
            dotArray[k] = newEgde;
        } else if (dotArray[k] === removeEdge) {
            dotArray.splice(k, 1);
        }
    }
    dotArray=changeEdgesPart2(dotArray,i,removeN);
    return dotArray;
};
const changeEdgesPart2=(dotArray,i,removeN)=>{
    for (var k=0; k<dotArray.length; k++) {
        if(dotArray[k].includes(removeN+' -> ')) {
            let str=dotArray[k].substring(dotArray[k].indexOf('-> n')+4,dotArray[k].indexOf(' ['));
            if(str<getNodeNumber(dotArray[i+1]))
                dotArray[k]=dotArray[k].replace( getNodeNumber(dotArray[i+1]), getNodeNumber(dotArray[i]));
        }
    }
    return dotArray;
};

const checkEdge=(dotArray,i)=>{
    let ans=false;
    let edge = 'n' + getNodeNumber(dotArray[i]) + ' -> n' + getNodeNumber(dotArray[i+1]) + ' []';
    for (var k=0; k<dotArray.length; k++) {
        if(dotArray[k].includes(edge)) {
            ans=true;
            break;
        }
        else
            ans=false;
    }

    let pointed=' -> n' + getNodeNumber(dotArray[i+1]) ;
    let ans2=countArrows(pointed,dotArray);

    return ans&&ans2;

};
const countArrows=(pointed,dotArray)=>{
    let count=0;
    let ans=true;
    for ( var k=0; k<dotArray.length; k++) {
        if(dotArray[k].includes(pointed)) {
            count++;
        }
    }
    if(count>1)
        ans=false;
    return ans;
};

const changeShape=(dot,dotToCompare)=>{
    let dotArray = dot.split('\n');
    let dotToCompareArray = dotToCompare.split('\n');
    for(var i=0; i<dotArray.length; i++){
        if(dotToCompareArray[i].includes('BinaryExpression')){
            dotArray[i]=setShape(dotArray,i,'diamond');
        }
        else if(!dotToCompareArray[i].includes('->')) {
            dotArray[i]=setShape(dotArray,i,'box');
        }
        else{
            break;
        }

    }
    return arrayToString(dotArray);
};

const setShape=(array,i,shape)=>{
    let oldLine = array[i].substring(0, array[i].indexOf('"]'));
    let ans= oldLine + '", shape = "' + shape + '"]';
    return ans;
};

const removeEmptyCells=(dot)=>{
    let dotArray = dot.split('\n');
    for(var i=0; i<dotArray.length; i++) {
        if(dotArray[i]==='') {
            dotArray.splice(i,1);
        }
    }
    return arrayToString(dotArray);
};

const removeStartAndExit=(dot)=>{
    let dotArray = dot.split('\n');
    let entry='n0';
    let exit='n'+getExit(dotArray);
    for(var i=0; i<dotArray.length; i++){
        if(dotArray[i].includes(entry)||dotArray[i].includes(exit)){
            dotArray.splice(i, 1);
            i--;
        }

    }
    return arrayToString(dotArray);
};
const getExit=(dotArray)=>{
    var i=0;
    for(; i<dotArray.length; i++){
        if(dotArray[i].includes('->'))
            break;
    }
    return getNodeNumber(dotArray[i-1]);
};

const colorGraph=(dot)=>{
    let dotArray = dot.split('\n');

    var i=0;
    for(; i<dotArray.length; i++){
        if(dotArray[i].includes('->'))
            break;
    }
    let list=[];
    let counter=0;

    dotArray=colorGraphPart2(i,dotArray,counter,list);
    return arrayToString(dotArray);
};

const colorGraphPart2=(i,dotArray,counter,list)=>{
    for(var j=0;j<i;j++){
        if(list.includes('n'+getNodeNumber(dotArray[j]))){
            continue;
        }
        else {
            if (dotArray[j].includes('box')) {
                dotArray[j] = setColor(dotArray, j, 'green');
            }
            else if (dotArray[j].includes('diamond')) {
                let ans=colorCondition(j,dotArray,counter,list);
                j=ans[0];
                dotArray=ans[1];
                counter=ans[2];
                list=ans[3];
            }
        }
    }
    return dotArray;
};
const colorCondition =(j,dotArray,counter,list)=>{
    counter ++;let bool = false;
    let condition = getCondition(dotArray[j]);
    let toCompareConditions = getFunc1();
    let arrayOfConditions = toCompareConditions.split('\n');
    for (var k = 0; k < arrayOfConditions.length; k++) {
        if (arrayOfConditions[k].includes(condition) && arrayOfConditions[k].includes('green')) {
            bool = true;list = getRoute(dotArray, j, false);break;}}
    dotArray[j] = setColor(dotArray, j, 'green');j++;
    if (bool) {
        let ans=colorTrueRoute(j,dotArray,counter,list);
        j=ans[0];dotArray=ans[1];counter=ans[2];list=ans[3];}
    else {
        let ans=skipFalseRoute(j,dotArray,counter);
        j=ans[0];
        counter=ans[1];}
    return [j,dotArray,counter,list];
};

const colorTrueRoute=(j,dotArray,counter,list)=>{
    while (counter !== 0) {

        if (dotArray[j].includes('endOfWhile')) {
            list.splice(0,list.length);
            dotArray[j] = setColor(dotArray, j, 'green');
            counter--;}
        // else if(!dotArray[j].includes('end')) {
        //     dotArray[j] = setColor(dotArray, j, 'green');
        //     j++;}
        else {
            dotArray[j] = setColor(dotArray, j, 'green');
            counter--;}}
    return [j,dotArray,counter,list];
};
const skipFalseRoute=(j,dotArray,counter)=>{
    while (counter !== 0) {
        // if (!dotArray[j].includes('end')) {
        //     j++;
        // }j
        // else {
        counter--;
        //  }

    }
    return [j,counter];

};
const setColor=(array,i,color)=>{
    let oldLine = array[i].substring(0, array[i].indexOf('"]'));
    let ans= oldLine + '" , style="filled" , color="' + color + '"]';
    return ans;
};


const getRoute=(dotArray,j,bool)=>{
    let ans=[];
    let edge = 'n' + getNodeNumber(dotArray[j]);
    let str='';
    for ( var k=0; k<dotArray.length; k++) {
        if(dotArray[k].includes(edge+' -> ') && dotArray[k].includes(bool)) {
            str='n'+dotArray[k].substring(dotArray[k].indexOf('-> n')+4,dotArray[k].indexOf(' ['));
            ans.push(str);
        }
        else
            continue;
    }
    ans=getRoutePart2(dotArray,j,str,ans);
    return ans;

};

const getRoutePart2=(dotArray,j,str,ans)=>{
    for (  var k=0; k<dotArray.length; k++) {
        if(getLineByN(dotArray,str).includes('end')) {
            break;
        }
        else {
            ans=getRoutePart3(dotArray,j,str,ans,k);
        }
    }
    return ans;
};

const getRoutePart3=(dotArray,j,str,ans,k)=>{
    // if (dotArray[k].includes(str + ' -> ') && !dotArray[k].includes('label')) {
    //     str = 'n' + dotArray[k].substring(dotArray[k].indexOf('-> n') + 4, dotArray[k].indexOf(' ['));
    //     ans.push(str);
    // }
    //else
    if (dotArray[k].includes(str + ' -> ') && dotArray[k].includes('label')) {
        let temp=dotArray[k].substring(0,dotArray[k].indexOf('-')-1 );
        ans=ans.concat(getRoute(dotArray, getArrayNumber(dotArray,temp), 'false'));
        ans=ans.concat(getRoute(dotArray, getArrayNumber(dotArray,temp), 'true'));
    }
    return ans;
};



const getLineByN=(dotArray,n)=>{
    let ans='';
    for ( var k=0; k<dotArray.length; k++) {
        if('n'+getNodeNumber(dotArray[k])===n && !dotArray[k].includes('->')){
            ans=dotArray[k];
            break;
        }
    }
    return ans;

};
const getArrayNumber=(dotArray,n)=>{

    for ( var k=0; k<dotArray.length; k++) {
        if('n'+getNodeNumber(dotArray[k])===n && !dotArray[k].includes('->')){
            //ans=dotArray[k];
            break;
        }
    }
    return k;
};

const cleanGraph=(dot)=>{
    let dotArray = dot.split('\n');
    for ( var k=0; k<dotArray.length; k++) {
        if(dotArray[k].includes('@%')){
            dotArray[k]=dotArray[k].replace(/@%/gi,'\n');
        }
        if(dotArray[k].includes('+\\"endOfWhile\\"')){
            dotArray[k]=dotArray[k].replace('+\\"endOfWhile\\"','');
        }
        if(dotArray[k].includes('+\\"end\\"')){
            dotArray[k]=dotArray[k].replace('+\\"end\\"','');

        }
    }
    return arrayToString(dotArray);

};

const setNumbers=(dot)=>{
    let dotArray = dot.split('\n');
    let line=1;
    for ( var i=0; i<dotArray.length; i++) {
        if(dotArray[i].includes('->')){
            break;
        }
        else {
            let newLine = '(' + line + ')@%' + getLabel(dotArray[i]);
            dotArray[i] = dotArray[i].replace(getLabel(dotArray[i]), newLine);
            line++;
        }
    }
    return arrayToString(dotArray);

};

export{draw1};