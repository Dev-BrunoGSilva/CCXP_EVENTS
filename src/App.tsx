import React, { useState } from 'react';

interface ParsedData {
  headers: string[];
  rows: string[][];
}

export default function App() {
  const [selectedTab, setSelectedTab] = useState<string>('eventos');
  const [csvData, setCsvData] = useState<ParsedData | null>(null);
  const [docxData, setDocxData] = useState<string | null>(null);

  // Função para mudar a aba ativa
  const changeTab = (tab: string) => setSelectedTab(tab);

  // Função para ler arquivo CSV
  const handleCsvFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const parsed = parseCsv(result);
        setCsvData(parsed);
      };
      reader.readAsText(file);
    }
  };

  // Função para processar e parsear CSV
  const parseCsv = (data: string): ParsedData => {
    const rows = data.split('\n').map(row => row.split(','));
    const headers = rows.shift() || [];
    return { headers, rows };
  };

  // Função para ler arquivo DOCX (apenas texto simples neste exemplo)
  const handleDocxFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const docxText = extractTextFromDocx(result);
        setDocxData(docxText);
      };
      reader.readAsBinaryString(file);
    }
  };

  // Função simplificada para extrair texto de um DOCX (este é um exemplo simplificado)
  const extractTextFromDocx = (data: string): string => {
    return "Texto extraído do arquivo DOCX (aqui deveria vir o conteúdo real)";
  };

  return (
    <div>
      <div className="tabs">
        <button onClick={() => changeTab('eventos')}>Eventos</button>
        <button onClick={() => changeTab('importar')}>Importar Arquivos</button>
      </div>

      {selectedTab === 'eventos' && (
        <div>
          <h1>Eventos</h1>
          {/* Exibição de eventos (pode ser uma lista de dados) */}
          <div className="eventos">
            <p>Exemplo de exibição de eventos...</p>
          </div>
        </div>
      )}

      {selectedTab === 'importar' && (
        <div>
          <h1>Importar Arquivos</h1>
          <div>
            <h2>Carregar CSV</h2>
            <input type="file" accept=".csv" onChange={handleCsvFileUpload} />
            {csvData && (
              <div className="csv-table">
                <table>
                  <thead>
                    <tr>
                      {csvData.headers.map((header, index) => (
                        <th key={index}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <h2>Carregar DOCX</h2>
            <input type="file" accept=".docx" onChange={handleDocxFileUpload} />
            {docxData && (
              <div className="docx-content">
                <p>{docxData}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .tabs button {
          padding: 10px 20px;
          cursor: pointer;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 5px;
        }
        .tabs button:hover {
          background-color: #45a049;
        }
        .tabs button:focus {
          outline: none;
        }

        .csv-table table {
          width: 100%;
          border-collapse: collapse;
        }
        .csv-table th, .csv-table td {
          padding: 8px 12px;
          text-align: left;
          border: 1px solid #ddd;
        }

        .csv-table th {
          background-color: #f2f2f2;
        }

        .docx-content p {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
        }
      `}</style>
    </div>
  );
          }
              
