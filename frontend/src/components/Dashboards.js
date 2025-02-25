// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import './Dashboard.css';
// import { DateTime } from 'luxon';
// import { Line, Pie, Bar } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   ArcElement,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from 'chart.js';

// // Register required components
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   ArcElement,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend
// );

// function Dashboard() {
//   const [data, setData] = useState(null);
//   const [streakHistory, setStreakHistory] = useState([]); // Track streak history

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // const response = await axios.get('https://backend-nsyi.onrender.com/api/dashboard-data');
//         const response = await axios.get('https://backend-portfolio-latest-yrlb.onrender.com/api/dashboard-data');
//         setData(response.data);

//         // Fetch streak history
//         // const streakResponse = await axios.get('https://backend-nsyi.onrender.com/api/streak-history');
//         const streakResponse = await axios.get('https://backend-portfolio-latest-yrlb.onrender.com/api/streak-history');
//         setStreakHistory(streakResponse.data);
//       } catch (error) {
//         console.error('Error fetching dashboard data:', error);
//       }
//     };
//     fetchData();
//   }, []);

//   if (!data) return <p>Loading...</p>;
//   // Safeguards to handle missing or undefined properties
//   const codingStats = data.codingStats || {};
//   const taskStats = data.taskStats || {};
//   const githubStats = data.githubStats || {};
//   const leetcodeDailySolved = codingStats.leetcodeDailySolved || 0;
//   const geeksDailySolved = codingStats.geeksDailySolved || 0;
//   const totalTasks = taskStats.totalTasks || 0;
//   const completedTasks = taskStats.completedTasks || 0;

//   // Prepare streak data for Line chart
//   const streakLabels = streakHistory.map((entry) => new Date(entry.date).toLocaleDateString());
//   const streakValues = streakHistory.map((entry) => entry.streak);
//   const codingStatsLeetCode = data.codingStatsLeetCode || {};
//   const leetcodeDistribution = [
//     codingStatsLeetCode.easy || 0,
//     codingStatsLeetCode.medium || 0,
//     codingStatsLeetCode.hard || 0,
//   ];
//   // const dueDate = DateTime.fromISO(task.due, { zone: 'utc' }).setZone('America/New_York').toLocaleString(DateTime.DATE_MED);

//   const streakData = {
//     labels: streakLabels.length > 0 ? streakLabels : ['No data'],
//     datasets: [
//       {
//         label: 'Streak Progress',
//         data: streakValues.length > 0 ? streakValues : [0],
//         borderColor: 'rgba(75,192,192,1)',
//         backgroundColor: 'rgba(75,192,192,0.2)',
//         fill: true,
//       },
//     ],
//   };
//   console.log(data.codingStatsGeeksforGeeks);

//   // Pie Chart: Coding Stats (Daily Solved)
//   const dailyCodingData = {
//     labels: ['LeetCode (Daily)', 'GeeksforGeeks (Daily)'],
//     datasets: [
//       {
//         data: [leetcodeDailySolved, geeksDailySolved],
//         backgroundColor: ['#4caf50', '#ff9800'],
//         hoverBackgroundColor: ['#388e3c', '#f57c00'],
//       },
//     ],
//   };
//   const leetcodePieData = {
//     labels: ['Easy', 'Medium', 'Hard'],
//     datasets: [
//       {
//         data: leetcodeDistribution,
//         backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
//       },
//     ],
//   };
//   // Bar Chart: Total Coding Stats (Overall Problems Solved)
//   const totalCodingData = {
//     labels: ['LeetCode', 'GeeksforGeeks'],
//     datasets: [
//         {
//             label: 'Total Problems Solved',
//             data: [
//                 (data.codingStatsLeetCode?.easy || 0) +
//                 (data.codingStatsLeetCode?.medium || 0) +
//                 (data.codingStatsLeetCode?.hard || 0),
//                 data.codingStatsGeeksforGeeks?.totalProblemsSolved || 0, // Ensure this is not undefined
//             ],
//             backgroundColor: ['#4caf50', '#ff9800'],
//         },
//     ],
// };

//   // Bar Chart: GitHub Stats (Daily Activity)
//   const githubDailyData = {
//     labels: ['Commits Today'],
//     datasets: [
//       {
//         label: 'GitHub Daily Activity',
//         data: [githubStats.commitsToday || 0],
//         backgroundColor: ['#3f51b5'],
//       },
//     ],
//   };

