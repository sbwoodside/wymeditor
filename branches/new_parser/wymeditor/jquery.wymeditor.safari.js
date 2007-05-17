/*
* WYMeditor : what you see is What You Mean web-based editor
* Copyright (C) 2007 H.O.net - http://www.honet.be/
* Dual licensed under the MIT (MIT-license.txt)
* and GPL (GPL-license.txt) licenses.
*
* For further information visit:
*        http://www.wymeditor.org/
*
* File Name:
*        jquery.wymeditor.safari.js
*        Safari specific class and functions.
*        See the documentation for more info.
*
* File Authors:
*        Jean-Francois Hovinne (jf.hovinne@wymeditor.org)
*        Bermi Ferrer (wymeditor a-t bermi dotorg)
*/

function WymClassSafari(wym) {

  this._wym = wym;
  this._class = "WymClassSafari";
};

WymClassSafari.prototype.initIframe = function(iframe) {

  this._iframe = iframe;
  this._doc = iframe.document;

  //add css rules from options
  var styles = this._doc.styleSheets[0];
  var aCss = eval(this._options.aEditorCss);

  for(var i = 0; i < aCss.length; i++) {
    var oCss = aCss[i];
    if(oCss.name && oCss.css)
    styles.addRule(oCss.name, oCss.css);
  }

  this._doc.title = this._wym._index;

  //init html value
  $j(this._doc.body).html(this._wym._html);

  //handle events
  var wym = this;

  this._doc.onkeyup = function() {
    wym.keyup();
  };


  if(!this._initialized) {

    this._doc.title = this._wym._index;
    this._doc.designMode = "on";
    this.html(this._wym._html);
    if($j.isFunction(this._options.fPreBind)) this._options.fPreBind(this);

    $j(this._box).find(this._options.sToolSelector+','+this._options.sContainerSelector+','+this._options.sClassSelector).mousedown(function(e) {
      e.returnValue = false;
    });

    this.bindEvents();

    $j(this._box).click(function() { wym.update();});

    //post-init functions
    if($j.isFunction(this._options.fPostInit)) this._options.fPostInit(this);

    //add event listeners to doc elements, e.g. images
    this.listen();
    this._initialized = true;
  }

};

WymClassSafari.prototype._exec = function(cmd,param) {
  param = param || null;
  var emulateCommand = false;
  eval("emulateCommand = typeof this."+cmd+" != 'undefined'");
  if(!emulateCommand){
    this._doc.execCommand(cmd,false,param);
  }else{
    var wym = this;
    eval('wym.'+cmd+"(param);");
  }
};


// TODO: Implement
WymClassSafari.prototype.setFocusToNode = function(node) {

};


WymClassSafari.prototype.beforeParsing = function(raw)
{
  this.output = '';
  return raw.
  // Remove safari place holders
  replace(/([^>]*)<(\w+)><BR class\="khtml-block-placeholder"><\/\2>([^<]*)/g, "<$2>$1$3</$2>").
  // replace links to avoid loading them on the design mode iframe
  replace(/ href=/i, ' href="#" wym_href=');
}


WymClassSafari.prototype.openBlockTag = function(tag, attributes)
{
  var attributes = this.validator.getValidTagAttributes(tag, attributes);
  
  // Handle apple style spans
  if(attributes['class'] && attributes['class'] == 'Apple-style-span'){
    this._tag_stack.pop();
    attributes['class'] = '';
    if(attributes.style){
      var tag = this.getTagForStyle(attributes.style);
      this._tag_stack.push(tag);
      attributes.style = '';
    }else{
      return;
    }
  }

  this.output += this.helper.tag(tag, attributes, true);    
}


// Returns the tag name for a span Apple-style-span style.
WymClassSafari.prototype.getTagForStyle = function(sStyle) {

  if(/bold/.test(sStyle)) return 'strong';
  if(/italic/.test(sStyle)) return 'em';
  if(/sub/.test(sStyle)) return 'sub';
  if(/sub/.test(sStyle)) return 'super';
  return 'span';
}

// This is a workarround for select iframe safari bug
WymClassSafari.prototype.addWymHacksForEditMode = function(xhtml) {
  return '<span id="wym_safari_select_all_hack" style="height:0.01em;position:absolute;margin-top:-50px;">safari-hack</span>'+xhtml;
}

WymClassSafari.prototype.removeWymAttributesFromXhtml = function(xhtml) {
  return xhtml.replace('/ href="#" wym_',' ').replace(/<span id="wym_safari_select_all_hack"[^>]*>safari-hack<\/span>/, '');
}

WymClassSafari.prototype.update = function() {
  var html = this.xhtml();
  $j(this._element).val(this.removeWymAttributesFromXhtml(html));
  $j(this._box).find(this._options.sHtmlValSelector).val(this.removeWymAttributesFromXhtml(html));
};


WymClassSafari.prototype.bindEvents = function() {

  //copy the instance
  var wym = this;
  
  //handle click event on tools buttons
  $j(this._box).find(this._options.sToolSelector).click(function() {
    wym.exec($j(this).attr(sWYM_NAME));
    return(false);
  });
  
  //handle click event on containers buttons
  $j(this._box).find(this._options.sContainerSelector).click(function() {
    wym.container($j(this).attr(sWYM_NAME));
    return(false);
  });
  
  //handle keyup event on html value: set the editor value
  $j(this._box).find(this._options.sHtmlValSelector).keyup(function() {
    $j(wym._doc.body).html(wym.addWymHacksForEditMode($j(this).val()));
  });
  
  //handle click event on classes buttons
  $j(this._box).find(this._options.sClassSelector).click(function() {
  
    var aClasses = eval(wym._options.aClassesItems);
    var sName = $j(this).attr(sWYM_NAME);
    
    var oClass = aClasses.findByName(sName);
    
    if(oClass) {
      jqexpr = oClass.expr;
      wym.toggleClass(sName, jqexpr);
    }
    return(false);
  });
  
  //handle event on update element
  $j(this._options.sUpdateSelector)
    .bind(this._options.sUpdateEvent, function() {
      wym.update();
  });
};



WymClassSafari.prototype.InsertOrderedList = function(param) {

}

WymClassSafari.prototype.InsertUnorderedList = function(param) {

}

WymClassSafari.prototype.Indent = function(param) {

}

WymClassSafari.prototype.Outdent = function(param) {

}

WymClassSafari.prototype.Unlink = function(param) {

}

WymClassSafari.prototype.CreateLink = function(param) {

}

WymClassSafari.prototype.InsertImage = function(param) {

}
