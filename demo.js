/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

$(function () {
    'use strict';

    var writer = new Writer('.editor', {
        header1: 'h2',
        header2: 'h3'
    });
    
    $('.anchor-form').hide();
    
    $('#btn-onoff').click(function (e) {
        if ($('#btn-onoff i').hasClass('fa-toggle-on')) {
            writer.disable();
            $('#btn-onoff i').removeClass('fa-toggle-on');
            $('#btn-onoff i').addClass('fa-toggle-off');
        }
        else {
            writer.enable();
            writer.focus();
            $('#btn-onoff i').removeClass('fa-toggle-off');
            $('#btn-onoff i').addClass('fa-toggle-on');
        }
    });
    
    $('#btn-off').click(function (e) {
        writer.disable();
        $('#btn-on').show();
        $('#btn-off').hide();
    });
    
    $('#btn-bold').click(function (e) {
        writer.executeBold();
    });
    $('#btn-italic').click(function (e) {
        writer.executeItalic();
    });
    $('#btn-underline').click(function (e) {
        writer.executeUnderline();
    });
    $('#btn-strike').click(function (e) {
        writer.executeStrikethrough();
    });
    $('#btn-ol').click(function (e) {
        writer.executeOrderedList();
    });
    $('#btn-ul').click(function (e) {
        writer.executeUnorderedList();
    });
    $('#btn-super').click(function (e) {
        writer.executeSuperscript();
    });
    $('#btn-sub').click(function (e) {
        writer.executeSubscript();
    });
    $('#btn-h1').click(function (e) {
        writer.executeHeader1();
    });
    $('#btn-h2').click(function (e) {
        writer.executeHeader2();
    });
    $('#btn-pre').click(function (e) {
        writer.executePreformatted();
    });
    $('#btn-quote').click(function (e) {
        writer.executeBlockquote();
    });
    
    $('#btn-anchor').click(function (e) {
        if (writer.getSelectionNode().anchorNode.parentNode.tagName.toLowerCase() === 'a') {
            writer.executeUnlink();
        } else {
            var ref = prompt('Enter a URL:', 'http://');
            writer.executeLink(ref);
        }
        
    });
    
    $('.editor').focus();
});