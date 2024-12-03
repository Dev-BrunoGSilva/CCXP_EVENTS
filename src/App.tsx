import { useEffect, useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import axios from "axios";
import "react-tabs/style/react-tabs.css";

const ITEMS_PER_PAGE = 50; // Quantidade de eventos por página

interface Event {
  id: string;
  title: string;
  day: string;
  local: string;
  startDate: number;
}

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

  // Organizar eventos por dia
  const eventsByDay = events.reduce<Record<string, Event[]>>((acc, event) => {
    if (!acc[event.day]) acc[event.day] = [];
    acc[event.day].push(event);
    return acc;
  }, {});

  const tabColors = [
    "bg-red-400", // Tom coral
    "bg-yellow-400", // Amarelo vibrante
    "bg-teal-400", // Azul esverdeado
    "bg-blue-400", // Azul claro
    "bg-purple-400", // Roxo pastel
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-gray-700">Eventos</h1>
      <Tabs className="w-full max-w-6xl">
        <TabList className="flex justify-center gap-4 my-4">
          {["Todos", ...Object.keys(eventsByDay)].map((tab, index) => (
            <Tab
              key={tab}
              className={`px-6 py-3 rounded-lg font-semibold text-white shadow-lg cursor-pointer transform transition-transform duration-200 hover:scale-105 ${tabColors[index % tabColors.length]}`}
              selectedClassName="border-4 border-white scale-110"
            >
              {tab}
            </Tab>
          ))}
        </TabList>

        {/* Painel de Todos os Eventos */}
        <TabPanel>
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
        </TabPanel>

        {/* Painéis por Dia */}
        {Object.keys(eventsByDay).map((day, index) => (
          <TabPanel key={day}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {eventsByDay[day].map((event) => (
                <div
                  key={event.id}
                  className="bg-white shadow-md rounded-lg p-4 hover:bg-gray-50"
                >
                  <h2 className="text-lg font-semibold text-gray-800">
                    {event.title}
                  </h2>
                  <p className="text-gray-600">
                    Horário:{" "}
                    {new Date(event.startDate * 1000).toLocaleTimeString(
                      "pt-BR",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
              ))}
            </div>
          </TabPanel>
        ))}
      </Tabs>
    </div>
  );
                            }
