/**
 * Method for selecting a dataset
 * @param {data} d
 */
export function select(d) {
    d.data.mark();
}
/**
 * Method for clearing the selected dataView elements
 * @param {Spotfire.DataView} data
 */
export function unSelect(data) {
    data.clearMarking();
}
