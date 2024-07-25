import React, { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

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

interface KpiCardProps {
  metric?: Metric;
  segmentGroup?: SegmentGroup;
  segment?: Segment;
  metricList: Metric[];
  segmentGroupList: SegmentGroup[];
  onSave: (
    metric: Metric,
    segmentGroup: SegmentGroup,
    segment: Segment
  ) => void;
  onCancel?: () => void;
  onEdit?: () => void;
  editMode: boolean;
  isInitialCard: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({
  metric,
  segmentGroup,
  segment,
  metricList,
  segmentGroupList,
  onSave,
  onCancel,
  onEdit,
  editMode,
  isInitialCard,
}) => {
  const [data, setData] = useState<{ date: string; value: number }[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<Metric | undefined>(
    metric
  );
  const [selectedSegmentGroup, setSelectedSegmentGroup] = useState<
    SegmentGroup | undefined
  >(segmentGroup);
  const [selectedSegment, setSelectedSegment] = useState<Segment | undefined>(
    segment
  );
  const [totalValue, setTotalValue] = useState<number>(0);
  const [percentageChange, setPercentageChange] = useState<number>(0);

  useEffect(() => {
    if (!selectedMetric && metricList.length > 0) {
      setSelectedMetric(metricList[0]);
    }
    if (!selectedSegmentGroup && segmentGroupList.length > 0) {
      setSelectedSegmentGroup(segmentGroupList[0]);
      setSelectedSegment(segmentGroupList[0].values[0]);
    }
  }, [metricList, segmentGroupList]);

  useEffect(() => {
    if (
      !editMode &&
      selectedMetric &&
      selectedSegmentGroup &&
      selectedSegment
    ) {
      fetch("https://sundial-fe-interview.vercel.app/api/snapshot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metric: selectedMetric.id,
          segmentKey: selectedSegmentGroup.segmentKey,
          segmentId: selectedSegment.segmentId,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          const values = data.data.values;
          setData(values);

          const total = values.reduce(
            (sum: any, item: { value: any }) => sum + item.value,
            0
          );
          setTotalValue(total);

          if (values.length >= 7) {
            const previousTotal = values
              .slice(0, values.length - 7)
              .reduce((sum: any, item: { value: any }) => sum + item.value, 0);
            const recentTotal = values
              .slice(values.length - 7)
              .reduce((sum: any, item: { value: any }) => sum + item.value, 0);
            const change =
              ((recentTotal - previousTotal) / previousTotal) * 100;
            setPercentageChange(change);
          }
        })
        .catch((error) => console.error("Error fetching snapshot:", error));
    }
  }, [editMode, selectedMetric, selectedSegmentGroup, selectedSegment]);

  const handleSave = () => {
    if (selectedMetric && selectedSegmentGroup && selectedSegment) {
      onSave(selectedMetric, selectedSegmentGroup, selectedSegment);
    } else {
      console.error("Save failed: missing data", {
        selectedMetric,
        selectedSegmentGroup,
        selectedSegment,
      });
    }
  };

  const handleMetricChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMetric = metricList.find((m) => m.id === e.target.value);
    setSelectedMetric(newMetric);
  };

  const handleSegmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSegmentId = e.target.value;
    const segmentGroup = segmentGroupList.find((sg) =>
      sg.values.some((s) => s.segmentId === selectedSegmentId)
    );
    const segment = segmentGroup?.values.find(
      (s) => s.segmentId === selectedSegmentId
    );
    setSelectedSegmentGroup(segmentGroup);
    setSelectedSegment(segment);
  };

  const formatNumber = (value: number): string => {
    if (value >= 1_000_000_000) {
      return (value / 1_000_000_000).toFixed(1) + "B";
    } else if (value >= 1_000_000) {
      return (value / 1_000_000).toFixed(1) + "M";
    } else if (value >= 1_000) {
      return (value / 1_000).toFixed(1) + "K";
    } else {
      return value.toString();
    }
  };

  if (!metricList.length || !segmentGroupList.length) {
    return <div>Loading...</div>;
  }

  return (
    <div className="rounded p-4 m-2 min-w-[300px] w-full flex flex-col mt-20">
      {editMode ? (
        <div>
          <select
            className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:border-blue-500 block w-full p-2.5"
            name="metric"
            value={selectedMetric?.id || ""}
            onChange={handleMetricChange}
          >
            {metricList.map((metric) => (
              <option key={metric.id} value={metric.id}>
                {metric.displayName}
              </option>
            ))}
          </select>
          <select
            className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:border-blue-500 block w-full p-2.5 mt-4"
            name="segment"
            value={selectedSegment?.segmentId || ""}
            onChange={handleSegmentChange}
          >
            {segmentGroupList.map((segmentGroup) => (
              <optgroup
                key={segmentGroup.segmentKey}
                label={segmentGroup.displayName}
              >
                {segmentGroup.values.map((segment) => (
                  <option key={segment.segmentId} value={segment.segmentId}>
                    {segment.displayName}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <div className="flex justify-center pt-2">
            {!isInitialCard && (
              <button
                onClick={onCancel}
                className="bg-red-100 text-custom-red p-2 rounded-md mt-2 mr-2 px-10"
              >
                {totalValue ? "Delete" : "Cancel"}
              </button>
            )}
            <button
              onClick={handleSave}
              className={
                isInitialCard
                  ? "bg-custom-green text-white mt-4 p-2 rounded-md py-2 px-10 me-2"
                  : "bg-custom-green text-white p-2 rounded-md mt-2 px-11"
              }
            >
              {totalValue ? "Save" : "Add"}
            </button>
          </div>
        </div>
      ) : (
        <div onClick={onEdit} className="cursor-pointer">
          <div className="">
            <div className="flex gap-2 items-center">
              <h3 className="text-gray-700">{selectedMetric?.displayName},</h3>
              <p className="text-gray-700">{selectedSegment?.displayName}</p>
            </div>
            <div className="flex w-[100%]">
              <div className="w-[25%] flex flex-col justify-end">
                <div className="mb-2">
                  <h3 className="text-2xl text-black/[0.8] font-medium">
                    {formatNumber(totalValue)}
                  </h3>
                </div>
                <div>
                  <p
                    className={`text-sm ${
                      percentageChange >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {percentageChange >= 0 ? "↑" : "↓"}{" "}
                    {Math.abs(percentageChange).toFixed(2)}% Δ7d
                  </p>
                </div>
              </div>
              <div className="w-[75%]">
                <HighchartsReact
                  highcharts={Highcharts}
                  options={{
                    chart: {
                      type: "area",
                      height: 200,
                    },
                    title: { text: "" },
                    series: [
                      {
                        data: data.map((d) => d.value),
                        type: "area",
                        color: "green",
                        fillColor: {
                          linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                          stops: [
                            [0, "rgba(17, 159, 151, 0.4)"],
                            [1, "rgba(17, 159, 151, 0)"],
                          ],
                        },
                        lineWidth: 1.5,
                        marker: {
                          enabled: false,
                        },
                      },
                    ],
                    xAxis: { visible: false },
                    yAxis: { visible: false },
                    plotOptions: {
                      series: {
                        borderColor: "#111f97",
                        borderWidth: 1.5,
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KpiCard;
