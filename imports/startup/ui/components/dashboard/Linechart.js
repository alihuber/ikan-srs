import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import format from 'date-fns/format';
import {
  LineController,
  LinearScale,
  Tooltip,
  CategoryScale,
  PointElement,
  LineElement,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import takeRight from 'lodash/takeRight';
import { ReactChart } from 'chartjs-react';

ReactChart.register(
  LineController,
  LinearScale,
  Tooltip,
  CategoryScale,
  PointElement,
  LineElement
);

const options = {
  indexAxis: 'x',
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};
const stateLabels = [
  'NEW',
  'LEARNING',
  'RELEARNING',
  'GRADUATED',
  'decksCount',
  'cardsCount',
];
const stateColorMap = {
  NEW: 'rgb(75, 192, 192)',
  LEARNING: 'rgb(88, 131, 109)',
  RELEARNING: 'rgb(206, 27, 82)',
  GRADUATED: 'rgb(72, 197, 132)',
  cardsCount: 'rgb(79, 123, 149)',
  decksCount: 'rgb(161, 219, 255)',
};

const LineChart = ({ data, isTabletOrMobile }) => {
  if (Meteor.isCordova || isTabletOrMobile) {
    data = takeRight(data, 7);
  }
  const dates = data.map((d) => format(d.date, 'dd.MM.yyyy'));
  const collectedData = {
    NEW: [],
    LEARNING: [],
    RELEARNING: [],
    GRADUATED: [],
    decksCount: [],
    cardsCount: [],
  };
  stateLabels.forEach((state) => {
    data.forEach((date) => {
      collectedData[state].push(date.data[state]);
    });
  });
  const datasets = Object.keys(collectedData).map((key) => {
    const values = collectedData[key];
    let label = key;
    label = key === 'decksCount' ? 'All decks' : label;
    label = key === 'cardsCount' ? 'All cards' : label;
    const res = {
      label,
      data: values,
      fill: false,
      borderColor: stateColorMap[key],
      tension: 0.1,
    };
    return res;
  });
  const chartData = {
    labels: dates,
    datasets,
  };
  return (
    <ReactChart
      options={options}
      type="line"
      data={chartData}
      height={Meteor.isCordova ? 200 : 100}
    />
  );
};

LineChart.propTypes = {
  data: PropTypes.array.isRequired,
};

export default LineChart;
