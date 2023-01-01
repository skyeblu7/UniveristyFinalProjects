import Typography from "@mui/material/Typography";
import {
  Bar, BarChart,
  CartesianGrid,
  Legend, Tooltip, XAxis,
  YAxis
} from "recharts";
import { TrendingCard } from "../types";

function CustomToolTip(props: { payload: any; label: any; active: boolean }) {
  const { payload, label, active } = props;
  if (active) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`${label} : ${payload[0].value}`}</p>
      </div>
    );
  }
}

const TrendingChart = (props: { trendingCards: TrendingCard[] }) => {
  const { trendingCards } = props;
  const data = [];
  for (let i = 1; i <= trendingCards.length; i++) {
    data.push({
      rank: i,
      card_name: trendingCards[i - 1].card_name,
      views: trendingCards[i - 1].views,
    });
  }

  return (
    <>
      <Typography variant="h5">Trending Card Views by Rank</Typography>
      <BarChart width={700} height={250} data={data} title="Trending Cards">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="rank" interval={0} width={50} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="views" fill="#8884d8" />
      </BarChart>
    </>
  );
};

export default TrendingChart;
