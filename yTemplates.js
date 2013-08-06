var generateView = ( function () {
    var
    getStrPos = function ( str, substr ) {
        var pos = str.indexOf(substr), positions = [];
        
        while(pos > -1) {
            positions.push(pos);
            pos = str.indexOf(substr, pos+1);
        }
    
        return positions;
    },

    chars = function(str) {
      if (str == null) return [];
      return str.split('');
    },
    
    strSplice = function (start, length, word, str) {
      var arr = chars(str);
      arr.splice(start, length, word);
      return arr.join('');  
    },
    
    getVars = function ( template ) {
        var 
        varLocs = {},
        openVar  = "{{",
        closeVar = "}}";
    
        varLocs.startIdxs = getStrPos( template, openVar );
        varLocs.closeIdxs = getStrPos( template, closeVar );
        
        return varLocs;    
    },
    
    getObjVal = function (objStr, data) {
        var 
        objStr = objStr.split("."),
        nextLevel,
        i = 0, l = objStr.length,
        value = data;

        if (!value || $.isEmptyObject(value)) return;

        while ( i < l ) {
            nextLevel = objStr[i];
            value = value[ nextLevel ] ? value[ nextLevel ] : false;
            if ( !value ) return;
            i += 1;
        }
        
        return $.trim( value );
    },
    
    extractVarVals = function (valArr, data) {
        var
        i = 0,
        l = valArr.length;
        
        for ( ; i < l; i += 1) {
            if ( !(valArr[i].value = getObjVal(valArr[i].objStr , data)) ) {
            	valArr.splice(i,1);
            	i--;
            	l--;
            }
        }

        return valArr;
    },
    
    injectVarVals = function ( varList, template ) {
        var 
        i = 0,
        l = varList.length,
        start, stop, range, valLen, value, adjust = 0;
        
        for ( ; i < l ; i += 1 ) {
            
            value  = $.trim( varList[i].value );
            valLen = varList[i].value.length;  
            
            start = varList[i].range[0];
            stop  = varList[i].range[1];    
            range = stop - start;
            
           
            if (i > 0) {
                start = varList[i].range[0] + adjust;
                stop  = varList[i].range[1] + adjust;    
                range = stop - start;
            }
                
            template = strSplice( start, range, value , template  );
            
            adjust += valLen - range;
        }
        
        return template;
    },
    
    getVarValues = function ( template ) {
        var 
        varLocs   = getVars( template ),
        startLocs = varLocs.startIdxs,
        endLocs   = varLocs.closeIdxs,
        
        len_sl = startLocs.length,
        len_el = endLocs.length,
        i, pos1, pos2, range,
        
        varList = [], varItem;
    
        
        if (len_sl !== len_el) return false; // un-even var braces!
        
        i = 0;
        for ( ; i < len_sl; i += 1 ) {
            pos1  = startLocs[i];
            pos2  = endLocs[i];
            
            varList.push({
                range  : [pos1, pos2 + 2],
                objStr : $.trim( template.slice(pos1 + 2, pos2) ) 
            });
            
        }
        
        return varList;
    };
    
    return function ( template, data ) {
        var varList;

        if ( typeof template !== "string" || typeof data !== "object" ) return;

        varList = getVarValues( template );

		extractVarVals( varList, data );

        return injectVarVals( varList, template );
    };
            
}());