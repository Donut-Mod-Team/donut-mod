/**
 * Method for selecting a dataset
 * @param {data} d
 */
export function select(d) {
    d.data.mark();
}
/**
 * Method for clearing the selected dataView elements
 * @param {data} d
 */
export function unSelect(d) {
    // TODO: check if we can improve the logic for clear marking
    if (d.length > 0) {
        d[0].clearMarking();
    }
}
