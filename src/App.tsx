import axios from "axios";
import { useEffect, useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { FaStar, FaRegStar } from "react-icons/fa"; // Ícones para favoritos
import "react-tabs/style/react-tabs.css";

interface Event {
  id: string;
  title: string;
  day: string;
  local: string;
  startDate: number;
}

const CACHE_EXPIRATION_TIME = 60 * 60 * 1000;

export default function App() {
  const [events, setEvents] = useState<Event[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Event[]>([]);

  useEffect(() => {
    const storedFavorites = localStorage.getItem("favorites");
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  const saveFavorites = (favorites: Event[]) => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
    setFavorites(favorites);
  };

  const toggleFavorite = (event: Event) => {
    const isFavorite = favorites.some((fav) => fav.id === event.id);
    const updatedFavorites = isFavorite
      ? favorites.filter((fav) => fav.id !== event.id)
      : [...favorites, event];

    saveFavorites(updatedFavorites);
  };

  const isFavorite = (event: Event) =>
    favorites.some((fav) => fav.id === event.id);

  useEffect(() => {
    const fetchEvents = async () => {
      const cachedData = localStorage.getItem("events");
      const cachedTimestamp = localStorage.getItem("eventsTimestamp");

      if (
        cachedData &&
        cachedTimestamp &&
        Date.now() - parseInt(cachedTimestamp, 10) < CACHE_EXPIRATION_TIME
      ) {
        setEvents(JSON.parse(cachedData));
        setLoading(false);
        return;
      }

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
                per_page: 250,
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

        localStorage.setItem("events", JSON.stringify(fetchedEvents));
        localStorage.setItem("eventsTimestamp", Date.now().toString());
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const eventsByDay = events
    ? events.reduce<Record<string, Event[]>>((acc, event) => {
        if (!acc[event.day]) acc[event.day] = [];
        acc[event.day].push(event);
        return acc;
      }, {})
    : {};

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      {loading ? (
        <h1 className="text-2xl text-gray-700">Carregando eventos...</h1>
      ) : (
        <Tabs>
          <TabList>
            <Tab>Favoritos</Tab>
            {Object.keys(eventsByDay).map((day) => (
              <Tab classname="bg-rose-200" key={day}>{day}</Tab>
            ))}
          </TabList>

          <TabPanel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {favorites.length === 0 ? (
                <p className="text-gray-600">Nenhum evento favorito.</p>
              ) : (
                favorites.map((event) => (
                  <div
                    key={event.id}
                    className="bg-yellow-100 shadow-md rounded-lg p-4"
                  >
                    <h2 className="text-lg font-semibold text-gray-800">
                      {event.title}
                    </h2>
                    <p className="text-gray-600">
                      Horário:{" "}
                      {new Date(event.startDate * 1000).toLocaleTimeString(
                        "pt-BR",
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                    </p>
                    <button
                      onClick={() => toggleFavorite(event)}
                      className="text-yellow-500 text-2xl mt-2"
                    >
                      <FaStar />
                    </button>
                  </div>
                ))
              )}
            </div>
          </TabPanel>

          {Object.keys(eventsByDay).map((day) => (
            <TabPanel key={day}>
              <Tabs>
                <TabList>
                  {Array.from(
                    new Set(eventsByDay[day].map((event) => event.local))
                  ).map((local) => (
                    <Tab key={local}>{local}</Tab>
                  ))}
                </TabList>
                {Array.from(
                  new Set(eventsByDay[day].map((event) => event.local))
                ).map((local) => (
                  <TabPanel key={local}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                      {eventsByDay[day]
                        .filter((event) => event.local === local)
                        .map((event) => (
                          <div
                            key={event.id}
                            className="bg-white shadow-md rounded-lg p-4 hover:bg-gray-50"
                          >
                            <h2 className="text-lg font-semibold text-gray-800">
                              {event.title}
                            </h2>
                            <p className="text-gray-600">
                              Horário:{" "}
                              {new Date(
                                event.startDate * 1000
                              ).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            <button
                              onClick={() => toggleFavorite(event)}
                              className={`text-2xl mt-2 ${
                                isFavorite(event)
                                  ? "text-yellow-500"
                                  : "text-gray-400"
                              }`}
                            >
                              {isFavorite(event) ? <FaStar /> : <FaRegStar />}
                            </button>
                          </div>
                        ))}
                    </div>
                  </TabPanel>
                ))}
              </Tabs>
            </TabPanel>
          ))}
        </Tabs>
      )}
    </div>
  );
}
