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
        blockElements = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre'],
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
            var node = getSelectionStartNode();
            if (node && node.classList.contains('writer-cont') && node.children.length === 0) {
                document.execCommand('formatBlock', false, 'p');
            }
            if (e.which === 13 && !e.shiftKey) {
                document.execCommand('formatBlock', false, 'p');
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
         
        // If current block elem is same as command, then convert back to paragraph
        if (parentBlockElem.tagName.toLowerCase() === p_command) {
            p_command = 'p';
        }
        return document.execCommand('formatBlock', false, p_command);
    }
     
    /*
     * Initialise writer container
     */
    writercont.setAttribute('contenteditable', 'true');
    writercont.classList.add('writer-cont');
    setPlaceholder();
    setParagraphCreationHandler();
    setTextSelectionHandler();
    setPastePlainTextHandler();
     
     
    /**
     * Public API
     */
     
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
 
    return writer;
     
};
