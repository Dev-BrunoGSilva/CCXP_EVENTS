import axios from "axios";
import { useEffect, useState } from "react";

// Definindo o tipo do evento
interface Event {
  title: string;
  day: string;
  local: string;
}

export default function App() {
  const [events, setEvents] = useState<Event[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Corpo da requisição POST
        const requestBody = {
          searches: [
            {
              query_by: "title, content, types, local, presenters, guests, day",
              query_by_weights: "100, 50, 1, 1, 90, 80, 1",
              sort_by: "_text_match:desc,localOrder:asc,startDate:asc",
              highlight_fields: "title",
              max_candidates: 4,
              highlight_full_fields:
                "title, content, types, local, presenters, guests, day",
              collection: "programacoes",
              q: "*",
              facet_by: "day,local,types",
              filter_by:
                "locale:pt-br && endDate:>1733208420 && day:=[`07/12 (sábado)`,`08/12 (domingo)`]",
              max_facet_values: 40,
              page: 1,
              per_page: 250,
            },
            {
              query_by: "title, content, types, local, presenters, guests, day",
              query_by_weights: "100, 50, 1, 1, 90, 80, 1",
              sort_by: "_text_match:desc,localOrder:asc,startDate:asc",
              highlight_fields: "title",
              max_candidates: 4,
              highlight_full_fields:
                "title, content, types, local, presenters, guests, day",
              collection: "programacoes",
              q: "*",
              facet_by: "day",
              filter_by: "locale:pt-br && endDate:>1733208420",
              max_facet_values: 40,
              page: 1,
            },
          ],
        };

        // Enviando requisição POST com Axios
        const response = await axios.post(
          "https://typesense.ccxp.com.br/multi_search?x-typesense-api-key=87UE3dBtOyjJpNU4TJIo4KOMiiasac93",
          requestBody, // Corpo da requisição
          {
            headers: {
              "Content-Type": "application/json", // Indicando que estamos enviando JSON
            },
          }
        );

        // Processa os resultados para guardar no estado
        setEvents(response.data.results[0].hits.map((hit: any) => hit.document));
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false); // Finaliza o carregamento
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      {loading ? (
        <h1 className="text-2xl text-gray-700">Carregando eventos...</h1>
      ) : (
        <div className="w-full max-w-4xl">
          {events ? (
            events.map((event: any, index: number) => (
              <div
                key={index}
                className="bg-white shadow-md rounded-lg p-4 mb-4"
              >
                <h2 className="text-xl font-semibold text-gray-800">
                  {event.title}
                </h2>
                <p className="text-gray-600">{event.day}</p>
                <p className="text-gray-600">{event.local}</p>
              </div>
            ))
          ) : (
            <h2 className="text-xl text-gray-700">Nenhum evento encontrado.</h2>
          )}
        </div>
      )}
    </div>
  );
}
