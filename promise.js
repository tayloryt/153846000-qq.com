const ONFULFILLED = "ONFULFILLED";
const REJECTED = "REJECTED";
const PENDDING = "PENDDING";
function isPromise(data) {
  return (
    (typeof data === "object" && data !== null) || typeof data === "function"
  );
}
function resolvePromise(promise, x, resolve, reject) {
  if (promise === x) {
    reject(new TypeError("Chaining cycle detected for promise #<Promise>"));
  } else if (isPromise(x)) {
    try {
      let then = x.then;
      if (typeof then === "function") {
        then.call(
          x,
          y => {
            resolvePromise(promise, y, resolve, reject);
          },
          r => {
            resolvePromise(promise, r, resolve, reject);
          }
        );
      } else {
        resolve(x);
      }
    } catch (e) {
      reject(e);
    }
  } else {
    resolve(x);
  }
}
class MyPromise {
  constructor(fn) {
    this.status = PENDDING;
    this.value = null;
    this.reason = null;
    this.onfulfilledList = [];
    this.rejectedList = [];
    this.resolve = value => {
        if(value instanceof MyPromise){
            return value.then(this.resolve,this.reject)
        }
      if (this.status === PENDDING) {
        this.status = ONFULFILLED;
        this.value = value;
        this.onfulfilledList.forEach(v => v());
      }
    };
    this.reject = reason => {
      if (this.status === PENDDING) {
        this.status = REJECTED;
        this.reason = reason;
        this.rejectedList.forEach(v => v());
      }
    };
    try {
      fn(this.resolve, this.reject);
    } catch (e) {
      this.reject(e);
    }
  }
  then(onfulfilled, rejected) {
    onfulfilled = typeof onfulfilled === "function" ? onfulfilled : val => val;
    rejected =
      typeof rejected === "function"
        ? rejected
        : val => {
            throw val;
          };
    const promise2 = new MyPromise((res, rej) => {
      if (this.status === ONFULFILLED) {
        setTimeout(() => {
          try {
            let x = onfulfilled(this.value);
            resolvePromise(promise2, x, res, rej);
          } catch (e) {
            rej(e);
          }
        }, 0);
      }
      if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = rejected(this.reason);
            resolvePromise(promise2, x, res, rej);
          } catch (e) {
            rej(e);
          }
        }, 0);
      }
      if (this.status === PENDDING) {
        // setTimeout(() => {
        this.onfulfilledList.push(() => {
          let x = onfulfilled(this.value);
          resolvePromise(promise2, x, res, rej);
        });
        this.rejectedList.push(() => {
          let x = rejected(this.reason);
          resolvePromise(promise2, x, res, rej);
        });
        // })
        //
      }
    });
    return promise2;
  }
  catch(callback){
      return this.then(null,callback)
  }
}
