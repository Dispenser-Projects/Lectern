/**
 * Class representing an Observable object on which entities can subscribe
 * <T> : The type of the value to observe
 */
export class Observable<T> {

    /** The value ot observe */
    value: T
    /** The list of all observers' entity for the value.
     * An observer define a callback function to call a each value changement
     * */
    readonly observers: Map<any, (value: T) => void> = new Map()

    /**
     * @param defaultValue the default value of the Observable
     */
    constructor(defaultValue: T) {
        this.value = defaultValue
    }

    /**
     * Change the value of the Observable.
     * If the new value is different from the old, all observers are notified of this changement
     * @param value the new value
     */
    setValue(value: T) {
        if(value !== this.value) {
            this.value = value
            this.observers.forEach(value1 => value1(value))
        }
    }

    /**
     * Return the current value of this Observable
     */
    getValue(): T {
        return this.value
    }

    /**
     * Add a new subscriber of the wrapped value state
     * @param uid an unique ID for this subscriber (can be <code>this</code>)
     * @param callback the function to call at each changement on <i>value<i/>
     */
    subscribe(uid: any, callback: (value: T) => void) {
        this.observers.set(uid, callback)
    }

    /**
     * Remove the entity represented by <i>uid</i> from the subscriber list
     * @param uid the unique ID of the entity
     */
    unsubscribe(uid: any) {
        this.observers.delete(uid)
    }
}
