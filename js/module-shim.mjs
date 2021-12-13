"use strict";
export {exportNamespace as default};

function exportNamespace(namespace){
    for(const property of Object.getOwnPropertyNames(namespace)){
        let propType = typeof(namespace[property]);
        if(propType == "number" || propType == "string" || propType == "boolean"){
            console.warn("property "+property+" is byval and copies will not function.");
            window[property] = namespace[property];
        }
        else{
            window[property] = namespace[property];
        }
    }
}






