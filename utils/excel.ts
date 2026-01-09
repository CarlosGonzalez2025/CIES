import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], fileName: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const readExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet);
                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsBinaryString(file);
    });
};

export const generateTemplate = (columns: string[], fileName: string) => {
    const data = [columns.reduce((acc, col) => ({ ...acc, [col]: '' }), {})];
    const ws = XLSX.utils.json_to_sheet(data);
    // Clear the example row, leaving only headers
    // The library creates headers from keys, so row 2 (index 1) is empty data.
    // Actually simpler: just create sheet from array of arrays
    const wsUsingArray = XLSX.utils.aoa_to_sheet([columns]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsUsingArray, 'Plantilla');
    XLSX.writeFile(wb, `${fileName}_template.xlsx`);
};
