import { useEffect, useRef, useState } from 'react';
import { rollups, mean } from 'd3-array';
import { Heatmap } from './Heatmap';
import { useDimensions } from './useDimensions';

const YEAR_START = new Date('2025-01-01');
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const CITIES = [
  { name: 'Reykjavik', lat: 64.15, lon: -21.94 },
  { name: 'Anchorage', lat: 61.22, lon: -149.9 },
  { name: 'Oslo', lat: 59.91, lon: 10.75 },
  { name: 'Moscow', lat: 55.75, lon: 37.62 },
  { name: 'London', lat: 51.51, lon: -0.13 },
  { name: 'Paris', lat: 48.85, lon: 2.35 },
  { name: 'New York', lat: 40.71, lon: -74.01 },
  { name: 'Tokyo', lat: 35.68, lon: 139.65 },
  { name: 'Los Angeles', lat: 34.05, lon: -118.24 },
  { name: 'Cairo', lat: 30.04, lon: 31.24 },
  { name: 'Delhi', lat: 28.61, lon: 77.21 },
  { name: 'Mexico City', lat: 19.43, lon: -99.13 },
  { name: 'Mumbai', lat: 19.08, lon: 72.88 },
  { name: 'Bangkok', lat: 13.76, lon: 100.5 },
  { name: 'Singapore', lat: 1.35, lon: 103.82 },
  { name: 'Nairobi', lat: -1.29, lon: 36.82 },
  { name: 'Jakarta', lat: -6.21, lon: 106.85 },
  { name: 'Lima', lat: -12.05, lon: -77.04 },
  { name: 'Rio de Janeiro', lat: -22.91, lon: -43.17 },
  { name: 'Cape Town', lat: -33.92, lon: 18.42 },
];

const url =
  'https://archive-api.open-meteo.com/v1/archive' +
  '?latitude=' + CITIES.map((c) => c.lat).join(',') +
  '&longitude=' + CITIES.map((c) => c.lon).join(',') +
  '&start_date=2025-01-01&end_date=2025-12-31' +
  '&daily=temperature_2m_mean&timezone=auto';

function App() {
  const wrapperRef = useRef(null);
  const { width, height } = useDimensions(wrapperRef);
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    fetch(url)
      .then((response) => response.json())
      .then((json) => {

        const daily = json.flatMap((city, i) =>
          city.daily.time.map((t, j) => ({
            city: CITIES[i].name,
            week: Math.min(
              51,
              Math.floor((new Date(t) - YEAR_START) / WEEK_MS)
            ),
            temp: city.daily.temperature_2m_mean[j],
          }))
        );

        
        const processed = rollups(
          daily,
          (v) => mean(v, (d) => d.temp),
          (d) => d.city,
          (d) => d.week
        ).flatMap(([city, weeks]) =>
          weeks.map(([week, temp]) => ({
            city,
            week: String(week),
            temp,
          }))
        );
        setHeatmapData(processed);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>Weather App</h2>
      <span className="subtitle">Weekly average temperatures in 2025 in degrees Celsius.</span>
      <div ref={wrapperRef} style={{ width: "100%", height: 450 }}>
        <Heatmap width={width} height={height} data={heatmapData}/>
      </div>
      <span className="credits" style={{ marginTop: 24, display: "block" }}>Source: Open Meteo</span>
    </div>
  );
}

export default App;