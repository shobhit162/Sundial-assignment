import React, { useState, useEffect } from "react";
import KpiCard from "./components/KpiCard";

interface Metric {
  id: string;
  displayName: string;
  isPercentageMetric: boolean;
}

interface Segment {
  segmentId: string;
  displayName: string;
}

interface SegmentGroup {
  segmentKey: string;
  displayName: string;
  values: Segment[];
}

const App: React.FC = () => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [segmentGroups, setSegmentGroups] = useState<SegmentGroup[]>([]);
  const [cards, setCards] = useState<
    {
      metric?: Metric;
      segmentGroup?: SegmentGroup;
      segment?: Segment;
      editMode: boolean;
    }[]
  >([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(
          "https://sundial-fe-interview.vercel.app/api/metrics"
        );
        if (!response.ok) {
          throw new Error(`Error fetching metrics: ${response.statusText}`);
        }
        const data = await response.json();
        setMetrics(data.data);
      } catch (error) {
        console.error("Failed to fetch metrics:", error);
        setMetrics([]);
      }
    };

    const fetchSegmentGroups = async () => {
      try {
        const response = await fetch(
          "https://sundial-fe-interview.vercel.app/api/segments"
        );
        if (!response.ok) {
          throw new Error(
            `Error fetching segment groups: ${response.statusText}`
          );
        }
        const data = await response.json();
        setSegmentGroups(data.data);
      } catch (error) {
        console.error("Failed to fetch segment groups:", error);
        setSegmentGroups([]);
      }
    };

    fetchMetrics();
    fetchSegmentGroups();
  }, []);

  const addCard = (index: number) => {
    const newCards = [...cards];
    newCards.splice(index, 0, { editMode: true });
    setCards(newCards);
  };

  const saveCard = (
    index: number,
    metric: Metric,
    segmentGroup: SegmentGroup,
    segment: Segment
  ) => {
    const newCards = [...cards];
    newCards[index] = { metric, segmentGroup, segment, editMode: false };
    setCards(newCards);
  };

  const cancelCard = (index: number) => {
    const newCards = [...cards];
    newCards.splice(index, 1);
    setCards(newCards);
  };

  const editCard = (index: number) => {
    const newCards = [...cards];
    const selectedCard = newCards[index];
    newCards[index] = { ...selectedCard, editMode: true };
    setCards(newCards);
  };

  const getGridColsClass = () => {
    if (cards.length === 1 || cards.length === 0) return "grid-cols-1";
    if (cards.length === 2) return "grid-cols-2";
    return "grid-cols-3";
  };

  return (
    <div
      className={`grid ${getGridColsClass()} gap-0.5 max-w-6xl w-full p-4 mx-auto`}
    >
      {cards.map((card, index) => (
        <div
          key={index}
          className={`relative ${
            index > 0 && index % 3 !== 0
              ? "border-dotted border-gray-300 border-l-2"
              : ""
          } ${index >= 3 ? "border-t-2 border-dotted border-gray-300" : ""}`}
        >
          <KpiCard
            metric={card.metric}
            segmentGroup={card.segmentGroup}
            segment={card.segment}
            metricList={metrics}
            segmentGroupList={segmentGroups}
            onSave={(metric, segmentGroup, segment) =>
              saveCard(index, metric, segmentGroup, segment)
            }
            onCancel={() => cancelCard(index)}
            onEdit={() => editCard(index)}
            editMode={card.editMode}
            isInitialCard={false}
          />
          {!card.editMode && (
            <button
              className="absolute z-10 flex justify-center items-center h-7 top-1/2 left-2.5 transform -translate-y-1/2 -translate-x-full bg-green-600 p-2 rounded-full text-white opacity-10 hover:opacity-100 transition-opacity duration-300"
              onClick={() => addCard(index)}
            >
              +
            </button>
          )}
          {!card.editMode && (
            <button
              className="absolute z-10 flex justify-center items-center h-7 top-1/2 right-3 transform -translate-y-1/2 translate-x-full bg-green-600 p-2 rounded-full text-white opacity-10 hover:opacity-100 transition-opacity duration-300"
              onClick={() => addCard(index + 1)}
            >
              +
            </button>
          )}
        </div>
      ))}
      {cards.length === 0 && (
        <KpiCard
          metricList={metrics}
          segmentGroupList={segmentGroups}
          onSave={(metric, segmentGroup, segment) =>
            saveCard(0, metric, segmentGroup, segment)
          }
          editMode={true}
          isInitialCard={true}
        />
      )}
    </div>
  );
};

export default App;
