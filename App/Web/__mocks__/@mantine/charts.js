import React from 'react';

const BarChart = ({ data }) => 
  React.createElement('div', { 'data-testid': 'bar-chart' }, JSON.stringify(data));

const LineChart = ({ data }) => 
  React.createElement('div', { 'data-testid': 'line-chart' }, JSON.stringify(data));

const AreaChart = ({ data }) => 
  React.createElement('div', { 'data-testid': 'area-chart' }, JSON.stringify(data));

const PieChart = ({ data }) => 
  React.createElement('div', { 'data-testid': 'pie-chart' }, JSON.stringify(data));

const DonutChart = ({ data }) => 
  React.createElement('div', { 'data-testid': 'donut-chart' }, JSON.stringify(data));

export {
  BarChart,
  LineChart,
  AreaChart,
  PieChart,
  DonutChart,
};
