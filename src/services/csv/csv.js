// data = [['field 1', 'field 2'], ['row val 1', 'row val 2']]
// TODO: add more data formats
export const dataToCSV = (data) => {
    let csvString = ''

    for (var i = 0; i < data.length; i++) {
        var value = data[i]

        for (var j = 0; j < value.length; j++) {
            var innerValue = value[j] === null ? '' : value[j].toString()
            var result = innerValue.replace(/"/g, '""')
            if (result.search(/("|,|\n|\r\n|\r)/g) >= 0) {
                result = '"' + result + '"'
            }

            if (j > 0) {
                csvString += ','
            }
            csvString += result
        }

        csvString += '\r\n';
    }

    return csvString
}