//-----------Libaries-----------//
import {React, useEffect, useState} from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import axios from "axios";

//-----------Components-----------//
import NavBar from "../Details/NavBar";

//-----------Utilities-----------//
import {bearerToken} from "../Utilities/token";

//-----------Dummy Data-----------//
// const jobApplicationsData = [
//   { week: "5", Applications: 5 },
//   { week: "6", Applications: 5 },
//   { week: "7", Applications: 8 },
//   { week: "8", Applications: 6 },
//   { week: "9", Applications: 10 },
//   { week: "10", Applications: 12 },
//   { week: "11", Applications: 13 },
//   { week: "12", Applications: 14 },
//   { week: "13", Applications: 5 },
// ];

// const codingPracticeData = [
//   { week: "5", Questions: 3 },
//   { week: "6", Questions: 4 },
//   { week: "7", Questions: 7 },
//   { week: "8", Questions: 8 },
//   { week: "9", Questions: 9 },
//   { week: "10", Questions: 20 },
//   { week: "11", Questions: 18 },
//   { week: "12", Questions: 25 },
//   { week: "13", Questions: 3 },
// ];

//-----------Media-----------//

export default function MetricsPage() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const token = localStorage.getItem("token");

  // Weekly goals: reference lines
  const [applicationGoalCount, setApplicationGoalCount] = useState(0);
  const [questionsGoalCount, setQuestionsGoalCount] = useState(0);
  const [applications, setApplications] = useState([]);
  const [processedJobApplicationsData, setProcessedJobApplicationsData] =
    useState([]);
  const [questions, setQuestions] = useState([]);
  const [processedQuestionsData, setProcessedQuestionsData] = useState([]);

  // GET - Retrieve user data from Backend for user
  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/users/data`, bearerToken(token)) // Endpoint: users/data
      .then((response) => {
        console.log("Single Application Endpoint", response.data.userData);
        setApplicationGoalCount(response.data.userData.applicationGoalCount);
        setQuestionsGoalCount(response.data.userData.questionsGoalCount);
      });
  }, []);

  // GET - Retrieve applications from Backend
  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/users/applications`, bearerToken(token)) // Endpoint: users/applications
      .then((response) => {
        console.log("Single Application Startp", response.data.applications);
        setApplications(response.data.applications);
      });
  }, []);

  useEffect(() => {
    const getWeekNumber = (d) => {
      const date = new Date(d.getTime());
      date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
      const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
      return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
    };

    const weeklySummary = applications.reduce((acc, application) => {
      const applicationDate = new Date(application.applicationDate);
      const weekNumber = getWeekNumber(applicationDate);
      acc[weekNumber] = (acc[weekNumber] || 0) + 1;
      return acc;
    }, {});

    const jobApplicationsData = Object.keys(weeklySummary).map((week) => ({
      week: week.toString(),
      Applications: weeklySummary[week],
    }));

    setProcessedJobApplicationsData(jobApplicationsData);
  }, [applications]);

  const latestJobApplications =
    processedJobApplicationsData.length > 0
      ? processedJobApplicationsData[processedJobApplicationsData.length - 1]
          .Applications
      : 0;

  // GET - Retrieve questions from Backend

    useEffect(() => {
      axios
        .get(`${BACKEND_URL}/users/questions`, bearerToken(token)) // Endpoint: users/questions
        .then((response) => {
          console.log("Questions", response.data.questions);
          setQuestions(response.data.questions);
        });
    }, []);

      useEffect(() => {
        const getWeekNumber = (d) => {
          const date = new Date(d.getTime());
          date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
          const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
          return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
        }

       const weeklySolvedQuestionsSummary = {};

       questions.forEach((question) => {
         if (question.statusId === 1) {
           const updatedDate = new Date(question.updatedAt);
           const weekNumber = getWeekNumber(updatedDate);

           if (!weeklySolvedQuestionsSummary[weekNumber]) {
             weeklySolvedQuestionsSummary[weekNumber] = 0;
           }
           weeklySolvedQuestionsSummary[weekNumber]++;
         }
       });

        const codingPracticeData = Object.keys(
          weeklySolvedQuestionsSummary,
        ).map((week) => ({
          week: week.toString(),
          Questions: weeklySolvedQuestionsSummary[week],
        }));

        setProcessedQuestionsData(codingPracticeData);
      }, [questions]);

      const latestCodingQuestions =
        processedQuestionsData.length > 0 ?
        processedQuestionsData[
          processedQuestionsData.length - 1].Questions : 0;
        

  return (
    <div className="flex h-screen flex-col bg-background">
      <NavBar />
      <header className="p-4 text-2xl font-bold">Metrics</header>
      <main className="w-full flex-grow overflow-auto p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Top left: Weekly Progress */}
          <section className="rounded-lg bg-gray-700 p-4">
            <h2 className="mb-2 text-lg font-semibold">Weekly Progress</h2>
            <div className="mb-4">
              <div className="mb-1 flex justify-between">
                <span>Job Applications</span>
                <span>
                  {latestJobApplications}/{applicationGoalCount}
                </span>
              </div>
              <div className="h-6 w-full rounded-full bg-gray-600">
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{
                    width: `${
                      (latestJobApplications / applicationGoalCount) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between">
                <span>Coding Practice</span>
                <span>
                  {latestCodingQuestions}/{questionsGoalCount}
                </span>
              </div>
              <div className="h-6 w-full rounded-full bg-gray-600">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{
                    width: `${
                      (latestCodingQuestions / questionsGoalCount) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </section>

          {/* Top right: Upcoming events */}
          <section className="rounded-lg bg-gray-700 p-4">
            <h2 className="mb-2 text-lg font-semibold">Upcoming</h2>
            <div className="mb-2">
              <p>Interview with Midjourney - 10 Nov 2023 - 4pm</p>
            </div>
            <div>
              <p>Interview with Orange - 11 Nov 2023 - 2pm</p>
            </div>
          </section>

          {/* Bottom left: Weekly Job Applications Bar Chart */}
          <section className="rounded-lg bg-gray-700 p-4 md:col-span-2 lg:col-span-1">
            <h2 className="mb-2 text-lg font-semibold">
              Weekly Job Applications
            </h2>
            <ResponsiveContainer width="100%" height={450}>
              <BarChart
                data={processedJobApplicationsData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Applications" fill="#10b981" />
                <ReferenceLine
                  y={applicationGoalCount}
                  stroke="red"
                  strokeDasharray="3 3"
                />
              </BarChart>
            </ResponsiveContainer>
          </section>

          {/* Bottom right: Weekly Coding Practice Bar Chart */}
          <section className="rounded-lg bg-gray-700 p-4 md:col-span-2 lg:col-span-1">
            <h2 className="mb-2 text-lg font-semibold">
              Weekly Coding Practice
            </h2>
            <ResponsiveContainer width="100%" height={450}>
              <BarChart
                data={processedQuestionsData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Questions" fill="#3b82f6" />
                <ReferenceLine
                  y={questionsGoalCount}
                  stroke="red"
                  strokeDasharray="3 3"
                />
              </BarChart>
            </ResponsiveContainer>
          </section>
        </div>
      </main>
    </div>
  );
}