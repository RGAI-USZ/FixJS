function(ele, key, val){
            var hasValue = val !== undefined,
                type = ele != null && ele === ele.window ? 'window'
                    : (ele.nodeType === 9 ? 'document' : false);
            hasValue && /^\d+$/.test(val += '') && (val += 'px');
            return type ? baidu.dom._getWindowOrDocumentWidthOrHeight(ele, type, key)
                : (hasValue ? ele.style.width = val : baidu.dom._getWidthOrHeight(ele, key));
        }