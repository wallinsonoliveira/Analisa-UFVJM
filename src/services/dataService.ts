import Papa from 'papaparse';

export interface ProcessRecord {
  proReitoria: string;
  setor: string;
  status: string;
  ano: string;
  quantidade: number;
}

export interface ProcessData {
  records: ProcessRecord[];
  lastUpdated: string;
}

export const fetchData = async (): Promise<ProcessData> => {
  // In the future, this can be changed to a local CSV file path like '/data.csv'
  const url = '/data.csv';
  
  try {
    const response = await fetch(url);
    const csvText = await response.text();
    
    // Try to get the last modified date from the response headers
    const lastModified = response.headers.get('last-modified');
    const lastUpdated = lastModified ? new Date(lastModified).toISOString() : new Date().toISOString();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const records: ProcessRecord[] = [];
          results.data.forEach((row: any) => {
            const proReitoria = row['PRÓ-REITORIA'];
            const setor = row['SETORES'];
            const status = row['PROCESSOS'];
            
            ['2021', '2022', '2023', '2024', '2025'].forEach(ano => {
              records.push({
                proReitoria,
                setor,
                status,
                ano,
                quantidade: parseInt(row[ano], 10) || 0
              });
            });
          });
          resolve({ records, lastUpdated });
        },
        error: (error: any) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return { records: [], lastUpdated: new Date().toISOString() };
  }
};
