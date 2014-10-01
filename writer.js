/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

var Writer = function (p_elem, p_options) {
     
    'use strict';
     
    var writer = {},
        writercont,
        storedSelection = {},
        defaultOptions = {
            header1: 'h1',
            header2: 'h2',
            placeholder: 'Start writing here!'
        },
        writerOptions = defaultOptions,
        blockElements = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'ul', 'ol', 'li'],
        elems,
        opt,
        placeholder;
     
    /*
     * Override default options with user p_options parameter
     */
    if (p_options && p_options !== undefined) {
        for (opt in defaultOptions) {
            if (defaultOptions.hasOwnProperty(opt) && p_options.hasOwnProperty(opt) === false) {
                p_options[opt] = defaultOptions[opt];
            }
        }
        writerOptions = p_options;
    }
     
    /*
     * Init the writer container using the p_elem parameter
     */
    if (p_elem && p_elem !== undefined) {
        elems = document.querySelectorAll(p_elem);
        if (elems && elems.length > 0) {
            writercont = elems[0];
        }
        if (!writercont) {
            return;
        }
    }
    
    /*
     * Returns the current selection ranges to store them.
     * Useful when trying to execute a link action where the 
     * editor is losing focus to enter the link ref.
     */
    function getSelectionRanges() {
        var i,
            len,
            ranges,
            sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            ranges = [];
            for (i = 0, len = sel.rangeCount; i < len; i += 1) {
                ranges.push(sel.getRangeAt(i));
            }
            return ranges;
        }
        return null;
    }

    /*
     * Restores the selection given as parameter
     */
    function restoreSelectionRanges(savedSel) {
        var i,
            len,
            sel = window.getSelection();
        if (savedSel) {
            sel.removeAllRanges();
            for (i = 0, len = savedSel.length; i < len; i += 1) {
                sel.addRange(savedSel[i]);
            }
        }
    }
     
    function setPlaceholder() {
        placeholder = document.createElement('p');
        placeholder.textContent = writerOptions.placeholder;
        writercont.appendChild(placeholder);
        placeholder.focus();
    }
     
    /*
     * Returns the current selection starting DOM node
     */
    function getSelectionStartNode() {
        var node = document.getSelection().anchorNode,
            startNode = (node && node.nodeType === 3 ? node.parentNode : node);
        return startNode;
    }
     
    /*
     * Stores the current selection object in the global storedSelection variable
     */
    function storeSelection() {
        var newSelection = window.getSelection();
        if (newSelection) {
            storedSelection.selection = newSelection;
            storedSelection.selectionRange = storedSelection.selection.getRangeAt(0);
        }
         
    }
     
    /*
     * Returns the first parent element of the given element that is a block
     * level element (these are defined in the global variable blockElements)
     */
    function getFirstBlockParentElement(el) {
        var tagName;
        if (el && el.tagName) {
            tagName = el.tagName.toLowerCase();
        }
 
        while (el && blockElements.indexOf(tagName) === -1) {
            el = el.parentNode;
            if (el && el.tagName) {
                tagName = el.tagName.toLowerCase();
            }
        }
 
        return el;
    }
    
    /*
     * Sets up the paragraph creation handler. This will make every enter key hit
     * to create a new paragraph overriding the browser default handler for the
     * enter key on contenteditable
     */
    function setParagraphCreationHandler() {
        writercont.addEventListener('keyup', function (e) {
            var node = getSelectionStartNode(),
                parentTag = node.parentNode.tagName.toLowerCase(),
                listTags = ['li', 'ul', 'ol'];
            if (node && node.classList.contains('writer-cont') && node.children.length === 0) {
                document.execCommand('formatBlock', false, 'p');
            }
            if (e.which === 13 && !e.shiftKey) {
                if (listTags.indexOf(parentTag) === -1) {
                    document.execCommand('formatBlock', false, 'p');
                }
            }
        });
    }
    
    /*
     * Backspace handler to prevent the deletion of the unique paragraph in case the
     * writer is empty
     */
    function setBackspaceHandler() {
        writercont.addEventListener('keydown', function (e) {
            var node = getSelectionStartNode();
            
            if (e.which === 8) {
                // if i'm the first paragraph (no siblings on top) and there's no text
                // then prevent backspace deleting me
                if (node.previousSibling === null && node.textContent.length === 0
                        && node.parentNode.classList.contains('writer-cont')) {
                    e.preventDefault();
                }
            }
        });
    }
     
    /*
     * Intercept paste event and get the clipboard data as plain text to avoid any
     * kind of styling to be introduced in the writer container
     */
    function setPastePlainTextHandler() {
        writercont.addEventListener("paste", function (e) {
            // cancel paste
            e.preventDefault();
            // get text representation of clipboard
            var text = e.clipboardData.getData("text/plain");
            // insert text manually
            document.execCommand("insertHTML", false, text);
        });
    }
     
    /*
     * Sets up the text selection handler that will store the current text selection
     * for further edition later
     */
    function setTextSelectionHandler() {
        document.documentElement.addEventListener('mouseup', storeSelection);
        writercont.addEventListener('keyup', storeSelection);
        writercont.addEventListener('blur', storeSelection);
    }
    
    /*
     * Handles the non wanted span creation done by Chrome. When a span element is 
     * created it removes it and moves it's content to the parent element.
     */
    function setSpanCreationHandler() {
        writercont.addEventListener('DOMNodeInserted', function (e) {
            if (e.target.tagName === 'SPAN') {
                var parent = e.target.parentNode;
                while (e.target.firstChild) {
                    parent.appendChild(e.target.firstChild);
                }
                parent.removeChild(e.target);
                console.log('removed browser created span elem');
            }
        });
    }
    
    /*
     * Insert new node after referenceNode
     */
    function insertAfter(newNode, referenceNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }
    
    /*
     * Executes a styling command over the current writer selected text.
     */
    function executeStylingCommand(p_command) {
        document.execCommand(p_command, false, null);
    }
     
    /*
     * Executes a formabtBlock command on the current writer selected text.
     */
    function executeFormatBlockCommand(p_command) {
        var parentBlockElem = getFirstBlockParentElement(storedSelection.selection.anchorNode);
        
        // Handle Firefox nesting blockquotes instead of removing it
        if (p_command === 'blockquote' && parentBlockElem.parentNode.tagName.toLowerCase() === 'blockquote') {
            return document.execCommand('outdent', false, null);
        }
        // Handle Firefox nesting other block elements inside blockquote
        if (parentBlockElem.parentNode.tagName.toLowerCase() === 'blockquote') {
            document.execCommand('outdent', false, null);
        }
        // If current block elem is same as command, then convert back to paragraph
        if (parentBlockElem.tagName.toLowerCase() === p_command) {
            p_command = 'p';
        }
        return document.execCommand('formatBlock', false, p_command);
    }
    
    /*
     * Executes an anchor action over the currently selected text. 
     */
    function executeLinkAction(reference) {
        document.execCommand('createLink', false, reference);
    }
    
    /*
     * Removes the link from the current selection
     */
    function executeUnlinkAction() {
        document.execCommand('unlink', false, null);
    }
     
    /*
     * Initialise writer container
     */
    writercont.setAttribute('contenteditable', 'true');
    writercont.classList.add('writer-cont');
    setPlaceholder();
    setBackspaceHandler();
    setParagraphCreationHandler();
    setTextSelectionHandler();
    setPastePlainTextHandler();
    setSpanCreationHandler();
     
     
    /**
     * Public API
     */
    
    writer.getSelectionNode = function () {
        return storedSelection.selection;
    };
    
    writer.getSelectionRanges = function () {
        return getSelectionRanges();
    };
    
    writer.restoreSelectionRanges = function (ranges) {
        restoreSelectionRanges(ranges);
    };
     
    writer.executeBold = function () {
        executeStylingCommand('bold');
    };
     
    writer.executeItalic = function () {
        executeStylingCommand('italic');
    };
     
    writer.executeUnderline = function () {
        executeStylingCommand('underline');
    };
     
    writer.executeStrikethrough = function () {
        executeStylingCommand('strikethrough');
    };
    
    writer.executeOrderedList = function () {
        executeStylingCommand('insertorderedlist');
    };
    
    writer.executeUnorderedList = function () {
        executeStylingCommand('insertunorderedlist');
    };
     
    writer.executeSuperscript = function () {
        executeStylingCommand('superscript');
    };
     
    writer.executeSubscript = function () {
        executeStylingCommand('subscript');
    };
     
    writer.executeHeader1 = function () {
        executeFormatBlockCommand(writerOptions.header1);
    };
     
    writer.executeHeader2 = function () {
        executeFormatBlockCommand(writerOptions.header2);
    };
     
    writer.executeBlockquote = function () {
        executeFormatBlockCommand('blockquote');
    };
     
    writer.executePreformatted = function () {
        executeFormatBlockCommand('pre');
    };
    
    writer.executeLink = function (reference) {
        executeLinkAction(reference);
    };
    
    writer.executeUnlink = function () {
        executeUnlinkAction();
    };
 
    return writer;
     
};
