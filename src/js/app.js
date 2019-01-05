import $ from 'jquery';
const viz=require('viz.js');

import {parseCode} from './code-analyzer';
import {parser} from './code-analyzer';

import {substitution} from './code-substitution';

import {getFunc2} from './code-substitution';
import {draw1} from './code-graph';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let values=$('#values').val();
        let parsedCode = parseCode(codeToParse);
        parser(parsedCode.body);
        // let ans=getAns();
        // Printer(ans);
        substitution(values);

        let func2=getFunc2();

        let final=draw1(func2);

        document.getElementById('outputTable').innerHTML=viz('digraph{'+final+'}');
        // let graph=final.split('\n');
        // document.getElementById('outputTable').innerHTML=draw1($('#codePlaceholder').val());
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));});

});


// function Printer(json) {
//     var tr=$('<tr/>');
//
//     tr.append('<td class=\'out title Line\'>' + 'Line' + '</td>');
//     tr.append('<td class=\'out title Type\'>' + 'Type' + '</td>');
//     tr.append('<td class=\'out title Name\'>' + 'Name' + '</td>');
//     tr.append('<td class=\'out title Condition\'>' + 'Condition' + '</td>');
//     tr.append('<td class=\'out title Condition\'>' + 'Value' + '</td>');
//     $('#outputTable').append(tr);
//     for (var i = 0; i < json.length; i++) {
//         tr = $('<tr/>');
//         tr.append('<td class=\'out Line\'>' + json[i].Line + '</td>');
//         tr.append('<td class=\'out Type\'>' + json[i].Type + '</td>');
//         tr.append('<td class=\'out Name\'>' + json[i].Name + '</td>');
//         tr.append('<td class=\'out Condition\'>' + json[i].Condition + '</td>');
//         tr.append('<td class=\'out Value\'>' + json[i].Value + '</td>');
//         $('#outputTable').append(tr);
//     }
// }

// function getAns(){
//     return ans;
// }





