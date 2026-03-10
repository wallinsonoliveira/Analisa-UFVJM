import Papa from 'papaparse';

export interface ProcessRecord {
  proReitoria: string;
  setor: string;
  status: string;
  ano: string;
  quantidade: number;
}

export interface FetchDataResponse {
  records: ProcessRecord[];
  lastUpdated: string | null;
}

export const fetchData = async (): Promise<FetchDataResponse> => {
  // In the future, this can be changed to a local CSV file path like '/data.csv'
  const url = '/data.csv';
  
  try {
    const response = await fetch(url);
    const lastUpdated = response.headers.get('X-Last-Updated');
    const csvText = await response.text();
    
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
    return { records: [], lastUpdated: null };
  }
};