//   // Task Completion Progress
//   const taskCompletionRate = {
//     labels: ['Tasks Due', 'Tasks Completed'],
//     datasets: [
//       {
//         label: 'Task Completion Progress',
//         data: [totalTasks, completedTasks],
//         backgroundColor: ['#f44336', '#4caf50'],
//       },
//     ],
//   };

//   // Safely access today's tasks
//   const todayTasks = taskStats.todayTasks || [];

//   return (
//     <div className="dashboard">
//   <h2>Consistency Dashboard</h2>

//   {/* Streak Progress */}
//   <div className="chart-row">
//     <div className="chart-item">
//       <h3>Streak Progress Over Time</h3>
//       <Line data={streakData} />
//     </div>
//     <div className="chart-item">
//           <h3>LeetCode Problem Distribution</h3>
//           <Pie data={leetcodePieData} />
//         </div>
//         <div className="chart-item">
//       <h3>Task Completion Rate</h3>
//       <Bar data={taskCompletionRate} />
//     </div>
//   </div>
    
//   {/* Daily and Total Coding Stats */}
//   <div className="chart-row">
//   <div className="chart-item">
//       <h3>Daily Coding Activity</h3>
//       <Pie data={dailyCodingData} />
//     </div>
//     <div className="chart-item">
//       <h3>Total Coding Stats</h3>
//       <Bar data={totalCodingData} />
//     </div>
//     <div className="chart-item">
//       <h3>GitHub Daily Activity</h3>
//       <Bar data={githubDailyData} />
//     </div>
//   </div>
    

//   {/* Today's Tasks */}
//   <div className="tasks">
//   <h3>Today's Tasks</h3>
//   {todayTasks.length > 0 ? (
//     <ul>
//       {todayTasks.map((task, index) => {
//         // Parse `due` as a plain date (ignore timezones)
//         const dueDate = DateTime.fromISO(task.due, { zone: 'utc' }).toFormat('MM/dd/yyyy');
//         return (
//           <li key={index}>
//             <strong>{task.title}</strong> - {task.completed ? '✅' : '❌'} (Due: {dueDate})
//           </li>
//         );
//       })}
//     </ul>
//   ) : (
//     <p>No tasks for today.</p>
//   )}
// </div>

// </div>

//   );
// }

// export default Dashboard;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Dashboard.css';
import { DateTime } from 'luxon';
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
  const [streakHistory, setStreakHistory] = useState([]);
  const [loading, setLoading] = useState(true); // Manage loading state
  console.log("🚀 Dashboard component mounted!");
  // Function to fetch the latest entry
  const fetchLatestEntry = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://server-backend-j3bt.onrender.com/api/latest-dashboard-data');
      // const response = await axios.get('http://localhost:5000/api/latest-dashboard-data');
      setData(response.data);

      const streakResponse = await axios.get('https://server-backend-j3bt.onrender.com/api/streak-history');
      // const streakResponse = await axios.get('http://localhost:5000/api/streak-history');
      console.log("Fetched streak history:", streakResponse.data);
      setStreakHistory(streakResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to update data on button click
  const updateData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://server-backend-j3bt.onrender.com/api/dashboard-data'); // This will trigger an update
      // const response = await axios.get('http://localhost:5000/api/dashboard-data');
      console.log('Updated data:', response.data);
      setData(response.data);
      
      const streakResponse = await axios.get('https://server-backend-j3bt.onrender.com/api/streak-history');
      // const streakResponse = await axios.get('http://localhost:5000/api/streak-history');
      console.log("Updated streak history:", streakResponse.data);
      setStreakHistory(streakResponse.data);
    } catch (error) {
      console.error('Error updating dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("useEffect triggered - Fetching latest entry...");
    fetchLatestEntry();
  }, []);
  console.log("Current state: ", { data, streakHistory, loading });
  if (loading) return <p>Loading...</p>;
  if (!data || Object.keys(data).length === 0) return <p>No data available.</p>;

  // Safeguards to handle missing properties
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

  const todayTasks = taskStats.todayTasks || [];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Consistency Dashboard</h2>
        <button onClick={updateData} className="update-button">
          Update
        </button>
      </div>

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

      <div className="tasks">
        <h3>Today's Tasks</h3>
        {todayTasks.length > 0 ? (
          <ul>
            {todayTasks.map((task, index) => {
              const dueDate = DateTime.fromISO(task.due, { zone: 'utc' }).toFormat('MM/dd/yyyy');
              return (
                <li key={index}>
                  <strong>{task.title}</strong> - {task.completed ? '✅' : '❌'} (Due: {dueDate})
                </li>
              );
            })}
          </ul>
        ) : (
          <p>No tasks for today.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
