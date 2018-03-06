// Import locals
import { isNumeric } from 'lib/helpers';

/*
 Diff 
 */
const diffContents = (dbContent, newContent) => {
  /*
  Deep traversing of the object tree
   */
  function traverse(o, p) {
    if (typeof p == 'undefined') {
      p = '';
    }

    const objType1 = Object.prototype.toString.call(o);
    let objType2;

    function deepTraverse(o, i, p) {
      objType2 = Object.prototype.toString.call(o[i]);

      const np = isNumeric(i) ? p + '[' + i + '].' : p + i;

      if (objType2 === '[object Array]') {
        const newElems = findNewElements(o[i], np, i);
        console.log(newElems);
      }

      if (objType2 === '[object Object]' || objType2 === '[object Array]') {
        traverse(o[i], np);
      }
    }

    if (objType1 === '[object Object]') {
      for (let i in o) {
        deepTraverse(o, i, p);
      }
    } else if (objType1 === '[object Array]') {
      o.forEach((el, i) => deepTraverse(o, i, p));
    } else {
      throw new Error(
        'Sorry could not traverse. Object does not have any enumerable property.'
      );
    }
  }

  /*
    This version filters only newly added array properties
   */
  function findNewElements(arr, path, type) {
    const dbArr = dbContent[path];

    if (typeof dbArr == 'undefined') {
      return;
    }

    const addedContent = arr.filter(i => {
      // What does this array contain? Object or string
      if (i !== null && typeof i === 'object') {
        return (
          dbContent[path].findIndex(j => {
            // name && uuid is only for accounts
            // Extend this also for other types
            if (type === 'accounts') {
              return j.name === i.name && j.uuid === i.uuid;
            }
          }) === -1
        );
      } else if (typeof newKey === 'string') {
        return dbContent[path].indexOf(i) === -1;
      }
    });

    return { path: path, type: type, content: addedContent };
  }

  traverse(newContent);
};

export { diffContents };
