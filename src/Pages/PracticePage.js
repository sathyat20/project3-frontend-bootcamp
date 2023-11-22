//-----------Libaries-----------//
import React, { useState, useEffect } from "react";
import axios from "axios";

//-----------Components-----------//
import NavBar from "../Details/NavBar";
import NewQuestion from "../Components/PracticePage/NewQuestion";
import NewTopic from "../Components/PracticePage/NewTopic";

//-----------Media-----------//
const Problem = ({
  title,
  link,
  notes,
  difficulty,
  statusId,
  starred,
  onSolvedChange,
  onStarredChange,
  onEditClick,
}) => (
  <div className="flex items-center justify-between border-b border-gray-600 p-2">
    <span className="w-1/12">
      <input
        type="checkbox"
        checked={statusId === 1}
        onChange={onSolvedChange}
        className="h-4 w-4 rounded border-gray-300 checked:bg-green-500"
      />
    </span>
    <span className="w-1/12" onClick={onStarredChange}>
      <span
        className={`icon cursor-pointer ${
          starred ? "text-yellow-400" : "text-gray-400"
        }`}
      >
        ★
      </span>
    </span>
    <span className="w-5/12 text-white">
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-white hover:text-blue-500"
      >
        {title}
      </a>
    </span>
    <span className="w-4/12 text-gray-300">
      {notes}
      <button onClick={onEditClick} className="ml-2 icon">
        ✎
      </button>
    </span>
    <span className="w-1/12">
      <button
        className={`btn btn-xs ${
          difficulty === "Easy" ? "btn-success" : "btn-error"
        }`}
      >
        {difficulty}
      </button>
    </span>
  </div>
);

export default function PracticePage() {
  const [openTopic, setOpenTopic] = useState(null);
  const [showNewTopic, setShowNewTopic] = useState(false);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; 
  const [editingQuestion, setEditingQuestion] = useState(null)

  const [topics, setTopics] = useState([]);

const handleEditClick = async (id) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/questions/${id}`);
    const questionData = response.data.data; // Adjust based on your API response structure
    console.log(questionData)
    setEditingQuestion(questionData);
    document.getElementById("new_question_modal").showModal();
  } catch (error) {
    console.error("Error fetching question details: ", error);
  }
};


  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/questions/getAllQuestions`)
      .then((response) => {
        const questions = response.data.data;
        const categories = response.data.categories;

        // Difficulty
        const difficultyMap = {
          1: "Easy",
          2: "Medium",
          3: "Hard",
        };

        const statusMap = {
          1: true,
          2: false,
        };

        // Transforming the data
        const transformedData = categories.map((category) => {
          return {
            name: category.categoryName,
            problems: questions
              .filter((question) => question.categoryId === category.id)
              .map((question) => {
                return {
                  id: question.id,
                  title: question.title,
                  link: question.link,
                  notes: question.notes,
                  difficulty: difficultyMap[question.difficultyId],
                  statusId: statusMap[question.statusId],
                  starred: question.starred,
                };
              }),
          };
        });

        setTopics(transformedData);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, []);



  const toggleSolved = async (topicIndex, problemIndex) => {
    // Create a new copy of topics with the updated status
    const newTopics = topics.map((topic, tIndex) => {
      if (tIndex === topicIndex) {
        return {
          ...topic,
          problems: topic.problems.map((problem, pIndex) => {
            if (pIndex === problemIndex) {
              // Toggle the statusId and return a new problem object
              const newStatusId = problem.statusId === 1 ? 2 : 1;
              return {
                ...problem,
                statusId: newStatusId,
              };
            }
            return problem;
          }),
        };
      }
      return topic;
    });

    const updatedProblem = newTopics[topicIndex].problems[problemIndex];

    try {
      // Send a PUT request to update the backend
      await axios.put(
        `http://localhost:8080/questions/edit/${updatedProblem.id}`,
        {
          statusId: updatedProblem.statusId,
        },
      );

      // Update the state only if backend update is successful
      setTopics(newTopics);
    } catch (error) {
      console.error("Error updating question: ", error);
    }
  };

  const toggleStarred = async (topicIndex, problemIndex) => {
     const newTopics = topics.map((topic, tIndex) => {
    if (tIndex === topicIndex) {
      return {
        ...topic,
        problems: topic.problems.map((problem, pIndex) => {
          if (pIndex === problemIndex) {
            // Toggle the starred status and return a new problem object
            return {
              ...problem,
              starred: !problem.starred,
            };
          }
          return problem;
        }),
      };
    }
    return topic;
  });

  const updatedProblem = newTopics[topicIndex].problems[problemIndex];

  try {
    // Send a PUT request to update the backend
    await axios.put(
      `http://localhost:8080/questions/edit/${updatedProblem.id}`,
      {
        starred: updatedProblem.starred,
      },
    );
    // Update the state only if backend update is successful
    setTopics(newTopics);
  } catch (error) {
    console.error("Error updating question: ", error);
  }
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background">
      <NavBar />
      <div className="flex w-full flex-1 flex-col">
        <header className="bg-blue-800 p-6 text-white"></header>
        <div className="flex-1 overflow-auto bg-gray-800 p-4">
          {topics.map((topic, topicIndex) => (
            <div key={topicIndex}>
              <button
                className="mb-2 w-full rounded bg-gray-700 p-3 text-left text-white"
                onClick={() =>
                  setOpenTopic(openTopic === topicIndex ? null : topicIndex)
                }
              >
                {topic.name}
              </button>

              {openTopic === topicIndex && (
                <div>
                  <div className="flex justify-between p-2 text-white">
                    <span className="w-1/12">Status</span>
                    <span className="w-1/12">Star</span>
                    <span className="w-5/12">Problem</span>
                    <span className="w-4/12">Notes</span>
                    <span className="w-1/12">Difficulty</span>
                  </div>
                  <div className="rounded bg-gray-600 p-2">
                    {topic.problems.map((problem, problemIndex) => (
                      <Problem
                        key={problemIndex}
                        link={problem.link}
                        {...problem}
                        onSolvedChange={() =>
                          toggleSolved(topicIndex, problemIndex)
                        }
                        onStarredChange={() =>
                          toggleStarred(topicIndex, problemIndex)
                        }
                        onEditClick={() => handleEditClick(problem.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          <NewTopic />
        </div>
        <NewQuestion topics={topics} editingQuestion={editingQuestion} />
      </div>
    </div>
  );
}
