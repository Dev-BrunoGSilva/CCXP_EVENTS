import { useEffect, useState } from "react";
import axios from "axios";

const ITEMS_PER_PAGE = 50; // Quantidade de eventos por página

export default function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchEvents(page);
  }, [page]);

  const fetchEvents = async (page: number) => {
    setLoading(true);

    try {
      const response = await axios.post(
        "https://typesense.ccxp.com.br/multi_search?x-typesense-api-key=87UE3dBtOyjJpNU4TJIo4KOMiiasac93",
        {
          searches: [
            {
              query_by: "title, content, types, local, presenters, guests, day",
              query_by_weights: "100, 50, 1, 1, 90, 80, 1",
              sort_by: "_text_match:desc,localOrder:asc,startDate:asc",
              collection: "programacoes",
              q: "*",
              facet_by: "day,local,types",
              filter_by:
                "locale:pt-br && endDate:>1733208420 && day:=[`07/12 (sábado)`,`08/12 (domingo)`]",
              per_page: ITEMS_PER_PAGE,
              page,
            },
          ],
        }
      );

      const fetchedEvents = response.data.results[0].hits.map(
        (hit: any) => ({
          id: hit.document.id,
          ...hit.document,
        })
      );

      setEvents((prevEvents) => [...prevEvents, ...fetchedEvents]);
      setHasMore(fetchedEvents.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore) setPage((prevPage) => prevPage + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white shadow-md rounded-lg p-4 hover:bg-gray-50"
          >
            <h2 className="text-lg font-semibold text-gray-800">
              {event.title}
            </h2>
            <p className="text-gray-600">
              Horário:{" "}
              {new Date(event.startDate * 1000).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        ))}
      </div>
      {loading && <p>Carregando...</p>}
      {hasMore && !loading && (
        <button
          onClick={loadMore}
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
        >
          Ver Mais
        </button>
      )}
    </div>
  );
      }
