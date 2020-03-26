const ONFULFILLED = 'ONFULFILLED'
const REJECTED = 'REJECTED'
const PENDDING = 'PENDDING'
function isPromise(data) {
    if ((typeof data === 'object' && data !== null) || typeof data === 'function') {
        if (typeof data.then === 'function') {
            return true
        } else {
            return false
        }
    } else {
        return false
    }       
}
function resolvePromise(promise, x, resolve, reject) {
    if (promise === x) {
        reject('err')
    }
}
class MyPromise {
    constructor(fn) {
        this.status = PENDDING
        this.value = null
        this.reason = null
        this.onfulfilledList = []
        this.rejectedList = []
        this.resolve = (value) => {
            if (this.status === PENDDING) {
                this.status = ONFULFILLED
                this.value = value
                this.onfulfilledList.forEach(v => v())
            }

        }
        this.reject = (reason) => {
            if (this.status === PENDDING) {
                this.status = REJECTED
                this.reason = reason
                this.rejectedList.forEach(v => v())
            }
        }
        try {
            fn(this.resolve, this.reject)
        } catch (e) {
            this.reject(e)
        }
    }
    then(onfulfilled, rejected) {
        const promise2 = new MyPromise((res, rej) => {
            if (this.status === ONFULFILLED) {
                setTimeout(() => {
                    let x = onfulfilled(this.value)
                    resolvePromise(promise2,x,res,rej)
                }) 
            }
            if (this.status === REJECTED) {
                setTimeout(() => {
                    let x = rejected(this.reason)
                    resolvePromise(promise2,x,res,rej)
                })   
            }
            if (this.status === PENDDING) {
                setTimeout(() => {
                    this.onfulfilledList.push(() => {
                        let x = onfulfilled(this.value)
                        resolvePromise(promise2,x,res,rej)
                    })
                    this.rejectedList.push(() => {
                        let x = rejected(this.reason)
                        resolvePromise(promise2,x,res,rej)
                    })
                })
               
            }
        })
        return promise2
    }
}