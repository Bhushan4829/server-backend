import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Dashboard.css';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [data, setData] = useState(null);
  const [streakHistory, setStreakHistory] = useState([]); // Track streak history

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/dashboard-data');
        setData(response.data);

        // Fetch streak history
        const streakResponse = await axios.get('http://localhost:5000/api/streak-history');
        setStreakHistory(streakResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();
  }, []);

  if (!data) return <p>Loading...</p>;

  // Safeguards to handle missing or undefined properties
  const codingStats = data.codingStats || {};
  const taskStats = data.taskStats || {};
  const githubStats = data.githubStats || {};
  const leetcodeDailySolved = codingStats.leetcodeDailySolved || 0;
  const geeksDailySolved = codingStats.geeksDailySolved || 0;
  const totalTasks = taskStats.totalTasks || 0;
  const completedTasks = taskStats.completedTasks || 0;

  // Prepare streak data for Line chart
  const streakLabels = streakHistory.map((entry) => new Date(entry.date).toLocaleDateString());
  const streakValues = streakHistory.map((entry) => entry.streak);
  const codingStatsLeetCode = data.codingStatsLeetCode || {};
  const leetcodeDistribution = [
    codingStatsLeetCode.easy || 0,
    codingStatsLeetCode.medium || 0,
    codingStatsLeetCode.hard || 0,
  ];
  const streakData = {
    labels: streakLabels.length > 0 ? streakLabels : ['No data'],
    datasets: [
      {
        label: 'Streak Progress',
        data: streakValues.length > 0 ? streakValues : [0],
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        fill: true,
      },
    ],
  };

  // Pie Chart: Coding Stats (Daily Solved)
  const dailyCodingData = {
    labels: ['LeetCode (Daily)', 'GeeksforGeeks (Daily)'],
    datasets: [
      {
        data: [leetcodeDailySolved, geeksDailySolved],
        backgroundColor: ['#4caf50', '#ff9800'],
        hoverBackgroundColor: ['#388e3c', '#f57c00'],
      },
    ],
  };
  const leetcodePieData = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [
      {
        data: leetcodeDistribution,
        backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
      },
    ],
  };
  // Bar Chart: Total Coding Stats (Overall Problems Solved)
  const totalCodingData = {
    labels: ['LeetCode', 'GeeksforGeeks'],
    datasets: [
      {
        label: 'Total Problems Solved',
        data: [
          (data.codingStatsLeetCode?.easy || 0) +
            (data.codingStatsLeetCode?.medium || 0) +
            (data.codingStatsLeetCode?.hard || 0),
          data.codingStatsGeeksforGeeks?.totalProblemsSolved || 0,
        ],
        backgroundColor: ['#4caf50', '#ff9800'],
      },
    ],
  };

  // Bar Chart: GitHub Stats (Daily Activity)
  const githubDailyData = {
    labels: ['Commits Today'],
    datasets: [
      {
        label: 'GitHub Daily Activity',
        data: [githubStats.commitsToday || 0],
        backgroundColor: ['#3f51b5'],
      },
    ],
  };

  // Task Completion Progress
  const taskCompletionRate = {
    labels: ['Tasks Due', 'Tasks Completed'],
    datasets: [
      {
        label: 'Task Completion Progress',
        data: [totalTasks, completedTasks],
        backgroundColor: ['#f44336', '#4caf50'],
      },
    ],
  };

  // Safely access today's tasks
  const todayTasks = taskStats.todayTasks || [];

  return (
    <div className="dashboard">
  <h2>Consistency Dashboard</h2>

  {/* Streak Progress */}
  <div className="chart-row">
    <div className="chart-item">
      <h3>Streak Progress Over Time</h3>
      <Line data={streakData} />
    </div>
    <div className="chart-item">
          <h3>LeetCode Problem Distribution</h3>
          <Pie data={leetcodePieData} />
        </div>
        <div className="chart-item">
      <h3>Task Completion Rate</h3>
      <Bar data={taskCompletionRate} />
    </div>
  </div>
    
  {/* Daily and Total Coding Stats */}
  <div className="chart-row">
  <div className="chart-item">
      <h3>Daily Coding Activity</h3>
      <Pie data={dailyCodingData} />
    </div>
    <div className="chart-item">
      <h3>Total Coding Stats</h3>
      <Bar data={totalCodingData} />
    </div>
    <div className="chart-item">
      <h3>GitHub Daily Activity</h3>
      <Bar data={githubDailyData} />
    </div>
  </div>
    

  {/* Today's Tasks */}
  <div className="tasks">
  <h3>Today's Tasks</h3>
  {todayTasks.length > 0 ? (
    <ul>
      {todayTasks.map((task, index) => (
        <li key={index}>
          <strong>{task.title}</strong> - {task.completed ? '✅' : '❌'} (Due: {new Date(task.due).toLocaleDateString()})
        </li>
      ))}
    </ul>
  ) : (
    <p>No tasks for today.</p>
  )}
</div>

</div>

  );
}

export default Dashboard;